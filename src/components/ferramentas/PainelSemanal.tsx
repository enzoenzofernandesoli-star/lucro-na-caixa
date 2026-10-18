"use client";

import { useState } from "react";
import { calcularPainelSemanal } from "@/lib/calculos";
import { formatarPercentual, formatarRazao, formatarReais } from "@/lib/dinheiro";
import { CampoNumero } from "./CampoNumero";
import { PainelCalculadora, Resultado, Veredito } from "./Painel";

// Example week only. Counts are ×100 because CampoNumero "numero" works in hundredths.
const EXEMPLO = {
  visitas: 200_000,
  carrinhos: 12_000,
  checkouts: 6_000,
  pedidos: 3_000,
  receita: 300_000,
  gasto: 90_000,
  margem: 4_000,
};

const pct = (v: number | null) => (v === null ? "—" : formatarPercentual(v));

/** Weekly dashboard (module 14): the numbers to look at every Monday. */
export function PainelSemanal() {
  const [v, setV] = useState(EXEMPLO);
  const set = (k: keyof typeof EXEMPLO) => (n: number) => setV((a) => ({ ...a, [k]: n }));
  const r = calcularPainelSemanal({
    visitas: v.visitas / 100,
    carrinhos: v.carrinhos / 100,
    checkouts: v.checkouts / 100,
    pedidos: v.pedidos / 100,
    receitaCentavos: v.receita,
    gastoAnunciosCentavos: v.gasto,
    margemPontosBase: v.margem,
  });

  return (
    <PainelCalculadora
      tipo="painel-semanal"
      rotulo="Painel semanal"
      legenda="Números da semana, tirados da loja"
      campos={
        <>
          <CampoNumero rotulo="Visitas (sessões)" formato="numero" valor={v.visitas} aoMudar={set("visitas")} passo={10_000} />
          <CampoNumero rotulo="Adições ao carrinho" formato="numero" valor={v.carrinhos} aoMudar={set("carrinhos")} passo={1_000} />
          <CampoNumero rotulo="Checkouts iniciados" formato="numero" valor={v.checkouts} aoMudar={set("checkouts")} passo={1_000} />
          <CampoNumero rotulo="Pedidos pagos" formato="numero" valor={v.pedidos} aoMudar={set("pedidos")} passo={100} />
          <CampoNumero rotulo="Receita da semana" formato="reais" valor={v.receita} aoMudar={set("receita")} passo={10_000} />
          <CampoNumero rotulo="Gasto com anúncios" formato="reais" valor={v.gasto} aoMudar={set("gasto")} passo={5_000} />
          <CampoNumero rotulo="Margem antes do anúncio (%)" formato="percentual" valor={v.margem} aoMudar={set("margem")} passo={100} minimo={-10_000} maximo={10_000} />
        </>
      }
      resultados={
        <>
          <Resultado
            rotulo="Conversão da loja"
            nome="conversao"
            valor={pct(r.conversao)}
            nota={`Carrinho ${pct(r.carrinhoPorVisita)} · checkout ${pct(r.checkoutPorCarrinho)} · pedido ${pct(r.pedidoPorCheckout)}`}
          />
          <Resultado
            rotulo="CPA da semana"
            nome="cpa"
            valor={r.cpaCentavos === null ? "—" : formatarReais(r.cpaCentavos)}
            nota={r.ticketMedioCentavos === null ? undefined : `Ticket médio ${formatarReais(r.ticketMedioCentavos)}`}
          />
          <Resultado
            rotulo="ROAS"
            nome="roas"
            valor={r.roas === null ? "—" : formatarRazao(r.roas)}
            nota={r.roasEquilibrio === null ? "Sem margem, não há ROAS de equilíbrio" : `Equilíbrio ${formatarRazao(r.roasEquilibrio)}`}
          />
          <Resultado rotulo="Lucro da semana (antes de custos fixos)" nome="lucro" valor={formatarReais(r.lucroCentavos)} />
          <Veredito>
            {r.lucroCentavos >= 0
              ? "A semana pagou os anúncios. Confira se sobra o suficiente para os custos fixos."
              : "A semana não pagou os anúncios. Veja qual etapa do funil caiu antes de mexer na verba."}
          </Veredito>
        </>
      }
    />
  );
}
