import type { ReactNode } from "react";
import { BarraModulos } from "./BarraModulos";

type QuadroAulaProps = {
  ativo?: string;
  children: ReactNode;
  className?: string;
  id?: string;
};

/** The paper board with the module sidebar on the left (section "aula" of the design). */
export function QuadroAula({ ativo, children, className = "", id }: QuadroAulaProps) {
  return (
    <section
      id={id}
      className={`grid overflow-hidden rounded-[22px] border-[3px] border-tinta bg-papel shadow-solida-lg lg:grid-cols-[320px_minmax(0,1fr)] ${className}`}
    >
      <BarraModulos ativo={ativo} />
      <div className="flex min-w-0 flex-col gap-6 px-4 py-7 sm:px-8 lg:px-14 lg:py-10">{children}</div>
    </section>
  );
}

/** Red label "MÓDULO 01 · AULA 02". */
export function EtiquetaAula({ children }: { children: ReactNode }) {
  return (
    <span className="self-start bg-vermelho-texto px-3.5 py-1.5 font-mono text-[13px] font-semibold tracking-[0.1em] text-branco">
      {children}
    </span>
  );
}
