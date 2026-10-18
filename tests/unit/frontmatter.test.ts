import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { ErroFrontmatter, validarFrontmatter } from "@/lib/conteudo/frontmatter";
import { lerTodasAsAulas } from "@/lib/conteudo/ler";

const valido = {
  modulo: 1,
  aula: 2,
  titulo: "Margem de contribuição",
  nivel: "iniciante",
  duracao_min: 15,
  objetivo: "Calcular a margem.",
  pre_requisitos: ["1-1"],
  fontes: [{ titulo: "Sebrae", url: "https://sebrae.com.br/", consultado_em: "2026-10-18" }],
  verificado_em: "2026-10-18",
};

describe("validarFrontmatter", () => {
  it("accepts a complete frontmatter", () => {
    expect(validarFrontmatter(valido, "x.mdx").titulo).toBe("Margem de contribuição");
  });

  it("accepts unquoted YAML dates (parsed as Date)", () => {
    const fm = validarFrontmatter({ ...valido, verificado_em: new Date("2026-10-18T00:00:00Z") }, "x.mdx");
    expect(fm.verificado_em).toBe("2026-10-18");
  });

  it.each(["titulo", "objetivo", "fontes", "verificado_em", "nivel", "duracao_min", "pre_requisitos"])(
    "fails when %s is missing",
    (campo) => {
      const dados: Record<string, unknown> = { ...valido };
      delete dados[campo];
      expect(() => validarFrontmatter(dados, "x.mdx")).toThrow(ErroFrontmatter);
      expect(() => validarFrontmatter(dados, "x.mdx")).toThrow(campo);
    },
  );

  it("fails with no sources, a bad date or an unknown level", () => {
    expect(() => validarFrontmatter({ ...valido, fontes: [] }, "x.mdx")).toThrow(/fonte/);
    expect(() => validarFrontmatter({ ...valido, verificado_em: "18/10/2026" }, "x.mdx")).toThrow(/AAAA-MM-DD/);
    expect(() => validarFrontmatter({ ...valido, nivel: "facil" }, "x.mdx")).toThrow(ErroFrontmatter);
  });

  it("fails on unknown fields (typos)", () => {
    expect(() => validarFrontmatter({ ...valido, titlo: "x" }, "x.mdx")).toThrow(ErroFrontmatter);
  });

  it("fails when numbers don't match folder and file", () => {
    expect(() => validarFrontmatter(valido, "x.mdx", { modulo: 1, aula: 3 })).toThrow(/não batem/);
  });
});

describe("lerTodasAsAulas", () => {
  let raiz = "";
  afterEach(async () => {
    if (raiz) await rm(raiz, { recursive: true, force: true });
  });

  async function criar(arquivo: string, conteudo: string) {
    raiz ||= await mkdtemp(path.join(os.tmpdir(), "lnc-"));
    await mkdir(path.join(raiz, path.dirname(arquivo)), { recursive: true });
    await writeFile(path.join(raiz, arquivo), conteudo, "utf8");
  }

  const yaml = `---
modulo: 1
aula: 2
titulo: "Aula"
nivel: iniciante
duracao_min: 10
objetivo: "Objetivo."
pre_requisitos: []
fontes:
  - titulo: "Fonte"
    url: "https://exemplo.gov.br/"
    consultado_em: "2026-10-18"
verificado_em: "2026-10-18"
---
Corpo da aula.
`;

  it("reads valid lessons with slugs and body", async () => {
    await criar("01-a-conta/02-aula.mdx", yaml);
    const [aula] = await lerTodasAsAulas(raiz);
    expect(aula.moduloSlug).toBe("01-a-conta");
    expect(aula.aulaSlug).toBe("02-aula");
    expect(aula.corpo.trim()).toBe("Corpo da aula.");
  });

  it("fails the whole read when one lesson misses a field", async () => {
    await criar("01-a-conta/02-aula.mdx", yaml.replace('objetivo: "Objetivo."\n', ""));
    await expect(lerTodasAsAulas(raiz)).rejects.toThrow(/objetivo/);
  });

  it("fails on file names outside the NN-slug pattern", async () => {
    await criar("01-a-conta/aula.mdx", yaml);
    await expect(lerTodasAsAulas(raiz)).rejects.toThrow(/NN-slug/);
  });
});

describe("real content", () => {
  it("every lesson in content/modulos is valid", async () => {
    const aulas = await lerTodasAsAulas(path.join(process.cwd(), "content", "modulos"));
    expect(aulas.length).toBeGreaterThan(0);
  });
});
