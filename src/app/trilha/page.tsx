import type { Metadata } from "next";
import Link from "next/link";
import { Folha, PaginaInterna, TituloPagina } from "@/components/marca/Cabecalho";
import { BackupProgresso } from "@/components/progresso/Backup";
import { BarraProgressoCurso } from "@/components/progresso/BarraCurso";
import { SeloStatus } from "@/components/progresso/Painel";
import { MODULOS, ROTULO_NIVEL, doisDigitos, type Nivel } from "@/data/modulos";
import { aulasPorModulo, resumoDasAulas } from "@/lib/conteudo";

export const metadata: Metadata = {
  title: "Trilha",
  description: "Os 20 módulos do curso, do iniciante ao avançado, com o seu status em cada um.",
};

const FAIXAS: { nivel: Nivel; titulo: string }[] = [
  { nivel: "iniciante", titulo: "Iniciante" },
  { nivel: "intermediario", titulo: "Intermediário" },
  { nivel: "avancado", titulo: "Avançado" },
];

export default async function Trilha() {
  const [porModulo, aulas] = await Promise.all([aulasPorModulo(), resumoDasAulas()]);

  return (
    <PaginaInterna>
      <Folha>
        <TituloPagina etiqueta="20 MÓDULOS · 3 NÍVEIS">Trilha do curso</TituloPagina>
        <p className="m-0 max-w-[70ch] text-lg">
          Siga na ordem: cada módulo usa o que veio antes. O status é calculado pelas aulas que você marcou como
          concluídas.
        </p>
        <BarraProgressoCurso ids={aulas.map((a) => a.id)} />

        {FAIXAS.map((faixa) => {
          const modulos = MODULOS.filter((m) => m.nivel === faixa.nivel);
          return (
            <section key={faixa.nivel} aria-labelledby={`nivel-${faixa.nivel}`} className="flex flex-col gap-3">
              <h2 id={`nivel-${faixa.nivel}`} className="m-0 font-titulo text-[30px] leading-none font-bold uppercase">
                {faixa.titulo}
              </h2>
              <ol className="m-0 grid list-none gap-3 p-0 md:grid-cols-2">
                {modulos.map((m) => {
                  const ids = porModulo[m.slug].map((a) => a.id);
                  return (
                    <li key={m.slug} data-modulo={m.numero}>
                      <Link
                        href={`/modulo/${m.slug}`}
                        className="flex h-full min-h-11 flex-col gap-2 rounded-2xl border-[3px] border-tinta bg-branco p-4 no-underline hover:bg-amarelo-claro hover:text-tinta"
                      >
                        <span className="flex items-center justify-between gap-3">
                          <span className="font-mono text-xs tracking-[0.15em]">
                            MÓDULO {doisDigitos(m.numero)} · {ROTULO_NIVEL[m.nivel].toUpperCase()}
                          </span>
                          <SeloStatus ids={ids} />
                        </span>
                        <span className="text-lg font-bold">{m.titulo}</span>
                        <span className="font-mono text-sm">{ids.length} aulas publicadas</span>
                      </Link>
                    </li>
                  );
                })}
              </ol>
            </section>
          );
        })}

        <BackupProgresso />
      </Folha>
    </PaginaInterna>
  );
}
