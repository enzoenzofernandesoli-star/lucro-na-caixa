"use client";

import { useRef, useState } from "react";
import { classesBotao } from "@/components/marca/Botao";
import { exportarProgresso, hojeIso, importarProgresso } from "@/lib/progresso";
import { gravarProgresso, useProgresso } from "@/lib/useProgresso";

/** Export progress to a JSON file and import it back (with validation). */
export function BackupProgresso() {
  const progresso = useProgresso();
  const arquivoRef = useRef<HTMLInputElement>(null);
  const [mensagem, setMensagem] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(null);

  function exportar() {
    const blob = new Blob([exportarProgresso(progresso)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lucro-na-caixa-progresso-${hojeIso()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMensagem({ tipo: "ok", texto: "Arquivo de progresso gerado." });
  }

  async function importar(arquivo: File | undefined) {
    if (!arquivo) return;
    if (arquivo.size > 2_000_000) {
      setMensagem({ tipo: "erro", texto: "Arquivo grande demais para ser um progresso do curso." });
      return;
    }
    const r = importarProgresso(await arquivo.text());
    if (!r.ok) {
      setMensagem({ tipo: "erro", texto: `${r.erro} Nada foi alterado.` });
      return;
    }
    const salvou = gravarProgresso(r.progresso);
    setMensagem(
      salvou
        ? { tipo: "ok", texto: `Progresso importado: ${Object.keys(r.progresso.concluidas).length} aulas concluídas.` }
        : { tipo: "erro", texto: "O navegador não deixou salvar o progresso importado." },
    );
  }

  return (
    <section aria-labelledby="titulo-backup" className="flex flex-col gap-4 rounded-2xl border-[3px] border-dashed border-tinta bg-kraft-escuro p-5 sm:p-6">
      <h2 id="titulo-backup" className="m-0 font-titulo text-[26px] leading-none font-bold uppercase">
        Cópia do seu progresso
      </h2>
      <p className="m-0">
        O progresso fica salvo só neste navegador. Exporte um arquivo para guardar ou levar para outro computador.
        Importar <strong>substitui</strong> o progresso atual.
      </p>
      <div className="flex flex-wrap gap-4">
        <button type="button" onClick={exportar} className={classesBotao("primario", "cursor-pointer")}>
          Exportar progresso
        </button>
        <button type="button" onClick={() => arquivoRef.current?.click()} className={classesBotao("secundario", "cursor-pointer")}>
          Importar progresso
        </button>
        <input
          ref={arquivoRef}
          type="file"
          tabIndex={-1}
          aria-hidden="true"
          data-importar
          accept="application/json,.json"
          className="sr-only"
          onChange={(e) => {
            void importar(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </div>
      <p
        role={mensagem?.tipo === "erro" ? "alert" : "status"}
        className={`m-0 font-semibold ${mensagem?.tipo === "erro" ? "text-vermelho-texto" : ""}`}
      >
        {mensagem?.texto}
      </p>
    </section>
  );
}
