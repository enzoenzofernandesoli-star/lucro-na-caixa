"use client";

import { useId, useState } from "react";

export type PerguntaQuiz = {
  enunciado: string;
  opcoes: string[];
  /** Index of the right option. */
  correta: number;
  /** Shown after any answer: why the right option is right. */
  explicacao: string;
};

type QuizProps = {
  perguntas: PerguntaQuiz[];
  /** Hide the "Teste rápido" heading (used when the quiz is embedded in a preview). */
  semTitulo?: boolean;
};

function Pergunta({ pergunta, numero }: { pergunta: PerguntaQuiz; numero: number }) {
  const [escolha, setEscolha] = useState<number | null>(null);
  const idEnunciado = useId();
  const acertou = escolha === pergunta.correta;

  return (
    <div
      role="group"
      aria-labelledby={idEnunciado}
      className="flex flex-col gap-3 border-t-[3px] border-dashed border-tinta pt-5"
      data-pergunta={numero}
    >
      <p id={idEnunciado} className="m-0 text-lg font-bold">
        {pergunta.enunciado}
      </p>
      <div className="flex flex-wrap gap-3">
        {pergunta.opcoes.map((opcao, i) => {
          const marcada = escolha === i;
          const cor = !marcada
            ? "bg-branco text-tinta hover:bg-amarelo-claro"
            : i === pergunta.correta
              ? "bg-tinta text-branco"
              : "bg-vermelho text-branco";
          return (
            <button
              key={i}
              type="button"
              aria-pressed={marcada}
              onClick={() => setEscolha(i)}
              className={`min-h-[50px] cursor-pointer rounded-xl border-[3px] border-tinta px-6 text-left font-mono text-base font-semibold ${cor}`}
            >
              {opcao}
            </button>
          );
        })}
      </div>
      <div aria-live="polite" className="text-base font-bold text-vermelho-texto">
        {escolha === null ? (
          "Escolha uma resposta."
        ) : acertou ? (
          <span>Certo. {pergunta.explicacao}</span>
        ) : (
          <span>
            Ainda não. Tente de novo.{" "}
            <span className="font-medium text-tinta">Dica: {pergunta.explicacao}</span>
          </span>
        )}
      </div>
    </div>
  );
}

export function Quiz({ perguntas, semTitulo = false }: QuizProps) {
  if (perguntas.length === 0) throw new Error("<Quiz> precisa de pelo menos uma pergunta.");
  for (const p of perguntas) {
    if (p.correta < 0 || p.correta >= p.opcoes.length) {
      throw new Error(`<Quiz>: índice de resposta correta inválido em "${p.enunciado}".`);
    }
  }
  return (
    <section className="flex flex-col gap-5" aria-label="Teste rápido" data-quiz>
      {semTitulo ? null : (
        <h2 className="m-0 font-titulo text-[30px] leading-[1.05] font-bold uppercase">Teste rápido</h2>
      )}
      {perguntas.map((p, i) => (
        <Pergunta key={i} pergunta={p} numero={i + 1} />
      ))}
    </section>
  );
}
