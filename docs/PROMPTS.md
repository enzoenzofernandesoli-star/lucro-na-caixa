# Lucro na Caixa — prompts prontos

Modelos: **Claude Code** com Opus 5.5 (constrói e pesquisa) · **Codex** com GPT-6 Sol (confere fatos e revisa código).
Ordem de cada fase: Claude Code em modo plano → você aprova → Claude Code faz → Codex revisa → Claude Code corrige → você aprova o PR.

Regras de segurança para todas as fases:
- Claude Code não faz push nem abre PR sem você autorizar.
- Nenhuma chave secreta em código, prompt ou commit (a v1 não precisa de nenhuma).

---

## FASE 0 — Base do site e identidade visual (Claude Code)

```
Leia CLAUDE.md, docs/CURRICULO.md e docs/design/LucroNaCaixa.dc.html inteiros antes de começar.
Trabalhe em modo plano: me mostre o plano e espere eu aprovar.

Tarefa — Fase 0 (branch feat/fase-0-base):
1. Criar o projeto Next.js (última versão estável, App Router, TypeScript strict, Tailwind, ESLint) na raiz deste repositório.
2. Configurar os tokens de cor e as 4 fontes da seção 5 do CLAUDE.md (next/font/google).
3. Recriar a identidade do design de referência em componentes React reutilizáveis:
   botão principal (sombra sólida, "levanta" no hover), cartão, fita vermelha diagonal, etiqueta de pedido com código de barras, selo redondo amarelo, barra lateral de módulos.
4. Criar a capa (/) igual à referência: "LUCRO NA CAIXA.", subtítulo, botões, etiqueta e selo. Adaptar para celular (a referência é 1440px).
5. Criar os componentes MDX da seção 6: Objetivo, PorQue, Exemplo, Formula, Calculadora (só tipo="margem" e tipo="roas" nesta fase), ErroComum, NaPratica, Quiz, Checklist, Resumo, Fontes, Termo, Alerta.
6. Configurar MDX para ler content/modulos/** com validação do frontmatter (falhar o build se faltar campo).
7. Criar UMA aula de exemplo: content/modulos/01-a-conta-do-produto/02-margem-de-contribuicao.mdx seguindo o molde da seção 4, com a calculadora e o quiz funcionando. Pesquise as fontes de verdade e cite com data. Números de exemplo marcados como exemplo.
8. Rota /aula/[modulo]/[aula] renderizando essa aula com a barra lateral dos 20 módulos (nomes de docs/CURRICULO.md).
9. Testes: Vitest para a conta da margem e do ROAS (centavos, prejuízo, margem zero) e para o quiz; Playwright abrindo a capa e a aula no celular e no computador.
10. Acessibilidade da seção 5 (contraste, foco visível, 44px, teclado, prefers-reduced-motion).

Não fazer nesta fase: progresso, busca, glossário, revisão, outras aulas.
Ao terminar: rode lint, typecheck, testes e build; me mostre o resultado e um resumo. Não faça push sem eu pedir.
```

---

## FASE 1 — Motor do curso (Claude Code)

```
Leia CLAUDE.md e docs/CURRICULO.md. Modo plano primeiro.

Tarefa — Fase 1 (branch feat/fase-1-motor):
1. Progresso no localStorage: concluir aula, % por módulo e geral, "continuar de onde parei" na capa. Exportar e importar o progresso em JSON (com validação).
2. /trilha com todos os módulos e status; /modulo/[slug] com objetivo, lista de aulas e projeto do módulo.
3. Anotações pessoais por aula (salvas no localStorage).
4. /glossario: termos em content/glossario.json, com busca; o componente <Termo> abre a definição.
5. /revisao: flashcards dos conceitos das aulas concluídas, com repetição espaçada simples (Leitner, 5 caixas). Cada aula pode declarar flashcards no frontmatter.
6. /busca: busca no texto de todas as aulas (índice gerado no build, sem serviço externo).
7. /ferramentas: todas as calculadoras juntas. Completar os tipos ponto-equilibrio, preco, markup, cac-ltv e importacao (importação só com campos editáveis pelo aluno — nenhum imposto fixo no código sem fonte; se tiver valor padrão, ele vem de uma aula com fonte e data).
8. Testes para progresso, import/export, Leitner, busca e todas as calculadoras.

Ao terminar: lint, typecheck, testes, build e resumo. Não faça push sem eu pedir.
```

---

## MODELO — Escrever um módulo (Claude Code, repetir para cada módulo)

Troque `NN` e o nome do módulo.

```
Leia CLAUDE.md (principalmente seções 2 e 4) e o Módulo NN de docs/CURRICULO.md. Modo plano primeiro.

Tarefa — Conteúdo do Módulo NN (branch content/modulo-NN):
1. PESQUISA ANTES DE ESCREVER: para cada aula, liste os fatos que ela precisa (taxas, leis, prazos, regras de plataforma, números de mercado) e pesquise cada um em fonte real, na ordem de prioridade da seção 2. Me mostre a tabela: fato | valor | fonte (URL) | data | marcação [verificado]/[estimativa]/[alegação não confirmada]. O que não conseguir confirmar, diga.
2. Espere eu aprovar a tabela.
3. Escreva cada aula em MDX seguindo EXATAMENTE o molde da seção 4 (Objetivo → Por que importa → Explicação → Exemplo real → Ferramenta → Erro comum → Na prática → Teste rápido → Resumo → Fontes).
4. Escreva como professor paciente para quem nunca vendeu online: frases curtas, um conceito por vez, todo termo técnico explicado na primeira vez e ligado ao glossário, exemplos em R$ do Brasil.
5. Regras de plataforma com <Alerta> e "Conferido em DD/MM/AAAA".
6. Projeto do módulo e flashcards de revisão.
7. Adicionar os termos novos em content/glossario.json.
8. Texto 100% original. Nada de cursos pagos como fonte. Sem promessa de renda.

Ao terminar: build passando e lista do que ficou como [estimativa] ou não confirmado. Não faça push sem eu pedir.
```

---

## CODEX — Conferência de fatos (somente leitura, depois de cada módulo)

```
Leia AGENTS.md. Você é revisor de fatos. NÃO altere arquivos.

Revise todas as aulas em content/modulos/NN-*/:
1. Para cada número, taxa, lei, prazo ou regra de plataforma: abra a fonte citada e confirme se ela diz exatamente isso hoje. Se possível, procure também a fonte oficial mais atual.
2. Confira se cada afirmação tem a marcação certa ([verificado], [estimativa], [alegação não confirmada]).
3. Aponte: fato errado ou desatualizado, fonte que não sustenta a frase, fonte fraca onde existe oficial, promessa de renda, texto que parece copiado, conta errada nos exemplos.
4. Avalie a didática: algum trecho confuso para iniciante? Termo sem explicação? Quiz com resposta ambígua?

Entregue uma tabela: arquivo | trecho | problema | gravidade (alta/média/baixa) | correção sugerida | fonte.
```

---

## CODEX — Revisão de código (somente leitura, depois de cada fase de código)

```
Leia AGENTS.md. Você é revisor de código. NÃO altere arquivos.

Revise o diff da branch atual contra main:
1. Bugs e contas erradas nas calculadoras (centavos, divisão por zero, margem negativa, arredondamento).
2. Progresso e import/export: dados corrompidos, JSON inválido, perda de progresso.
3. Acessibilidade (seção 5): contraste, foco, teclado, alvos de 44px, leitor de tela.
4. Fidelidade à identidade visual de docs/design/LucroNaCaixa.dc.html.
5. Celular: quebra de layout, rolagem horizontal.
6. Testes faltando para regras importantes.
7. Segredos, dependências desnecessárias, código morto.

Entregue: lista por gravidade (alta/média/baixa) com arquivo, linha, problema e correção sugerida.
```

---

## Claude Code — Aplicar a revisão do Codex

```
Aqui está a revisão do Codex: [COLE A REVISÃO]
Leia CLAUDE.md. Corrija os itens de gravidade alta e média. Para cada item baixo, corrija ou explique por que não.
Em correção de fato, use a fonte oficial e atualize a data de consulta.
Ao terminar: lint, typecheck, testes, build e lista do que foi corrigido. Não faça push sem eu pedir.
```
