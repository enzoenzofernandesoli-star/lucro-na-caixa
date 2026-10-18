import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { validarFrontmatter, type FrontmatterAula } from "./frontmatter";

// Plain fs helpers (no Next imports) so tests can point them at a temp folder.

export type AulaListada = {
  moduloSlug: string;
  aulaSlug: string;
  frontmatter: FrontmatterAula;
};

export type AulaCarregada = AulaListada & { corpo: string };

const PADRAO_SLUG = /^(\d{2})-[a-z0-9-]+$/;

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

/** Reads and validates every lesson under `raiz` (content/modulos). Fails on the first bad file. */
export async function lerTodasAsAulas(raiz: string): Promise<AulaCarregada[]> {
  const pastas = (await readdir(raiz, { withFileTypes: true }))
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();
  const aulas: AulaCarregada[] = [];
  for (const moduloSlug of pastas) {
    const arquivos = (await readdir(path.join(raiz, moduloSlug))).filter((f) => f.endsWith(".mdx")).sort();
    for (const arquivo of arquivos) aulas.push(await lerAula(raiz, moduloSlug, arquivo));
  }
  return aulas;
}
