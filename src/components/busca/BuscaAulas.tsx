"use client";

import Link from "next/link";
import { useDeferredValue, useState } from "react";
import { doisDigitos } from "@/data/modulos";
import { buscar, type ItemIndice } from "@/lib/busca";
import { CampoBusca } from "./ListaGlossario";

export function BuscaAulas({ indice }: { indice: ItemIndice[] }) {
  const [consulta, setConsulta] = useState("");
  const adiada = useDeferredValue(consulta);
  const resultados = buscar(indice, adiada);
  const curta = adiada.trim().length < 2;

  return (
    <div className="flex flex-col gap-5">
      <CampoBusca rotulo="O que você procura?" valor={consulta} aoMudar={setConsulta} placeholder="ex.: frete grátis, Pix, CNAE" />
      <p className="m-0 font-mono text-sm" aria-live="polite">
        {curta
          ? "Digite pelo menos 2 letras."
          : `${resultados.length} ${resultados.length === 1 ? "aula encontrada" : "aulas encontradas"}`}
      </p>
      <ol className="m-0 flex list-none flex-col gap-3 p-0">
        {resultados.map((r) => (
          <li key={r.id}>
            <Link
              href={r.url}
              className="flex flex-col gap-1 rounded-2xl border-[3px] border-tinta bg-branco p-4 no-underline hover:bg-amarelo-claro hover:text-tinta"
            >
              <span className="font-mono text-xs tracking-[0.15em]">
                MÓDULO {doisDigitos(r.modulo)} · AULA {r.id.split("-")[1]}
              </span>
              <span className="text-lg font-bold">{r.titulo}</span>
              <span className="text-base">{r.trecho}</span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
