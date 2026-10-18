import { z } from "zod";

// Student progress, saved in localStorage (v1 is single-user). Pure functions only:
// the browser store lives in useProgresso.ts.

/** Lesson id "modulo-aula", e.g. "1-2" (same format as pre_requisitos). */
export type IdAula = string;

const ID_AULA = /^\d{1,2}-\d{1,2}$/;
const DATA_ISO = /^\d{4}-\d{2}-\d{2}$/;

export const CAIXAS_LEITNER = 5;

const esquemaCartao = z.strictObject({
  caixa: z.int().min(1).max(CAIXAS_LEITNER),
  proxima: z.string().regex(DATA_ISO),
});

export const esquemaProgresso = z.strictObject({
  versao: z.literal(1),
  /** Lesson id -> ISO date it was completed. */
  concluidas: z.record(z.string().regex(ID_AULA), z.string().regex(DATA_ISO)),
  ultimaAula: z.string().regex(ID_AULA).nullable(),
  anotacoes: z.record(z.string().regex(ID_AULA), z.string().max(20_000)),
  /** Flashcard id -> Leitner box and next review date. */
  revisao: z.record(z.string().min(1).max(200), esquemaCartao),
});

export type Progresso = z.infer<typeof esquemaProgresso>;
export type EstadoCartao = z.infer<typeof esquemaCartao>;

export function progressoVazio(): Progresso {
  return { versao: 1, concluidas: {}, ultimaAula: null, anotacoes: {}, revisao: {} };
}

export function idAula(modulo: number, aula: number): IdAula {
  return `${modulo}-${aula}`;
}

/** YYYY-MM-DD in local time. */
export function hojeIso(agora: Date = new Date()): string {
  const m = String(agora.getMonth() + 1).padStart(2, "0");
  const d = String(agora.getDate()).padStart(2, "0");
  return `${agora.getFullYear()}-${m}-${d}`;
}

export function somarDias(dataIso: string, dias: number): string {
  const [a, m, d] = dataIso.split("-").map(Number);
  return hojeIso(new Date(a, m - 1, d + dias));
}

export function concluirAula(p: Progresso, id: IdAula, hoje: string): Progresso {
  if (p.concluidas[id]) return p;
  return { ...p, concluidas: { ...p.concluidas, [id]: hoje } };
}

export function desfazerConclusao(p: Progresso, id: IdAula): Progresso {
  if (!p.concluidas[id]) return p;
  const concluidas = { ...p.concluidas };
  delete concluidas[id];
  return { ...p, concluidas };
}

export function registrarVisita(p: Progresso, id: IdAula): Progresso {
  return p.ultimaAula === id ? p : { ...p, ultimaAula: id };
}

export function salvarAnotacao(p: Progresso, id: IdAula, texto: string): Progresso {
  const anotacoes = { ...p.anotacoes };
  if (texto.trim() === "") delete anotacoes[id];
  else anotacoes[id] = texto;
  return { ...p, anotacoes };
}

/** Whole-number percentage of `ids` already completed (0 when the list is empty). */
export function percentualConcluido(p: Progresso, ids: readonly IdAula[]): number {
  if (ids.length === 0) return 0;
  const feitas = ids.filter((id) => p.concluidas[id]).length;
  return Math.floor((feitas * 100) / ids.length);
}

export type StatusModulo = "nao-iniciado" | "em-andamento" | "concluido";

export function statusModulo(p: Progresso, ids: readonly IdAula[]): StatusModulo {
  const feitas = ids.filter((id) => p.concluidas[id]).length;
  if (feitas === 0) return "nao-iniciado";
  return feitas === ids.length ? "concluido" : "em-andamento";
}

/**
 * Where "continuar de onde parei" points: the last visited lesson if it is not done,
 * otherwise the first lesson (in course order) not done yet. Null when all are done.
 */
export function proximaAula(p: Progresso, ordem: readonly IdAula[]): IdAula | null {
  if (p.ultimaAula && ordem.includes(p.ultimaAula) && !p.concluidas[p.ultimaAula]) return p.ultimaAula;
  return ordem.find((id) => !p.concluidas[id]) ?? null;
}

// --- Leitner (5 boxes) -------------------------------------------------------

/** Days until the next review for each box: 1, 2, 4, 8, 16. */
export function intervaloDias(caixa: number): number {
  return 2 ** (caixa - 1);
}

/** Right answer moves the card up one box; wrong answer sends it back to box 1. */
export function responderCartao(p: Progresso, idCartao: string, acertou: boolean, hoje: string): Progresso {
  const atual = p.revisao[idCartao]?.caixa ?? 0;
  const caixa = acertou ? Math.min(CAIXAS_LEITNER, Math.max(1, atual + 1)) : 1;
  return {
    ...p,
    revisao: { ...p.revisao, [idCartao]: { caixa, proxima: somarDias(hoje, intervaloDias(caixa)) } },
  };
}

/** Cards from completed lessons that are new or due today (or overdue). */
export function cartoesDoDia<T extends { id: string; aula: IdAula }>(p: Progresso, cartoes: readonly T[], hoje: string): T[] {
  return cartoes.filter((c) => {
    if (!p.concluidas[c.aula]) return false;
    const estado = p.revisao[c.id];
    return !estado || estado.proxima <= hoje;
  });
}

// --- Export / import ---------------------------------------------------------

export function exportarProgresso(p: Progresso): string {
  return JSON.stringify(p, null, 2);
}

export type ResultadoImportacao = { ok: true; progresso: Progresso } | { ok: false; erro: string };

/** Validates a JSON backup. Never throws: bad files return a readable error. */
export function importarProgresso(texto: string): ResultadoImportacao {
  let dados: unknown;
  try {
    dados = JSON.parse(texto);
  } catch {
    return { ok: false, erro: "O arquivo não é um JSON válido." };
  }
  const r = esquemaProgresso.safeParse(dados);
  if (!r.success) {
    const primeiro = r.error.issues[0];
    return { ok: false, erro: `Arquivo de progresso inválido (${primeiro.path.join(".") || "raiz"}: ${primeiro.message}).` };
  }
  return { ok: true, progresso: r.data };
}
