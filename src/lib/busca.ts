import { normalizar } from "./glossario";

/**
 * Removes JSX component tags. A self-closing component (`<Quiz ... />`) goes away with its
 * props; for open/close pairs only the tags go and the children's text stays.
 * Tracks braces and quotes, so props like perguntas={[{ ... }]} are skipped as a whole.
 */
function removerComponentes(texto: string): string {
  let saida = "";
  let i = 0;
  while (i < texto.length) {
    const inicio = texto.slice(i).search(/<\/?[A-Z]/);
    if (inicio < 0) {
      saida += texto.slice(i);
      break;
    }
    saida += texto.slice(i, i + inicio);
    let j = i + inicio + 1;
    let chaves = 0;
    let aspas: string | null = null;
    for (; j < texto.length; j++) {
      const c = texto[j];
      if (aspas) {
        if (c === "\\") j++;
        else if (c === aspas) aspas = null;
      } else if (c === '"' || c === "'" || c === "`") aspas = c;
      else if (c === "{") chaves++;
      else if (c === "}") chaves--;
      else if (c === ">" && chaves === 0) break;
    }
    saida += " ";
    i = j + 1;
  }
  return saida;
}

/** Turns lesson MDX into plain text for the search index. */
export function mdxParaTexto(corpo: string): string {
  return removerComponentes(corpo)
    .replace(/^\s*\|?\s*:?-{3,}.*$/gm, " ")
    .replace(/[#*_`|>]/g, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

export type ItemIndice = {
  id: string;
  titulo: string;
  modulo: number;
  url: string;
  texto: string;
};

export type ResultadoBusca = ItemIndice & { trecho: string; pontos: number };

/**
 * Accent- and case-insensitive search. Every word must appear in the title or text;
 * title hits rank first. Returns a snippet around the first match.
 */
export function buscar(indice: readonly ItemIndice[], consulta: string, limite = 30): ResultadoBusca[] {
  const palavras = normalizar(consulta).split(/\s+/).filter((p) => p.length >= 2);
  if (palavras.length === 0) return [];
  const resultados: ResultadoBusca[] = [];
  for (const item of indice) {
    const titulo = normalizar(item.titulo);
    const texto = normalizar(item.texto);
    if (!palavras.every((p) => titulo.includes(p) || texto.includes(p))) continue;
    const pontos = palavras.reduce((s, p) => s + (titulo.includes(p) ? 10 : 0) + (texto.split(p).length - 1), 0);
    resultados.push({ ...item, pontos, trecho: trecho(item.texto, texto, palavras[0]) });
  }
  return resultados.sort((a, b) => b.pontos - a.pontos || a.id.localeCompare(b.id)).slice(0, limite);
}

function trecho(original: string, normalizado: string, palavra: string): string {
  // normalizar() keeps string length for pt-BR text, so indexes line up with the original.
  const i = normalizado.indexOf(palavra);
  if (i < 0) return original.slice(0, 160) + (original.length > 160 ? "…" : "");
  const inicio = Math.max(0, i - 70);
  const fim = Math.min(original.length, i + palavra.length + 90);
  return `${inicio > 0 ? "…" : ""}${original.slice(inicio, fim)}${fim < original.length ? "…" : ""}`;
}
