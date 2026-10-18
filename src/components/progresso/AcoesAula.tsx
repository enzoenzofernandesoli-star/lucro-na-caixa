"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { classesBotao } from "@/components/marca/Botao";
import { concluirAula, desfazerConclusao, hojeIso, LIMITE_ANOTACAO, registrarVisita, salvarAnotacao } from "@/lib/progresso";
import { atualizarProgresso, useNoNavegador, useProgresso } from "@/lib/useProgresso";
import { AvisoProgressoIlegivel } from "./AvisoIlegivel";

type LinkAula = { url: string; titulo: string };

type AcoesAulaProps = {
  id: string;
  anterior?: LinkAula;
  proxima?: LinkAula;
};

/** "Concluir aula", personal notes and previous/next links at the end of a lesson. */
export function AcoesAula({ id, anterior, proxima }: AcoesAulaProps) {
  const progresso = useProgresso();
  const noNavegador = useNoNavegador();
  const concluida = Boolean(progresso.concluidas[id]);
  const [erro, setErro] = useState(false);

  useEffect(() => {
    atualizarProgresso((p) => registrarVisita(p, id));
  }, [id]);

  function alternar() {
    const ok = atualizarProgresso((p) => (concluida ? desfazerConclusao(p, id) : concluirAula(p, id, hojeIso())));
    setErro(!ok);
  }

  return (
    <section className="flex flex-col gap-6 border-t-[3px] border-tinta pt-8" aria-label="Seu progresso nesta aula" data-acoes-aula>
      <div className="flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={alternar}
          disabled={!noNavegador}
          aria-pressed={concluida}
          className={classesBotao(concluida ? "secundario" : "primario", "cursor-pointer disabled:cursor-wait")}
        >
          {concluida ? "✓ Aula concluída — desfazer" : "Concluir aula"}
        </button>
        <p className="m-0 font-mono text-sm" aria-live="polite">
          {concluida ? `Concluída em ${progresso.concluidas[id].split("-").reverse().join("/")}.` : ""}
        </p>
      </div>
      <AvisoProgressoIlegivel />
      {erro ? (
        <p role="alert" className="m-0 font-bold text-vermelho-texto">
          Não foi possível salvar o progresso (modo anônimo, armazenamento cheio ou progresso salvo ilegível).
        </p>
      ) : null}

      <Anotacoes id={id} />

      <nav aria-label="Navegação entre aulas" className="flex flex-col gap-3 sm:flex-row sm:justify-between">
        {anterior ? (
          <Link href={anterior.url} className="inline-flex min-h-11 items-center font-semibold">
            ← {anterior.titulo}
          </Link>
        ) : (
          <span />
        )}
        {proxima ? (
          <Link href={proxima.url} className="inline-flex min-h-11 items-center font-semibold sm:text-right">
            {proxima.titulo} →
          </Link>
        ) : null}
      </nav>
    </section>
  );
}

function Anotacoes({ id }: { id: string }) {
  const progresso = useProgresso();
  const salvo = progresso.anotacoes[id] ?? "";
  const [rascunho, setRascunho] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const idCampo = useId();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function salvar(texto: string) {
    const ok = atualizarProgresso((p) => salvarAnotacao(p, id, texto));
    setStatus(ok ? "Anotação salva neste navegador." : "Não foi possível salvar a anotação.");
    setRascunho(null);
  }

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={idCampo} className="font-mono text-xs tracking-[0.15em]">
        MINHAS ANOTAÇÕES
      </label>
      <textarea
        id={idCampo}
        rows={5}
        value={rascunho ?? salvo}
        maxLength={LIMITE_ANOTACAO}
        onChange={(e) => {
          const texto = e.target.value;
          setRascunho(texto);
          setStatus("");
          if (timer.current) clearTimeout(timer.current);
          timer.current = setTimeout(() => salvar(texto), 800);
        }}
        onBlur={() => {
          if (timer.current) clearTimeout(timer.current);
          if (rascunho !== null) salvar(rascunho);
        }}
        placeholder="Escreva aqui o que quer lembrar desta aula. Fica salvo só neste navegador."
        className="w-full rounded-xl border-[3px] border-tinta bg-branco p-3 text-base"
      />
      <p className="m-0 min-h-5 font-mono text-xs" aria-live="polite">
        {status}
      </p>
    </div>
  );
}
