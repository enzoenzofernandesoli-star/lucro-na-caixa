import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { componentesDaAula } from "@/components/mdx";
import type { FonteAula } from "./frontmatter";

/** Compiles lesson/module MDX with the course components. */
export async function compilarMdx(corpo: string, fontes: FonteAula[] = []) {
  const { content } = await compileMDX({
    source: corpo,
    components: componentesDaAula(fontes),
    // Content is our own files and passes props like <Quiz perguntas={[...]} />.
    options: { blockJS: false, mdxOptions: { remarkPlugins: [remarkGfm] } },
  });
  return content;
}
