// src/util/provider/parsing.ts

import {
  tryParseBoolean,
  tryParseJson,
  tryParseNumber,
} from './parsing.helper';
import { DEFAULT_ENV_PARSE } from './providerDefaults';

/**
 * Flags zur Steuerung der String-Konvertierung.
 */
export type ParseFlags = Readonly<{
  numbers: boolean;
  booleans: boolean;
  json: boolean;
}>;

/**
 * Union-Typ für `parse`-Einstellungen:
 * - `true`  → alle Flags gemäß Defaults aktiv
 * - `false` → keine Konvertierung
 * - `object` → gezielte Aktivierung einzelner Flags
 */
export type EnvParseOptions = boolean | Partial<ParseFlags> | undefined;

/**
 * Normalisiert die `parse`-Option auf ein konsistentes Flag-Objekt.
 * Dadurch entfällt Logik-Duplikation in den Providern.
 */
export function normalizeParse(
  input: EnvParseOptions,
  defaults: ParseFlags = DEFAULT_ENV_PARSE,
): ParseFlags {
  if (input === true) {
    return { ...defaults };
  }
  if (input === false || input === undefined) {
    return { numbers: false, booleans: false, json: false };
  }
  return {
    numbers: input.numbers ?? defaults.numbers,
    booleans: input.booleans ?? defaults.booleans,
    json: input.json ?? defaults.json,
  };
}

/**
 * Konvertiert einen String gemäß den aktiven Flags in den passenden Typ.
 *
 * Reihenfolge der Konvertierung:
 * 1. JSON (z. B. `"{\"a\":1}"` → `{ a:1 }`)
 * 2. Boolean (`"true"` → `true`)
 * 3. Number (`"42"` → `42`)
 *
 * Wird keine passende Konvertierung gefunden, bleibt der Wert ein String.
 * Die Funktion ist als schlanker Orchestrator implementiert (niedrige kognitive Last).
 */
export function coerceString(value: string, flags: ParseFlags): unknown {
  const text = value.trim();

  const json = tryParseJson(text, flags);
  if (json.parsed) {
    return json.value;
  }

  const bool = tryParseBoolean(text, flags);
  if (bool.parsed) {
    return bool.value;
  }

  const num = tryParseNumber(text, flags);
  if (num.parsed) {
    return num.value;
  }

  return value;
}
