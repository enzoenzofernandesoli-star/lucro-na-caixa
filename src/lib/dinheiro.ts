// Money is always integer cents; percentages are integer basis points (1500 = 15%).

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const decimal2 = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const decimal1 = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const ateDuas = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 });

/** Formats cents as "R$ 1.234,56" (normal spaces, so tests and screen readers see plain text). */
export function formatarReais(centavos: number): string {
  return brl.format(centavos / 100).replace(/ /g, " ");
}

/** Formats basis points as "39,0%". */
export function formatarPercentual(pontosBase: number): string {
  return `${decimal1.format(pontosBase / 100)}%`;
}

/** Formats basis points for an editable field: 1500 -> "15", 1250 -> "12,5". */
export function formatarPercentualCampo(pontosBase: number): string {
  return ateDuas.format(pontosBase / 100);
}

/** Formats cents for an editable field: 3500 -> "35,00". */
export function formatarReaisCampo(centavos: number): string {
  return decimal2.format(centavos / 100);
}

/** Formats a ratio such as ROAS: 2.5641 -> "2,56". */
export function formatarRazao(valor: number): string {
  return decimal2.format(valor);
}

/**
 * Parses a pt-BR number typed by the user ("1.234,56", "12,5", "12.5", "R$ 10")
 * and returns it multiplied by 100 as an integer (cents or basis points).
 * Returns null when the text is not a number.
 */
export function lerCentesimos(texto: string): number | null {
  let limpo = texto.replace(/R\$|%|\s/g, "");
  if (limpo === "") return null;
  if (limpo.includes(",")) limpo = limpo.replace(/\./g, "").replace(",", ".");
  if (!/^-?\d+(\.\d+)?$/.test(limpo)) return null;
  return Math.round(Number(limpo) * 100);
}
