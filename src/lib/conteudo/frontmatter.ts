import { z } from "zod";

// YAML turns unquoted 2026-10-18 into a Date; accept both and keep ISO strings.
const dataIso = z.preprocess(
  (v) => (v instanceof Date ? v.toISOString().slice(0, 10) : v),
  z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "use o formato AAAA-MM-DD"),
);

const fonte = z.object({
  titulo: z.string().min(1),
  url: z.url({ protocol: /^https?$/ }),
  consultado_em: dataIso,
});

// Lesson frontmatter, CLAUDE.md section 4. Every field is required.
export const esquemaFrontmatter = z.strictObject({
  modulo: z.int().min(0).max(19),
  aula: z.int().min(1),
  titulo: z.string().min(1),
  nivel: z.enum(["iniciante", "intermediario", "avancado"]),
  duracao_min: z.int().positive(),
  objetivo: z.string().min(1),
  pre_requisitos: z.array(z.string().regex(/^\d+-\d+$/, 'use "modulo-aula", ex.: "1-1"')),
  fontes: z.array(fonte).min(1, "toda aula precisa de pelo menos uma fonte"),
  verificado_em: dataIso,
});

export type FrontmatterAula = z.infer<typeof esquemaFrontmatter>;
export type FonteAula = FrontmatterAula["fontes"][number];

export class ErroFrontmatter extends Error {
  constructor(caminho: string, problemas: string[]) {
    super(`Frontmatter inválido em ${caminho}:\n${problemas.map((p) => `  - ${p}`).join("\n")}`);
    this.name = "ErroFrontmatter";
  }
}

/** Validates frontmatter and checks it matches the folder/file numbers. Throws ErroFrontmatter. */
export function validarFrontmatter(
  dados: unknown,
  caminho: string,
  esperado?: { modulo: number; aula: number },
): FrontmatterAula {
  const r = esquemaFrontmatter.safeParse(dados);
  if (!r.success) {
    throw new ErroFrontmatter(
      caminho,
      r.error.issues.map((i) => `${i.path.join(".") || "(raiz)"}: ${i.message}`),
    );
  }
  if (esperado && (r.data.modulo !== esperado.modulo || r.data.aula !== esperado.aula)) {
    throw new ErroFrontmatter(caminho, [
      `modulo/aula (${r.data.modulo}/${r.data.aula}) não batem com a pasta e o arquivo (${esperado.modulo}/${esperado.aula})`,
    ]);
  }
  return r.data;
}
