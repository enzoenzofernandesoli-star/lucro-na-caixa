import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Folha, PaginaInterna, TituloPagina } from "@/components/marca/Cabecalho";
import { BarraProgressoCurso } from "@/components/progresso/BarraCurso";
import { ListaAulas } from "@/components/progresso/Painel";
import { MODULOS, ROTULO_NIVEL, doisDigitos, moduloPorSlug } from "@/data/modulos";
import { aulasPorModulo, moduloPorSlugConteudo } from "@/lib/conteudo";
import { compilarMdx } from "@/lib/conteudo/mdx";

type Params = PageProps<"/modulo/[slug]">["params"];

export function generateStaticParams() {
  return MODULOS.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({ params }: PageProps<"/modulo/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const m = moduloPorSlug(slug);
  return m ? { title: `Módulo ${doisDigitos(m.numero)}: ${m.titulo}` } : {};
}

export default function PaginaModulo({ params }: PageProps<"/modulo/[slug]">) {
  return (
    <PaginaInterna>
      <Suspense fallback={<Folha>Carregando o módulo…</Folha>}>
        <Modulo params={params} />
      </Suspense>
    </PaginaInterna>
  );
}

async function Modulo({ params }: { params: Params }) {
  const { slug } = await params;
  const modulo = moduloPorSlug(slug);
  if (!modulo) notFound();

  const [porModulo, dados] = await Promise.all([aulasPorModulo(), moduloPorSlugConteudo(slug)]);
  const aulas = porModulo[slug];
  const projeto = dados ? await compilarMdx(dados.corpo) : null;
  const anterior = MODULOS.find((m) => m.numero === modulo.numero - 1);
  const seguinte = MODULOS.find((m) => m.numero === modulo.numero + 1);

  return (
    <Folha>
      <TituloPagina etiqueta={`MÓDULO ${doisDigitos(modulo.numero)} · ${ROTULO_NIVEL[modulo.nivel].toUpperCase()}`}>
        {modulo.titulo}
      </TituloPagina>

      {dados ? (
        <section className="rounded-2xl border-[3px] border-tinta bg-amarelo p-5 sm:p-6" aria-label="Objetivo do módulo">
          <span className="font-mono text-xs tracking-[0.15em]">OBJETIVO DO MÓDULO</span>
          <p className="m-0 mt-2 text-lg font-semibold">{dados.frontmatter.objetivo}</p>
        </section>
      ) : null}

      <section aria-labelledby="titulo-aulas" className="flex flex-col gap-4">
        <h2 id="titulo-aulas" className="m-0 font-titulo text-[30px] leading-none font-bold uppercase">
          Aulas
        </h2>
        {aulas.length > 0 ? (
          <>
            <BarraProgressoCurso ids={aulas.map((a) => a.id)} rotulo="Módulo concluído" />
            <ListaAulas aulas={aulas} />
          </>
        ) : (
          <p className="m-0">As aulas deste módulo ainda não foram publicadas.</p>
        )}
      </section>

      {dados && projeto ? (
        <section aria-labelledby="titulo-projeto" className="flex flex-col gap-4 rounded-2xl border-[3px] border-tinta bg-branco p-5 shadow-solida sm:p-6">
          <span className="font-mono text-xs tracking-[0.15em]">PROJETO DO MÓDULO</span>
          <h2 id="titulo-projeto" className="m-0 font-titulo text-[30px] leading-none font-bold uppercase">
            {dados.frontmatter.projeto}
          </h2>
          <div className="prosa">{projeto}</div>
        </section>
      ) : null}

      {aulas.length > 0 ? (
        <p className="m-0">
          Terminou as aulas? Revise os conceitos em <Link href="/revisao">Revisão</Link>.
        </p>
      ) : null}

      <nav aria-label="Outros módulos" className="flex flex-col gap-3 border-t-[3px] border-tinta pt-6 sm:flex-row sm:justify-between">
        {anterior ? (
          <Link href={`/modulo/${anterior.slug}`} className="inline-flex min-h-11 items-center font-semibold">
            ← {doisDigitos(anterior.numero)} · {anterior.titulo}
          </Link>
        ) : (
          <span />
        )}
        {seguinte ? (
          <Link href={`/modulo/${seguinte.slug}`} className="inline-flex min-h-11 items-center font-semibold">
            {doisDigitos(seguinte.numero)} · {seguinte.titulo} →
          </Link>
        ) : null}
      </nav>
    </Folha>
  );
}
