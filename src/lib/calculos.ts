// Course calculators. Inputs and outputs in integer cents / basis points (see dinheiro.ts).

export type EntradaMargem = {
  precoCentavos: number;
  custoCentavos: number;
  /** Fees as a share of the sale price, in basis points (1500 = 15%). */
  taxaPontosBase: number;
  freteCentavos: number;
  embalagemCentavos: number;
};

export type ResultadoMargem = {
  taxaCentavos: number;
  margemCentavos: number;
  /** Contribution margin as a share of price; null when price is zero. */
  margemPontosBase: number | null;
  /** Ad revenue needed per R$ 1 spent to break even; null when margin is zero or negative. */
  roasEquilibrio: number | null;
};

/** Rounds half away from zero, so negative amounts round like positive ones. */
function arredondar(valor: number): number {
  return Math.sign(valor) * Math.round(Math.abs(valor));
}

export function calcularMargem(e: EntradaMargem): ResultadoMargem {
  const taxaCentavos = arredondar((e.precoCentavos * e.taxaPontosBase) / 10_000);
  const margemCentavos =
    e.precoCentavos - e.custoCentavos - taxaCentavos - e.freteCentavos - e.embalagemCentavos;
  const margemPontosBase =
    e.precoCentavos > 0 ? arredondar((margemCentavos * 10_000) / e.precoCentavos) : null;
  return {
    taxaCentavos,
    margemCentavos,
    margemPontosBase,
    roasEquilibrio: calcularRoasEquilibrio(e.precoCentavos, margemCentavos),
  };
}

/** Break-even ROAS = price ÷ contribution margin (same as 1 ÷ margin %). */
export function calcularRoasEquilibrio(precoCentavos: number, margemCentavos: number): number | null {
  if (precoCentavos <= 0 || margemCentavos <= 0) return null;
  return precoCentavos / margemCentavos;
}

export type EntradaRoas = {
  receitaCentavos: number;
  gastoAnuncioCentavos: number;
  /** Contribution margin before ads, in basis points. */
  margemPontosBase: number;
};

export type ResultadoRoas = {
  /** Revenue ÷ ad spend; null when nothing was spent. */
  roas: number | null;
  /** 1 ÷ margin; null when margin is zero or negative. */
  roasEquilibrio: number | null;
  margemGeradaCentavos: number;
  /** What is left after paying for the ads. Negative means loss. */
  resultadoCentavos: number;
};

export function calcularRoas(e: EntradaRoas): ResultadoRoas {
  const margemGeradaCentavos = arredondar((e.receitaCentavos * e.margemPontosBase) / 10_000);
  return {
    roas: e.gastoAnuncioCentavos > 0 ? e.receitaCentavos / e.gastoAnuncioCentavos : null,
    roasEquilibrio: e.margemPontosBase > 0 ? 10_000 / e.margemPontosBase : null,
    margemGeradaCentavos,
    resultadoCentavos: margemGeradaCentavos - e.gastoAnuncioCentavos,
  };
}

export type Veredito = "prejuizo" | "apertada" | "saudavel";

/** Teaching cut-off of 20% used in the course design; not a market rule. */
export const CORTE_MARGEM_APERTADA_PONTOS_BASE = 2_000;

export function vereditoMargem(margemPontosBase: number | null): Veredito {
  if (margemPontosBase === null || margemPontosBase <= 0) return "prejuizo";
  if (margemPontosBase < CORTE_MARGEM_APERTADA_PONTOS_BASE) return "apertada";
  return "saudavel";
}

// --- Ponto de equilíbrio ------------------------------------------------------

export type EntradaPontoEquilibrio = {
  custosFixosCentavos: number;
  precoCentavos: number;
  /** Contribution margin as a share of price, in basis points. */
  margemPontosBase: number;
};

export type ResultadoPontoEquilibrio = {
  margemUnitariaCentavos: number;
  /** Monthly revenue that pays the fixed costs (Sebrae: fixed costs ÷ margin %). Null without margin. */
  faturamentoCentavos: number | null;
  /** Sales needed per month, rounded up. Null without margin per unit. */
  unidades: number | null;
};

export function calcularPontoEquilibrio(e: EntradaPontoEquilibrio): ResultadoPontoEquilibrio {
  const margemUnitariaCentavos = arredondar((e.precoCentavos * e.margemPontosBase) / 10_000);
  if (e.margemPontosBase <= 0) return { margemUnitariaCentavos, faturamentoCentavos: null, unidades: null };
  return {
    margemUnitariaCentavos,
    faturamentoCentavos: Math.ceil((e.custosFixosCentavos * 10_000) / e.margemPontosBase),
    unidades: margemUnitariaCentavos > 0 ? Math.ceil(e.custosFixosCentavos / margemUnitariaCentavos) : null,
  };
}

// --- Preço ideal ---------------------------------------------------------------

export type EntradaPreco = {
  custoCentavos: number;
  freteCentavos: number;
  embalagemCentavos: number;
  /** Fees and sales tax over the price, in basis points. */
  taxaPontosBase: number;
  /** Contribution margin you want left over, in basis points. */
  margemDesejadaPontosBase: number;
};

export type ResultadoPreco = {
  /** Formula price rounded up to the cent, so the margin is at least the wanted one. Null when impossible. */
  precoCentavos: number | null;
  /** The margin check, recomputed from that price. */
  margem: ResultadoMargem | null;
};

/** Price = fixed-per-sale costs ÷ (1 − fees % − wanted margin %). */
export function calcularPrecoIdeal(e: EntradaPreco): ResultadoPreco {
  const sobra = 10_000 - e.taxaPontosBase - e.margemDesejadaPontosBase;
  if (sobra <= 0) return { precoCentavos: null, margem: null };
  const base = e.custoCentavos + e.freteCentavos + e.embalagemCentavos;
  const margemDe = (precoCentavos: number) =>
    calcularMargem({
      precoCentavos,
      custoCentavos: e.custoCentavos,
      taxaPontosBase: e.taxaPontosBase,
      freteCentavos: e.freteCentavos,
      embalagemCentavos: e.embalagemCentavos,
    });
  let precoCentavos = Math.ceil((base * 10_000) / sobra);
  let margem = margemDe(precoCentavos);
  // Rounding the fee can still leave the margin a hair short: add cents until it reaches the target.
  while (margem.margemCentavos * 10_000 < precoCentavos * e.margemDesejadaPontosBase) {
    precoCentavos += 1;
    margem = margemDe(precoCentavos);
  }
  return { precoCentavos, margem };
}

// --- Markup x margem -------------------------------------------------------------

export type ResultadoMarkup = {
  /** (price − cost) ÷ cost. Null when cost is zero. */
  markupPontosBase: number | null;
  /** price ÷ cost. Null when cost is zero. */
  multiplicador: number | null;
  /** (price − cost) ÷ price. Null when price is zero. */
  margemBrutaPontosBase: number | null;
};

export function calcularMarkup(custoCentavos: number, precoCentavos: number): ResultadoMarkup {
  const diferenca = precoCentavos - custoCentavos;
  return {
    markupPontosBase: custoCentavos > 0 ? arredondar((diferenca * 10_000) / custoCentavos) : null,
    multiplicador: custoCentavos > 0 ? precoCentavos / custoCentavos : null,
    margemBrutaPontosBase: precoCentavos > 0 ? arredondar((diferenca * 10_000) / precoCentavos) : null,
  };
}

// --- CAC x LTV -------------------------------------------------------------------

export type EntradaCacLtv = {
  gastoMarketingCentavos: number;
  /** New customers in the period, times 100 (same "centésimos" unit as the fields). */
  novosClientesCentesimos: number;
  ticketMedioCentavos: number;
  margemPontosBase: number;
  /** Purchases per customer over their lifetime, times 100 (1,5 compras = 150). */
  comprasPorClienteCentesimos: number;
};

export type ResultadoCacLtv = {
  /** Marketing spend ÷ new customers. Null without customers. */
  cacCentavos: number | null;
  /** Contribution margin a customer leaves over their lifetime. */
  ltvCentavos: number;
  /** LTV ÷ CAC. Null when CAC is null or zero. */
  razao: number | null;
};

export function calcularCacLtv(e: EntradaCacLtv): ResultadoCacLtv {
  const cacCentavos =
    e.novosClientesCentesimos > 0 ? arredondar((e.gastoMarketingCentavos * 100) / e.novosClientesCentesimos) : null;
  const ltvCentavos = arredondar(
    (e.ticketMedioCentavos * e.margemPontosBase * e.comprasPorClienteCentesimos) / (10_000 * 100),
  );
  return { cacCentavos, ltvCentavos, razao: cacCentavos && cacCentavos > 0 ? ltvCentavos / cacCentavos : null };
}

// --- Custo de importação (todos os campos do aluno) ----------------------------------
// Follows the Receita Federal remessa formula: customs value = goods + freight + insurance;
// II = rate × customs value − deduction (never below zero). Formal import (Receita
// "bases de cálculo"): IPI over customs value + II; PIS and Cofins over customs value.
// ICMS is charged "por dentro": base = (customs value + II + IPI + PIS/Cofins) ÷ (1 − ICMS
// rate). Customs expenses that also enter the ICMS base are left to "outras taxas". No rate
// is fixed in code.

export type EntradaImportacao = {
  /** Price per unit in US$ cents. */
  precoUnitarioUsdCentavos: number;
  /** Units, times 100. */
  quantidadeCentesimos: number;
  /** Exchange rate: R$ cents per US$ 1. */
  cotacaoCentavos: number;
  /** International shipping for the whole order, US$ cents. */
  freteUsdCentavos: number;
  /** Insurance for the whole order, US$ cents. */
  seguroUsdCentavos: number;
  /** Import tax (II) rate over the customs value, basis points. */
  impostoImportacaoPontosBase: number;
  /** Deduction from the II, US$ cents (e.g. the Remessa Conforme discount). */
  deducaoImpostoUsdCentavos: number;
  /** IPI rate (formal import), basis points, over customs value + II. */
  ipiPontosBase: number;
  /** PIS-Importação + Cofins-Importação rates added up (formal import), basis points, over customs value. */
  pisCofinsPontosBase: number;
  /** ICMS rate, basis points, charged "por dentro". */
  icmsPontosBase: number;
  /** Other fees in R$ (customs broker, storage, domestic shipping…). */
  outrasTaxasCentavos: number;
};

export type ResultadoImportacao = {
  valorAduaneiroUsdCentavos: number;
  impostoImportacaoUsdCentavos: number;
  icmsUsdCentavos: number;
  /** All taxes converted to R$. */
  impostosCentavos: number;
  totalCentavos: number;
  /** Null when quantity is zero. */
  custoUnitarioCentavos: number | null;
  /** Null when ICMS is 100% or more (impossible "por dentro" base). */
  erro: string | null;
};

export function calcularImportacao(e: EntradaImportacao): ResultadoImportacao {
  const produtos = (e.precoUnitarioUsdCentavos * e.quantidadeCentesimos) / 100;
  const valorAduaneiro = produtos + e.freteUsdCentavos + e.seguroUsdCentavos;
  const ii = Math.max(0, (valorAduaneiro * e.impostoImportacaoPontosBase) / 10_000 - e.deducaoImpostoUsdCentavos);
  const ipi = ((valorAduaneiro + ii) * e.ipiPontosBase) / 10_000;
  const pisCofins = (valorAduaneiro * e.pisCofinsPontosBase) / 10_000;
  const outros = ipi + pisCofins;
  if (e.icmsPontosBase >= 10_000) {
    return { valorAduaneiroUsdCentavos: arredondar(valorAduaneiro), impostoImportacaoUsdCentavos: arredondar(ii), icmsUsdCentavos: 0, impostosCentavos: 0, totalCentavos: 0, custoUnitarioCentavos: null, erro: "ICMS de 100% ou mais não fecha a conta." };
  }
  const baseIcms = (valorAduaneiro + ii + outros) / (1 - e.icmsPontosBase / 10_000);
  const icms = (baseIcms * e.icmsPontosBase) / 10_000;
  const paraReais = (usd: number) => arredondar((usd * e.cotacaoCentavos) / 100);
  const impostosCentavos = paraReais(ii + outros + icms);
  const totalCentavos = paraReais(valorAduaneiro) + impostosCentavos + e.outrasTaxasCentavos;
  return {
    valorAduaneiroUsdCentavos: arredondar(valorAduaneiro),
    impostoImportacaoUsdCentavos: arredondar(ii),
    icmsUsdCentavos: arredondar(icms),
    impostosCentavos,
    totalCentavos,
    custoUnitarioCentavos: e.quantidadeCentesimos > 0 ? arredondar((totalCentavos * 100) / e.quantidadeCentesimos) : null,
    erro: null,
  };
}

// --- Ficha de avaliação de produto (módulo 3) ---------------------------------------

export const CRITERIOS_FICHA = [
  { id: "demanda", titulo: "Demanda", ajuda: "1 = quase ninguém procura · 5 = busca constante e vendas visíveis" },
  { id: "margem", titulo: "Margem", ajuda: "1 = prejuízo ou margem apertada · 5 = margem que paga anúncio com folga" },
  { id: "concorrencia", titulo: "Concorrência", ajuda: "1 = mercado saturado, guerra de preço · 5 = espaço para diferenciar" },
  { id: "apelo", titulo: "Apelo e problema resolvido", ajuda: "1 = ninguém entende pra que serve · 5 = resolve uma dor clara e se mostra bem em foto ou vídeo" },
  { id: "logistica", titulo: "Logística", ajuda: "1 = pesado, frágil ou grande · 5 = leve, pequeno, resistente" },
  { id: "constancia", titulo: "Constância", ajuda: "1 = vende só numa época · 5 = vende o ano inteiro" },
  { id: "fornecedor", titulo: "Fornecedor", ajuda: "1 = sem nota, sem prazo confiável · 5 = fornecedor checado, com nota e reposição" },
  { id: "regulatorio", titulo: "Risco regulatório", ajuda: "1 = exige certificação que você não tem · 5 = sem exigência especial" },
] as const;

export type CriterioFicha = (typeof CRITERIOS_FICHA)[number]["id"];
export type NotasFicha = Record<CriterioFicha, number>;
export type VereditoFicha = "testar" | "talvez" | "descartar";

export type ResultadoFicha = {
  /** Average of the notes, 1 to 5, with two decimals. */
  media: number;
  /** Criteria that rule the product out on their own (margin or regulatory risk at 1). */
  eliminatorios: CriterioFicha[];
  veredito: VereditoFicha;
};

/** Teaching rule of the course: margin 1 or regulatory risk 1 rules out; otherwise ≥ 4 test, ≥ 3 maybe. */
export function avaliarProduto(notas: NotasFicha): ResultadoFicha {
  const valores = CRITERIOS_FICHA.map((c) => notas[c.id]);
  if (valores.some((v) => !Number.isInteger(v) || v < 1 || v > 5)) {
    throw new Error("Cada critério da ficha precisa de uma nota inteira de 1 a 5.");
  }
  const media = Math.round((valores.reduce((s, v) => s + v, 0) / valores.length) * 100) / 100;
  const eliminatorios = (["margem", "regulatorio"] as const).filter((c) => notas[c] === 1);
  const veredito: VereditoFicha =
    eliminatorios.length > 0 || media < 3 ? "descartar" : media >= 4 ? "testar" : "talvez";
  return { media, eliminatorios, veredito };
}

// --- Simulador de campanha (módulo 12) ----------------------------------------------

export type EntradaCampanha = {
  orcamentoCentavos: number;
  /** Average cost per click, cents. */
  cpcCentavos: number;
  /** Share of clicks that become a purchase, basis points (150 = 1,5%). */
  conversaoPontosBase: number;
  ticketMedioCentavos: number;
  /** Contribution margin before ads, basis points. */
  margemPontosBase: number;
};

export type ResultadoCampanha = {
  cliques: number;
  /** Expected purchases (can be fractional: it is an average). */
  vendas: number;
  receitaCentavos: number;
  margemCentavos: number;
  /** Margin minus ad spend. */
  resultadoCentavos: number;
  /** Null when there are no expected sales. */
  cpaCentavos: number | null;
  /** Null when the budget is zero. */
  roas: number | null;
};

/** Budget → clicks → sales → profit, with averages (a plan, not a promise). */
export function simularCampanha(e: EntradaCampanha): ResultadoCampanha {
  const cliques = e.cpcCentavos > 0 ? Math.floor(e.orcamentoCentavos / e.cpcCentavos) : 0;
  const vendas = (cliques * e.conversaoPontosBase) / 10_000;
  const receitaCentavos = arredondar(vendas * e.ticketMedioCentavos);
  const margemCentavos = arredondar((receitaCentavos * e.margemPontosBase) / 10_000);
  return {
    cliques,
    vendas,
    receitaCentavos,
    margemCentavos,
    resultadoCentavos: margemCentavos - e.orcamentoCentavos,
    cpaCentavos: vendas > 0 ? arredondar(e.orcamentoCentavos / vendas) : null,
    roas: e.orcamentoCentavos > 0 ? receitaCentavos / e.orcamentoCentavos : null,
  };
}

// --- Painel semanal (módulo 14) ------------------------------------------------------
// Funnel rates come from the store's own counts; profit uses the contribution margin
// before ads, so it matches the margin calculator of module 1.

export type EntradaPainelSemanal = {
  visitas: number;
  carrinhos: number;
  checkouts: number;
  pedidos: number;
  receitaCentavos: number;
  gastoAnunciosCentavos: number;
  /** Contribution margin before ads, basis points. */
  margemPontosBase: number;
};

export type ResultadoPainelSemanal = {
  /** Step rates in basis points; null when the previous step is zero. */
  carrinhoPorVisita: number | null;
  checkoutPorCarrinho: number | null;
  pedidoPorCheckout: number | null;
  conversao: number | null;
  ticketMedioCentavos: number | null;
  cpaCentavos: number | null;
  roas: number | null;
  roasEquilibrio: number | null;
  /** Contribution margin of the week minus ad spend. */
  lucroCentavos: number;
};

function taxa(parte: number, todo: number): number | null {
  return todo > 0 ? Math.round((parte * 10_000) / todo) : null;
}

export function calcularPainelSemanal(e: EntradaPainelSemanal): ResultadoPainelSemanal {
  const margemCentavos = arredondar((e.receitaCentavos * e.margemPontosBase) / 10_000);
  return {
    carrinhoPorVisita: taxa(e.carrinhos, e.visitas),
    checkoutPorCarrinho: taxa(e.checkouts, e.carrinhos),
    pedidoPorCheckout: taxa(e.pedidos, e.checkouts),
    conversao: taxa(e.pedidos, e.visitas),
    ticketMedioCentavos: e.pedidos > 0 ? arredondar(e.receitaCentavos / e.pedidos) : null,
    cpaCentavos: e.pedidos > 0 ? arredondar(e.gastoAnunciosCentavos / e.pedidos) : null,
    roas: e.gastoAnunciosCentavos > 0 ? e.receitaCentavos / e.gastoAnunciosCentavos : null,
    roasEquilibrio: e.margemPontosBase > 0 ? 10_000 / e.margemPontosBase : null,
    lucroCentavos: margemCentavos - e.gastoAnunciosCentavos,
  };
}

// --- Margem do dropshipping (módulo 16) ----------------------------------------------
// Expected profit per order once refunds and chargebacks are averaged in. Assumption
// shown to the student: on a refunded or charged-back order the seller gets nothing,
// still pays the supplier, the platform/gateway fees and the ad cost (CPA); a
// chargeback also costs the chargeback fee. Taxes are treated as recovered unless the student
// adds them (with return shipping) to the extra cost per refund. Refund and chargeback shares
// are separate groups of orders, so together they cannot pass 100%.

export type EntradaDrop = {
  precoCentavos: number;
  /** Supplier price + supplier shipping per order. */
  custoFornecedorCentavos: number;
  /** Platform + gateway fees, basis points of price. */
  taxasPontosBase: number;
  /** Taxes on the sale, basis points of price. */
  impostosPontosBase: number;
  cpaCentavos: number;
  /** Share of orders refunded, basis points. */
  reembolsoPontosBase: number;
  /** Share of orders with chargeback, basis points. */
  chargebackPontosBase: number;
  tarifaChargebackCentavos: number;
  /** Extra loss on each refunded or charged-back order: return shipping, tax not recovered… */
  custoExtraReembolsoCentavos: number;
};

export type ResultadoDrop = {
  /** Profit of an order that goes well. */
  lucroPedidoNormalCentavos: number;
  /** Loss of a refunded order (negative). */
  perdaReembolsoCentavos: number;
  /** Loss of a charged-back order (negative). */
  perdaChargebackCentavos: number;
  /** Average profit per order, refunds and chargebacks included. */
  lucroEsperadoCentavos: number;
  /** Same, as a share of price; null when price is zero. */
  margemEsperadaPontosBase: number | null;
  /** Set when refunds + chargebacks pass 100% of the orders; the other fields are then zero. */
  erro: string | null;
};

export function calcularMargemDrop(e: EntradaDrop): ResultadoDrop {
  if (e.reembolsoPontosBase + e.chargebackPontosBase > 10_000) {
    return {
      lucroPedidoNormalCentavos: 0, perdaReembolsoCentavos: 0, perdaChargebackCentavos: 0,
      lucroEsperadoCentavos: 0, margemEsperadaPontosBase: null,
      erro: "Reembolsos e chargebacks juntos não podem passar de 100% dos pedidos.",
    };
  }
  const taxas = arredondar((e.precoCentavos * e.taxasPontosBase) / 10_000);
  const impostos = arredondar((e.precoCentavos * e.impostosPontosBase) / 10_000);
  const normal = e.precoCentavos - e.custoFornecedorCentavos - taxas - impostos - e.cpaCentavos;
  const reembolso = -(e.custoFornecedorCentavos + taxas + e.cpaCentavos + e.custoExtraReembolsoCentavos);
  const chargeback = reembolso - e.tarifaChargebackCentavos;
  const r = e.reembolsoPontosBase / 10_000;
  const k = e.chargebackPontosBase / 10_000;
  const esperado = arredondar((1 - r - k) * normal + r * reembolso + k * chargeback);
  return {
    lucroPedidoNormalCentavos: normal,
    perdaReembolsoCentavos: reembolso,
    perdaChargebackCentavos: chargeback,
    lucroEsperadoCentavos: esperado,
    margemEsperadaPontosBase: e.precoCentavos > 0 ? Math.round((esperado * 10_000) / e.precoCentavos) : null,
    erro: null,
  };
}
