import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variante = "primario" | "secundario";

const base =
  "inline-flex min-h-[58px] items-center justify-center rounded-[14px] border-[3px] border-tinta px-[30px] text-lg font-bold text-tinta no-underline hover:text-tinta";

const variantes: Record<Variante, string> = {
  // Solid shadow; on hover the button "lifts" 2px (instant when reduced motion is on).
  primario:
    "bg-amarelo shadow-solida motion-safe:transition-[transform,box-shadow] motion-safe:duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-solida-hover",
  secundario: "bg-papel px-[26px] hover:bg-amarelo-claro",
};

export function classesBotao(variante: Variante = "primario", extra = ""): string {
  return `${base} ${variantes[variante]} ${extra}`.trim();
}

type BotaoLinkProps = {
  href: string;
  variante?: Variante;
  children: ReactNode;
  className?: string;
};

export function BotaoLink({ href, variante = "primario", children, className }: BotaoLinkProps) {
  return (
    <Link href={href} className={classesBotao(variante, className)}>
      {children}
    </Link>
  );
}

type BotaoProps = ComponentProps<"button"> & { variante?: Variante };

export function Botao({ variante = "primario", className, type = "button", ...props }: BotaoProps) {
  return <button type={type} className={classesBotao(variante, className)} {...props} />;
}
