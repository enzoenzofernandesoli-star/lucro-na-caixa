import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { buscar, mdxParaTexto, type ItemIndice } from "@/lib/busca";
import { lerConteudo } from "@/lib/conteudo/ler";
import { GLOSSARIO, esquemaGlossario, filtrarGlossario, normalizar, termoPorId } from "@/lib/glossario";
import { MODULOS } from "@/data/modulos";

describe("mdxParaTexto", () => {
  it("drops components with props and keeps text inside wrappers", () => {
    const texto = mdxParaTexto(`## Explicação

<Objetivo>
Calcular a **margem**.
</Objetivo>

<Quiz perguntas={[{ enunciado: "x", opcoes: ["a"], correta: 0, explicacao: "y" }]} />

| Item | Valor |
| --- | ---: |
| Preço | R$ 100 |

Veja <Termo id="roas">ROAS</Termo> e [o glossário](/glossario).`);
    expect(texto).toContain("Calcular a margem");
    expect(texto).toContain("ROAS");
    expect(texto).toContain("o glossário");
    expect(texto).not.toContain("enunciado");
    expect(texto).not.toContain("<");
    expect(texto).not.toContain("---");
  });
});

describe("buscar", () => {
  const indice: ItemIndice[] = [
    { id: "1-2", titulo: "Margem de contribuição", modulo: 1, url: "/a", texto: "O que sobra da venda depois das taxas." },
    { id: "2-6", titulo: "Meios de pagamento", modulo: 2, url: "/b", texto: "Pix, cartão e boleto. A margem muda com a taxa." },
  ];

  it("ignores accents and case and ranks title hits first", () => {
    const r = buscar(indice, "MARGEM");
    expect(r.map((x) => x.id)).toEqual(["1-2", "2-6"]);
    expect(buscar(indice, "cartao")[0].id).toBe("2-6");
  });

  it("requires every word", () => {
    expect(buscar(indice, "margem pix").map((x) => x.id)).toEqual(["2-6"]);
  });

  it("returns nothing for empty or 1-letter queries", () => {
    expect(buscar(indice, "")).toEqual([]);
    expect(buscar(indice, "m")).toEqual([]);
  });

  it("builds a snippet around the match", () => {
    expect(buscar(indice, "boleto")[0].trecho).toContain("boleto");
  });
});

describe("glossário", () => {
  it("is valid, with unique ids, sorted", () => {
    expect(() => esquemaGlossario.parse(GLOSSARIO)).not.toThrow();
    const nomes = GLOSSARIO.map((t) => t.termo);
    expect([...nomes].sort((a, b) => a.localeCompare(b, "pt-BR"))).toEqual(nomes);
  });

  it("rejects duplicated ids", () => {
    const t = { id: "x", termo: "X", definicao: "d" };
    expect(() => esquemaGlossario.parse([t, t])).toThrow(/repetido/);
  });

  it("filters by term or definition, accent-insensitive", () => {
    expect(filtrarGlossario(GLOSSARIO, "contribuicao").map((t) => t.id)).toContain("margem-de-contribuicao");
    expect(filtrarGlossario(GLOSSARIO, "")).toHaveLength(GLOSSARIO.length);
    expect(normalizar("Ação")).toBe("acao");
  });
});

describe("real content", () => {
  it("every module folder matches a course module and every <Termo id> exists in the glossary", async () => {
    const raiz = path.join(process.cwd(), "content", "modulos");
    const { aulas, modulos } = await lerConteudo(raiz);
    const slugs = new Set(MODULOS.map((m) => m.slug));
    for (const a of aulas) expect(slugs, a.moduloSlug).toContain(a.moduloSlug);
    for (const m of modulos) expect(slugs, m.moduloSlug).toContain(m.moduloSlug);

    const textos = [...aulas.map((a) => a.corpo), ...modulos.map((m) => m.corpo)];
    const ids = textos.flatMap((t) => [...t.matchAll(/<Termo\s+id="([^"]+)"/g)].map((m) => m[1]));
    const faltando = [...new Set(ids)].filter((id) => !termoPorId(id));
    expect(faltando).toEqual([]);
  });

  it("every lesson module number matches its folder", async () => {
    const { aulas } = await lerConteudo(path.join(process.cwd(), "content", "modulos"));
    for (const a of aulas) {
      expect(MODULOS[a.frontmatter.modulo].slug).toBe(a.moduloSlug);
    }
  });

  it("every glossary rule points to a lesson that exists and has a checked date", async () => {
    const { aulas } = await lerConteudo(path.join(process.cwd(), "content", "modulos"));
    const ids = new Set(aulas.map((a) => `${a.frontmatter.modulo}-${a.frontmatter.aula}`));
    const bruto = esquemaGlossario.parse(JSON.parse(await readFile(path.join(process.cwd(), "content", "glossario.json"), "utf8")));
    const comAula = bruto.filter((t) => t.aula);
    expect(comAula.length).toBeGreaterThan(0);
    for (const t of comAula) {
      expect(ids, t.id).toContain(t.aula);
      expect(t.conferidoEm, t.id).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
    expect(() => esquemaGlossario.parse([{ id: "x", termo: "X", definicao: "y", aula: "1-1" }])).toThrow();
  });

  it("glossary file parses", async () => {
    const bruto = JSON.parse(await readFile(path.join(process.cwd(), "content", "glossario.json"), "utf8"));
    expect(() => esquemaGlossario.parse(bruto)).not.toThrow();
  });
});
