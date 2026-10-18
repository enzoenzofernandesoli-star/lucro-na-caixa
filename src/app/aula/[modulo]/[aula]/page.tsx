import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { dataBR } from "@/components/mdx/Fontes";
import { PaginaInterna } from "@/components/marca/Cabecalho";
import { EtiquetaAula, QuadroAula } from "@/components/marca/QuadroAula";
import { AcoesAula } from "@/components/progresso/AcoesAula";
import { ROTULO_NIVEL, doisDigitos } from "@/data/modulos";
import { aulaPorSlug, idDaAula, todasAsAulas, urlDaAula } from "@/lib/conteudo";
import { compilarMdx } from "@/lib/conteudo/mdx";

type Params = PageProps<"/aula/[modulo]/[aula]">["params"];

// Building this list validates every lesson's frontmatter: a bad file fails `next build`.
export async function generateStaticParams() {
  const aulas = await todasAsAulas();
  return aulas.map((a) => ({ modulo: a.moduloSlug, aula: a.aulaSlug }));
}

export async function generateMetadata({ params }: PageProps<"/aula/[modulo]/[aula]">): Promise<Metadata> {
  const { modulo, aula } = await params;
  const dados = await aulaPorSlug(modulo, aula);
  if (!dados) return {};
  return { title: dados.frontmatter.titulo, description: dados.frontmatter.objetivo };
}

// Static frame; the URL-dependent lesson sits behind <Suspense> so navigations stay instant.
export default function PaginaAula({ params }: PageProps<"/aula/[modulo]/[aula]">) {
  return (
    <PaginaInterna>
      <Suspense
        fallback={
          <QuadroAula>
            <main id="conteudo" aria-busy="true" className="font-mono text-sm">
              Carregando a aula…
            </main>
          </QuadroAula>
        }
      >
        <Aula params={params} />
      </Suspense>
    </PaginaInterna>
  );
}

async function Aula({ params }: { params: Params }) {
  const { modulo, aula } = await params;
  const [dados, todas] = await Promise.all([aulaPorSlug(modulo, aula), todasAsAulas()]);
  if (!dados) notFound();

  const fm = dados.frontmatter;
  const conteudo = await compilarMdx(dados.corpo, fm.fontes);
  // Cached results may be copies, so match by slug, not by reference.
  const posicao = todas.findIndex((a) => a.moduloSlug === dados.moduloSlug && a.aulaSlug === dados.aulaSlug);
  const vizinha = (i: number) => {
    const a = todas[i];
    return a ? { url: urlDaAula(a), titulo: `${a.frontmatter.modulo}.${a.frontmatter.aula} ${a.frontmatter.titulo}` } : undefined;
  };

  return (
    <QuadroAula ativo={dados.moduloSlug}>
      <main id="conteudo" className="flex min-w-0 flex-col gap-6">
        <EtiquetaAula>
          MÓDULO {doisDigitos(fm.modulo)} · AULA {doisDigitos(fm.aula)}
        </EtiquetaAula>
        <h1 className="m-0 font-titulo text-[clamp(2.25rem,6vw,3.5rem)] leading-none font-bold break-words uppercase">
          {fm.titulo}
        </h1>
        <dl className="m-0 flex flex-wrap gap-x-6 gap-y-1 font-mono text-sm">
          <div className="flex gap-1.5">
            <dt>Nível:</dt>
            <dd className="m-0 font-semibold">{ROTULO_NIVEL[fm.nivel]}</dd>
          </div>
          <div className="flex gap-1.5">
            <dt>Duração:</dt>
            <dd className="m-0 font-semibold">{fm.duracao_min} min</dd>
          </div>
          <div className="flex gap-1.5">
            <dt>Fatos verificados em:</dt>
            <dd className="m-0 font-semibold">{dataBR(fm.verificado_em)}</dd>
          </div>
          {fm.pre_requisitos.length > 0 ? (
            <div className="flex gap-1.5">
              <dt>Antes, veja:</dt>
              <dd className="m-0 font-semibold">{fm.pre_requisitos.map((p) => `aula ${p.replace("-", ".")}`).join(", ")}</dd>
            </div>
          ) : null}
        </dl>
        <article className="prosa">{conteudo}</article>
        <AcoesAula id={idDaAula(dados)} anterior={vizinha(posicao - 1)} proxima={vizinha(posicao + 1)} />
      </main>
    </QuadroAula>
  );
}
