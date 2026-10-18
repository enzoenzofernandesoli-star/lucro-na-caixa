import Link from "next/link";
import { MODULOS, doisDigitos } from "@/data/modulos";

type BarraModulosProps = {
  /** Slug of the module being viewed. */
  ativo?: string;
  /** Module slug -> first lesson URL. Modules without content render as "em breve". */
  links: Record<string, string>;
};

function ListaModulos({ ativo, links }: BarraModulosProps) {
  return (
    <ol className="flex flex-col gap-1.5">
      {MODULOS.map((m) => {
        const href = links[m.slug];
        const atual = m.slug === ativo;
        const classes = `flex min-h-11 items-center gap-3 rounded-[10px] px-3 py-1.5 text-[15px] font-semibold no-underline ${
          atual ? "bg-tinta text-amarelo hover:text-amarelo" : "text-tinta"
        }`;
        const conteudo = (
          <>
            <span className="w-[22px] shrink-0 font-mono text-xs">{doisDigitos(m.numero)}</span>
            <span>{m.titulo}</span>
          </>
        );
        return (
          <li key={m.slug}>
            {href ? (
              <Link
                href={href}
                aria-current={atual ? "page" : undefined}
                className={`${classes} ${atual ? "" : "hover:bg-amarelo hover:text-tinta"}`}
              >
                {conteudo}
              </Link>
            ) : (
              <span className={`${classes} opacity-80`}>
                {conteudo}
                <span className="sr-only"> (em breve)</span>
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}

/** Module sidebar. Always open on large screens, collapsible on phones. */
export function BarraModulos(props: BarraModulosProps) {
  return (
    <nav
      aria-label="Módulos"
      className="border-b-[3px] border-tinta bg-kraft-escuro px-4 py-4 lg:border-r-[3px] lg:border-b-0 lg:px-5 lg:py-7"
    >
      <details className="group lg:hidden">
        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between rounded-[10px] font-mono text-xs tracking-[0.15em] [&::-webkit-details-marker]:hidden">
          <span>MÓDULOS ({MODULOS.length})</span>
          <span aria-hidden="true" className="text-lg group-open:rotate-180 motion-safe:transition-transform">
            ▾
          </span>
        </summary>
        <div className="pt-2">
          <ListaModulos {...props} />
        </div>
      </details>
      <div className="hidden lg:block">
        <span className="mb-2.5 block font-mono text-xs tracking-[0.15em]">MÓDULOS</span>
        <ListaModulos {...props} />
      </div>
    </nav>
  );
}
