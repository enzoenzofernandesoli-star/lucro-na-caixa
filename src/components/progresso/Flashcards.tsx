"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { classesBotao } from "@/components/marca/Botao";
import { CAIXAS_LEITNER, cartoesDoDia, hojeIso, responderCartao } from "@/lib/progresso";
import { atualizarProgresso, useNoNavegador, useProgresso } from "@/lib/useProgresso";

export type Cartao = {
  id: string;
  aula: string;
  tituloAula: string;
  frente: string;
  verso: string;
};

/** Leitner review session over cards of completed lessons. */
export function Flashcards({ cartoes }: { cartoes: Cartao[] }) {
  const progresso = useProgresso();
  const noNavegador = useNoNavegador();
  // Today is read only in the browser (prerender must not freeze the date).
  const hoje = noNavegador ? hojeIso() : "";
  // Session queue is fixed when the session starts, so answering doesn't reshuffle it.
  const [sessao, setSessao] = useState<string[] | null>(null);
  const [virado, setVirado] = useState(false);
  const [feitos, setFeitos] = useState({ certos: 0, errados: 0 });

  const devidos = useMemo(() => cartoesDoDia(progresso, cartoes, hoje), [progresso, cartoes, hoje]);
  const temConcluidas = cartoes.some((c) => progresso.concluidas[c.aula]);
  const porCaixa = Array.from({ length: CAIXAS_LEITNER }, (_, i) =>
    cartoes.filter((c) => progresso.revisao[c.id]?.caixa === i + 1).length,
  );

  if (!noNavegador) return <p className="m-0 font-mono text-sm">Carregando seus cartões…</p>;

  if (sessao === null) {
    return (
      <div className="flex flex-col gap-5" data-revisao="inicio">
        <Caixas porCaixa={porCaixa} />
        {devidos.length > 0 ? (
          <div className="flex flex-wrap items-center gap-4">
            <p className="m-0 text-lg">
              <strong>{devidos.length}</strong> {devidos.length === 1 ? "cartão para hoje" : "cartões para hoje"}.
            </p>
            <button
              type="button"
              className={classesBotao("primario", "cursor-pointer")}
              onClick={() => {
                setSessao(devidos.map((c) => c.id));
                setVirado(false);
                setFeitos({ certos: 0, errados: 0 });
              }}
            >
              Começar revisão
            </button>
          </div>
        ) : temConcluidas ? (
          <p className="m-0 text-lg">Nada para revisar hoje. Volte amanhã ou conclua novas aulas.</p>
        ) : (
          <p className="m-0 text-lg">
            Você ainda não concluiu nenhuma aula com cartões. Comece pela <Link href="/trilha">trilha</Link>.
          </p>
        )}
      </div>
    );
  }

  const atual = cartoes.find((c) => c.id === sessao[0]);
  if (!atual) {
    return (
      <div className="flex flex-col gap-4" data-revisao="fim" role="status">
        <p className="m-0 text-lg font-bold">
          Revisão do dia feita: {feitos.certos} certos, {feitos.errados} para rever.
        </p>
        <Caixas porCaixa={porCaixa} />
        <button type="button" className={classesBotao("secundario", "cursor-pointer self-start")} onClick={() => setSessao(null)}>
          Voltar
        </button>
      </div>
    );
  }

  function responder(acertou: boolean) {
    if (!atual) return;
    atualizarProgresso((p) => responderCartao(p, atual.id, acertou, hoje));
    setFeitos((f) => (acertou ? { ...f, certos: f.certos + 1 } : { ...f, errados: f.errados + 1 }));
    setSessao((s) => (s ? s.slice(1) : s));
    setVirado(false);
  }

  return (
    <div className="flex flex-col gap-5" data-revisao="cartao">
      <p className="m-0 font-mono text-sm" aria-live="polite">
        Cartão {feitos.certos + feitos.errados + 1} de {feitos.certos + feitos.errados + sessao.length} · aula{" "}
        {atual.aula.replace("-", ".")} {atual.tituloAula}
      </p>
      <div className="flex min-h-[220px] flex-col justify-center gap-4 rounded-2xl border-[3px] border-tinta bg-branco p-6 shadow-solida">
        <p className="m-0 text-xl font-bold">{atual.frente}</p>
        {virado ? (
          <p className="m-0 border-t-[3px] border-dashed border-tinta pt-4 text-lg" data-verso>
            {atual.verso}
          </p>
        ) : null}
      </div>
      {virado ? (
        <div className="flex flex-wrap gap-4">
          <button type="button" className={classesBotao("primario", "cursor-pointer")} onClick={() => responder(true)}>
            Acertei
          </button>
          <button type="button" className={classesBotao("secundario", "cursor-pointer")} onClick={() => responder(false)}>
            Errei
          </button>
        </div>
      ) : (
        <button type="button" className={classesBotao("primario", "cursor-pointer self-start")} onClick={() => setVirado(true)}>
          Mostrar resposta
        </button>
      )}
    </div>
  );
}

function Caixas({ porCaixa }: { porCaixa: number[] }) {
  return (
    <ul className="m-0 grid list-none grid-cols-5 gap-2 p-0" aria-label="Cartões por caixa">
      {porCaixa.map((n, i) => (
        <li key={i} className="flex flex-col items-center rounded-xl border-[3px] border-tinta bg-kraft-escuro px-1 py-2 text-center">
          <span className="font-mono text-[11px] tracking-[0.1em]">CAIXA {i + 1}</span>
          <span className="font-numero text-2xl font-extrabold">{n}</span>
        </li>
      ))}
    </ul>
  );
}
