import Link from "next/link";
import { BotaoLink } from "@/components/marca/Botao";
import { LINKS_SITE } from "@/components/marca/Cabecalho";
import { EtiquetaPedido } from "@/components/marca/EtiquetaPedido";
import { FitaDiagonal } from "@/components/marca/FitaDiagonal";
import { EtiquetaAula, QuadroAula } from "@/components/marca/QuadroAula";
import { SeloRedondo } from "@/components/marca/SeloRedondo";
import { CalculadoraMargem } from "@/components/ferramentas/CalculadoraMargem";
import { Quiz } from "@/components/ferramentas/Quiz";
import { ContinuarDeOndeParei } from "@/components/progresso/Painel";
import { MODULOS } from "@/data/modulos";
import { resumoDasAulas } from "@/lib/conteudo";

export default async function Capa() {
  const aulas = await resumoDasAulas();
  const aulaMargem = aulas.find((a) => a.id === "1-2");

  return (
    <main id="conteudo" className="mx-auto max-w-[1440px] pb-16">
      <section className="relative flex min-h-[640px] flex-col justify-between gap-12 overflow-hidden px-4 py-8 sm:px-10 md:px-20 md:py-16 lg:h-[720px] lg:min-h-0">
        <FitaDiagonal className="-right-[180px] bottom-[170px] h-[44px] md:bottom-auto w-[620px] pl-10 text-[13px] md:-right-[120px] md:top-[120px] md:h-[70px] md:w-[900px] md:pl-[60px] md:text-lg" />

        <div className="relative flex flex-wrap items-center justify-between gap-3">
          <span className="font-mono text-xs tracking-[0.15em] sm:text-sm">CURSO · E-COMMERCE · DROPSHIPPING</span>
          <span className="rounded-full bg-tinta px-4 py-2 text-sm font-bold text-amarelo">
            {MODULOS.length} MÓDULOS
          </span>
        </div>

        <div className="relative flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex max-w-[840px] flex-col gap-6">
            <h1 className="m-0 font-titulo text-[clamp(3.5rem,10.4vw,9.375rem)] leading-[0.88] font-bold">
              LUCRO NA
              <br />
              CAIXA<span className="text-vermelho">.</span>
            </h1>
            <p className="m-0 max-w-[680px] text-[clamp(1.125rem,1.9vw,1.6875rem)] leading-[1.35] font-medium">
              E-commerce e dropshipping do zero ao avançado: vender mais, anunciar melhor e saber se cada venda deixa
              dinheiro no caixa.
            </p>
            <div className="flex flex-wrap gap-4">
              <BotaoLink href={`/modulo/${MODULOS[1].slug}`}>Abrir o módulo 1</BotaoLink>
              <BotaoLink href="/trilha" variante="secundario">
                Ver a trilha
              </BotaoLink>
            </div>
          </div>

          <div className="relative mx-auto h-[330px] w-[320px] shrink-0 lg:mx-0" aria-hidden="true">
            <EtiquetaPedido className="absolute top-2.5 left-0" />
            <SeloRedondo rotulo="MARGEM" valor="39%" nota="exemplo" className="absolute right-0 bottom-0" />
          </div>
        </div>
      </section>

      <div className="mx-4 mb-10 sm:mx-6 lg:mx-10">
        <ContinuarDeOndeParei aulas={aulas} />
      </div>

      <QuadroAula id="aula" ativo={aulaMargem?.moduloSlug} className="mx-4 sm:mx-6 lg:mx-10">
        <EtiquetaAula>MÓDULO 01 · AULA 02</EtiquetaAula>
        <h2 className="m-0 font-titulo text-[clamp(2.25rem,5vw,3.5rem)] leading-none font-bold">
          MARGEM DE CONTRIBUIÇÃO
        </h2>
        <p className="m-0 max-w-[720px] text-lg leading-relaxed">
          É o que sobra de cada venda depois de pagar o produto, as taxas, o frete e a embalagem. Se ela não paga o
          anúncio, vender mais só aumenta o prejuízo.
        </p>
        <CalculadoraMargem />
        <Quiz
          semTitulo
          perguntas={[
            {
              enunciado: "Teste rápido: a margem é 25%. Qual é o ROAS de equilíbrio?",
              opcoes: ["2,5", "4,0", "25"],
              correta: 1,
              explicacao: "1 ÷ 0,25 = 4. O anúncio precisa devolver R$ 4 para cada R$ 1.",
            },
          ]}
        />
        {aulaMargem ? (
          <div>
            <BotaoLink href={aulaMargem.url}>Abrir a aula completa</BotaoLink>
          </div>
        ) : null}
      </QuadroAula>

      <nav aria-label="Seções do curso" className="mx-4 mt-10 sm:mx-6 lg:mx-10">
        <ul className="m-0 flex list-none flex-wrap gap-3 p-0">
          {LINKS_SITE.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="inline-flex min-h-11 items-center rounded-[10px] border-[3px] border-tinta bg-papel px-4 font-mono text-sm font-semibold tracking-[0.08em] uppercase no-underline hover:bg-amarelo hover:text-tinta"
              >
                {l.rotulo}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </main>
  );
}
