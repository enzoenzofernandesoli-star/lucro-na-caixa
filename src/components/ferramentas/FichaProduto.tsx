"use client";

import { useId, useState } from "react";
import { CRITERIOS_FICHA, avaliarProduto, type NotasFicha, type VereditoFicha } from "@/lib/calculos";
import { PainelCalculadora, Resultado, Veredito } from "./Painel";

const INICIAL = Object.fromEntries(CRITERIOS_FICHA.map((c) => [c.id, 3])) as NotasFicha;

const TEXTO: Record<VereditoFicha, string> = {
  testar: "Bom candidato: vale fazer um teste pequeno.",
  talvez: "Talvez: só teste se não houver opção melhor na lista.",
  descartar: "Descartar por enquanto.",
};

function Criterio({ id, titulo, ajuda, nota, aoMudar }: { id: string; titulo: string; ajuda: string; nota: number; aoMudar: (n: number) => void }) {
  const nome = useId();
  return (
    <fieldset className="m-0 border-0 p-0" data-criterio={id}>
      <legend className="text-base font-semibold">{titulo}</legend>
      <p className="m-0 mb-2 text-sm">{ajuda}</p>
      <div className="flex flex-wrap gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <label
            key={n}
            className={`grid size-11 cursor-pointer place-items-center rounded-[10px] border-[3px] border-tinta font-mono text-lg font-semibold has-[:focus-visible]:outline has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-offset-[3px] ${
              nota === n ? "bg-tinta text-amarelo" : "bg-branco hover:bg-amarelo-claro"
            }`}
          >
            <input type="radio" name={nome} value={n} checked={nota === n} onChange={() => aoMudar(n)} className="sr-only" />
            <span aria-hidden="true">{n}</span>
            <span className="sr-only">
              {titulo}: nota {n}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/** Interactive product scoring sheet (module 3). */
export function FichaProduto() {
  const [notas, setNotas] = useState<NotasFicha>(INICIAL);
  const r = avaliarProduto(notas);
  const nomes = Object.fromEntries(CRITERIOS_FICHA.map((c) => [c.id, c.titulo]));

  return (
    <PainelCalculadora
      tipo="ficha-produto"
      rotulo="Ficha de avaliação"
      legenda="Notas de 1 a 5 por critério"
      campos={CRITERIOS_FICHA.map((c) => (
        <Criterio key={c.id} id={c.id} titulo={c.titulo} ajuda={c.ajuda} nota={notas[c.id]} aoMudar={(n) => setNotas((a) => ({ ...a, [c.id]: n }))} />
      ))}
      resultados={
        <>
          <Resultado rotulo="Nota média" nome="media" valor={r.media.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} nota="de 1 a 5" />
          <Resultado rotulo="Veredito" nome="veredito" valor={r.veredito === "testar" ? "Testar" : r.veredito === "talvez" ? "Talvez" : "Descartar"} />
          <Veredito>
            {TEXTO[r.veredito]}
            {r.eliminatorios.length > 0 ? ` Nota 1 em ${r.eliminatorios.map((c) => nomes[c]).join(" e ")} elimina o produto, qualquer que seja a média.` : ""}
          </Veredito>
          <p className="m-0 font-mono text-xs">Cortes (4 e 3) são critério didático do curso, não regra de mercado.</p>
        </>
      }
    />
  );
}
