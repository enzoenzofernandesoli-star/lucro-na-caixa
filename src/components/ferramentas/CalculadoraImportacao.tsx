"use client";

import { useState } from "react";
import { calcularImportacao } from "@/lib/calculos";
import { formatarReais } from "@/lib/dinheiro";
import { CampoNumero } from "./CampoNumero";
import { PainelCalculadora, Resultado, Veredito } from "./Painel";

// Every field is the student's. Rates start at zero on purpose: no tax rate is fixed in
// code. The current rules come from lesson 4.4, with source and date.
const EXEMPLO = {
  preco: 500,
  quantidade: 10_000,
  cotacao: 0,
  frete: 0,
  seguro: 0,
  ii: 0,
  deducao: 0,
  ipi: 0,
  pisCofins: 0,
  icms: 0,
  taxas: 0,
};

export function CalculadoraImportacao() {
  const [v, setV] = useState(EXEMPLO);
  const set = (k: keyof typeof EXEMPLO) => (n: number) => setV((a) => ({ ...a, [k]: n }));
  const r = calcularImportacao({
    precoUnitarioUsdCentavos: v.preco,
    quantidadeCentesimos: v.quantidade,
    cotacaoCentavos: v.cotacao,
    freteUsdCentavos: v.frete,
    seguroUsdCentavos: v.seguro,
    impostoImportacaoPontosBase: v.ii,
    deducaoImpostoUsdCentavos: v.deducao,
    ipiPontosBase: v.ipi,
    pisCofinsPontosBase: v.pisCofins,
    icmsPontosBase: v.icms,
    outrasTaxasCentavos: v.taxas,
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
          <CampoNumero rotulo="Frete internacional (US$)" formato="numero" valor={v.frete} aoMudar={set("frete")} passo={500} />
          <CampoNumero rotulo="Seguro (US$)" formato="numero" valor={v.seguro} aoMudar={set("seguro")} passo={100} />
          <CampoNumero rotulo="Cotação do dólar (R$)" formato="reais" valor={v.cotacao} aoMudar={set("cotacao")} passo={5} />
          <CampoNumero rotulo="Imposto de importação (%)" formato="percentual" valor={v.ii} aoMudar={set("ii")} passo={100} maximo={10_000} />
          <CampoNumero rotulo="Desconto no imposto de importação (US$)" formato="numero" valor={v.deducao} aoMudar={set("deducao")} passo={500} />
          <CampoNumero rotulo="IPI (%) — importação formal" formato="percentual" valor={v.ipi} aoMudar={set("ipi")} passo={100} maximo={10_000} />
          <CampoNumero rotulo="PIS + Cofins (%) — importação formal" formato="percentual" valor={v.pisCofins} aoMudar={set("pisCofins")} passo={100} maximo={10_000} />
          <CampoNumero rotulo="ICMS (%) — calculado por dentro" formato="percentual" valor={v.icms} aoMudar={set("icms")} passo={100} maximo={9_900} />
          <CampoNumero rotulo="Outras taxas (R$)" formato="reais" valor={v.taxas} aoMudar={set("taxas")} passo={1_000} />
        </>
      }
      resultados={
        <>
          <Resultado rotulo="Custo total em reais" nome="total" valor={formatarReais(r.totalCentavos)} nota={`Impostos: ${formatarReais(r.impostosCentavos)}`} />
          <Resultado rotulo="Custo por unidade" nome="unitario" valor={r.custoUnitarioCentavos === null ? "—" : formatarReais(r.custoUnitarioCentavos)} />
          <Veredito>
            {r.erro ??
              (v.cotacao === 0
                ? "Preencha a cotação do dólar do dia: sem ela o custo fica zerado."
                : "Os percentuais são os que você digitou. Confira na aula 4.4 as regras em vigor para o seu caso.")}
          </Veredito>
        </>
      }
    />
  );
}
