import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Quiz, type PerguntaQuiz } from "@/components/ferramentas/Quiz";

const pergunta: PerguntaQuiz = {
  enunciado: "A margem é 25%. Qual é o ROAS de equilíbrio?",
  opcoes: ["2,5", "4,0", "25"],
  correta: 1,
  explicacao: "1 ÷ 0,25 = 4.",
};

describe("Quiz", () => {
  it("asks for an answer before any choice", () => {
    render(<Quiz perguntas={[pergunta]} />);
    expect(screen.getByText("Escolha uma resposta.")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Teste rápido" })).toBeInTheDocument();
  });

  it("marks a wrong answer and lets the student try again", async () => {
    const user = userEvent.setup();
    render(<Quiz perguntas={[pergunta]} />);
    await user.click(screen.getByRole("button", { name: "2,5" }));
    expect(screen.getByRole("button", { name: "2,5" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText(/Ainda não/)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "4,0" }));
    expect(screen.getByRole("button", { name: "2,5" })).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByText(/Certo\./)).toHaveTextContent("Certo. 1 ÷ 0,25 = 4.");
  });

  it("works with the keyboard", async () => {
    const user = userEvent.setup();
    render(<Quiz perguntas={[pergunta]} />);
    await user.tab();
    await user.tab();
    expect(screen.getByRole("button", { name: "4,0" })).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(screen.getByText(/Certo\./)).toBeInTheDocument();
  });

  it("keeps each question's answer separate", async () => {
    const user = userEvent.setup();
    render(<Quiz perguntas={[pergunta, { ...pergunta, enunciado: "Outra", correta: 0 }]} />);
    await user.click(screen.getAllByRole("button", { name: "2,5" })[1]);
    expect(screen.getAllByText("Escolha uma resposta.")).toHaveLength(1);
    expect(screen.getByText(/Certo\./)).toBeInTheDocument();
  });

  it("rejects an invalid right-answer index", () => {
    expect(() => render(<Quiz perguntas={[{ ...pergunta, correta: 3 }]} />)).toThrow(/índice/);
  });
});
