/**
 * Gemeinsame Optionen für alle Provider.
 *
 * Hinweis:
 * - `separator` ist rein konventionell (Standard: ".") und wird nicht über den Typ erzwungen.
 * - `name` dient der Protokollierung / Diagnose und hat keine funktionale Bedeutung.
 */
export interface IBaseProviderOptions {
  /**
   * Logischer Name des Providers (für Logs / Diagnose).
   * Beispiel: "env", "jsonFile", "memory"
   */
  name?: string;

  /**
   * Trenner für verschachtelte Schlüssel (z. B. "a.b.c").
   * Standard-Konvention: "." (Punkt)
   */
  separator?: string;
}

/**
 * Gesteuerte Parse-Optionen für Env-Werte.
 * - true  => alle gängigen Typen parsen (Zahlen, Booleans, JSON)
 * - false => keine Konvertierung, alles bleibt String
 * - Objekt => gezielte Aktivierung einzelner Konvertierungen
 */
export type IEnvParseOptions =
  | boolean
  | {
      /** Zahlen erkennen (z. B. "42" → 42) */
      numbers?: boolean;
      /** Booleans erkennen ("true" | "false" → true | false) */
      booleans?: boolean;
      /** JSON erkennen (z. B. '{"a":1}' → { a: 1 }) */
      json?: boolean;
    };

/**
 * Optionen speziell für den Env-Provider.
 *
 * WICHTIG (Migration):
 * - Vereinheitlichtes Undefined-Handling über `dropUndefined`.
 *   Falls noch `includeUndefined` im Code existiert, sollte dies in der Factory
 *   auf `dropUndefined` (invertiert) gemappt werden.
 */
export interface IEnvProviderOptions extends IBaseProviderOptions {
  /**
   * Optionales Präfix, das vor dem Lookup aus ENV-Variablen entfernt wird.
   * Beispiel: "DQ_" → "DQ_APP_PORT" wird zu "APP_PORT".
   */
  stripPrefix?: string;

  /**
   * Steuert, ob doppelte Unterstriche ("__") als Trenner interpretiert werden.
   * Beispiel:
   *   "APP__DATABASE__PORT" → "app.database.port"
   *
   * Standard: true
   */
  doubleUnderscoreIsSeparator?: boolean;

  /**
   * Steuert, ob Variablennamen in Kleinschreibung konvertiert werden,
   * bevor sie intern weiterverarbeitet werden.
   * Beispiel:
   *   "APP_PORT" → "app_port"
   *
   * Standard: false
   */
  toLowerCase?: boolean;

  /**
   * Gesteuerte Konvertierung von String-Werten.
   * - true  => Zahlen, Booleans und JSON werden erkannt
   * - false => keine Konvertierung
   * - Objekt => gezielte Aktivierung einzelner Konvertierungen
   */
  parse?: IEnvParseOptions;

  /**
   * Einheitliches Undefined-Handling:
   * - true  => Werte `undefined` werden verworfen (empfohlene Standardeinstellung)
   * - false => `undefined`-Werte bleiben erhalten
   *
   * Hintergrund: Diese Option ersetzt frühere Bezeichner wie `includeUndefined`.
   */
  dropUndefined?: boolean;
}

/**
 * Optionen speziell für den JSON-Datei-Provider.
 * Aktuell gibt es keine zusätzlichen Felder gegenüber dem Basistyp.
 * Diese Schnittstelle existiert bewusst, um zukünftige Felder klar trennen zu können.
 */
export interface IJsonFileProviderOptions extends IBaseProviderOptions {
  // (derzeit keine zusätzlichen Felder)
}

/**
 * Optionen speziell für den In-Memory-Provider.
 */
export interface IMemoryProviderOptions extends IBaseProviderOptions {
  /**
   * Steuert, ob Eingabestrukturen vor der Schlüsselauflösung flachgeklopft werden.
   * - true  => verschachtelte Objekte werden zu Dot-Keys
   * - false => Originalstruktur bleibt erhalten
   */
  flatten?: boolean;

  /**
   * Steuert, ob bei Arrays Indizes in den generierten Schlüsseln enthalten sind.
   * Beispiel bei true: "items.0.name" statt "items.name"
   */
  includeArrayIndices?: boolean;

  /**
   * Einheitliches Undefined-Handling:
   * - true  => `undefined`-Werte werden verworfen (empfohlen)
   * - false => `undefined`-Werte bleiben erhalten
   */
  dropUndefined?: boolean;
}

/**
 * Zusammenfassender Union-Typ aller Provider-Options.
 * Praktisch für Stellen, die „irgendeinen“ Options-Typ akzeptieren,
 * ohne providerspezifische Felder direkt zu benutzen.
 */
export type AnyProviderOptions =
  | IEnvProviderOptions
  | IJsonFileProviderOptions
  | IMemoryProviderOptions;

/**
 * Utility: Markiert nur ausgewählte Keys als required (mit NonNullable),
 * lässt alle anderen Keys unverändert (ggf. optional).
 */
type WithRequired<T, K extends keyof T> = Omit<T, K> & {
  [P in K]-?: NonNullable<T[P]>;
};

/**
 * Normalisierte Rückgabetypen für EnvProviderOptions:
 * - Nur Felder mit Defaults sind required.
 * - Alle übrigen bleiben optional.
 */
export type NormalizedEnvOptions = WithRequired<
  IEnvProviderOptions,
  | 'separator'
  | 'doubleUnderscoreIsSeparator'
  | 'toLowerCase'
  | 'parse'
  | 'dropUndefined'
>;

/**
 * Normalisierte Rückgabetypen für JsonFileProviderOptions:
 * - Nur Felder mit Defaults sind required.
 * - Alle übrigen bleiben optional.
 */
export type NormalizedJsonFileOptions = WithRequired<
  IJsonFileProviderOptions,
  'separator'
>;

/**
 * Normalisierte Rückgabetyp für MemoryOptions:
 * - Nur Felder mit Defaults sind required.
 * - Alle übrigen bleiben optional.
 */
export type NormalizedMemoryOptions = WithRequired<
  IMemoryProviderOptions,
  'separator' | 'flatten' | 'includeArrayIndices' | 'dropUndefined'
>;
