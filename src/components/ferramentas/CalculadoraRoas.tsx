"use client";

import { useState } from "react";
import { RotuloMono } from "@/components/marca/Cartao";
import { calcularRoas } from "@/lib/calculos";
import { formatarRazao, formatarReais } from "@/lib/dinheiro";
import { CampoNumero } from "./CampoNumero";

export type ValoresRoas = {
  receita: number;
  gasto: number;
  margem: number;
};

// Example values only: R$ 1.000 in sales from R$ 300 of ads, 39% margin.
export const VALORES_EXEMPLO_ROAS: ValoresRoas = {
  receita: 100_000,
  gasto: 30_000,
  margem: 3_900,
};

type CalculadoraRoasProps = {
  inicial?: Partial<ValoresRoas>;
};

export function CalculadoraRoas({ inicial }: CalculadoraRoasProps) {
  const [v, setV] = useState<ValoresRoas>({ ...VALORES_EXEMPLO_ROAS, ...inicial });
  const set = (campo: keyof ValoresRoas) => (valor: number) => setV((a) => ({ ...a, [campo]: valor }));

  const r = calcularRoas({
    receitaCentavos: v.receita,
    gastoAnuncioCentavos: v.gasto,
    margemPontosBase: v.margem,
  });
  const lucro = r.resultadoCentavos > 0;
  const empate = r.resultadoCentavos === 0;

  return (
    <div className="grid gap-5 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]" data-calculadora="roas">
      <fieldset className="flex min-w-0 flex-col gap-3.5 rounded-2xl border-[3px] border-tinta bg-branco p-5 sm:p-6">
        <legend className="sr-only">Resultado da campanha</legend>
        <RotuloMono aria-hidden="true">Calculadora de ROAS</RotuloMono>
        <CampoNumero rotulo="Vendas geradas pelo anúncio" formato="reais" valor={v.receita} aoMudar={set("receita")} passo={5_000} />
        <CampoNumero rotulo="Gasto com anúncio" formato="reais" valor={v.gasto} aoMudar={set("gasto")} passo={1_000} />
        <CampoNumero rotulo="Margem antes do anúncio (%)" formato="percentual" valor={v.margem} aoMudar={set("margem")} passo={100} minimo={-10_000} maximo={10_000} />
      </fieldset>

      <div
        className="flex flex-col justify-between gap-4 rounded-2xl border-[3px] border-tinta bg-amarelo p-5 sm:p-6"
        aria-live="polite"
        role="status"
      >
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-[15px] font-medium">ROAS da campanha</div>
            <div className="font-numero text-[40px] leading-[1.1] font-extrabold" data-resultado="roas">
              {r.roas === null ? "—" : formatarRazao(r.roas)}
            </div>
          </div>
          <div>
            <div className="text-[15px] font-medium">ROAS de equilíbrio</div>
            <div className="font-numero text-[40px] leading-[1.1] font-extrabold" data-resultado="roas-equilibrio">
              {r.roasEquilibrio === null ? "—" : formatarRazao(r.roasEquilibrio)}
            </div>
          </div>
        </div>
        <div>
          <div className="text-[15px] font-medium">Sobra depois do anúncio</div>
          <div className="font-numero text-[40px] leading-[1.1] font-extrabold" data-resultado="sobra">
            {formatarReais(r.resultadoCentavos)}
          </div>
          <div className="font-mono text-sm" data-resultado="conta">
            Margem total {formatarReais(r.margemGeradaCentavos)} − anúncio {formatarReais(v.gasto)}
          </div>
        </div>
        <p className="m-0 text-[15px] leading-normal font-bold text-vermelho-texto">
          {r.roasEquilibrio === null
            ? "Sem margem, nenhum ROAS paga o anúncio."
            : lucro
              ? "O anúncio se pagou e ainda sobrou dinheiro."
              : empate
                ? "Empate: o anúncio comeu toda a margem."
                : "Prejuízo: o anúncio custou mais do que a margem que gerou."}
        </p>
      </div>
    </div>
  );
}
