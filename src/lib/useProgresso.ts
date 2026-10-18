"use client";

import { useSyncExternalStore } from "react";
import { esquemaProgresso, progressoVazio, type Progresso } from "./progresso";

// Browser store for progress: one localStorage key, shared by every component,
// kept in sync across tabs through the "storage" event.

export const CHAVE_PROGRESSO = "lucro-na-caixa:progresso:v1";
/** Where an unreadable saved value is copied before an import replaces it. */
export const CHAVE_PROGRESSO_ILEGIVEL = "lucro-na-caixa:progresso:v1:ilegivel";

const VAZIO = progressoVazio();
let cache: Progresso | null = null;
// True when a saved value exists but cannot be read. Automatic writes are then refused,
// so a visit or a click never overwrites progress that could still be recovered.
let ilegivel = false;
const ouvintes = new Set<() => void>();

function ler(): Progresso {
  if (cache) return cache;
  try {
    const bruto = window.localStorage.getItem(CHAVE_PROGRESSO);
    if (bruto === null) {
      ilegivel = false;
      cache = progressoVazio();
    } else {
      const r = esquemaProgresso.safeParse(JSON.parse(bruto));
      ilegivel = !r.success;
      cache = r.success ? r.data : progressoVazio();
    }
  } catch {
    // Unparseable JSON, or storage blocked by the browser.
    ilegivel = true;
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

/**
 * Saves a new progress value, replacing whatever is stored (used by import).
 * Invalid values are never written. Returns false when nothing was saved.
 */
export function gravarProgresso(proximo: Progresso): boolean {
  if (!esquemaProgresso.safeParse(proximo).success) return false;
  try {
    if (ilegivel) {
      const antigo = window.localStorage.getItem(CHAVE_PROGRESSO);
      if (antigo !== null) window.localStorage.setItem(CHAVE_PROGRESSO_ILEGIVEL, antigo);
    }
    window.localStorage.setItem(CHAVE_PROGRESSO, JSON.stringify(proximo));
  } catch {
    return false;
  }
  cache = proximo;
  ilegivel = false;
  avisar();
  return true;
}

/** Applies a change to the saved progress. Refused (false) while the saved value is unreadable. */
export function atualizarProgresso(mudar: (p: Progresso) => Progresso): boolean {
  const atual = ler();
  if (ilegivel) return false;
  const proximo = mudar(atual);
  return proximo === atual ? true : gravarProgresso(proximo);
}

/** True when the browser has saved progress that could not be read. */
export function progressoIlegivel(): boolean {
  ler();
  return ilegivel;
}

/** Same as progressoIlegivel, as a hook (false on the server). */
export function useProgressoIlegivel(): boolean {
  return useSyncExternalStore(inscrever, progressoIlegivel, () => false);
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
  ilegivel = false;
}
