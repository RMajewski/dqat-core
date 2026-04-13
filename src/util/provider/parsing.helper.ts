import { isNumberLike } from './guards.ts';
import type { ParseFlags } from './parsing.ts';

/**
 * Versucht, eine JSON-Repräsentation zu parsen, falls `flags.json` aktiv ist.
 * Liefert ein Ergebnisobjekt mit `parsed`-Flag zur einfachen Orchestrierung.
 */
export function tryParseJson(
  text: string,
  flags: ParseFlags,
): { parsed: boolean; value?: unknown } {
  if (!flags.json) {
    return { parsed: false };
  }
  if (!isJsonCandidate(text)) {
    return { parsed: false };
  }

  try {
    return { parsed: true, value: JSON.parse(text) };
  } catch {
    return { parsed: false };
  }
}

/**
 * Versucht, einen Boolean zu parsen, falls `flags.booleans` aktiv ist.
 * Erkennt ausschließlich die Literale „true“/„false“ (case-insensitiv).
 */
export function tryParseBoolean(
  text: string,
  flags: ParseFlags,
): { parsed: boolean; value?: boolean } {
  if (!flags.booleans) {
    return { parsed: false };
  }
  if (/^true$/i.test(text)) {
    return { parsed: true, value: true };
  }
  if (/^false$/i.test(text)) {
    return { parsed: true, value: false };
  }
  return { parsed: false };
}

/**
 * Versucht, eine Zahl zu parsen, falls `flags.numbers` aktiv ist.
 * Nutzt eine konservative Heuristik, um Verwechslungen mit IDs etc. zu vermeiden.
 */
export function tryParseNumber(
  text: string,
  flags: ParseFlags,
): { parsed: boolean; value?: number } {
  if (!flags.numbers) {
    return { parsed: false };
  }
  if (!isNumberLike(text)) {
    return { parsed: false };
  }

  const n = Number(text);
  return Number.isNaN(n) ? { parsed: false } : { parsed: true, value: n };
}

/**
 * Heuristik: Prüft, ob ein String wahrscheinlich JSON ist.
 * Ziel: unnötige `JSON.parse`-Versuche vermeiden.
 */
function isJsonCandidate(text: string): boolean {
  if (text.length === 0) {
    return false;
  }
  const first = text[0];

  // JSON-Objekt / -Array
  if (first === '{' || first === '[') {
    return true;
  }

  // JSON-Literale
  if (text === 'null' || text === 'true' || text === 'false') {
    return true;
  }

  // JSON-String (in Anführungszeichen)
  if (text.length >= 2 && first === '"' && text.endsWith('"')) {
    return true;
  }

  return false;
}
