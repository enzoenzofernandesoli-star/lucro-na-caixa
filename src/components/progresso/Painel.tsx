"use client";

import Link from "next/link";
import { classesBotao } from "@/components/marca/Botao";
import { doisDigitos } from "@/data/modulos";
import type { ResumoAula } from "@/lib/conteudo";
import { percentualConcluido, proximaAula, statusModulo, type StatusModulo } from "@/lib/progresso";
import { useNoNavegador, useProgresso } from "@/lib/useProgresso";

export function BarraProgresso({ percentual, rotulo }: { percentual: number; rotulo: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-3 font-mono text-sm">
        <span>{rotulo}</span>
        <span className="font-semibold">{percentual}%</span>
      </div>
      <div
        role="progressbar"
        aria-label={rotulo}
        aria-valuenow={percentual}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-4 overflow-hidden rounded-full border-[3px] border-tinta bg-branco"
      >
        <div className="h-full bg-tinta" style={{ width: `${percentual}%` }} />
      </div>
    </div>
  );
}

/** Cover card: overall progress and "continuar de onde parei". */
export function ContinuarDeOndeParei({ aulas }: { aulas: ResumoAula[] }) {
  const progresso = useProgresso();
  const noNavegador = useNoNavegador();
  const ordem = aulas.map((a) => a.id);
  const percentual = percentualConcluido(progresso, ordem);
  const idProxima = proximaAula(progresso, ordem);
  const proxima = aulas.find((a) => a.id === idProxima);
  const comecou = Object.keys(progresso.concluidas).length > 0 || progresso.ultimaAula !== null;

  return (
    <section
      aria-label="Seu progresso"
      data-continuar
      className="flex flex-col gap-4 rounded-2xl border-[3px] border-tinta bg-papel p-5 shadow-solida sm:p-6"
    >
      <BarraProgresso percentual={noNavegador ? percentual : 0} rotulo={`Curso concluído (${aulas.length} aulas publicadas)`} />
      {proxima ? (
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="m-0 text-base">
            {comecou ? "Continuar de onde parei:" : "Comece por:"}{" "}
            <strong>
              Módulo {doisDigitos(proxima.modulo)} · {proxima.titulo}
            </strong>
          </p>
          <Link href={proxima.url} className={classesBotao("primario")}>
            {comecou ? "Continuar" : "Começar"}
          </Link>
        </div>
      ) : (
        <p className="m-0 font-semibold">Você concluiu todas as aulas publicadas. Revise em /revisao.</p>
      )}
    </section>
  );
}

const ROTULO_STATUS: Record<StatusModulo, string> = {
  "nao-iniciado": "Não iniciado",
  "em-andamento": "Em andamento",
  concluido: "Concluído",
};

const COR_STATUS: Record<StatusModulo, string> = {
  "nao-iniciado": "bg-branco text-tinta",
  "em-andamento": "bg-amarelo text-tinta",
  concluido: "bg-tinta text-amarelo",
};

/** Status chip of a module, read from progress. */
export function SeloStatus({ ids }: { ids: string[] }) {
  const progresso = useProgresso();
  const noNavegador = useNoNavegador();
  if (ids.length === 0) {
    return <span className="rounded-full border-2 border-tinta px-3 py-1 font-mono text-xs font-semibold">Em breve</span>;
  }
  const status = noNavegador ? statusModulo(progresso, ids) : "nao-iniciado";
  const pct = noNavegador ? percentualConcluido(progresso, ids) : 0;
  return (
    <span
      data-status={status}
      className={`rounded-full border-2 border-tinta px-3 py-1 font-mono text-xs font-semibold ${COR_STATUS[status]}`}
    >
      {ROTULO_STATUS[status]} · {pct}%
    </span>
  );
}

/** Lesson list of a module with done marks. */
export function ListaAulas({ aulas }: { aulas: ResumoAula[] }) {
  const progresso = useProgresso();
  return (
    <ol className="m-0 flex list-none flex-col gap-2 p-0">
      {aulas.map((a) => {
        const feita = Boolean(progresso.concluidas[a.id]);
        return (
          <li key={a.id}>
            <Link
              href={a.url}
              className="flex min-h-11 items-center gap-3 rounded-xl border-[3px] border-tinta bg-branco px-4 py-2 font-semibold no-underline hover:bg-amarelo-claro"
            >
              <span
                aria-hidden="true"
                className={`grid size-7 shrink-0 place-items-center rounded-full border-2 border-tinta font-mono text-xs ${feita ? "bg-tinta text-amarelo" : ""}`}
              >
                {feita ? "✓" : a.aula}
              </span>
              <span>
                Aula {a.aula} · {a.titulo}
                {feita ? <span className="sr-only"> (concluída)</span> : null}
              </span>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
