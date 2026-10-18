import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { CalculadoraMargem } from "@/components/ferramentas/CalculadoraMargem";
import { CalculadoraRoas } from "@/components/ferramentas/CalculadoraRoas";

const resultado = (nome: string) => document.querySelector(`[data-resultado="${nome}"]`);

describe("CalculadoraMargem", () => {
  it("starts with the design example", () => {
    render(<CalculadoraMargem />);
    expect(resultado("margem")).toHaveTextContent("R$ 39,00");
    expect(resultado("margem-percentual")).toHaveTextContent("39,0% do preço");
    expect(resultado("roas-equilibrio")).toHaveTextContent("2,56");
  });

  it("updates with the −/+ steppers", async () => {
    const user = userEvent.setup();
    render(<CalculadoraMargem />);
    await user.click(screen.getByRole("button", { name: "Aumentar custo do produto" }));
    expect(resultado("margem")).toHaveTextContent("R$ 34,00");
  });

  it("accepts a typed pt-BR value", async () => {
    const user = userEvent.setup();
    render(<CalculadoraMargem />);
    const custo = screen.getByLabelText("Custo do produto");
    await user.clear(custo);
    await user.type(custo, "74{Enter}");
    expect(resultado("margem")).toHaveTextContent("R$ 0,00");
    expect(resultado("roas-equilibrio")).toHaveTextContent("—");
    expect(screen.getByText(/prejuízo/)).toBeInTheDocument();
  });

  it("ignores text that is not a number", async () => {
    const user = userEvent.setup();
    render(<CalculadoraMargem />);
    const preco = screen.getByLabelText("Preço de venda");
    await user.clear(preco);
    await user.type(preco, "abc");
    await user.tab();
    expect(preco).toHaveValue("100,00");
  });
});

describe("CampoNumero thousands", () => {
  it("reads 1.000 as one thousand reais", async () => {
    const user = userEvent.setup();
    render(<CalculadoraMargem />);
    const preco = screen.getByLabelText("Preço de venda");
    await user.clear(preco);
    await user.type(preco, "1.000{Enter}");
    expect(preco).toHaveValue("1.000,00");
    // 1000 − 35 − 150 (15%) − 10 − 1 = 804
    expect(resultado("margem")).toHaveTextContent("R$ 804,00");
  });
});

describe("CalculadoraRoas", () => {
  it("accepts a negative margin and shows the full loss", async () => {
    const user = userEvent.setup();
    render(<CalculadoraRoas />);
    const margem = screen.getByLabelText("Margem antes do anúncio (%)");
    await user.clear(margem);
    await user.type(margem, "-10{Enter}");
    expect(margem).toHaveValue("-10");
    // R$ 1.000 of sales at −10% margin = −R$ 100, minus R$ 300 of ads
    expect(resultado("sobra")).toHaveTextContent("-R$ 400,00");
    expect(resultado("roas-equilibrio")).toHaveTextContent("—");
  });

  it("steps below zero with the − button", async () => {
    const user = userEvent.setup();
    render(<CalculadoraRoas inicial={{ margem: 0 }} />);
    await user.click(screen.getByRole("button", { name: "Diminuir margem antes do anúncio (%)" }));
    expect(screen.getByLabelText("Margem antes do anúncio (%)")).toHaveValue("-1");
  });
});

describe("CalculadoraRoas labels", () => {
  it("labels R$ 390 as total margin, not sales", () => {
    render(<CalculadoraRoas />);
    // Lesson 1.2 example: R$ 1.000 of sales × 39% margin = R$ 390 of margin.
    expect(resultado("conta")).toHaveTextContent("Margem total R$ 390,00 − anúncio R$ 300,00");
    expect(resultado("conta")).not.toHaveTextContent(/vendas/i);
    expect(resultado("sobra")).toHaveTextContent("R$ 90,00");
  });
});
