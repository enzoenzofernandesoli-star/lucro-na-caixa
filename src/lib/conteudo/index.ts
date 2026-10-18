import path from "node:path";
import { cacheLife } from "next/cache";
import { lerTodasAsAulas, type AulaCarregada } from "./ler";

const RAIZ_MODULOS = path.join(process.cwd(), "content", "modulos");

/** All lessons, validated. Content only changes on deploy, so cache for good. */
export async function todasAsAulas(): Promise<AulaCarregada[]> {
  "use cache";
  cacheLife("max");
  return lerTodasAsAulas(RAIZ_MODULOS);
}

export async function aulaPorSlug(moduloSlug: string, aulaSlug: string): Promise<AulaCarregada | undefined> {
  const aulas = await todasAsAulas();
  return aulas.find((a) => a.moduloSlug === moduloSlug && a.aulaSlug === aulaSlug);
}

export function urlDaAula(a: Pick<AulaCarregada, "moduloSlug" | "aulaSlug">): string {
  return `/aula/${a.moduloSlug}/${a.aulaSlug}`;
}

/** Module slug -> URL of its first lesson, for the sidebar. */
export async function linksDosModulos(): Promise<Record<string, string>> {
  const links: Record<string, string> = {};
  for (const a of await todasAsAulas()) links[a.moduloSlug] ??= urlDaAula(a);
  return links;
}
