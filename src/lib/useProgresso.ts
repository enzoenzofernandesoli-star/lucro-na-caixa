"use client";

import { useSyncExternalStore } from "react";
import { esquemaProgresso, progressoVazio, type Progresso } from "./progresso";

// Browser store for progress: one localStorage key, shared by every component,
// kept in sync across tabs through the "storage" event.

export const CHAVE_PROGRESSO = "lucro-na-caixa:progresso:v1";

const VAZIO = progressoVazio();
let cache: Progresso | null = null;
const ouvintes = new Set<() => void>();

function ler(): Progresso {
  if (cache) return cache;
  try {
    const bruto = window.localStorage.getItem(CHAVE_PROGRESSO);
    const r = bruto ? esquemaProgresso.safeParse(JSON.parse(bruto)) : null;
    // A corrupted value is ignored (not deleted), so it can still be recovered by hand.
    cache = r?.success ? r.data : progressoVazio();
  } catch {
    cache = progressoVazio();
  }
  return cache;
}

function avisar() {
  for (const o of ouvintes) o();
}

function inscrever(ouvinte: () => void) {
  ouvintes.add(ouvinte);
  const aoMudarEmOutraAba = (e: StorageEvent) => {
    if (e.key === CHAVE_PROGRESSO) {
      cache = null;
      avisar();
    }
  };
  window.addEventListener("storage", aoMudarEmOutraAba);
  return () => {
    ouvintes.delete(ouvinte);
    window.removeEventListener("storage", aoMudarEmOutraAba);
  };
}

/** Saves a new progress value. Returns false when the browser refuses to store it. */
export function gravarProgresso(proximo: Progresso): boolean {
  cache = proximo;
  let ok = true;
  try {
    window.localStorage.setItem(CHAVE_PROGRESSO, JSON.stringify(proximo));
  } catch {
    ok = false;
  }
  avisar();
  return ok;
}

export function atualizarProgresso(mudar: (p: Progresso) => Progresso): boolean {
  const atual = ler();
  const proximo = mudar(atual);
  return proximo === atual ? true : gravarProgresso(proximo);
}

/** Current progress. On the server and during hydration it is the empty progress. */
export function useProgresso(): Progresso {
  return useSyncExternalStore(inscrever, ler, () => VAZIO);
}

/** True after hydration, so UI can avoid flashing "0%" before localStorage is read. */
export function useNoNavegador(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

/** Test helper: forget the in-memory copy. */
export function _limparCacheProgresso() {
  cache = null;
}
