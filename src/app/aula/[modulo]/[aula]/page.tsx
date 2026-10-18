import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { compileMDX } from "next-mdx-remote/rsc";
import { Suspense } from "react";
import remarkGfm from "remark-gfm";
import { componentesDaAula } from "@/components/mdx";
import { dataBR } from "@/components/mdx/Fontes";
import { EtiquetaAula, QuadroAula } from "@/components/marca/QuadroAula";
import { ROTULO_NIVEL, doisDigitos } from "@/data/modulos";
import { aulaPorSlug, linksDosModulos, todasAsAulas } from "@/lib/conteudo";

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
    <div className="px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link href="/" className="font-titulo text-2xl leading-none font-bold no-underline">
          LUCRO NA CAIXA<span className="text-vermelho">.</span>
        </Link>
        <span className="font-mono text-xs tracking-[0.15em]">CURSO · E-COMMERCE · DROPSHIPPING</span>
      </header>
      <Suspense fallback={<AulaCarregando />}>
        <Aula params={params} />
      </Suspense>
    </div>
  );
}

async function AulaCarregando() {
  return (
    <QuadroAula links={await linksDosModulos()}>
      <main id="conteudo" aria-busy="true" className="font-mono text-sm">
        Carregando a aula…
      </main>
    </QuadroAula>
  );
}

async function Aula({ params }: { params: Params }) {
  const { modulo, aula } = await params;
  const dados = await aulaPorSlug(modulo, aula);
  if (!dados) notFound();

  const fm = dados.frontmatter;
  const [{ content }, links] = await Promise.all([
    compileMDX({
      source: dados.corpo,
      components: componentesDaAula(fm.fontes),
      // Lessons are our own files and pass props like <Quiz perguntas={[...]} />.
      options: { blockJS: false, mdxOptions: { remarkPlugins: [remarkGfm] } },
    }),
    linksDosModulos(),
  ]);

  return (
    <QuadroAula ativo={dados.moduloSlug} links={links}>
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
        </dl>
        <article className="prosa">{content}</article>
      </main>
    </QuadroAula>
  );
}
