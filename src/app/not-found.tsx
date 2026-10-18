import { BotaoLink } from "@/components/marca/Botao";

export default function NaoEncontrado() {
  return (
    <main id="conteudo" className="mx-auto flex min-h-dvh max-w-[720px] flex-col items-start justify-center gap-6 px-4 py-16">
      <span className="bg-vermelho px-3.5 py-1.5 font-mono text-[13px] font-semibold tracking-[0.1em] text-branco">
        ERRO 404 · PEDIDO EXTRAVIADO
      </span>
      <h1 className="m-0 font-titulo text-[clamp(2.5rem,8vw,4.5rem)] leading-[0.95] font-bold">
        ESSA PÁGINA NÃO ESTÁ NA CAIXA<span className="text-vermelho">.</span>
      </h1>
      <p className="m-0 text-lg">O endereço não existe ou a aula ainda não foi publicada.</p>
      <BotaoLink href="/">Voltar para a capa</BotaoLink>
    </main>
  );
}
