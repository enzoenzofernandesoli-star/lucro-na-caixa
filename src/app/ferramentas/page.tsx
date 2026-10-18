import type { Metadata } from "next";
import Link from "next/link";
import { Folha, PaginaInterna, TituloPagina } from "@/components/marca/Cabecalho";
import { CALCULADORAS } from "@/components/mdx/Calculadora";
import { resumoDasAulas } from "@/lib/conteudo";

export const metadata: Metadata = {
  title: "Ferramentas",
  description: "Todas as calculadoras do curso: margem, ROAS, ponto de equilíbrio, preço, markup, CAC x LTV e importação.",
};

export default async function Ferramentas() {
  const aulas = await resumoDasAulas();
  const entradas = Object.entries(CALCULADORAS);

  return (
    <PaginaInterna>
      <Folha>
        <TituloPagina etiqueta={`${entradas.length} CALCULADORAS`}>Ferramentas</TituloPagina>
        <p className="m-0 max-w-[70ch] text-lg">
          Todas as contas do curso num lugar só. Os valores iniciais são exemplos: troque pelos números do seu produto.
          Nenhuma calculadora guarda o que você digita.
        </p>
        <nav aria-label="Calculadoras">
          <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
            {entradas.map(([tipo, c]) => (
              <li key={tipo}>
                <a
                  href={`#${tipo}`}
                  className="inline-flex min-h-11 items-center rounded-[10px] border-[3px] border-tinta bg-branco px-3 font-semibold no-underline hover:bg-amarelo hover:text-tinta"
                >
                  {c.titulo}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        {entradas.map(([tipo, { titulo, aula, Componente }]) => {
          const aulaRef = aulas.find((a) => a.id === aula);
          return (
            <section key={tipo} id={tipo} aria-labelledby={`titulo-${tipo}`} className="flex scroll-mt-6 flex-col gap-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 id={`titulo-${tipo}`} className="m-0 font-titulo text-[30px] leading-none font-bold uppercase">
                  {titulo}
                </h2>
                {aulaRef ? (
                  <Link href={aulaRef.url} className="font-mono text-sm">
                    Explicado na aula {aula.replace("-", ".")}
                  </Link>
                ) : (
                  <span className="font-mono text-sm">Aula {aula.replace("-", ".")}</span>
                )}
              </div>
              <Componente />
            </section>
          );
        })}
      </Folha>
    </PaginaInterna>
  );
}
