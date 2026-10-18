import type { Metadata } from "next";
import { Folha, PaginaInterna, TituloPagina } from "@/components/marca/Cabecalho";
import { ListaGlossario } from "@/components/busca/ListaGlossario";
import { GLOSSARIO, esquemaGlossario } from "@/lib/glossario";

export const metadata: Metadata = {
  title: "Glossário",
  description: "Os termos de e-commerce, marketplace e tráfego pago usados no curso, explicados em português simples.",
};

export default function Glossario() {
  // A broken glossary fails the build instead of shipping.
  esquemaGlossario.parse(GLOSSARIO);
  return (
    <PaginaInterna>
      <Folha>
        <TituloPagina etiqueta={`${GLOSSARIO.length} TERMOS`}>Glossário</TituloPagina>
        <p className="m-0 max-w-[70ch] text-lg">
          Todo termo técnico das aulas está aqui. Nas aulas, clique no termo sublinhado para ver a definição sem sair
          da página.
        </p>
        <ListaGlossario termos={[...GLOSSARIO]} />
      </Folha>
    </PaginaInterna>
  );
}
