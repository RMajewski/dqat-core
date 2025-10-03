/**
 * Optionen für den EnvProvider.
 */
export type EnvProviderOptions = {
  /**
   * Name des Providers (nur informativ; Default: "env")
   */
  name?: string;

  /**
   * Entfernt dieses führende Präfix aus den Keys (z. B. "DQ_").
   */
  stripPrefix?: string;

  /**
   * Trenner für dot-Keys (Default: ".").
   */
  separator?: string;

  /**
   * Wandelt "__" in den `separator` um (Default: true).
   */
  doubleUnderscoreIsSeparator?: boolean;

  /**
   * Normalisiert Keys auf Kleinbuchstaben (Default: true).
   */
  toLowerCase?: boolean;

  /**
   * Behalte `undefined`-Werte im Mapping (Default: false → droppen).
   */
  includeUndefined?: boolean;

  /**
   * Parsing-Konfiguration:
   * - false: keine Konvertierung (Strings bleiben Strings)
   * - true: numbers + booleans + json aktiv
   * - Objekt: feingranulare Flags
   */
  parse?: boolean | { numbers?: boolean; booleans?: boolean; json?: boolean };
};
