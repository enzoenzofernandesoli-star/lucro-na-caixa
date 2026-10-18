import path from "node:path";
import { cacheLife } from "next/cache";
import { MODULOS } from "@/data/modulos";
import { idAula } from "@/lib/progresso";
import { lerConteudo, type AulaCarregada, type Conteudo, type ModuloCarregado } from "./ler";

const RAIZ_MODULOS = path.join(process.cwd(), "content", "modulos");

/** All lessons and module files, validated. Content only changes on deploy, so cache for good. */
export async function conteudo(): Promise<Conteudo> {
  "use cache";
  cacheLife("max");
  return lerConteudo(RAIZ_MODULOS);
}

export async function todasAsAulas(): Promise<AulaCarregada[]> {
  return (await conteudo()).aulas;
}

export async function aulaPorSlug(moduloSlug: string, aulaSlug: string): Promise<AulaCarregada | undefined> {
  const aulas = await todasAsAulas();
  return aulas.find((a) => a.moduloSlug === moduloSlug && a.aulaSlug === aulaSlug);
}

export async function moduloPorSlugConteudo(moduloSlug: string): Promise<ModuloCarregado | undefined> {
  return (await conteudo()).modulos.find((m) => m.moduloSlug === moduloSlug);
}

export function urlDaAula(a: Pick<AulaCarregada, "moduloSlug" | "aulaSlug">): string {
  return `/aula/${a.moduloSlug}/${a.aulaSlug}`;
}

export function idDaAula(a: Pick<AulaCarregada, "frontmatter">): string {
  return idAula(a.frontmatter.modulo, a.frontmatter.aula);
}

/** Light, serializable lesson summary for client components (progress, search, review). */
export type ResumoAula = {
  id: string;
  modulo: number;
  aula: number;
  titulo: string;
  url: string;
  moduloSlug: string;
};

export async function resumoDasAulas(): Promise<ResumoAula[]> {
  return (await todasAsAulas()).map((a) => ({
    id: idDaAula(a),
    modulo: a.frontmatter.modulo,
    aula: a.frontmatter.aula,
    titulo: a.frontmatter.titulo,
    url: urlDaAula(a),
    moduloSlug: a.moduloSlug,
  }));
}

/** Module slug -> its lessons, in order, for every course module (empty when none written yet). */
export async function aulasPorModulo(): Promise<Record<string, ResumoAula[]>> {
  const resumo = await resumoDasAulas();
  return Object.fromEntries(MODULOS.map((m) => [m.slug, resumo.filter((a) => a.modulo === m.numero)]));
}
