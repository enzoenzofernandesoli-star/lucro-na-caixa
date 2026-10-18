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

// pt-BR: comma is the decimal mark, dot groups thousands in blocks of 3.
const COM_VIRGULA = /^-?\d{1,3}(\.\d{3})*,\d+$|^-?\d+,\d+$/;
const SO_MILHAR = /^-?\d{1,3}(\.\d{3})+$/;
// Typed on a dot-only keyboard: "12.5" or "12.50" read as decimals.
const PONTO_DECIMAL = /^-?\d+\.\d{1,2}$/;
const INTEIRO = /^-?\d+$/;

/**
 * Parses a pt-BR number typed by the user and returns it multiplied by 100 as an
 * integer (cents or basis points). Rules:
 * - "1.234,56", "12,5": comma is the decimal mark, dots group thousands;
 * - "1.000", "12.500": dot followed by groups of 3 digits is a thousands separator;
 * - "12.5", "12.50": dot followed by 1–2 digits is a decimal mark;
 * - anything else ("1.2345", "1.00,5", "1,2,3") is ambiguous and returns null.
 */
export function lerCentesimos(texto: string): number | null {
  const limpo = texto.replace(/R\$|%|\s/g, "");
  let normalizado: string;
  if (COM_VIRGULA.test(limpo)) normalizado = limpo.replace(/\./g, "").replace(",", ".");
  else if (SO_MILHAR.test(limpo)) normalizado = limpo.replace(/\./g, "");
  else if (PONTO_DECIMAL.test(limpo) || INTEIRO.test(limpo)) normalizado = limpo;
  else return null;
  return Math.round(Number(normalizado) * 100);
}
