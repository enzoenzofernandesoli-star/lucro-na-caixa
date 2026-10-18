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
  const precoCentavos = Math.ceil((base * 10_000) / sobra);
  return {
    precoCentavos,
    margem: calcularMargem({
      precoCentavos,
      custoCentavos: e.custoCentavos,
      taxaPontosBase: e.taxaPontosBase,
      freteCentavos: e.freteCentavos,
      embalagemCentavos: e.embalagemCentavos,
    }),
  };
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

// --- Custo de importação (modelo simplificado, todos os campos do aluno) ------------

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
  /** Taxes the student entered, as % over (goods + shipping + insurance) in R$. */
  impostosPontosBase: number;
  /** Other fees in R$ (customs broker, storage, domestic shipping…). */
  outrasTaxasCentavos: number;
};

export type ResultadoImportacao = {
  baseReaisCentavos: number;
  impostosCentavos: number;
  totalCentavos: number;
  /** Null when quantity is zero. */
  custoUnitarioCentavos: number | null;
};

export function calcularImportacao(e: EntradaImportacao): ResultadoImportacao {
  const produtosUsd = (e.precoUnitarioUsdCentavos * e.quantidadeCentesimos) / 100;
  const baseUsd = produtosUsd + e.freteUsdCentavos + e.seguroUsdCentavos;
  const baseReaisCentavos = arredondar((baseUsd * e.cotacaoCentavos) / 100);
  const impostosCentavos = arredondar((baseReaisCentavos * e.impostosPontosBase) / 10_000);
  const totalCentavos = baseReaisCentavos + impostosCentavos + e.outrasTaxasCentavos;
  return {
    baseReaisCentavos,
    impostosCentavos,
    totalCentavos,
    custoUnitarioCentavos:
      e.quantidadeCentesimos > 0 ? arredondar((totalCentavos * 100) / e.quantidadeCentesimos) : null,
  };
}
