import { describe, expect, it } from "vitest";
import {
  calcularMargem,
  calcularRoas,
  calcularRoasEquilibrio,
  vereditoMargem,
} from "@/lib/calculos";

const exemplo = {
  precoCentavos: 10_000,
  custoCentavos: 3_500,
  taxaPontosBase: 1_500,
  freteCentavos: 1_000,
  embalagemCentavos: 100,
};

describe("calcularMargem", () => {
  it("matches the design example: R$ 100 sale leaves R$ 39 (39%)", () => {
    const r = calcularMargem(exemplo);
    expect(r.taxaCentavos).toBe(1_500);
    expect(r.margemCentavos).toBe(3_900);
    expect(r.margemPontosBase).toBe(3_900);
    expect(r.roasEquilibrio).toBeCloseTo(100 / 39, 10);
  });

  it("works in integer cents with no float drift", () => {
    // 0.1 + 0.2 style traps: R$ 19,99 with 12.5% fee
    const r = calcularMargem({ ...exemplo, precoCentavos: 1_999, custoCentavos: 999, taxaPontosBase: 1_250, freteCentavos: 0, embalagemCentavos: 0 });
    expect(r.taxaCentavos).toBe(250); // 249.875 -> 250
    expect(r.margemCentavos).toBe(750);
    expect(Number.isInteger(r.margemCentavos)).toBe(true);
  });

  it("reports loss with negative margin and no break-even ROAS", () => {
    const r = calcularMargem({ ...exemplo, custoCentavos: 9_000 });
    expect(r.margemCentavos).toBe(-1_600);
    expect(r.margemPontosBase).toBe(-1_600);
    expect(r.roasEquilibrio).toBeNull();
    expect(vereditoMargem(r.margemPontosBase)).toBe("prejuizo");
  });

  it("handles zero margin: no ROAS can pay the ad", () => {
    const r = calcularMargem({ ...exemplo, custoCentavos: 7_400 });
    expect(r.margemCentavos).toBe(0);
    expect(r.margemPontosBase).toBe(0);
    expect(r.roasEquilibrio).toBeNull();
    expect(vereditoMargem(r.margemPontosBase)).toBe("prejuizo");
  });

  it("does not divide by zero when price is zero", () => {
    const r = calcularMargem({ ...exemplo, precoCentavos: 0 });
    expect(r.margemPontosBase).toBeNull();
    expect(r.roasEquilibrio).toBeNull();
  });

  it("rounds negative fee shares the same way as positive ones", () => {
    const r = calcularMargem({ ...exemplo, precoCentavos: 1_999, custoCentavos: 3_000, taxaPontosBase: 1_250, freteCentavos: 0, embalagemCentavos: 0 });
    expect(r.margemCentavos).toBe(1_999 - 3_000 - 250);
    expect(r.margemPontosBase).toBe(-6_258); // -1251/1999 = -62.58%
  });
});

describe("vereditoMargem", () => {
  it("uses the 20% teaching cut-off", () => {
    expect(vereditoMargem(1_999)).toBe("apertada");
    expect(vereditoMargem(2_000)).toBe("saudavel");
    expect(vereditoMargem(null)).toBe("prejuizo");
  });
});

describe("calcularRoasEquilibrio", () => {
  it("is 1 ÷ margin: 25% margin needs ROAS 4", () => {
    expect(calcularRoasEquilibrio(10_000, 2_500)).toBe(4);
  });
});

describe("calcularRoas", () => {
  it("computes campaign ROAS and what is left after ads", () => {
    const r = calcularRoas({ receitaCentavos: 100_000, gastoAnuncioCentavos: 30_000, margemPontosBase: 3_900 });
    expect(r.roas).toBeCloseTo(3.3333, 4);
    expect(r.margemGeradaCentavos).toBe(39_000);
    expect(r.resultadoCentavos).toBe(9_000);
  });

  it("shows a loss when ROAS is below break-even (lesson example: ROAS 2, margin 39%)", () => {
    const r = calcularRoas({ receitaCentavos: 20_000, gastoAnuncioCentavos: 10_000, margemPontosBase: 3_900 });
    expect(r.roas).toBe(2);
    expect(r.resultadoCentavos).toBe(7_800 - 10_000);
  });

  it("breaks even exactly at the break-even ROAS", () => {
    const r = calcularRoas({ receitaCentavos: 40_000, gastoAnuncioCentavos: 10_000, margemPontosBase: 2_500 });
    expect(r.roasEquilibrio).toBe(4);
    expect(r.resultadoCentavos).toBe(0);
  });

  it("returns null ROAS when nothing was spent", () => {
    expect(calcularRoas({ receitaCentavos: 10_000, gastoAnuncioCentavos: 0, margemPontosBase: 3_000 }).roas).toBeNull();
  });

  it("returns null break-even with zero or negative margin", () => {
    expect(calcularRoas({ receitaCentavos: 10_000, gastoAnuncioCentavos: 100, margemPontosBase: 0 }).roasEquilibrio).toBeNull();
    expect(calcularRoas({ receitaCentavos: 10_000, gastoAnuncioCentavos: 100, margemPontosBase: -500 }).roasEquilibrio).toBeNull();
  });
});
