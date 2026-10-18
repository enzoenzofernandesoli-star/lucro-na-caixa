import type { Metadata } from "next";
import { Folha, PaginaInterna, TituloPagina } from "@/components/marca/Cabecalho";
import { Flashcards, type Cartao } from "@/components/progresso/Flashcards";
import { idDaAula, todasAsAulas } from "@/lib/conteudo";

export const metadata: Metadata = {
  title: "Revisão",
  description: "Flashcards dos conceitos das aulas que você já concluiu, com repetição espaçada.",
};

export default async function Revisao() {
  const cartoes: Cartao[] = (await todasAsAulas()).flatMap((a) =>
    (a.frontmatter.flashcards ?? []).map((f, i) => ({
      id: `${idDaAula(a)}#${i + 1}`,
      aula: idDaAula(a),
      tituloAula: a.frontmatter.titulo,
      frente: f.frente,
      verso: f.verso,
    })),
  );

  return (
    <PaginaInterna>
      <Folha>
        <TituloPagina etiqueta="REPETIÇÃO ESPAÇADA">Revisão</TituloPagina>
        <p className="m-0 max-w-[70ch] text-lg">
          Aqui aparecem os cartões das aulas que você concluiu. Acertou: o cartão volta mais tarde (1, 2, 4, 8 e depois
          16 dias). Errou: ele volta amanhã.
        </p>
        <Flashcards cartoes={cartoes} />
      </Folha>
    </PaginaInterna>
  );
}
