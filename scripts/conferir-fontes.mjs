// Checks every source URL cited in content/ (lesson frontmatter `fontes` and <Alerta fonte="...">).
// Usage: npm run fontes            (all sources)
//        npm run fontes -- 03      (only modules whose folder starts with 03)
// Exit code 1 when a link is broken or redirects to a generic page.

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

const RAIZ = path.join(process.cwd(), "content", "modulos");
const filtro = process.argv[2];

// Pages that sites use when an old article no longer exists.
const PAGINAS_GENERICAS = [/sebrae\.com\.br\/empreendedores\/conteudos\/?$/, /\/404/, /page-not-found/i];

async function listarArquivos() {
  const saida = [];
  for (const pasta of (await readdir(RAIZ)).sort()) {
    if (filtro && !pasta.startsWith(filtro)) continue;
    for (const arquivo of (await readdir(path.join(RAIZ, pasta))).filter((f) => f.endsWith(".mdx"))) {
      saida.push(path.join(RAIZ, pasta, arquivo));
    }
  }
  return saida;
}

async function coletar() {
  const porUrl = new Map();
  for (const arquivo of await listarArquivos()) {
    const bruto = await readFile(arquivo, "utf8");
    const { data, content } = matter(bruto);
    const urls = [
      ...(data.fontes ?? []).map((f) => f.url),
      ...[...content.matchAll(/fonte="(https?:\/\/[^"]+)"/g)].map((m) => m[1]),
    ];
    for (const url of urls) {
      if (!porUrl.has(url)) porUrl.set(url, new Set());
      porUrl.get(url).add(path.relative(RAIZ, arquivo));
    }
  }
  return porUrl;
}

async function conferir(url) {
  try {
    const r = await fetch(url, {
      redirect: "follow",
      headers: { "user-agent": "Mozilla/5.0 (conferencia de fontes Lucro na Caixa)" },
      signal: AbortSignal.timeout(30_000),
    });
    const generica = PAGINAS_GENERICAS.some((re) => re.test(r.url));
    // Some official sites block robots (403) but open in a browser: report, don't fail.
    const bloqueado = r.status === 403 || r.status === 429;
    return { status: r.status, final: r.url, ok: r.ok && !generica, generica, bloqueado };
  } catch (e) {
    return { status: 0, final: "", ok: false, generica: false, bloqueado: false, erro: String(e.cause?.code ?? e.message) };
  }
}

const porUrl = await coletar();
let quebrados = 0;
const resultados = await Promise.all(
  [...porUrl.keys()].map(async (url) => ({ url, arquivos: [...porUrl.get(url)], ...(await conferir(url)) })),
);
for (const r of resultados.sort((a, b) => Number(a.ok) - Number(b.ok))) {
  const marca = r.ok ? "OK " : r.bloqueado ? "?? " : "ERRO";
  if (!r.ok && !r.bloqueado) quebrados++;
  console.log(`${marca} ${r.status || r.erro} ${r.url}`);
  if (r.generica) console.log(`     redireciona para página genérica: ${r.final}`);
  if (!r.ok) console.log(`     citado em: ${r.arquivos.join(", ")}`);
}
console.log(`\n${resultados.length} fontes, ${quebrados} quebradas, ${resultados.filter((r) => r.bloqueado).length} bloqueiam robôs (conferir no navegador).`);
process.exit(quebrados > 0 ? 1 : 0);
