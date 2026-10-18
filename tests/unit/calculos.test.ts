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
  const base = {
    precoUnitarioUsdCentavos: 4_900, quantidadeCentesimos: 100, cotacaoCentavos: 100,
    freteUsdCentavos: 500, seguroUsdCentavos: 300, impostoImportacaoPontosBase: 0,
    deducaoImpostoUsdCentavos: 0, outrosImpostosPontosBase: 0, icmsPontosBase: 0, outrasTaxasCentavos: 0,
  };

  it("reproduces the Receita Federal example (non-certified site, 60% II, 17% ICMS por dentro)", () => {
    // Receita: product 49 + freight 5 + insurance 3 = 57; II 34,20; ICMS base 109,88; ICMS 18,68.
    const r = calcularImportacao({ ...base, impostoImportacaoPontosBase: 6_000, icmsPontosBase: 1_700 });
    expect(r.valorAduaneiroUsdCentavos).toBe(5_700);
    expect(r.impostoImportacaoUsdCentavos).toBe(3_420);
    expect(r.icmsUsdCentavos).toBe(1_868);
    expect(r.totalCentavos).toBe(5_700 + 3_420 + 1_868);
  });

  it("applies the US$ 30 deduction and never makes II negative", () => {
    const r = calcularImportacao({ ...base, precoUnitarioUsdCentavos: 10_000, freteUsdCentavos: 0, seguroUsdCentavos: 0, impostoImportacaoPontosBase: 6_000, deducaoImpostoUsdCentavos: 3_000 });
    expect(r.impostoImportacaoUsdCentavos).toBe(3_000);
    const pequeno = calcularImportacao({ ...base, precoUnitarioUsdCentavos: 1_000, freteUsdCentavos: 0, seguroUsdCentavos: 0, impostoImportacaoPontosBase: 6_000, deducaoImpostoUsdCentavos: 3_000 });
    expect(pequeno.impostoImportacaoUsdCentavos).toBe(0);
  });

  it("converts to reais and splits the unit cost", () => {
    const r = calcularImportacao({ ...base, precoUnitarioUsdCentavos: 500, quantidadeCentesimos: 10_000, freteUsdCentavos: 10_000, seguroUsdCentavos: 0, cotacaoCentavos: 550, outrasTaxasCentavos: 5_000 });
    expect(r.totalCentavos).toBe(330_000 + 5_000);
    expect(r.custoUnitarioCentavos).toBe(3_350);
  });

  it("has no unit cost for zero quantity and refuses ICMS of 100%", () => {
    expect(calcularImportacao({ ...base, quantidadeCentesimos: 0 }).custoUnitarioCentavos).toBeNull();
    expect(calcularImportacao({ ...base, icmsPontosBase: 10_000 }).erro).not.toBeNull();
  });
});

import { CRITERIOS_FICHA, avaliarProduto, type NotasFicha } from "@/lib/calculos";

describe("avaliarProduto", () => {
  const todas = (n: number) => Object.fromEntries(CRITERIOS_FICHA.map((c) => [c.id, n])) as NotasFicha;

  it("averages the 8 criteria and applies the teaching cut-offs", () => {
    expect(avaliarProduto(todas(4))).toEqual({ media: 4, eliminatorios: [], veredito: "testar" });
    expect(avaliarProduto(todas(3)).veredito).toBe("talvez");
    expect(avaliarProduto(todas(2)).veredito).toBe("descartar");
  });

  it("rules out margin 1 or regulatory risk 1 even with a high average", () => {
    const r = avaliarProduto({ ...todas(5), margem: 1 });
    expect(r.media).toBe(4.5);
    expect(r.veredito).toBe("descartar");
    expect(r.eliminatorios).toEqual(["margem"]);
    expect(avaliarProduto({ ...todas(5), regulatorio: 1 }).eliminatorios).toEqual(["regulatorio"]);
  });

  it("rejects notes outside 1–5", () => {
    expect(() => avaliarProduto({ ...todas(3), demanda: 6 })).toThrow();
    expect(() => avaliarProduto({ ...todas(3), demanda: 2.5 })).toThrow();
  });
});

import { simularCampanha } from "@/lib/calculos";

describe("simularCampanha", () => {
  const base = { orcamentoCentavos: 15_000, cpcCentavos: 120, conversaoPontosBase: 150, ticketMedioCentavos: 8_990, margemPontosBase: 3_500 };

  it("turns budget into clicks, sales, margin and result", () => {
    const r = simularCampanha(base);
    expect(r.cliques).toBe(125);
    expect(r.vendas).toBeCloseTo(1.875, 6);
    expect(r.receitaCentavos).toBe(16_856);
    expect(r.margemCentavos).toBe(5_900);
    expect(r.resultadoCentavos).toBe(5_900 - 15_000);
    expect(r.cpaCentavos).toBe(8_000);
  });

  it("handles zero CPC, zero conversion and zero budget", () => {
    expect(simularCampanha({ ...base, cpcCentavos: 0 }).cliques).toBe(0);
    expect(simularCampanha({ ...base, conversaoPontosBase: 0 }).cpaCentavos).toBeNull();
    expect(simularCampanha({ ...base, orcamentoCentavos: 0 }).roas).toBeNull();
  });

  it("breaks even when CPA equals the margin per sale", () => {
    // ticket 100, margin 25% → R$ 25 per sale; CPC 1 and 4% conversion → CPA 25
    const r = simularCampanha({ orcamentoCentavos: 10_000, cpcCentavos: 100, conversaoPontosBase: 400, ticketMedioCentavos: 10_000, margemPontosBase: 2_500 });
    expect(r.cpaCentavos).toBe(2_500);
    expect(r.resultadoCentavos).toBe(0);
  });
});

import { calcularMargemDrop, calcularPainelSemanal } from "@/lib/calculos";

describe("calcularPainelSemanal", () => {
  const base = { visitas: 2_000, carrinhos: 120, checkouts: 60, pedidos: 30, receitaCentavos: 300_000, gastoAnunciosCentavos: 90_000, margemPontosBase: 4_000 };

  it("computes funnel rates, CPA, ROAS and profit", () => {
    const r = calcularPainelSemanal(base);
    expect(r.carrinhoPorVisita).toBe(600);
    expect(r.checkoutPorCarrinho).toBe(5_000);
    expect(r.pedidoPorCheckout).toBe(5_000);
    expect(r.conversao).toBe(150);
    expect(r.ticketMedioCentavos).toBe(10_000);
    expect(r.cpaCentavos).toBe(3_000);
    expect(r.roas).toBeCloseTo(3.333, 3);
    expect(r.roasEquilibrio).toBe(2.5);
    expect(r.lucroCentavos).toBe(120_000 - 90_000);
  });

  it("returns null rates for empty steps", () => {
    const r = calcularPainelSemanal({ ...base, visitas: 0, pedidos: 0, gastoAnunciosCentavos: 0, margemPontosBase: 0 });
    expect(r.carrinhoPorVisita).toBeNull();
    expect(r.cpaCentavos).toBeNull();
    expect(r.roas).toBeNull();
    expect(r.roasEquilibrio).toBeNull();
  });
});

describe("calcularMargemDrop", () => {
  const base = {
    precoCentavos: 10_000, custoFornecedorCentavos: 4_000, taxasPontosBase: 500, impostosPontosBase: 600,
    cpaCentavos: 2_500, reembolsoPontosBase: 0, chargebackPontosBase: 0, tarifaChargebackCentavos: 0,
  };

  it("equals the normal order profit with no refunds", () => {
    const r = calcularMargemDrop(base);
    expect(r.lucroPedidoNormalCentavos).toBe(10_000 - 4_000 - 500 - 600 - 2_500);
    expect(r.lucroEsperadoCentavos).toBe(2_400);
    expect(r.margemEsperadaPontosBase).toBe(2_400);
  });

  it("averages refunds and chargebacks into the expected profit", () => {
    const r = calcularMargemDrop({ ...base, reembolsoPontosBase: 800, chargebackPontosBase: 200, tarifaChargebackCentavos: 1_500 });
    expect(r.perdaReembolsoCentavos).toBe(-7_000);
    expect(r.perdaChargebackCentavos).toBe(-8_500);
    // 0.90 × 2400 + 0.08 × (−7000) + 0.02 × (−8500) = 2160 − 560 − 170
    expect(r.lucroEsperadoCentavos).toBe(1_430);
  });

  it("handles zero price", () => {
    expect(calcularMargemDrop({ ...base, precoCentavos: 0 }).margemEsperadaPontosBase).toBeNull();
  });
});
