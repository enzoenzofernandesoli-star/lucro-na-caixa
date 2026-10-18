"use client";

import Link from "next/link";
import { useProgressoIlegivel } from "@/lib/useProgresso";

/** Shown while the saved progress cannot be read: nothing is overwritten until an import. */
export function AvisoProgressoIlegivel({ comLink = true }: { comLink?: boolean }) {
  const ilegivel = useProgressoIlegivel();
  if (!ilegivel) return null;
  return (
    <p role="alert" className="m-0 rounded-xl border-[3px] border-tinta bg-amarelo p-4 font-semibold" data-progresso-ilegivel>
      O progresso salvo neste navegador não pôde ser lido. Para não apagar nada, o curso não vai salvar novas
      alterações até você importar uma cópia do progresso
      {comLink ? (
        <>
          {" "}
          na <Link href="/trilha#titulo-backup">trilha</Link>
        </>
      ) : null}
      . O conteúdo antigo fica guardado à parte neste navegador.
    </p>
  );
}
