"use client";

import { useId, useState } from "react";

type ChecklistProps = {
  titulo?: string;
  itens: string[];
};

/** Interactive checklist. State is per visit for now (saved progress comes in phase 1). */
export function Checklist({ titulo = "Checklist", itens }: ChecklistProps) {
  const [marcados, setMarcados] = useState<boolean[]>(() => itens.map(() => false));
  const base = useId();
  const feitos = marcados.filter(Boolean).length;

  return (
    <div className="rounded-2xl border-[3px] border-tinta bg-branco p-5 sm:p-6" data-checklist>
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <span className="font-mono text-xs tracking-[0.15em] uppercase">{titulo}</span>
        <span className="font-mono text-sm font-semibold" aria-live="polite">
          {feitos} de {itens.length}
        </span>
      </div>
      <ul className="m-0 flex list-none flex-col gap-1 p-0">
        {itens.map((item, i) => (
          <li key={i} className="m-0">
            <label
              htmlFor={`${base}-${i}`}
              className="flex min-h-11 cursor-pointer items-start gap-3 rounded-[10px] px-1 py-2 hover:bg-amarelo-claro"
            >
              <input
                id={`${base}-${i}`}
                type="checkbox"
                checked={marcados[i]}
                onChange={() => setMarcados((a) => a.map((v, j) => (j === i ? !v : v)))}
                className="mt-0.5 size-6 shrink-0 cursor-pointer accent-tinta"
              />
              <span className={marcados[i] ? "line-through" : ""}>{item}</span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}
