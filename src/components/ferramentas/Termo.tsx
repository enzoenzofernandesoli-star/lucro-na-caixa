"use client";

import Link from "next/link";
import { useId, useState, type ReactNode } from "react";
import { termoPorId } from "@/lib/glossario";

type TermoProps = {
  /** Glossary id in content/glossario.json. Unknown ids fail the build. */
  id: string;
  children: ReactNode;
};

/** Technical term linked to the glossary: a button that shows its definition inline. */
export function Termo({ id, children }: TermoProps) {
  const [aberto, setAberto] = useState(false);
  const idDefinicao = useId();
  const termo = termoPorId(id);
  if (!termo) throw new Error(`<Termo id="${id}">: termo não existe em content/glossario.json.`);

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
        <strong>{termo.termo}:</strong> {termo.definicao}{" "}
        <Link href={`/glossario#${id}`} className="font-mono text-[0.85em]">
          ver no glossário
        </Link>
      </span>
    </>
  );
}
