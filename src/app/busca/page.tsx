import type { Metadata } from "next";
import { Folha, PaginaInterna, TituloPagina } from "@/components/marca/Cabecalho";
import { BuscaAulas } from "@/components/busca/BuscaAulas";
import { mdxParaTexto, type ItemIndice } from "@/lib/busca";
import { idDaAula, todasAsAulas, urlDaAula } from "@/lib/conteudo";

export const metadata: Metadata = {
  title: "Busca",
  description: "Busque em todas as aulas do curso.",
};

export default async function Busca() {
  // The index is built at build time from the lesson files; no external service.
  const indice: ItemIndice[] = (await todasAsAulas()).map((a) => ({
    id: idDaAula(a),
    titulo: a.frontmatter.titulo,
    modulo: a.frontmatter.modulo,
    url: urlDaAula(a),
    texto: `${a.frontmatter.objetivo} ${mdxParaTexto(a.corpo)}`,
  }));

  return (
    <PaginaInterna>
      <Folha>
        <TituloPagina etiqueta={`${indice.length} AULAS`}>Busca</TituloPagina>
        <BuscaAulas indice={indice} />
      </Folha>
    </PaginaInterna>
  );
}
