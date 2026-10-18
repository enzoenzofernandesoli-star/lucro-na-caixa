import { CalculadoraMargem } from "@/components/ferramentas/CalculadoraMargem";
import { CalculadoraRoas } from "@/components/ferramentas/CalculadoraRoas";

// Phase 0 ships only "margem" and "roas"; the other types come in phase 1.
const TIPOS = ["margem", "roas"] as const;
type TipoCalculadora = (typeof TIPOS)[number];

function tipoValido(tipo: string): tipo is TipoCalculadora {
  return (TIPOS as readonly string[]).includes(tipo);
}

/** <Calculadora tipo="margem|roas" /> inside lessons. Unknown types fail the build. */
export function Calculadora({ tipo }: { tipo: string }) {
  if (!tipoValido(tipo)) {
    throw new Error(`<Calculadora tipo="${tipo}">: tipo não disponível. Use: ${TIPOS.join(", ")}.`);
  }
  return tipo === "margem" ? <CalculadoraMargem /> : <CalculadoraRoas />;
}
