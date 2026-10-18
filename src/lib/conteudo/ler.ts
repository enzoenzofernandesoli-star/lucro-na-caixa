import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import {
  validarFrontmatter,
  validarModulo,
  type FrontmatterAula,
  type FrontmatterModulo,
} from "./frontmatter";

// Plain fs helpers (no Next imports) so tests can point them at a temp folder.

export type AulaListada = {
  moduloSlug: string;
  aulaSlug: string;
  frontmatter: FrontmatterAula;
};

export type AulaCarregada = AulaListada & { corpo: string };

export type ModuloCarregado = {
  moduloSlug: string;
  frontmatter: FrontmatterModulo;
  /** MDX of the module project. */
  corpo: string;
};

export type Conteudo = {
  aulas: AulaCarregada[];
  modulos: ModuloCarregado[];
};

const PADRAO_SLUG = /^(\d{2})-[a-z0-9-]+$/;
const ARQUIVO_MODULO = "_modulo.mdx";

function numeroDoSlug(slug: string): number | null {
  const m = PADRAO_SLUG.exec(slug);
  return m ? Number(m[1]) : null;
}

async function lerAula(raiz: string, moduloSlug: string, arquivo: string): Promise<AulaCarregada> {
  const aulaSlug = arquivo.replace(/\.mdx$/, "");
  const caminho = path.join(raiz, moduloSlug, arquivo);
  const moduloNum = numeroDoSlug(moduloSlug);
  const aulaNum = numeroDoSlug(aulaSlug);
  if (moduloNum === null || aulaNum === null) {
    throw new Error(`Nome fora do padrão NN-slug: ${caminho}`);
  }
  const { data, content } = matter(await readFile(caminho, "utf8"));
  const frontmatter = validarFrontmatter(data, caminho, { modulo: moduloNum, aula: aulaNum });
  return { moduloSlug, aulaSlug, frontmatter, corpo: content };
}

async function lerModulo(raiz: string, moduloSlug: string): Promise<ModuloCarregado> {
  const caminho = path.join(raiz, moduloSlug, ARQUIVO_MODULO);
  const { data, content } = matter(await readFile(caminho, "utf8"));
  const numero = numeroDoSlug(moduloSlug);
  if (numero === null) throw new Error(`Nome fora do padrão NN-slug: ${caminho}`);
  return { moduloSlug, frontmatter: validarModulo(data, caminho, numero), corpo: content };
}

/** Reads and validates every lesson and module file under `raiz` (content/modulos). */
export async function lerConteudo(raiz: string): Promise<Conteudo> {
  const pastas = (await readdir(raiz, { withFileTypes: true }))
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();
  const aulas: AulaCarregada[] = [];
  const modulos: ModuloCarregado[] = [];
  for (const moduloSlug of pastas) {
    const arquivos = (await readdir(path.join(raiz, moduloSlug))).filter((f) => f.endsWith(".mdx")).sort();
    for (const arquivo of arquivos) {
      if (arquivo === ARQUIVO_MODULO) modulos.push(await lerModulo(raiz, moduloSlug));
      else aulas.push(await lerAula(raiz, moduloSlug, arquivo));
    }
  }
  return { aulas, modulos };
}

/** Lessons only (kept for callers and tests that don't need modules). */
export async function lerTodasAsAulas(raiz: string): Promise<AulaCarregada[]> {
  return (await lerConteudo(raiz)).aulas;
}
