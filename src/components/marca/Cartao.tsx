import type { ComponentProps } from "react";

type Fundo = "papel" | "branco" | "amarelo" | "kraft-escuro";

const fundos: Record<Fundo, string> = {
  papel: "bg-papel",
  branco: "bg-branco",
  amarelo: "bg-amarelo",
  "kraft-escuro": "bg-kraft-escuro",
};

type CartaoProps = ComponentProps<"div"> & {
  fundo?: Fundo;
  /** Highlight cards get the solid offset shadow. */
  destaque?: boolean;
};

export function Cartao({ fundo = "papel", destaque = false, className = "", ...props }: CartaoProps) {
  return (
    <div
      className={`rounded-2xl border-[3px] border-tinta p-6 ${fundos[fundo]} ${destaque ? "shadow-solida" : ""} ${className}`}
      {...props}
    />
  );
}

/** Small mono label used at the top of cards ("CALCULADORA", "MÓDULOS"). */
export function RotuloMono({ className = "", ...props }: ComponentProps<"span">) {
  return <span className={`font-mono text-xs tracking-[0.15em] uppercase ${className}`} {...props} />;
}
