import Link from "next/link";

export const LINKS_SITE = [
  { href: "/trilha", rotulo: "Trilha" },
  { href: "/ferramentas", rotulo: "Ferramentas" },
  { href: "/glossario", rotulo: "Glossário" },
  { href: "/revisao", rotulo: "Revisão" },
  { href: "/busca", rotulo: "Busca" },
] as const;

/** Site header for inner pages: logo + section links. */
export function Cabecalho() {
  return (
    <header className="mb-6 flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
      <Link href="/" className="font-titulo text-2xl leading-none font-bold no-underline">
        LUCRO NA CAIXA<span className="text-vermelho">.</span>
      </Link>
      <nav aria-label="Seções do curso">
        <ul className="m-0 flex list-none flex-wrap gap-x-1 p-0">
          {LINKS_SITE.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="inline-flex min-h-11 items-center rounded-[10px] px-2.5 font-mono text-[13px] font-semibold tracking-[0.08em] uppercase no-underline hover:bg-amarelo hover:text-tinta"
              >
                {l.rotulo}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}

/** Standard page shell for inner pages. */
export function PaginaInterna({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
      <Cabecalho />
      {children}
    </div>
  );
}

/** Paper card used as the main area of inner pages. */
export function Folha({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <main
      id="conteudo"
      className={`flex flex-col gap-6 rounded-[22px] border-[3px] border-tinta bg-papel px-4 py-7 shadow-solida-lg sm:px-8 lg:px-14 lg:py-10 ${className}`}
    >
      {children}
    </main>
  );
}

export function TituloPagina({ children, etiqueta }: { children: React.ReactNode; etiqueta?: string }) {
  return (
    <div className="flex flex-col gap-4">
      {etiqueta ? (
        <span className="self-start bg-vermelho-texto px-3.5 py-1.5 font-mono text-[13px] font-semibold tracking-[0.1em] text-branco">
          {etiqueta}
        </span>
      ) : null}
      <h1 className="m-0 font-titulo text-[clamp(2.25rem,6vw,3.5rem)] leading-none font-bold break-words uppercase">
        {children}
      </h1>
    </div>
  );
}
