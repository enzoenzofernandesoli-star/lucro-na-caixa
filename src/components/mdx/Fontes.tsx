import type { FonteAula } from "@/lib/conteudo/frontmatter";

export function dataBR(iso: string): string {
  const [ano, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${ano}`;
}

/** 10. Fontes — rendered from the lesson frontmatter, so the list has a single source of truth. */
export function ListaFontes({ fontes }: { fontes: FonteAula[] }) {
  return (
    <section className="flex flex-col gap-3" data-bloco="fontes">
      <h2 className="m-0 font-titulo text-[30px] leading-[1.05] font-bold uppercase">Fontes</h2>
      <ol className="m-0 flex list-decimal flex-col gap-2 pl-6 text-base">
        {fontes.map((f) => (
          <li key={f.url}>
            <a href={f.url} target="_blank" rel="noopener noreferrer" className="break-words">
              {f.titulo}
            </a>{" "}
            <span className="font-mono text-sm">— consultado em {dataBR(f.consultado_em)}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
