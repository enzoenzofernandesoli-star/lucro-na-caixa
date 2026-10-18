"use client";

import { useState } from "react";
import { calcularPrecoIdeal } from "@/lib/calculos";
import { formatarPercentual, formatarReais } from "@/lib/dinheiro";
import { CampoNumero } from "./CampoNumero";
import { PainelCalculadora, Resultado, Veredito } from "./Painel";

// Example values only.
const EXEMPLO = { custo: 3_500, frete: 1_000, embalagem: 100, taxa: 1_500, margem: 3_000 };

export function CalculadoraPreco() {
  const [v, setV] = useState(EXEMPLO);
  const set = (k: keyof typeof EXEMPLO) => (n: number) => setV((a) => ({ ...a, [k]: n }));
  const r = calcularPrecoIdeal({
    custoCentavos: v.custo,
    freteCentavos: v.frete,
    embalagemCentavos: v.embalagem,
    taxaPontosBase: v.taxa,
    margemDesejadaPontosBase: v.margem,
  });

  return (
    <PainelCalculadora
      tipo="preco"
      rotulo="Preço ideal"
      legenda="Custos e margem desejada"
      campos={
        <>
          <CampoNumero rotulo="Custo do produto" formato="reais" valor={v.custo} aoMudar={set("custo")} passo={500} />
          <CampoNumero rotulo="Frete que você paga" formato="reais" valor={v.frete} aoMudar={set("frete")} passo={100} />
          <CampoNumero rotulo="Embalagem" formato="reais" valor={v.embalagem} aoMudar={set("embalagem")} passo={50} />
          <CampoNumero rotulo="Taxas e imposto (%)" formato="percentual" valor={v.taxa} aoMudar={set("taxa")} passo={100} maximo={10_000} />
          <CampoNumero rotulo="Margem que você quer (%)" formato="percentual" valor={v.margem} aoMudar={set("margem")} passo={100} maximo={10_000} />
        </>
      }
      resultados={
        <>
          <Resultado rotulo="Preço mínimo de venda" nome="preco" valor={r.precoCentavos === null ? "—" : formatarReais(r.precoCentavos)} />
          {r.margem ? (
            <Resultado
              rotulo="Margem nesse preço"
              nome="margem"
              valor={formatarReais(r.margem.margemCentavos)}
              nota={r.margem.margemPontosBase === null ? undefined : `${formatarPercentual(r.margem.margemPontosBase)} do preço`}
            />
          ) : null}
          <Veredito>
            {r.precoCentavos === null
              ? "Taxas + margem desejada somam 100% ou mais: nenhum preço fecha essa conta."
              : "Preço = custos por venda ÷ (1 − taxas − margem desejada)."}
          </Veredito>
        </>
      }
    />
  );
}
