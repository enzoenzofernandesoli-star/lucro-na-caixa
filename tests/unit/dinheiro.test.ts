import { describe, expect, it } from "vitest";
import { formatarPercentual, formatarRazao, formatarReais, lerCentesimos } from "@/lib/dinheiro";

describe("formatting", () => {
  it("formats cents as pt-BR reais", () => {
    expect(formatarReais(3_900)).toBe("R$ 39,00");
    expect(formatarReais(123_456)).toBe("R$ 1.234,56");
    expect(formatarReais(-1_600)).toBe("-R$ 16,00");
  });

  it("formats basis points and ratios", () => {
    expect(formatarPercentual(3_900)).toBe("39,0%");
    expect(formatarRazao(100 / 39)).toBe("2,56");
  });
});

describe("lerCentesimos", () => {
  it.each([
    ["35", 3_500],
    ["35,5", 3_550],
    ["1.234,56", 123_456],
    ["12.5", 1_250],
    ["R$ 10,00", 1_000],
    ["15%", 1_500],
    ["0,005", 1],
  ])("reads %s", (texto, esperado) => {
    expect(lerCentesimos(texto)).toBe(esperado);
  });

  it.each(["", "abc", "1,2,3", "--1"])("rejects %s", (texto) => {
    expect(lerCentesimos(texto)).toBeNull();
  });
});
