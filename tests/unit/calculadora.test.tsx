import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { CalculadoraMargem } from "@/components/ferramentas/CalculadoraMargem";

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
