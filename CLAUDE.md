# Lucro na Caixa — contexto do projeto (leia inteiro antes de qualquer tarefa)

Este arquivo é a fonte da verdade. Se um pedido contradisser este arquivo, PARE e pergunte.
O mesmo conteúdo existe em `AGENTS.md` (para o Codex). Se mudar um, mude o outro.

## 1. O que é

**Lucro na Caixa** é um curso completo de e-commerce e dropshipping, em português do Brasil, em forma de site.
Aluno principal: o Enzo (dono do projeto), que quer sair do zero e virar especialista. No futuro o curso pode ser vendido, então todo conteúdo deve ter qualidade de produto.

Objetivo do aluno ao terminar: saber escolher produto, fazer a conta, anunciar em marketplace e em tráfego pago, operar, atender, medir, escalar e montar o próprio hub/ERP, sabendo separar fato de promessa de guru.

## 2. Regras de ouro (não negociáveis)

1. **Nada inventado.** Todo número, regra, taxa, lei, prazo ou política vem de fonte real, citada na aula, com data de consulta. Sem fonte confiável: escreva que não foi possível confirmar.
2. **Marque a confiabilidade** de todo número e afirmação de mercado: `[verificado]` (lei, documentação oficial, página oficial da plataforma), `[estimativa]` (referência de mercado, explicar de onde), `[alegação não confirmada]` (discurso comum sem dado).
3. **Fontes preferidas, nesta ordem:** lei e governo (planalto.gov.br, gov.br, Receita Federal, SEFAZ), documentação oficial das plataformas (central do vendedor Shopee e Mercado Livre, TikTok, Meta, Google), órgãos (Sebrae, Procon), e só depois blogs e imprensa especializada. Nunca usar curso pago de terceiros como fonte nem copiar texto de ninguém.
4. **Regras de plataforma mudam.** Toda aula sobre taxa, política ou funcionalidade de plataforma mostra "Conferido em DD/MM/AAAA" e um link para a página oficial.
5. **Texto original.** Explicar com as próprias palavras. Citação literal só curta, entre aspas e com fonte.
6. **Sem promessa de renda.** Nenhuma aula promete faturamento, "produto vencedor" ou resultado garantido.
7. **Didática primeiro** (seção 4). Uma aula difícil de entender está errada, mesmo que esteja correta.
8. **Escopo fechado por fase.** Ideia nova vai para `docs/v2.md`.

## 3. Stack

| Camada | Ferramenta |
| --- | --- |
| App | Next.js (última estável, App Router) + TypeScript strict |
| Visual | Tailwind CSS. Fontes via next/font/google: Saira Stencil One (títulos), Bricolage Grotesque (números grandes), Figtree (texto), IBM Plex Mono (rótulos e valores) |
| Conteúdo | MDX em `content/` (um arquivo por aula), com frontmatter |
| Progresso | localStorage (v1, uso pessoal) com exportar/importar JSON. Banco só se o curso for vendido |
| Testes | Vitest (calculadoras, quiz, progresso) + Playwright (navegação) |
| Hospedagem | Vercel |

## 4. Método didático (toda aula segue este molde)

Cada aula é um arquivo MDX em `content/modulos/NN-slug/NN-slug.mdx` com:

```yaml
---
modulo: 1
aula: 2
titulo: "Margem de contribuição"
nivel: iniciante | intermediario | avancado
duracao_min: 15
objetivo: "Ao final você calcula a margem de qualquer produto e sabe se ele paga o anúncio."
pre_requisitos: ["1-1"]
fontes:
  - titulo: "Nome da fonte"
    url: "https://..."
    consultado_em: "2026-10-18"
verificado_em: "2026-10-18"
---
```

Estrutura obrigatória, nesta ordem:

1. **Objetivo** — uma frase: o que o aluno sabe fazer ao terminar.
2. **Por que importa** — o problema real que essa aula resolve, com uma situação concreta.
3. **Explicação** — passo a passo, linguagem simples, um conceito por vez, termos técnicos explicados na primeira vez (e linkados ao glossário).
4. **Exemplo real** — números de exemplo marcados como exemplo, conta feita na tela.
5. **Ferramenta** — quando fizer sentido: calculadora, simulador ou checklist interativo.
6. **Erro comum** — o que iniciante costuma fazer errado e como evitar.
7. **Na prática** — exercício que o aluno faz com o próprio produto ou loja (a Busca Agora pode servir de laboratório).
8. **Teste rápido** — 3 a 5 perguntas com correção e explicação da resposta certa.
9. **Resumo** — 3 a 5 tópicos.
10. **Fontes** — lista com links e data de consulta.

Regras de escrita: frases curtas, parágrafos de até 4 linhas, exemplos brasileiros, valores em R$, sem jargão sem explicação, sem tom de guru. Cada módulo termina com um **projeto do módulo** e uma **revisão** (flashcards dos conceitos).

Progressão: iniciante (módulos 0–4) → intermediário (5–12) → avançado (13–19). Cada aula diz o nível e os pré-requisitos.

## 5. Identidade visual "Lucro na Caixa"

Referência completa: `docs/design/LucroNaCaixa.dc.html` (arquivo-fonte do design aprovado: copie medidas, cores, fontes e componentes; as tags `<sc-for>`, `<sc-if>` e `{{...}}` são só do editor de design).

| Token | Hex | Uso |
| --- | --- | --- |
| `kraft` | #D9BC8C | Fundo principal (papelão) |
| `kraft-escuro` | #EFE6D2 | Barra lateral, áreas secundárias |
| `papel` | #F7F2E7 | Cartões e área de leitura |
| `tinta` | #141210 | Texto, bordas de 3px, sombras sólidas |
| `amarelo` | #FFE03A | Destaque, botões principais, resultados |
| `vermelho` | #E5292B | Fita, selos, alerta |
| `vermelho-texto` | #B3121A | Texto vermelho sobre claro (contraste) |
| `branco` | #FFFFFF | Campos e cartões de ferramenta |

- Bordas 3px `tinta`, cantos 12–22px, sombra sólida deslocada (`6px 6px 0 tinta`) em botões e cartões de destaque; no hover o botão "levanta" 2px.
- Títulos em Saira Stencil One maiúsculo; números grandes em Bricolage Grotesque 800; rótulos em IBM Plex Mono com espaçamento.
- Elementos de marca: fita vermelha diagonal, etiqueta de pedido com código de barras, selo redondo amarelo.
- Acessibilidade: contraste 4.5:1, alvos de toque de 44px, botões reais, navegação por teclado, `prefers-reduced-motion`.
- Leitura confortável: área de texto da aula com no máximo ~70 caracteres por linha, fonte 18px.

## 6. Estrutura do site

- `/` capa do curso, progresso geral e "continuar de onde parei".
- `/trilha` todos os módulos com status (não iniciado, em andamento, concluído).
- `/modulo/[slug]` visão do módulo: objetivo, aulas, projeto do módulo.
- `/aula/[modulo]/[aula]` a aula, com barra lateral de módulos, anotações pessoais por aula e botão "concluir aula".
- `/ferramentas` todas as calculadoras e simuladores juntos.
- `/glossario` termos do curso com busca.
- `/revisao` flashcards com repetição espaçada dos conceitos já estudados.
- `/busca` busca em todas as aulas.

Componentes MDX disponíveis para as aulas: `<Objetivo>`, `<PorQue>`, `<Exemplo>`, `<Formula>`, `<Calculadora tipo="margem|roas|ponto-equilibrio|preco|markup|cac-ltv|importacao|ficha-produto|campanha|painel-semanal|drop">`, `<ErroComum>`, `<NaPratica>`, `<Quiz>`, `<Checklist>`, `<Resumo>`, `<Fontes>`, `<Termo>` (link ao glossário), `<Alerta conferidoEm="DD/MM/AAAA" fonte="https://...">` (regra de plataforma que muda).

- A pasta de cada módulo usa o slug definido em `src/data/modulos.ts` (ex.: `content/modulos/15-operacao/`).
- `npm run fontes` (ou `npm run fontes -- NN` para um módulo) confere se os links das fontes respondem e se não redirecionam para página genérica. Páginas que bloqueiam robôs precisam ser conferidas no navegador.

## 7. Convenções

- Dinheiro em centavos (inteiro) nas calculadoras; formatação pt-BR na tela.
- Código e commits em inglês; conteúdo em português do Brasil.
- Uma fase = uma branch = um Pull Request.
- Nunca colocar chave secreta no código.

## 8. Definição de pronto

- [ ] Toda aula do módulo segue o molde da seção 4 e tem fontes com data.
- [ ] Nenhum número sem marcação de confiabilidade.
- [ ] Revisão de fatos do Codex feita e corrigida.
- [ ] Lint, typecheck, testes e build passando; prévia na Vercel funcionando no celular e no computador.
- [ ] Resumo final: o que foi feito, o que não pôde ser confirmado e o que ficou pendente.
