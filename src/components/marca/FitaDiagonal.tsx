type FitaDiagonalProps = {
  texto?: string;
  className?: string;
};

/** Decorative red tape crossing the hero. Hidden from screen readers. */
export function FitaDiagonal({
  texto = "VENDIDO · DESPACHADO · ENTREGUE · VENDIDO · DESPACHADO",
  className = "",
}: FitaDiagonalProps) {
  return (
    <div
      aria-hidden="true"
      data-fita
      className={`pointer-events-none absolute flex rotate-[8deg] items-center gap-10 bg-vermelho font-mono font-semibold tracking-[0.2em] whitespace-nowrap text-branco select-none ${className}`}
    >
      {texto}
    </div>
  );
}
