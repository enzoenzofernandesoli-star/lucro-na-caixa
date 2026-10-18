"use client";

import { useState } from "react";
import { simularCampanha } from "@/lib/calculos";
import { formatarRazao, formatarReais } from "@/lib/dinheiro";
import { CampoNumero } from "./CampoNumero";
import { PainelCalculadora, Resultado, Veredito } from "./Painel";

// Example values only: R$ 150 test, R$ 1,20 per click, 1,5% conversion.
const EXEMPLO = { orcamento: 15_000, cpc: 120, conversao: 150, ticket: 8_990, margem: 3_500 };

/** Campaign simulator (module 12): budget → clicks → sales → profit. */
export function SimuladorCampanha() {
  const [v, setV] = useState(EXEMPLO);
  const set = (k: keyof typeof EXEMPLO) => (n: number) => setV((a) => ({ ...a, [k]: n }));
  const r = simularCampanha({
    orcamentoCentavos: v.orcamento,
    cpcCentavos: v.cpc,
    conversaoPontosBase: v.conversao,
    ticketMedioCentavos: v.ticket,
    margemPontosBase: v.margem,
  });
  const vendas = r.vendas.toLocaleString("pt-BR", { maximumFractionDigits: 1 });

  return (
    <PainelCalculadora
      tipo="campanha"
      rotulo="Simulador de campanha"
      legenda="Orçamento e taxas esperadas"
      campos={
        <>
          <CampoNumero rotulo="Orçamento do teste" formato="reais" valor={v.orcamento} aoMudar={set("orcamento")} passo={5_000} />
          <CampoNumero rotulo="Custo por clique (CPC)" formato="reais" valor={v.cpc} aoMudar={set("cpc")} passo={10} minimo={1} />
          <CampoNumero rotulo="Conversão do site (%)" formato="percentual" valor={v.conversao} aoMudar={set("conversao")} passo={10} maximo={10_000} />
          <CampoNumero rotulo="Ticket médio" formato="reais" valor={v.ticket} aoMudar={set("ticket")} passo={500} />
          <CampoNumero rotulo="Margem antes do anúncio (%)" formato="percentual" valor={v.margem} aoMudar={set("margem")} passo={100} minimo={-10_000} maximo={10_000} />
        </>
      }
      resultados={
        <>
          <Resultado rotulo="Vendas esperadas" nome="vendas" valor={vendas} nota={`${r.cliques.toLocaleString("pt-BR")} cliques`} />
          <Resultado rotulo="CPA esperado" nome="cpa" valor={r.cpaCentavos === null ? "—" : formatarReais(r.cpaCentavos)} nota={r.roas === null ? undefined : `ROAS ${formatarRazao(r.roas)}`} />
          <Resultado rotulo="Resultado do teste" nome="resultado" valor={formatarReais(r.resultadoCentavos)} nota={`Margem ${formatarReais(r.margemCentavos)} − orçamento ${formatarReais(v.orcamento)}`} />
          <Veredito>
            {r.resultadoCentavos >= 0
              ? "No papel, o teste se paga. Confira com os números reais depois de 7 dias."
              : "No papel, o teste dá prejuízo: ele custa aprendizado. Decida quanto aceita pagar por isso."}
          </Veredito>
          <p className="m-0 font-mono text-xs">É uma média esperada, não promessa: CPC e conversão reais variam.</p>
        </>
      }
    />
  );
}
