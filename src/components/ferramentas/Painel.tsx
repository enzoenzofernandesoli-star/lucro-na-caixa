import type { ReactNode } from "react";
import { RotuloMono } from "@/components/marca/Cartao";

type PainelCalculadoraProps = {
  tipo: string;
  rotulo: string;
  legenda: string;
  campos: ReactNode;
  resultados: ReactNode;
};

/** Shared calculator layout: white input card + yellow results card (design "aula" section). */
export function PainelCalculadora({ tipo, rotulo, legenda, campos, resultados }: PainelCalculadoraProps) {
  return (
    // Columns follow the width the calculator really has (container query), not the viewport:
    // inside a lesson with the sidebar, a 1024 px screen leaves too little room for two.
    <div className="@container" data-calculadora={tipo}>
      <div className="grid gap-5 @3xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <fieldset className="flex min-w-0 flex-col gap-3.5 rounded-2xl border-[3px] border-tinta bg-branco p-5 sm:p-6">
          <legend className="sr-only">{legenda}</legend>
          <RotuloMono aria-hidden="true">{rotulo}</RotuloMono>
          {campos}
        </fieldset>
        <div
          className="flex flex-col justify-between gap-4 rounded-2xl border-[3px] border-tinta bg-amarelo p-5 sm:p-6"
          aria-live="polite"
          role="status"
        >
          {resultados}
        </div>
      </div>
    </div>
  );
}

export function Resultado({ rotulo, valor, nome, nota }: { rotulo: string; valor: string; nome: string; nota?: ReactNode }) {
  return (
    <div>
      <div className="text-[15px] font-medium">{rotulo}</div>
      <div className="font-numero text-[40px] leading-[1.1] font-extrabold break-words" data-resultado={nome}>
        {valor}
      </div>
      {nota ? <div className="font-mono text-sm">{nota}</div> : null}
    </div>
  );
}

export function Veredito({ children }: { children: ReactNode }) {
  return <p className="m-0 text-[15px] leading-normal font-bold text-vermelho-texto">{children}</p>;
}
