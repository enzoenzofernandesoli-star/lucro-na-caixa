type SeloRedondoProps = {
  rotulo: string;
  valor: string;
  nota?: string;
  className?: string;
};

/** Round yellow seal with a big number. */
export function SeloRedondo({ rotulo, valor, nota, className = "" }: SeloRedondoProps) {
  return (
    <div
      className={`flex size-[190px] rotate-12 flex-col items-center justify-center rounded-full border-[3px] border-tinta bg-amarelo text-center shadow-solida ${className}`}
    >
      <span className="text-sm font-bold">{rotulo}</span>
      <span className="font-numero text-[52px] leading-none font-extrabold">{valor}</span>
      {nota ? <span className="text-xs">{nota}</span> : null}
    </div>
  );
}
