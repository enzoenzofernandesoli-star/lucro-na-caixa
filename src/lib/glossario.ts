import { z } from "zod";
import dados from "../../content/glossario.json";

const esquemaTermo = z.strictObject({
  id: z.string().regex(/^[a-z0-9-]+$/, "id em minúsculas, sem acento, com hífens"),
  termo: z.string().min(1),
  definicao: z.string().min(1),
});

export const esquemaGlossario = z.array(esquemaTermo).superRefine((termos, ctx) => {
  const vistos = new Set<string>();
  for (const t of termos) {
    if (vistos.has(t.id)) ctx.addIssue({ code: "custom", message: `id repetido no glossário: ${t.id}` });
    vistos.add(t.id);
  }
});

export type TermoGlossario = z.infer<typeof esquemaTermo>;

/** Glossary entries, sorted alphabetically (pt-BR). Validated in tests and on build. */
export const GLOSSARIO: readonly TermoGlossario[] = [...(dados as TermoGlossario[])].sort((a, b) =>
  a.termo.localeCompare(b.termo, "pt-BR"),
);

const PORID = new Map(GLOSSARIO.map((t) => [t.id, t]));

export function termoPorId(id: string): TermoGlossario | undefined {
  return PORID.get(id);
}

/** Lowercase, accent-free text for searching ("Margem" matches "margem", "ação" matches "acao"). */
export function normalizar(texto: string): string {
  return texto.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

export function filtrarGlossario(termos: readonly TermoGlossario[], busca: string): TermoGlossario[] {
  const q = normalizar(busca.trim());
  if (!q) return [...termos];
  return termos.filter((t) => normalizar(t.termo).includes(q) || normalizar(t.definicao).includes(q));
}
