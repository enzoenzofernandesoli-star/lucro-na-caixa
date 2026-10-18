"use client";

import { useState } from "react";
import { calcularMarkup } from "@/lib/calculos";
import { formatarPercentual, formatarRazao } from "@/lib/dinheiro";
import { CampoNumero } from "./CampoNumero";
import { PainelCalculadora, Resultado, Veredito } from "./Painel";

// Example values only.
const EXEMPLO = { custo: 5_000, preco: 10_000 };

export function CalculadoraMarkup() {
  const [v, setV] = useState(EXEMPLO);
  const set = (k: keyof typeof EXEMPLO) => (n: number) => setV((a) => ({ ...a, [k]: n }));
  const r = calcularMarkup(v.custo, v.preco);

  return (
    <PainelCalculadora
      tipo="markup"
      rotulo="Markup x margem"
      legenda="Custo e preço"
      campos={
        <>
          <CampoNumero rotulo="Custo do produto" formato="reais" valor={v.custo} aoMudar={set("custo")} passo={500} />
          <CampoNumero rotulo="Preço de venda" formato="reais" valor={v.preco} aoMudar={set("preco")} passo={500} />
        </>
      }
      resultados={
        <>
          <Resultado
            rotulo="Markup (sobre o custo)"
            nome="markup"
            valor={r.markupPontosBase === null ? "—" : formatarPercentual(r.markupPontosBase)}
            nota={r.multiplicador === null ? undefined : `Multiplicador ${formatarRazao(r.multiplicador)}×`}
          />
          <Resultado
            rotulo="Margem bruta (sobre o preço)"
            nome="margem-bruta"
            valor={r.margemBrutaPontosBase === null ? "—" : formatarPercentual(r.margemBrutaPontosBase)}
          />
          <Veredito>
            Mesmo dinheiro, porcentagens diferentes: markup divide pelo custo, margem divide pelo preço. Esta margem
            ainda não desconta taxas, imposto e frete.
          </Veredito>
        </>
      }
    />
  );
}
