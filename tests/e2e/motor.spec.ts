import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";

const AULA = "/aula/01-a-conta-do-produto/02-margem-de-contribuicao";

test.describe("progresso", () => {
  test("completing a lesson updates the cover, the trail and the module", async ({ page }) => {
    await page.goto(AULA);
    await page.getByRole("button", { name: "Concluir aula" }).click();
    await expect(page.getByRole("button", { name: /Aula concluída/ })).toHaveAttribute("aria-pressed", "true");

    await page.goto("/trilha");
    await expect(page.locator(`[data-modulo="1"] [data-status]`)).toHaveText(/Em andamento · 12%/);

    await page.goto("/modulo/01-a-conta-do-produto");
    await expect(page.getByRole("link", { name: /Margem de contribuição \(concluída\)/ })).toBeVisible();

    await page.goto("/");
    await expect(page.locator("[data-continuar]")).toContainText(/concluiu todas as aulas publicadas|Continuar de onde parei/);
  });

  test("notes are saved per lesson and survive a reload", async ({ page }) => {
    await page.goto(AULA);
    const notas = page.getByLabel("MINHAS ANOTAÇÕES");
    await notas.fill("ROAS de equilíbrio = 1 ÷ margem");
    await notas.blur();
    await expect(page.getByText("Anotação salva neste navegador.")).toBeVisible();
    await page.reload();
    await expect(page.getByLabel("MINHAS ANOTAÇÕES")).toHaveValue("ROAS de equilíbrio = 1 ÷ margem");
  });

  test("exports and re-imports progress; rejects a broken file", async ({ page }, info) => {
    await page.goto(AULA);
    await page.getByRole("button", { name: "Concluir aula" }).click();
    await page.goto("/trilha");

    const download = page.waitForEvent("download");
    await page.getByRole("button", { name: "Exportar progresso" }).click();
    const arquivo = info.outputPath("progresso.json");
    await (await download).saveAs(arquivo);
    const exportado = JSON.parse(await readFile(arquivo, "utf8"));
    expect(Object.keys(exportado.concluidas)).toContain("1-2");

    const input = page.locator("[data-importar]");
    await input.setInputFiles({ name: "ruim.json", mimeType: "application/json", buffer: Buffer.from('{"versao":9}') });
    await expect(page.getByRole("alert").filter({ hasText: "Nada foi alterado" })).toBeVisible();
    await expect(page.locator(`[data-modulo="1"] [data-status]`)).toHaveText(/Em andamento/);

    const vazio = { versao: 1, concluidas: {}, ultimaAula: null, anotacoes: {}, revisao: {} };
    await input.setInputFiles({ name: "vazio.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(vazio)) });
    await expect(page.getByRole("status").filter({ hasText: "Progresso importado" })).toBeVisible();
    await expect(page.locator('[data-modulo="1"] [data-status]')).toHaveText(/Não iniciado/);
  });
});

test("revisão only offers cards after the lesson is completed, then schedules them", async ({ page }) => {
  await page.goto("/revisao");
  await expect(page.getByText(/ainda não concluiu nenhuma aula/)).toBeVisible();

  await page.goto(AULA);
  await page.getByRole("button", { name: "Concluir aula" }).click();
  await page.goto("/revisao");
  await page.getByRole("button", { name: "Começar revisão" }).click();
  for (let i = 0; i < 4; i++) {
    await page.getByRole("button", { name: "Mostrar resposta" }).click();
    await expect(page.locator("[data-verso]")).toBeVisible();
    await page.getByRole("button", { name: i === 0 ? "Errei" : "Acertei" }).click();
  }
  await expect(page.locator('[data-revisao="fim"]')).toContainText("3 certos, 1 para rever");
  await page.getByRole("button", { name: "Voltar" }).click();
  await expect(page.getByText("Nada para revisar hoje.")).toBeVisible();
});

test("glossário filters terms and lesson terms open their definition", async ({ page }) => {
  await page.goto("/glossario");
  await page.getByLabel("Buscar termo").fill("roas de equilibrio");
  await expect(page.locator("dl > div")).toHaveCount(1);
  await expect(page.locator("dl > div")).toContainText("ROAS de equilíbrio");

  await page.goto(AULA);
  const termo = page.locator('[data-termo="roas"]');
  await termo.click();
  await expect(termo).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByRole("note").filter({ hasText: "ver no glossário" }).first()).toBeVisible();
});

test("busca finds lessons by words in their text", async ({ page }) => {
  await page.goto("/busca");
  await page.getByLabel("O que você procura?").fill("roas de equilibrio");
  await expect(page.getByText(/aulas? encontradas?/)).not.toHaveText(/^0 /);
  await expect(page.getByRole("link", { name: /ROAS de equilíbrio e CPA máximo/ })).toBeVisible();
  await page.getByLabel("O que você procura?").fill("xyzabc");
  await expect(page.getByText(/0 aulas encontradas/)).toBeVisible();
});

test("ferramentas shows every calculator and they react to input", async ({ page }) => {
  await page.goto("/ferramentas");
  for (const tipo of ["margem", "roas", "ponto-equilibrio", "preco", "markup", "cac-ltv", "importacao"]) {
    await expect(page.locator(`[data-calculadora="${tipo}"]`)).toBeVisible();
  }
  const pe = page.locator('[data-calculadora="ponto-equilibrio"]');
  await expect(pe.locator('[data-resultado="unidades"]')).toHaveText("77");
  const fixos = pe.getByRole("textbox", { name: "Custos fixos do mês" });
  await fixos.fill("3.900");
  await fixos.press("Enter");
  await expect(pe.locator('[data-resultado="unidades"]')).toHaveText("100");

  const imp = page.locator('[data-calculadora="importacao"]');
  await expect(imp).toContainText("Preencha a cotação do dólar");
});

test("inner pages have no horizontal scroll", async ({ page }) => {
  for (const url of ["/trilha", "/modulo/01-a-conta-do-produto", "/modulo/12-trafego-pago-meta-ads", "/glossario", "/busca", "/revisao", "/ferramentas"]) {
    await page.goto(url);
    const { sw, cw } = await page.evaluate(() => ({
      sw: document.documentElement.scrollWidth,
      cw: document.documentElement.clientWidth,
    }));
    expect(sw, url).toBeLessThanOrEqual(cw);
  }
});
