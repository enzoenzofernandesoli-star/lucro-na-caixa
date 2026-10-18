import { describe, expect, it } from "vitest";
import {
  cartoesDoDia,
  concluirAula,
  desfazerConclusao,
  exportarProgresso,
  hojeIso,
  importarProgresso,
  intervaloDias,
  percentualConcluido,
  progressoVazio,
  proximaAula,
  registrarVisita,
  responderCartao,
  salvarAnotacao,
  somarDias,
  statusModulo,
} from "@/lib/progresso";

const HOJE = "2026-10-18";

describe("lesson progress", () => {
  it("completes and undoes a lesson", () => {
    const p = concluirAula(progressoVazio(), "1-2", HOJE);
    expect(p.concluidas).toEqual({ "1-2": HOJE });
    expect(concluirAula(p, "1-2", "2026-12-01").concluidas["1-2"]).toBe(HOJE); // keeps first date
    expect(desfazerConclusao(p, "1-2").concluidas).toEqual({});
  });

  it("computes percentage and module status", () => {
    let p = progressoVazio();
    const ids = ["1-1", "1-2", "1-3"];
    expect(percentualConcluido(p, ids)).toBe(0);
    expect(statusModulo(p, ids)).toBe("nao-iniciado");
    p = concluirAula(p, "1-1", HOJE);
    expect(percentualConcluido(p, ids)).toBe(33);
    expect(statusModulo(p, ids)).toBe("em-andamento");
    p = concluirAula(concluirAula(p, "1-2", HOJE), "1-3", HOJE);
    expect(percentualConcluido(p, ids)).toBe(100);
    expect(statusModulo(p, ids)).toBe("concluido");
    expect(percentualConcluido(p, [])).toBe(0);
  });

  it("'continuar de onde parei' prefers the last unfinished visit, then the first pending lesson", () => {
    const ordem = ["0-1", "0-2", "1-1"];
    let p = progressoVazio();
    expect(proximaAula(p, ordem)).toBe("0-1");
    p = registrarVisita(p, "1-1");
    expect(proximaAula(p, ordem)).toBe("1-1");
    p = concluirAula(p, "1-1", HOJE);
    expect(proximaAula(p, ordem)).toBe("0-1");
    p = concluirAula(concluirAula(p, "0-1", HOJE), "0-2", HOJE);
    expect(proximaAula(p, ordem)).toBeNull();
  });

  it("ignores a last visit to a lesson that no longer exists", () => {
    const p = registrarVisita(progressoVazio(), "9-9");
    expect(proximaAula(p, ["0-1"])).toBe("0-1");
  });

  it("saves and clears notes", () => {
    const p = salvarAnotacao(progressoVazio(), "1-2", "margem paga o anúncio");
    expect(p.anotacoes["1-2"]).toBe("margem paga o anúncio");
    expect(salvarAnotacao(p, "1-2", "   ").anotacoes).toEqual({});
  });
});

describe("dates", () => {
  it("formats local dates and adds days across months and years", () => {
    expect(hojeIso(new Date(2026, 9, 18, 23, 59))).toBe("2026-10-18");
    expect(somarDias("2026-10-31", 1)).toBe("2026-11-01");
    expect(somarDias("2026-12-31", 16)).toBe("2027-01-16");
  });
});

describe("Leitner", () => {
  const cartoes = [
    { id: "1-2#1", aula: "1-2" },
    { id: "1-2#2", aula: "1-2" },
    { id: "2-1#1", aula: "2-1" },
  ];

  it("uses 1, 2, 4, 8, 16 day intervals", () => {
    expect([1, 2, 3, 4, 5].map(intervaloDias)).toEqual([1, 2, 4, 8, 16]);
  });

  it("only shows cards of completed lessons that are new or due", () => {
    let p = concluirAula(progressoVazio(), "1-2", HOJE);
    expect(cartoesDoDia(p, cartoes, HOJE).map((c) => c.id)).toEqual(["1-2#1", "1-2#2"]);
    p = responderCartao(p, "1-2#1", true, HOJE);
    expect(cartoesDoDia(p, cartoes, HOJE).map((c) => c.id)).toEqual(["1-2#2"]);
    expect(cartoesDoDia(p, cartoes, "2026-10-19").map((c) => c.id)).toEqual(["1-2#1", "1-2#2"]);
  });

  it("moves up one box on a right answer, caps at 5, and resets on a wrong one", () => {
    let p = progressoVazio();
    p = responderCartao(p, "c", true, HOJE);
    expect(p.revisao.c).toEqual({ caixa: 1, proxima: "2026-10-19" });
    for (let i = 0; i < 6; i++) p = responderCartao(p, "c", true, HOJE);
    expect(p.revisao.c).toEqual({ caixa: 5, proxima: "2026-11-03" });
    p = responderCartao(p, "c", false, HOJE);
    expect(p.revisao.c).toEqual({ caixa: 1, proxima: "2026-10-19" });
  });
});

describe("export / import", () => {
  it("round-trips a full progress", () => {
    let p = concluirAula(progressoVazio(), "1-2", HOJE);
    p = salvarAnotacao(registrarVisita(p, "1-2"), "1-2", "nota");
    p = responderCartao(p, "1-2#1", true, HOJE);
    const r = importarProgresso(exportarProgresso(p));
    expect(r).toEqual({ ok: true, progresso: p });
  });

  it.each([
    ["not JSON", "{oops", /JSON válido/],
    ["wrong version", JSON.stringify({ ...progressoVazio(), versao: 2 }), /versao/],
    ["bad lesson id", JSON.stringify({ ...progressoVazio(), concluidas: { margem: HOJE } }), /concluidas/],
    ["bad date", JSON.stringify({ ...progressoVazio(), concluidas: { "1-2": "18/10/2026" } }), /concluidas/],
    ["box out of range", JSON.stringify({ ...progressoVazio(), revisao: { c: { caixa: 9, proxima: HOJE } } }), /revisao/],
    ["extra field", JSON.stringify({ ...progressoVazio(), hack: true }), /inválido/],
    ["array", "[]", /inválido/],
  ])("rejects %s without throwing", (_nome, texto, erro) => {
    const r = importarProgresso(texto);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.erro).toMatch(erro);
  });
});
