"use client";

import { useState } from "react";
import { calcularCacLtv } from "@/lib/calculos";
import { formatarRazao, formatarReais } from "@/lib/dinheiro";
import { CampoNumero } from "./CampoNumero";
import { PainelCalculadora, Resultado, Veredito } from "./Painel";

// Example values only.
const EXEMPLO = { gasto: 200_000, clientes: 5_000, ticket: 12_000, margem: 3_500, compras: 180 };

export function CalculadoraCacLtv() {
  const [v, setV] = useState(EXEMPLO);
  const set = (k: keyof typeof EXEMPLO) => (n: number) => setV((a) => ({ ...a, [k]: n }));
  const r = calcularCacLtv({
    gastoMarketingCentavos: v.gasto,
    novosClientesCentesimos: v.clientes,
    ticketMedioCentavos: v.ticket,
    margemPontosBase: v.margem,
    comprasPorClienteCentesimos: v.compras,
  });

  return (
    <PainelCalculadora
      tipo="cac-ltv"
      rotulo="CAC x LTV"
      legenda="Aquisição e valor do cliente"
      campos={
        <>
          <CampoNumero rotulo="Gasto com marketing no período" formato="reais" valor={v.gasto} aoMudar={set("gasto")} passo={10_000} />
          <CampoNumero rotulo="Clientes novos no período" formato="numero" valor={v.clientes} aoMudar={set("clientes")} passo={100} />
          <CampoNumero rotulo="Ticket médio" formato="reais" valor={v.ticket} aoMudar={set("ticket")} passo={500} />
          <CampoNumero rotulo="Margem de contribuição (%)" formato="percentual" valor={v.margem} aoMudar={set("margem")} passo={100} minimo={-10_000} maximo={10_000} />
          <CampoNumero rotulo="Compras por cliente" formato="numero" valor={v.compras} aoMudar={set("compras")} passo={10} />
        </>
      }
      resultados={
        <>
          <Resultado rotulo="CAC (custo por cliente novo)" nome="cac" valor={r.cacCentavos === null ? "—" : formatarReais(r.cacCentavos)} />
          <Resultado rotulo="LTV (margem por cliente)" nome="ltv" valor={formatarReais(r.ltvCentavos)} />
          <Resultado rotulo="LTV ÷ CAC" nome="razao" valor={r.razao === null ? "—" : formatarRazao(r.razao)} />
          <Veredito>
            {r.razao === null
              ? "Sem clientes novos não há CAC para comparar."
              : r.razao < 1
                ? "Cada cliente deixa menos margem do que custou para conquistar."
                : "Cada cliente paga o próprio custo de aquisição. Quanto sobra é o que financia o resto."}
          </Veredito>
        </>
      }
    />
  );
}
