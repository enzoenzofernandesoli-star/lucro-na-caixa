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
