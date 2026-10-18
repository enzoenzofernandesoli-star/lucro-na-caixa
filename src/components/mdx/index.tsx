import { Checklist } from "@/components/ferramentas/Checklist";
import { Quiz } from "@/components/ferramentas/Quiz";
import { Termo } from "@/components/ferramentas/Termo";
import type { FonteAula } from "@/lib/conteudo/frontmatter";
import { Alerta, ErroComum, Exemplo, Formula, NaPratica, Objetivo, PorQue, Resumo } from "./Blocos";
import { Calculadora } from "./Calculadora";
import { ListaFontes } from "./Fontes";

/** Components available to lesson MDX (CLAUDE.md section 6). */
export function componentesDaAula(fontes: FonteAula[]) {
  return {
    Objetivo,
    PorQue,
    Exemplo,
    Formula,
    Calculadora,
    ErroComum,
    NaPratica,
    Quiz,
    Checklist,
    Resumo,
    // <Fontes /> takes no props: it lists the frontmatter sources.
    Fontes: () => <ListaFontes fontes={fontes} />,
    Termo,
    Alerta,
  };
}
