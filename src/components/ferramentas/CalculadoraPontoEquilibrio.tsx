"use client";

import { useState } from "react";
import { calcularPontoEquilibrio } from "@/lib/calculos";
import { formatarReais } from "@/lib/dinheiro";
import { CampoNumero } from "./CampoNumero";
import { PainelCalculadora, Resultado, Veredito } from "./Painel";

// Example values only.
const EXEMPLO = { fixos: 300_000, preco: 10_000, margem: 3_900 };

export function CalculadoraPontoEquilibrio() {
  const [v, setV] = useState(EXEMPLO);
  const set = (k: keyof typeof EXEMPLO) => (n: number) => setV((a) => ({ ...a, [k]: n }));
  const r = calcularPontoEquilibrio({ custosFixosCentavos: v.fixos, precoCentavos: v.preco, margemPontosBase: v.margem });

  return (
    <PainelCalculadora
      tipo="ponto-equilibrio"
      rotulo="Ponto de equilíbrio"
      legenda="Custos fixos e margem"
      campos={
        <>
          <CampoNumero rotulo="Custos fixos do mês" formato="reais" valor={v.fixos} aoMudar={set("fixos")} passo={10_000} />
          <CampoNumero rotulo="Preço médio de venda" formato="reais" valor={v.preco} aoMudar={set("preco")} passo={500} />
          <CampoNumero rotulo="Margem de contribuição (%)" formato="percentual" valor={v.margem} aoMudar={set("margem")} passo={100} minimo={-10_000} maximo={10_000} />
        </>
      }
      resultados={
        <>
          <Resultado rotulo="Faturamento mínimo no mês" nome="faturamento" valor={r.faturamentoCentavos === null ? "—" : formatarReais(r.faturamentoCentavos)} />
          <Resultado
            rotulo="Vendas por mês"
            nome="unidades"
            valor={r.unidades === null ? "—" : r.unidades.toLocaleString("pt-BR")}
            nota={`Cada venda deixa ${formatarReais(r.margemUnitariaCentavos)} de margem`}
          />
          <Veredito>
            {r.unidades === null
              ? "Sem margem positiva, nenhuma quantidade de vendas paga os custos fixos."
              : "Abaixo disso, o mês fecha no prejuízo. Acima, cada venda vira lucro."}
          </Veredito>
        </>
      }
    />
  );
}
