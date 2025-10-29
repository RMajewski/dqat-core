/**
 * @file StarfleetDirectives – zentrale Framework-Konfiguration
 *
 * Diese Datei definiert:
 * 1. Standard-Pfadangaben der DQAT-Konfigurationsdateien (Reihenfolge wichtig!)
 * 2. Provider-Defaults, die von den jeweiligen Provider-Konstruktoren genutzt werden.
 *
 * Hinweis:
 * - Diese Datei darf beliebig angepasst werden, z. B. um weitere
 *   Konfigurationsdateien aufzunehmen oder Standards zu ändern.
 * - Die Werte werden **nicht** direkt verändert; Provider rufen intern ihre
 *   normalize-Funktionen auf, um fehlende Felder zu ergänzen.
 */

/**
 * In dieser Reihenfolge werden Konfigurations-Dateien geprüft und geladen.
 * Nur existierende Dateien werden berücksichtigt.
 *
 * Die Reihenfolge entspricht gleichzeitig der Priorität:
 * - Früher geladene Dateien liefern Basiskonfigurationen
 * - Später geladene Dateien überschreiben Werte früherer
 */
export const STARFLEET_DIRECTIVE_CONFIG_FILES = [
  './dqat.config.json',
  './test/dqat.config.json',
  './test/acceptance/dqat.config.json',
] as const;

/**
 * Standard-Trennzeichen für verschachtelte Schlüssel.
 * Beispiel: "database.host" → Trenner "."
 */
export const DEFAULT_SEPARATOR = '.' as const;

/**
 * Steuert, ob doppelte Unterstriche ("__") standardmäßig
 * als Schlüsseltrenner interpretiert werden.
 * Beispiel: "APP__DATABASE__PORT" → "app.database.port"
 */
export const DEFAULT_DOUBLE_UNDERSCORE_IS_SEPARATOR = true as const;

/**
 * Steuert, ob Variablennamen standardmäßig in Kleinschreibung
 * konvertiert werden sollen (z. B. "APP_PORT" → "app_port").
 */
export const DEFAULT_TO_LOWER_CASE = false as const;

/**
 * Steuert, ob `undefined`-Werte standardmäßig entfernt werden.
 * true  → `undefined` wird verworfen
 * false → `undefined` bleibt erhalten
 */
export const DEFAULT_DROP_UNDEFINED = true as const;

/**
 * Steuert, ob verschachtelte Objekte standardmäßig
 * zu flachen Dot-Keys umgewandelt werden.
 */
export const DEFAULT_FLATTEN = true as const;

/**
 * Steuert, ob bei Arrays standardmäßig die Indizes
 * in die generierten Schlüssel aufgenommen werden.
 * Beispiel: "items.0.name" statt "items.name"
 */
export const DEFAULT_INCLUDE_ARRAY_INDICES = true as const;

/**
 * Standard-Flags für das Parsen von ENV-Strings.
 * Diese definieren, welche Typkonvertierungen aktiv sind,
 * wenn `parse: true` angegeben wird.
 *
 * - numbers  → "42" → 42
 * - booleans → "true"/"false" → true/false
 * - json     → "{...}" → Objekt
 */
export const DEFAULT_ENV_PARSE: Readonly<{
  numbers: boolean;
  booleans: boolean;
  json: boolean;
}> = Object.freeze({
  numbers: true,
  booleans: true,
  json: true,
});

/**
 * Type-Shortcut für den Typ der Standard-Parsing-Flags.
 */
export type DefaultEnvParse = typeof DEFAULT_ENV_PARSE;
