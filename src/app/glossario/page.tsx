import type { Metadata } from "next";
import { Folha, PaginaInterna, TituloPagina } from "@/components/marca/Cabecalho";
import { ListaGlossario, type AulasDoGlossario } from "@/components/busca/ListaGlossario";
import { resumoDasAulas } from "@/lib/conteudo";
import { GLOSSARIO, esquemaGlossario } from "@/lib/glossario";

export const metadata: Metadata = {
  title: "Glossário",
  description: "Os termos de e-commerce, marketplace e tráfego pago usados no curso, explicados em português simples.",
};

export default async function Glossario() {
  // A broken glossary fails the build instead of shipping.
  esquemaGlossario.parse(GLOSSARIO);
  const resumo = await resumoDasAulas();
  const aulas: AulasDoGlossario = Object.fromEntries(resumo.map((a) => [a.id, { url: a.url, titulo: a.titulo }]));
  for (const t of GLOSSARIO) {
    if (t.aula && !aulas[t.aula]) throw new Error(`Glossário: o termo ${t.id} aponta para a aula ${t.aula}, que não existe.`);
  }
  return (
    <PaginaInterna>
      <Folha>
        <TituloPagina etiqueta={`${GLOSSARIO.length} TERMOS`}>Glossário</TituloPagina>
        <p className="m-0 max-w-[70ch] text-lg">
          Todo termo técnico das aulas está aqui. Nas aulas, clique no termo sublinhado para ver a definição sem sair
          da página.
        </p>
        <ListaGlossario termos={[...GLOSSARIO]} aulas={aulas} />
      </Folha>
    </PaginaInterna>
  );
}
