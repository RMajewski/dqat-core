import { readFileSync } from 'node:fs';
import { isAbsolute } from 'node:path';
import type { StarfleetDirectiveProvider } from '../../type/starfleetDirective';

/**
 * 📄 JsonFileProvider – lädt eine JSON-Konfigurationsdatei und stellt sie als
 * flache dot-Keys bereit.
 *
 * Verhalten:
 * - Der Konstruktor lädt synchron die JSON-Datei (UTF-8) und parst sie.
 * - Das Root-Element MUSS ein Plain Object sein. Andernfalls wird eine Exception geworfen.
 * - `get(key)` erwartet exakte dot-Keys (z. B. "db.host").
 * - `list(prefix)` liefert exakt `prefix` und alle Keys mit `prefix + separator`.
 * - Funktionswerte werden nie ausgegeben (in JSON praktisch ausgeschlossen; Guard bleibt).
 *
 * Optionen:
 * - name?: string              – Logischer Name (Default: "json")
 * - separator?: string         – Trenner für dot-Keys (Default: ".")
 *
 * @example
 * // config.json:
 * // {
 * //   "db": { "host": "localhost", "port": 3306 },
 * //   "feature": { "enabled": true }
 * // }
 * const provider = new JsonFileProvider('./config.json', { separator: '.', name: 'config' });
 * provider.get('db.host'); // "localhost"
 * provider.list('db');     // { "db.host": "localhost", "db.port": 3306 }
 */
export class JsonFileProvider implements StarfleetDirectiveProvider {
  /** Öffentlicher Name des Providers. */
  public readonly name: string;

  /** Effektiver Trenner für dot-Keys. */
  private readonly separator: string;

  /** Unveränderliche flache Key→Value-Map. */
  private readonly flatMap: Readonly<Record<string, unknown>>;

  constructor(filePath: string, options: JsonFileProviderOptions = {}) {
    validateFilePath(filePath);

    this.name = options.name ?? 'json';
    this.separator = options.separator ?? '.';

    const jsonContent = readFileSync(filePath, { encoding: 'utf-8' });
    const parsedRoot = safeParseJson(jsonContent, filePath);

    if (!isPlainObject(parsedRoot)) {
      throw new Error(
        `JsonFileProvider: Root von "${filePath}" ist kein JSON-Objekt. Erwartet wurde ein Plain Object.`,
      );
    }

    // flattenObject behandelt Arrays als Blatt und ignoriert Funktionen.
    // Wir nutzen parentKey/Separator hier nicht; nachträgliches Filtern erfolgt in list().
    const flattened = flattenObject(parsedRoot, { separator: this.separator });

    // Freeze für Immutability
    this.flatMap = Object.freeze({ ...flattened });
  }

  /**
   * Liefert den Wert für einen exakten dot-Key, oder `undefined`, wenn unbekannt.
   */
  get(key: string): unknown {
    if (!key) {
      return undefined;
    }
    if (Object.hasOwn(this.flatMap, key)) {
      return this.flatMap[key];
    }
    return undefined;
  }

  /**
   * Listet alle Einträge (optional per Präfix gefiltert).
   * Rückgabe ist immutable (Object.freeze).
   */
  list(prefix?: string): Record<string, unknown> {
    if (!prefix) {
      return this.flatMap;
    }

    const output: Record<string, unknown> = {};
    const withSeparator = `${prefix}${this.separator}`;

    for (const [currentKey, currentValue] of Object.entries(this.flatMap)) {
      if (currentKey === prefix || currentKey.startsWith(withSeparator)) {
        output[currentKey] = currentValue;
      }
    }

    return Object.freeze(output);
  }
}

/** Optionen für den JsonFileProvider. */
export type JsonFileProviderOptions = {
  /** Logischer Name, Standard: "json". */
  name?: string;
  /** Key-Trenner, Standard: ".". */
  separator?: string;
};

// ---------- interne, kleine Helfer (niedrige Komplexität) ----------

/** Validiert den übergebenen Pfad grob, ohne „Magie“. */
function validateFilePath(filePath: string): void {
  if (typeof filePath !== 'string' || filePath.trim() === '') {
    throw new Error('JsonFileProvider: filePath ist leer oder kein String.');
  }
  // Kein erzwungenes Absolut-Format – wir erlauben relative Pfade.
  // Der Aufrufer ist verantwortlich für den korrekten Arbeitsordner.
  // Optional: sanfte Prüfung auf offensichtliche Tippfehler.
  const looksLikeJson = filePath.toLowerCase().endsWith('.json');
  if (!looksLikeJson) {
    // bewusst nur Warn-Charakter via Exception-Message
    // (die Datei kann dennoch JSON enthalten, wir sind hier konservativ streng)
    throw new Error(
      `JsonFileProvider: "${filePath}" hat keine ".json"-Endung.`,
    );
  }
  // isAbsolute nur informativ – wir erzwingen nichts.

  isAbsolute(filePath);
}

/**
 * Sicheres JSON-Parsing mit klarer Fehlermeldung inkl. Datei.
 */
function safeParseJson(content: string, filePath: string): unknown {
  try {
    return JSON.parse(content);
  } catch (caughtError: unknown) {
    const originalMessage =
      caughtError instanceof Error ? `: ${caughtError.message}` : '';
    // Node 18+/TS lib.es2022.error → ErrorOptions.cause verfügbar
    throw new SyntaxError(
      `JsonFileProvider: Ungültiges JSON in "${filePath}"${originalMessage}`,
      { cause: caughtError },
    );
  }
}

export type FlatObject = Record<string, unknown>;

type Options = {
  separator?: string;
  parentKey?: string;
};

type Frame = { key: string; value: unknown };

/**
 * Zusammensetzen eines Keys mit Trenner.
 */
function makeKey(
  parentKey: string,
  childKey: string,
  separator: string,
): string {
  return parentKey ? `${parentKey}${separator}${childKey}` : childKey;
}

/**
 * Nur Plain Objects werden expandiert (Arrays zählen als Blatt).
 */
function isExpandable(value: unknown): value is Record<string, unknown> {
  return isPlainObject(value);
}

/**
 * Funktionswerte nie listen.
 */
function isForbiddenValue(value: unknown): boolean {
  return typeof value === 'function';
}

/**
 * Initialen Stack aus den Root-Entries aufbauen.
 */
function createInitialStack(
  entries: Array<[string, unknown]>,
  parentKey: string,
  separator: string,
): Frame[] {
  return entries.map(([currentKey, currentValue]) => ({
    key: parentKey
      ? makeKey(parentKey, String(currentKey), separator)
      : String(currentKey),
    value: currentValue,
  }));
}

/**
 * Kinder eines expandierbaren Knotens pushen oder leeres Objekt als Blatt aufnehmen.
 */
function pushChildrenOrRecordEmpty(
  key: string,
  value: Record<string, unknown>,
  stack: Frame[],
  output: FlatObject,
  separator: string,
): void {
  const innerEntries = Object.entries(value);
  if (innerEntries.length === 0) {
    output[key] = value;
    return;
  }
  for (const [childKey, childValue] of innerEntries) {
    stack.push({
      key: makeKey(key, String(childKey), separator),
      value: childValue,
    });
  }
}

/**
 * Stack verarbeiten (Depth-First), Funktionswerte auslassen.
 */
function processStack(stack: Frame[], separator: string): FlatObject {
  const output: FlatObject = {};

  while (stack.length > 0) {
    const { key, value } = stack.pop() as Frame;

    if (isForbiddenValue(value)) {
      continue;
    }

    if (isExpandable(value)) {
      pushChildrenOrRecordEmpty(key, value, stack, output, separator);
      continue;
    }

    // Blatt (inkl. Arrays, Date, Primitive …)
    output[key] = value;
  }

  return output;
}

/**
 * 🧩 Flacht ein verschachteltes Objekt in eine Key→Value-Map ab.
 * - Key-Trenner standardmäßig ".".
 * - Funktionswerte werden niemals gelistet.
 * - Nicht-Plain-Objects (inkl. Arrays) sind Blätter.
 *
 * @example
 * const input = { a: 1, b: { c: 2 }, fn: () => 42 };
 * flattenObject(input) // → { "a": 1, "b.c": 2 }
 */
export function flattenObject(
  input: unknown,
  options: Options = {},
): FlatObject {
  const separator = options.separator ?? '.';
  const parentKey = options.parentKey ?? '';

  // Nicht-Plain-Object → direkt als Blatt (nur mit parentKey sinnvoll)
  if (!isPlainObject(input)) {
    return parentKey ? { [parentKey]: input } : {};
  }

  const rootEntries = Object.entries(input);

  // Leeres Objekt als Blatt, falls parentKey gesetzt
  if (rootEntries.length === 0) {
    return parentKey ? { [parentKey]: input } : {};
  }

  const stack = createInitialStack(rootEntries, parentKey, separator);
  return processStack(stack, separator);
}

/**
 * 🔎 Prüft, ob ein Wert ein einfaches Objekt (Plain Object) ist.
 *
 * @example
 * isPlainObject({ a: 1 }) // true
 * isPlainObject(new Date()) // false
 *
 * @param value Beliebiger Eingabewert.
 * @returns true, wenn Plain Object; sonst false.
 */
function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== 'object') {
    return false;
  }
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}
