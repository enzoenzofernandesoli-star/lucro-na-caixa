"use client";

import Link from "next/link";
import { useDeferredValue, useId, useState } from "react";
import { dataBr, filtrarGlossario, type TermoGlossario } from "@/lib/glossario";

/** Lesson id -> link data, for terms whose rule is checked in a lesson. */
export type AulasDoGlossario = Record<string, { url: string; titulo: string }>;

export function CampoBusca({
  rotulo,
  valor,
  aoMudar,
  placeholder,
}: {
  rotulo: string;
  valor: string;
  aoMudar: (v: string) => void;
  placeholder?: string;
}) {
  const id = useId();
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="font-mono text-xs tracking-[0.15em] uppercase">
        {rotulo}
      </label>
      <input
        id={id}
        type="search"
        value={valor}
        onChange={(e) => aoMudar(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        className="min-h-[52px] w-full max-w-[640px] rounded-xl border-[3px] border-tinta bg-branco px-4 text-lg"
      />
    </div>
  );
}

export function ListaGlossario({ termos, aulas }: { termos: TermoGlossario[]; aulas: AulasDoGlossario }) {
  const [busca, setBusca] = useState("");
  const adiada = useDeferredValue(busca);
  const filtrados = filtrarGlossario(termos, adiada);

  return (
    <div className="flex flex-col gap-5">
      <CampoBusca rotulo="Buscar termo" valor={busca} aoMudar={setBusca} placeholder="ex.: margem, ROAS, CNPJ" />
      <p className="m-0 font-mono text-sm" aria-live="polite">
        {filtrados.length} {filtrados.length === 1 ? "termo" : "termos"}
      </p>
      <dl className="m-0 flex flex-col gap-3">
        {filtrados.map((t) => (
          <div
            key={t.id}
            id={t.id}
            className="scroll-mt-6 rounded-2xl border-[3px] border-tinta bg-branco p-4 target:bg-amarelo-claro sm:p-5"
          >
            <dt className="text-lg font-bold">{t.termo}</dt>
            <dd className="m-0 mt-1 max-w-[70ch] leading-relaxed">{t.definicao}</dd>
            {t.aula && t.conferidoEm && aulas[t.aula] ? (
              <dd className="m-0 mt-2 font-mono text-sm">
                Regra que muda · conferida em {dataBr(t.conferidoEm)} · fonte na{" "}
                <Link href={aulas[t.aula].url}>
                  aula {t.aula.replace("-", ".")} — {aulas[t.aula].titulo}
                </Link>
              </dd>
            ) : null}
          </div>
        ))}
      </dl>
    </div>
  );
}
