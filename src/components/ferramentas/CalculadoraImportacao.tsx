"use client";

import { useState } from "react";
import { calcularImportacao } from "@/lib/calculos";
import { formatarReais } from "@/lib/dinheiro";
import { CampoNumero } from "./CampoNumero";
import { PainelCalculadora, Resultado, Veredito } from "./Painel";

// Every field is the student's. Taxes start at zero on purpose: no tax rate is fixed
// in code. The rates and rules come from lesson 4.4, with source and date.
const EXEMPLO = { preco: 500, quantidade: 10_000, cotacao: 0, frete: 0, seguro: 0, impostos: 0, outras: 0 };

export function CalculadoraImportacao() {
  const [v, setV] = useState(EXEMPLO);
  const set = (k: keyof typeof EXEMPLO) => (n: number) => setV((a) => ({ ...a, [k]: n }));
  const r = calcularImportacao({
    precoUnitarioUsdCentavos: v.preco,
    quantidadeCentesimos: v.quantidade,
    cotacaoCentavos: v.cotacao,
    freteUsdCentavos: v.frete,
    seguroUsdCentavos: v.seguro,
    impostosPontosBase: v.impostos,
    outrasTaxasCentavos: v.outras,
  });

  return (
    <PainelCalculadora
      tipo="importacao"
      rotulo="Custo de importação"
      legenda="Dados da importação"
      campos={
        <>
          <CampoNumero rotulo="Preço por unidade (US$)" formato="numero" valor={v.preco} aoMudar={set("preco")} passo={50} />
          <CampoNumero rotulo="Quantidade" formato="numero" valor={v.quantidade} aoMudar={set("quantidade")} passo={1_000} />
          <CampoNumero rotulo="Cotação do dólar (R$)" formato="reais" valor={v.cotacao} aoMudar={set("cotacao")} passo={5} />
          <CampoNumero rotulo="Frete internacional (US$)" formato="numero" valor={v.frete} aoMudar={set("frete")} passo={500} />
          <CampoNumero rotulo="Seguro (US$)" formato="numero" valor={v.seguro} aoMudar={set("seguro")} passo={100} />
          <CampoNumero rotulo="Impostos (% sobre produto + frete + seguro)" formato="percentual" valor={v.impostos} aoMudar={set("impostos")} passo={100} maximo={50_000} />
          <CampoNumero rotulo="Outras taxas (R$)" formato="reais" valor={v.outras} aoMudar={set("outras")} passo={1_000} />
        </>
      }
      resultados={
        <>
          <Resultado rotulo="Custo total em reais" nome="total" valor={formatarReais(r.totalCentavos)} nota={`Impostos: ${formatarReais(r.impostosCentavos)}`} />
          <Resultado rotulo="Custo por unidade" nome="unitario" valor={r.custoUnitarioCentavos === null ? "—" : formatarReais(r.custoUnitarioCentavos)} />
          <Veredito>
            {v.cotacao === 0
              ? "Preencha a cotação do dólar do dia: sem ela o custo fica zerado."
              : "Modelo simplificado: confira na aula 4.4 quais impostos se aplicam ao seu caso e preencha os percentuais."}
          </Veredito>
        </>
      }
    />
  );
}
