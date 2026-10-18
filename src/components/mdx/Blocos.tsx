import type { ReactNode } from "react";

type BlocoProps = { children: ReactNode };

function Titulo({ children }: { children: ReactNode }) {
  return <h2 className="m-0 font-titulo text-[30px] leading-[1.05] font-bold uppercase">{children}</h2>;
}

/** 1. Objetivo — one sentence: what the student can do after the lesson. */
export function Objetivo({ children }: BlocoProps) {
  return (
    <section className="rounded-2xl border-[3px] border-tinta bg-amarelo p-5 sm:p-6" aria-label="Objetivo" data-bloco="objetivo">
      <span className="font-mono text-xs tracking-[0.15em]">OBJETIVO</span>
      <div className="mt-2 text-lg font-semibold [&>p]:m-0">{children}</div>
    </section>
  );
}

/** 2. Por que importa — the real problem this lesson solves. */
export function PorQue({ children }: BlocoProps) {
  return (
    <section className="flex flex-col gap-3" data-bloco="por-que">
      <Titulo>Por que importa</Titulo>
      <div className="flex flex-col gap-4 [&>p]:m-0">{children}</div>
    </section>
  );
}

/** Worked example. Numbers inside are always example numbers. */
export function Exemplo({ titulo = "Exemplo real", children }: BlocoProps & { titulo?: string }) {
  return (
    <section className="rounded-2xl border-[3px] border-tinta bg-branco p-5 sm:p-6" data-bloco="exemplo">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="m-0 font-titulo text-[26px] leading-[1.05] font-bold uppercase">{titulo}</h2>
        <span className="rounded-full bg-tinta px-3 py-1 font-mono text-xs font-semibold tracking-[0.1em] text-amarelo">
          NÚMEROS DE EXEMPLO
        </span>
      </div>
      <div className="flex flex-col gap-4 [&>*]:m-0">{children}</div>
    </section>
  );
}

/** Formula box. */
export function Formula({ titulo, children }: BlocoProps & { titulo?: string }) {
  return (
    <figure className="m-0 rounded-2xl border-[3px] border-tinta bg-kraft-escuro p-5" data-bloco="formula">
      {titulo ? <figcaption className="mb-2 font-mono text-xs tracking-[0.15em] uppercase">{titulo}</figcaption> : null}
      <div className="font-mono text-[17px] leading-relaxed font-semibold break-words [&>p]:m-0">{children}</div>
    </figure>
  );
}

/** 6. Erro comum. */
export function ErroComum({ children }: BlocoProps) {
  return (
    <section className="rounded-2xl border-[3px] border-tinta bg-papel p-5 shadow-solida sm:p-6" data-bloco="erro-comum">
      <div className="mb-3 flex items-center gap-3">
        <span aria-hidden="true" className="grid size-9 shrink-0 place-items-center rounded-full bg-vermelho font-numero text-xl font-extrabold text-branco">
          !
        </span>
        <h2 className="m-0 font-titulo text-[26px] leading-[1.05] font-bold uppercase">Erro comum</h2>
      </div>
      <div className="flex flex-col gap-4 [&>*]:m-0">{children}</div>
    </section>
  );
}

/** 7. Na prática — exercise on the student's own product or store. */
export function NaPratica({ children }: BlocoProps) {
  return (
    <section className="rounded-2xl border-[3px] border-dashed border-tinta bg-kraft-escuro p-5 sm:p-6" data-bloco="na-pratica">
      <h2 className="m-0 mb-3 font-titulo text-[26px] leading-[1.05] font-bold uppercase">Na prática</h2>
      <div className="flex flex-col gap-4 [&>*]:m-0">{children}</div>
    </section>
  );
}

/** 9. Resumo — 3 to 5 bullet points. */
export function Resumo({ children }: BlocoProps) {
  return (
    <section className="flex flex-col gap-3 rounded-2xl border-[3px] border-tinta bg-amarelo p-5 sm:p-6" data-bloco="resumo">
      <h2 className="m-0 font-titulo text-[26px] leading-[1.05] font-bold uppercase">Resumo</h2>
      <div className="[&>ul]:m-0 [&>ul]:pl-5">{children}</div>
    </section>
  );
}

type AlertaProps = BlocoProps & {
  /** Date the platform rule was checked, DD/MM/AAAA. */
  conferidoEm: string;
  /** Official page of the rule. */
  fonte: string;
};

/** Platform rule that may change: always shows the check date and the official link. */
export function Alerta({ conferidoEm, fonte, children }: AlertaProps) {
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(conferidoEm)) {
    throw new Error(`<Alerta>: conferidoEm deve ser DD/MM/AAAA, recebido "${conferidoEm}".`);
  }
  return (
    <aside role="note" className="rounded-2xl border-[3px] border-tinta bg-branco p-5" data-bloco="alerta">
      <span className="mb-2 inline-block bg-vermelho px-2.5 py-1 font-mono text-xs font-semibold tracking-[0.1em] text-branco">
        REGRA QUE MUDA
      </span>
      <div className="flex flex-col gap-3 [&>*]:m-0">{children}</div>
      <p className="m-0 mt-3 font-mono text-sm">
        Conferido em {conferidoEm} ·{" "}
        <a href={fonte} target="_blank" rel="noopener noreferrer">
          página oficial
        </a>
      </p>
    </aside>
  );
}
