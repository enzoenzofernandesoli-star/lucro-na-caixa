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

import {
  calcularCacLtv,
  calcularImportacao,
  calcularMarkup,
  calcularPontoEquilibrio,
  calcularPrecoIdeal,
} from "@/lib/calculos";

describe("calcularPontoEquilibrio", () => {
  it("fixed costs ÷ margin %, rounded up", () => {
    const r = calcularPontoEquilibrio({ custosFixosCentavos: 300_000, precoCentavos: 10_000, margemPontosBase: 3_900 });
    expect(r.margemUnitariaCentavos).toBe(3_900);
    expect(r.faturamentoCentavos).toBe(769_231);
    expect(r.unidades).toBe(77);
  });

  it("exact division does not add an extra sale", () => {
    expect(calcularPontoEquilibrio({ custosFixosCentavos: 100_000, precoCentavos: 10_000, margemPontosBase: 5_000 }).unidades).toBe(20);
  });

  it("returns null without positive margin", () => {
    for (const m of [0, -500]) {
      const r = calcularPontoEquilibrio({ custosFixosCentavos: 100_000, precoCentavos: 10_000, margemPontosBase: m });
      expect(r.faturamentoCentavos).toBeNull();
      expect(r.unidades).toBeNull();
    }
  });

  it("zero fixed costs need zero sales", () => {
    expect(calcularPontoEquilibrio({ custosFixosCentavos: 0, precoCentavos: 10_000, margemPontosBase: 3_000 }).unidades).toBe(0);
  });
});

describe("calcularPrecoIdeal", () => {
  it("rounds the formula price up so the margin reaches the target", () => {
    const e = { custoCentavos: 3_500, freteCentavos: 1_000, embalagemCentavos: 100, taxaPontosBase: 1_500, margemDesejadaPontosBase: 3_000 };
    const r = calcularPrecoIdeal(e);
    expect(r.precoCentavos).toBe(8_364);
    expect(r.margem?.margemPontosBase).toBeGreaterThanOrEqual(3_000);
  });

  it("is impossible when fees + margin reach 100%", () => {
    expect(calcularPrecoIdeal({ custoCentavos: 100, freteCentavos: 0, embalagemCentavos: 0, taxaPontosBase: 5_000, margemDesejadaPontosBase: 5_000 }).precoCentavos).toBeNull();
  });
});

describe("calcularMarkup", () => {
  it("shows markup over cost and margin over price for the same money", () => {
    const r = calcularMarkup(5_000, 10_000);
    expect(r.markupPontosBase).toBe(10_000);
    expect(r.multiplicador).toBe(2);
    expect(r.margemBrutaPontosBase).toBe(5_000);
  });

  it("handles zero cost and zero price", () => {
    expect(calcularMarkup(0, 1_000).markupPontosBase).toBeNull();
    expect(calcularMarkup(1_000, 0).margemBrutaPontosBase).toBeNull();
  });

  it("goes negative when selling below cost", () => {
    expect(calcularMarkup(10_000, 8_000).margemBrutaPontosBase).toBe(-2_500);
  });
});

describe("calcularCacLtv", () => {
  it("computes CAC, margin LTV and ratio", () => {
    const r = calcularCacLtv({ gastoMarketingCentavos: 200_000, novosClientesCentesimos: 5_000, ticketMedioCentavos: 12_000, margemPontosBase: 3_500, comprasPorClienteCentesimos: 180 });
    expect(r.cacCentavos).toBe(4_000);
    expect(r.ltvCentavos).toBe(7_560);
    expect(r.razao).toBeCloseTo(1.89, 2);
  });

  it("has no CAC without new customers", () => {
    const r = calcularCacLtv({ gastoMarketingCentavos: 1_000, novosClientesCentesimos: 0, ticketMedioCentavos: 1_000, margemPontosBase: 1_000, comprasPorClienteCentesimos: 100 });
    expect(r.cacCentavos).toBeNull();
    expect(r.razao).toBeNull();
  });
});

describe("calcularImportacao", () => {
  it("converts goods + freight + insurance, applies the entered tax and fees", () => {
    const r = calcularImportacao({
      precoUnitarioUsdCentavos: 500, // US$ 5
      quantidadeCentesimos: 10_000, // 100 units
      cotacaoCentavos: 550, // R$ 5,50
      freteUsdCentavos: 10_000, // US$ 100
      seguroUsdCentavos: 0,
      impostosPontosBase: 1_000, // 10% (example)
      outrasTaxasCentavos: 5_000, // R$ 50
    });
    expect(r.baseReaisCentavos).toBe(330_000); // US$ 600 × 5,50
    expect(r.impostosCentavos).toBe(33_000);
    expect(r.totalCentavos).toBe(368_000);
    expect(r.custoUnitarioCentavos).toBe(3_680);
  });

  it("has no unit cost for zero quantity and no tax by default", () => {
    const r = calcularImportacao({ precoUnitarioUsdCentavos: 500, quantidadeCentesimos: 0, cotacaoCentavos: 550, freteUsdCentavos: 0, seguroUsdCentavos: 0, impostosPontosBase: 0, outrasTaxasCentavos: 0 });
    expect(r.custoUnitarioCentavos).toBeNull();
    expect(r.impostosCentavos).toBe(0);
  });
});
