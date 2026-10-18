import { expect, test, type Page } from "@playwright/test";

const AULA = "/aula/01-a-conta-do-produto/02-margem-de-contribuicao";

async function semRolagemHorizontal(page: Page) {
  const { larguraPagina, larguraJanela } = await page.evaluate(() => ({
    larguraPagina: document.documentElement.scrollWidth,
    larguraJanela: document.documentElement.clientWidth,
  }));
  expect(larguraPagina).toBeLessThanOrEqual(larguraJanela);
}

test.describe("capa", () => {
  test("shows the brand hero and opens the lesson", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(/LUCRO NA\s*CAIXA\./);
    await expect(page.getByText("20 MÓDULOS")).toBeVisible();
    await semRolagemHorizontal(page);

    await page.getByRole("link", { name: "Abrir o módulo 1" }).click();
    await expect(page).toHaveURL("/modulo/01-a-conta-do-produto");
    await page.getByRole("link", { name: /Margem de contribuição/ }).click();
    await expect(page).toHaveURL(AULA);
    await expect(page.getByRole("heading", { level: 1, name: "Margem de contribuição" })).toBeVisible();
  });

  test("lesson preview calculator responds", async ({ page }) => {
    await page.goto("/");
    const calc = page.locator('[data-calculadora="margem"]');
    await expect(calc.locator('[data-resultado="margem"]')).toHaveText("R$ 39,00");
    await calc.getByRole("button", { name: "Diminuir custo do produto" }).click();
    await expect(calc.locator('[data-resultado="margem"]')).toHaveText("R$ 44,00");
  });
});

test.describe("aula", () => {
  test("renders every block of the lesson template in order", async ({ page }) => {
    await page.goto(AULA);
    await semRolagemHorizontal(page);
    const ordem = await page
      .locator("[data-bloco], [data-calculadora], [data-quiz]")
      .evaluateAll((els) =>
        els.map((e) => (e as HTMLElement).dataset.bloco ?? ((e as HTMLElement).dataset.calculadora ? "ferramenta" : "quiz")),
      );
    const marcos = ["objetivo", "por-que", "exemplo", "ferramenta", "erro-comum", "na-pratica", "quiz", "resumo", "fontes"];
    const posicoes = marcos.map((m) => ordem.indexOf(m));
    expect(posicoes.every((p) => p >= 0)).toBe(true);
    expect([...posicoes].sort((a, b) => a - b)).toEqual(posicoes);
    await expect(page.locator('[data-bloco="fontes"] li')).toHaveCount(3);
  });

  test("sidebar lists the 20 modules and marks the current one", async ({ page }) => {
    await page.goto(AULA);
    const nav = page.getByRole("navigation", { name: "Módulos" });
    // On phones the list is collapsed behind a <details>.
    const resumo = nav.locator("summary");
    if (await resumo.isVisible()) await resumo.click();
    await expect(nav.locator("li:visible")).toHaveCount(20);
    await expect(nav.locator('a[aria-current="true"]:visible')).toHaveText(/A conta do produto/);
  });

  test("calculator and quiz work with the keyboard", async ({ page }) => {
    await page.goto(AULA);
    const calc = page.locator('[data-calculadora="margem"]');
    const preco = calc.getByRole("textbox", { name: "Preço de venda" });
    await preco.focus();
    await preco.fill("200");
    await preco.press("Enter");
    // 200 − 35 − 30 (15%) − 10 − 1 = 124
    await expect(calc.locator('[data-resultado="margem"]')).toHaveText("R$ 124,00");

    const quiz = page.locator("[data-quiz]");
    const certa = quiz.locator('[data-pergunta="1"]').getByRole("button", { name: "4,0" });
    await certa.focus();
    await page.keyboard.press("Enter");
    await expect(quiz.locator('[data-pergunta="1"]')).toContainText("Certo.");
  });

  test("interactive targets are at least 44px", async ({ page }) => {
    await page.goto(AULA);
    const pequenos = await page
      .locator('[data-calculadora] button, [data-quiz] button, [data-checklist] label')
      .evaluateAll((els) =>
        els
          .map((e) => e.getBoundingClientRect())
          .filter((r) => r.width > 0 && (r.height < 44 || r.width < 44)).length,
      );
    expect(pequenos).toBe(0);
  });

  test("unknown lesson shows the not-found page", async ({ page }) => {
    await page.goto("/aula/01-a-conta-do-produto/99-nao-existe");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(/NÃO ESTÁ NA CAIXA/);
  });
});

test("small white-on-red labels reach 4.5:1 contrast", async ({ page }) => {
  await page.goto(AULA);
  // The lesson streams in behind Suspense; wait for it before measuring.
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  const razoes = await page.locator(".text-branco:not([aria-hidden] *):not([aria-hidden])").evaluateAll((els) => {
    const lum = (rgb: string) => {
      const [r, g, b] = (rgb.match(/\d+/g) ?? []).slice(0, 3).map((v) => {
        const c = Number(v) / 255;
        return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    return els
      .filter((e) => (e as HTMLElement).offsetParent !== null)
      .map((e) => {
        const cs = getComputedStyle(e);
        const [a, b] = [lum(cs.color), lum(cs.backgroundColor)].sort((x, y) => y - x);
        return (a + 0.05) / (b + 0.05);
      });
  });
  expect(razoes.length).toBeGreaterThan(0);
  for (const r of razoes) expect(r).toBeGreaterThanOrEqual(4.5);
});
