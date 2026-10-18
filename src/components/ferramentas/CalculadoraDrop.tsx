"use client";

import { useState } from "react";
import { calcularMargemDrop } from "@/lib/calculos";
import { formatarPercentual, formatarReais } from "@/lib/dinheiro";
import { CampoNumero } from "./CampoNumero";
import { PainelCalculadora, Resultado, Veredito } from "./Painel";

// Example values only.
const EXEMPLO = {
  preco: 12_990,
  custo: 5_500,
  taxas: 500,
  impostos: 600,
  cpa: 3_000,
  reembolso: 800,
  chargeback: 100,
  tarifa: 1_500,
  extra: 0,
};

/** Dropshipping margin (module 16): refunds and chargebacks inside the margin. */
export function CalculadoraDrop() {
  const [v, setV] = useState(EXEMPLO);
  const set = (k: keyof typeof EXEMPLO) => (n: number) => setV((a) => ({ ...a, [k]: n }));
  const r = calcularMargemDrop({
    precoCentavos: v.preco,
    custoFornecedorCentavos: v.custo,
    taxasPontosBase: v.taxas,
    impostosPontosBase: v.impostos,
    cpaCentavos: v.cpa,
    reembolsoPontosBase: v.reembolso,
    chargebackPontosBase: v.chargeback,
    tarifaChargebackCentavos: v.tarifa,
    custoExtraReembolsoCentavos: v.extra,
  });

  return (
    <PainelCalculadora
      tipo="drop"
      rotulo="Margem do drop"
      legenda="Preço, custos e taxas de problema"
      campos={
        <>
          <CampoNumero rotulo="Preço de venda" formato="reais" valor={v.preco} aoMudar={set("preco")} passo={500} />
          <CampoNumero rotulo="Custo do fornecedor + frete dele" formato="reais" valor={v.custo} aoMudar={set("custo")} passo={500} />
          <CampoNumero rotulo="Taxas de plataforma e pagamento (%)" formato="percentual" valor={v.taxas} aoMudar={set("taxas")} passo={50} maximo={10_000} />
          <CampoNumero rotulo="Impostos sobre a venda (%)" formato="percentual" valor={v.impostos} aoMudar={set("impostos")} passo={50} maximo={10_000} />
          <CampoNumero rotulo="Custo de anúncio por venda (CPA)" formato="reais" valor={v.cpa} aoMudar={set("cpa")} passo={500} />
          <CampoNumero rotulo="Pedidos reembolsados (%)" formato="percentual" valor={v.reembolso} aoMudar={set("reembolso")} passo={50} maximo={10_000} />
          <CampoNumero rotulo="Pedidos com chargeback (%)" formato="percentual" valor={v.chargeback} aoMudar={set("chargeback")} passo={25} maximo={10_000} />
          <CampoNumero rotulo="Tarifa por chargeback" formato="reais" valor={v.tarifa} aoMudar={set("tarifa")} passo={500} />
          <CampoNumero rotulo="Custo extra por reembolso (frete de volta, imposto não recuperado)" formato="reais" valor={v.extra} aoMudar={set("extra")} passo={500} />
        </>
      }
      resultados={
        r.erro ? (
          <p role="alert" className="m-0 font-bold text-vermelho-texto">
            {r.erro} Os dois grupos são de pedidos diferentes: um pedido reembolsado não é contado também como chargeback.
          </p>
        ) : (
        <>
          <Resultado rotulo="Lucro de um pedido sem problema" nome="normal" valor={formatarReais(r.lucroPedidoNormalCentavos)} />
          <Resultado
            rotulo="Perda de um pedido reembolsado"
            nome="reembolso"
            valor={formatarReais(r.perdaReembolsoCentavos)}
            nota={`Com chargeback: ${formatarReais(r.perdaChargebackCentavos)}`}
          />
          <Resultado
            rotulo="Lucro médio por pedido"
            nome="esperado"
            valor={formatarReais(r.lucroEsperadoCentavos)}
            nota={r.margemEsperadaPontosBase === null ? undefined : `Margem real ${formatarPercentual(r.margemEsperadaPontosBase)}`}
          />
          <Veredito>
            {r.lucroEsperadoCentavos > 0
              ? "Mesmo com reembolsos e chargebacks, sobra lucro por pedido. Confira as taxas reais depois do teste."
              : "Com os problemas na conta, cada pedido dá prejuízo em média."}
          </Veredito>
          <p className="m-0 font-mono text-xs">
            Premissa: no reembolso e no chargeback você devolve o valor, mas já pagou fornecedor, taxas e anúncio. Impostos tratados como recuperados, a menos que você os inclua no custo extra (confirme com o contador).
          </p>
        </>
        )
      }
    />
  );
}
