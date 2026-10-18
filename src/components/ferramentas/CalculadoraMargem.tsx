"use client";

import { useState } from "react";
import { RotuloMono } from "@/components/marca/Cartao";
import { calcularMargem, vereditoMargem, type Veredito } from "@/lib/calculos";
import { formatarPercentual, formatarRazao, formatarReais } from "@/lib/dinheiro";
import { CampoNumero } from "./CampoNumero";

export type ValoresMargem = {
  preco: number;
  custo: number;
  taxa: number;
  frete: number;
  embalagem: number;
};

// Example values from the approved design (R$ 100 sale -> 39% margin).
export const VALORES_EXEMPLO_MARGEM: ValoresMargem = {
  preco: 10_000,
  custo: 3_500,
  taxa: 1_500,
  frete: 1_000,
  embalagem: 100,
};

const TEXTO_VEREDITO: Record<Veredito, string> = {
  prejuizo: "Cada venda dá prejuízo antes mesmo do anúncio.",
  apertada: "Margem apertada: o anúncio precisa ser muito eficiente.",
  saudavel: "Margem saudável para testar anúncios com controle.",
};

type CalculadoraMargemProps = {
  inicial?: Partial<ValoresMargem>;
};

export function CalculadoraMargem({ inicial }: CalculadoraMargemProps) {
  const [v, setV] = useState<ValoresMargem>({ ...VALORES_EXEMPLO_MARGEM, ...inicial });
  const set = (campo: keyof ValoresMargem) => (valor: number) => setV((a) => ({ ...a, [campo]: valor }));

  const r = calcularMargem({
    precoCentavos: v.preco,
    custoCentavos: v.custo,
    taxaPontosBase: v.taxa,
    freteCentavos: v.frete,
    embalagemCentavos: v.embalagem,
  });
  const veredito = vereditoMargem(r.margemPontosBase);

  return (
    <div className="grid gap-5 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]" data-calculadora="margem">
      <fieldset className="flex min-w-0 flex-col gap-3.5 rounded-2xl border-[3px] border-tinta bg-branco p-5 sm:p-6">
        <legend className="sr-only">Dados do produto</legend>
        <RotuloMono aria-hidden="true">Calculadora</RotuloMono>
        <CampoNumero rotulo="Preço de venda" formato="reais" valor={v.preco} aoMudar={set("preco")} passo={500} minimo={100} />
        <CampoNumero rotulo="Custo do produto" formato="reais" valor={v.custo} aoMudar={set("custo")} passo={500} />
        <CampoNumero rotulo="Taxas e imposto (%)" formato="percentual" valor={v.taxa} aoMudar={set("taxa")} passo={100} maximo={10_000} />
        <CampoNumero rotulo="Frete que você paga" formato="reais" valor={v.frete} aoMudar={set("frete")} passo={100} />
        <CampoNumero rotulo="Embalagem" formato="reais" valor={v.embalagem} aoMudar={set("embalagem")} passo={50} />
        <p className="font-mono text-[13px]">Taxas e imposto em reais:{formatarReais(r.taxaCentavos)}</p>
      </fieldset>

      <div
        className="flex flex-col justify-between gap-4 rounded-2xl border-[3px] border-tinta bg-amarelo p-5 sm:p-6"
        aria-live="polite"
        role="status"
      >
        <div>
          <div className="text-[15px] font-medium">Margem antes do anúncio</div>
          <div className="font-numero text-[44px] leading-[1.1] font-extrabold" data-resultado="margem">
            {formatarReais(r.margemCentavos)}
          </div>
          <div className="font-mono text-base font-semibold text-vermelho-texto" data-resultado="margem-percentual">
            {r.margemPontosBase === null ? "—" : `${formatarPercentual(r.margemPontosBase)} do preço`}
          </div>
        </div>
        <div>
          <div className="text-[15px] font-medium">ROAS de equilíbrio</div>
          <div className="font-numero text-[44px] leading-[1.1] font-extrabold" data-resultado="roas-equilibrio">
            {r.roasEquilibrio === null ? "—" : formatarRazao(r.roasEquilibrio)}
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <p className="m-0 text-[15px] leading-normal font-medium">{TEXTO_VEREDITO[veredito]}</p>
          <p className="m-0 font-mono text-xs">Corte de 20%: critério didático do curso, não regra de mercado.</p>
        </div>
      </div>
    </div>
  );
}
