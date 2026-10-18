import type { ComponentType } from "react";
import { CalculadoraDrop } from "@/components/ferramentas/CalculadoraDrop";
import { CalculadoraCacLtv } from "@/components/ferramentas/CalculadoraCacLtv";
import { CalculadoraImportacao } from "@/components/ferramentas/CalculadoraImportacao";
import { CalculadoraMargem } from "@/components/ferramentas/CalculadoraMargem";
import { CalculadoraMarkup } from "@/components/ferramentas/CalculadoraMarkup";
import { CalculadoraPontoEquilibrio } from "@/components/ferramentas/CalculadoraPontoEquilibrio";
import { CalculadoraPreco } from "@/components/ferramentas/CalculadoraPreco";
import { CalculadoraRoas } from "@/components/ferramentas/CalculadoraRoas";
import { FichaProduto } from "@/components/ferramentas/FichaProduto";
import { PainelSemanal } from "@/components/ferramentas/PainelSemanal";
import { SimuladorCampanha } from "@/components/ferramentas/SimuladorCampanha";

/** Every calculator, in the order /ferramentas shows them. */
export const CALCULADORAS = {
  margem: { titulo: "Margem de contribuição", aula: "1-2", Componente: CalculadoraMargem },
  roas: { titulo: "ROAS da campanha", aula: "1-6", Componente: CalculadoraRoas },
  "ponto-equilibrio": { titulo: "Ponto de equilíbrio", aula: "1-8", Componente: CalculadoraPontoEquilibrio },
  preco: { titulo: "Preço ideal", aula: "1-7", Componente: CalculadoraPreco },
  markup: { titulo: "Markup x margem", aula: "1-7", Componente: CalculadoraMarkup },
  "cac-ltv": { titulo: "CAC x LTV", aula: "14-2", Componente: CalculadoraCacLtv },
  importacao: { titulo: "Custo de importação", aula: "4-4", Componente: CalculadoraImportacao },
  "ficha-produto": { titulo: "Ficha de avaliação de produto", aula: "3-6", Componente: FichaProduto },
  campanha: { titulo: "Simulador de campanha", aula: "12-5", Componente: SimuladorCampanha },
  "painel-semanal": { titulo: "Painel semanal", aula: "14-6", Componente: PainelSemanal },
  drop: { titulo: "Margem do drop", aula: "16-6", Componente: CalculadoraDrop },
} satisfies Record<string, { titulo: string; aula: string; Componente: ComponentType }>;

export type TipoCalculadora = keyof typeof CALCULADORAS;

function tipoValido(tipo: string): tipo is TipoCalculadora {
  return tipo in CALCULADORAS;
}

/** <Calculadora tipo="..." /> inside lessons. Unknown types fail the build. */
export function Calculadora({ tipo }: { tipo: string }) {
  if (!tipoValido(tipo)) {
    throw new Error(`<Calculadora tipo="${tipo}">: tipo não disponível. Use: ${Object.keys(CALCULADORAS).join(", ")}.`);
  }
  const { Componente } = CALCULADORAS[tipo];
  return <Componente />;
}
