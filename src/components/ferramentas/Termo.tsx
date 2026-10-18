"use client";

import { useId, useState, type ReactNode } from "react";

type TermoProps = {
  /** Glossary id (the /glossario page arrives in phase 1). */
  id: string;
  definicao: string;
  children: ReactNode;
};

/** Technical term: a button that shows its definition inline. */
export function Termo({ id, definicao, children }: TermoProps) {
  const [aberto, setAberto] = useState(false);
  const idDefinicao = useId();

  return (
    <>
      <button
        type="button"
        data-termo={id}
        aria-expanded={aberto}
        aria-controls={idDefinicao}
        onClick={() => setAberto((a) => !a)}
        className="inline cursor-pointer border-0 bg-transparent p-0 font-[inherit] font-semibold text-inherit underline decoration-vermelho decoration-dotted decoration-2 underline-offset-4 hover:bg-amarelo-claro"
      >
        {children}
      </button>
      <span
        id={idDefinicao}
        role="note"
        hidden={!aberto}
        className="mx-1 rounded-md border-2 border-tinta bg-amarelo-claro px-2 py-0.5 text-[0.9em]"
      >
        {definicao}
      </span>
    </>
  );
}
