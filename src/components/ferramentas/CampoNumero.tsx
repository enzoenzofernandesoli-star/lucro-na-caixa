"use client";

import { useId, useState } from "react";
import {
  formatarPercentualCampo,
  formatarReaisCampo,
  lerCentesimos,
} from "@/lib/dinheiro";

type CampoNumeroProps = {
  rotulo: string;
  /** Value ×100: cents ("reais"), basis points ("percentual") or plain hundredths ("numero"). */
  valor: number;
  aoMudar: (valor: number) => void;
  formato: "reais" | "percentual" | "numero";
  /** Step of the −/+ buttons, same unit as `valor`. */
  passo: number;
  minimo?: number;
  maximo?: number;
};

/** Number field with −/+ steppers (44px) and a typed input that accepts pt-BR numbers. */
export function CampoNumero({
  rotulo,
  valor,
  aoMudar,
  formato,
  passo,
  minimo = 0,
  maximo = Number.MAX_SAFE_INTEGER,
}: CampoNumeroProps) {
  const id = useId();
  const formatar = formato === "reais" ? formatarReaisCampo : formatarPercentualCampo;
  const sufixo = formato === "reais" ? "R$" : formato === "percentual" ? "%" : null;
  // Text being typed; null means "show the formatted value".
  const [rascunho, setRascunho] = useState<string | null>(null);

  const limitar = (v: number) => Math.min(maximo, Math.max(minimo, v));

  function confirmar() {
    if (rascunho === null) return;
    const lido = lerCentesimos(rascunho);
    if (lido !== null) aoMudar(limitar(lido));
    setRascunho(null);
  }

  const botao =
    "size-11 shrink-0 cursor-pointer rounded-[10px] border-[3px] border-tinta bg-branco text-xl font-bold hover:bg-amarelo disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-branco";

  return (
    <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
      <label htmlFor={id} className="text-base font-semibold">
        {rotulo}
      </label>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className={botao}
          aria-label={`Diminuir ${rotulo.toLowerCase()}`}
          disabled={valor <= minimo}
          onClick={() => aoMudar(limitar(valor - passo))}
        >
          −
        </button>
        <div className="relative">
          {sufixo ? (
            <span
              aria-hidden="true"
              className={`pointer-events-none absolute top-1/2 -translate-y-1/2 font-mono text-sm ${
                formato === "reais" ? "left-2.5" : "right-2.5"
              }`}
            >
              {sufixo}
            </span>
          ) : null}
          <input
            id={id}
            type="text"
            inputMode="decimal"
            autoComplete="off"
            className={`h-11 w-[124px] rounded-[10px] border-[3px] border-tinta bg-branco text-center font-mono text-[17px] font-semibold ${
              formato === "reais" ? "pl-8" : formato === "percentual" ? "pr-7" : ""
            }`}
            value={rascunho ?? formatar(valor)}
            onChange={(e) => setRascunho(e.target.value)}
            onFocus={(e) => e.target.select()}
            onBlur={confirmar}
            onKeyDown={(e) => {
              if (e.key === "Enter") confirmar();
              if (e.key === "Escape") setRascunho(null);
            }}
          />
        </div>
        <button
          type="button"
          className={botao}
          aria-label={`Aumentar ${rotulo.toLowerCase()}`}
          disabled={valor >= maximo}
          onClick={() => aoMudar(limitar(valor + passo))}
        >
          +
        </button>
      </div>
    </div>
  );
}
