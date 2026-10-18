type EtiquetaPedidoProps = {
  numero?: string;
  destino?: string;
  className?: string;
};

/** Shipping-label brand element with a CSS barcode. */
export function EtiquetaPedido({ numero = "#0001", destino = "LUCRO", className = "" }: EtiquetaPedidoProps) {
  return (
    <div
      className={`flex w-[270px] -rotate-4 flex-col gap-2.5 border-[3px] border-tinta bg-papel p-5 font-mono text-[13px] ${className}`}
    >
      <div className="flex justify-between border-b-[3px] border-tinta pb-2">
        <b>PEDIDO</b>
        <span>{numero}</span>
      </div>
      <div>
        DESTINO: <b>{destino}</b>
      </div>
      <div
        aria-hidden="true"
        className="h-[52px] bg-[repeating-linear-gradient(90deg,#141210_0_3px,transparent_3px_6px,#141210_6px_7px,transparent_7px_11px)]"
      />
    </div>
  );
}
