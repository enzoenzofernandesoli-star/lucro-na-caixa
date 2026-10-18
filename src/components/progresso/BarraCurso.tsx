"use client";

import { percentualConcluido } from "@/lib/progresso";
import { useNoNavegador, useProgresso } from "@/lib/useProgresso";
import { BarraProgresso } from "./Painel";

/** Progress bar for a set of lessons (whole course or one module). */
export function BarraProgressoCurso({ ids, rotulo = "Curso concluído" }: { ids: string[]; rotulo?: string }) {
  const progresso = useProgresso();
  const noNavegador = useNoNavegador();
  return <BarraProgresso percentual={noNavegador ? percentualConcluido(progresso, ids) : 0} rotulo={rotulo} />;
}
