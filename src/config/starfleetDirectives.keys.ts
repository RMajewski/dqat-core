/**
 * @file starfleetDirectiveKey.ts
 * @description Zentrale Schlüsseldefinitionen für interne Framework-Directives.
 *
 * Diese Datei stellt Konstanten für alle im Framework verwendeten Konfigurations-
 * und Provider-Keys bereit. Durch die Verwendung dieser Konstanten anstelle
 * von String-Literalen werden Tippfehler vermieden und Umbenennungen vereinfacht.
 */

import type { IEnvProviderOptions } from '../type/provider/providerOptions.ts';

/**
 * Sammlung aller derzeit definierten Starfleet-Directive-Schlüssel.
 *
 * Jeder Eintrag repräsentiert einen logischen Konfigurations- oder
 * Framework-Parameter, der innerhalb von JSON-, ENV- oder Memory-Providern
 * vorkommen kann.
 *
 * Diese Konstanten sollten in allen Komponenten verwendet werden,
 * anstatt die Schlüssel als String-Literals zu wiederholen.
 */
export const StarfleetDirectiveKey = {
  /**
   * Schlüsselname für die ENV-Provider-Optionen innerhalb einer
   * JSON-Konfigurationsdatei.
   *
   * Wird im Loader genutzt, um aus der ersten gefundenen
   * DQAT-Konfiguration (z. B. `./test/acceptance/dqat.config.json`)
   * die gewünschten Optionen für den EnvProvider zu extrahieren.
   *
   * Beispiel (in JSON-Datei):
   * ```json
   * {
   *   "envProviderOptions": {
   *     "stripPrefix": "DQ_",
   *     "toLowerCase": true
   *   }
   * }
   * ```
   */
  envProviderOptions: 'envProviderOptions',

  /**
   * Reservierter Schlüssel für zukünftige Framework-weite
   * Einstellungen, z. B. Logging- oder Versionierungsparameter.
   *
   * Dieser Schlüssel wird aktuell nicht aktiv genutzt,
   * dient aber als Vorlage für künftige Erweiterungen.
   *
   * Beispiel:
   * ```json
   * {
   *   "framework.settings": {
   *     "logLevel": "debug"
   *   }
   * }
   * ```
   */
  frameworkSettings: 'framework.settings',
} as const;

/**
 * Union-Typ aller bekannten Starfleet-Directive-Schlüssel.
 *
 * Dieser Typ kann für generische Methoden verwendet werden,
 * um Parameter wie `key: TStarfleetDirectiveKey`
 * typsicher zu beschränken.
 */
export type TStarfleetDirectiveKey = keyof IStarfleetDirectiveSchema;

/**
 * @interface IStarfleetDirectiveSchema
 * @description
 * Definiert die erwarteten Rückgabe-Typen für alle aktuell bekannten
 * Starfleet-Directive-Schlüssel, die in {@link StarfleetDirectiveKey}
 * definiert sind.
 *
 * Dieses Interface stellt sicher, dass Aufrufe wie
 * `world.getDirective(StarfleetDirectiveKey.envProviderOptions)`
 * stets den richtigen Typ liefern und Tippfehler in Schlüssel-Namen
 * frühzeitig erkannt werden.
 */
export interface IStarfleetDirectiveSchema {
  /**
   * Optionen für den Env-Provider, die aus einer JSON-Konfigurationsdatei
   * gelesen werden können.
   *
   * Typischerweise definiert in `dqat.config.json` oder einer der
   * Test-spezifischen Varianten (z. B. `./test/acceptance/dqat.config.json`).
   *
   * Beispiel:
   * ```json
   * {
   *   "envProviderOptions": {
   *     "stripPrefix": "DQ_",
   *     "toLowerCase": true
   *   }
   * }
   * ```
   */
  [StarfleetDirectiveKey.envProviderOptions]: IEnvProviderOptions;

  /**
   * Platzhalter für Framework-weite Einstellungen oder Metadaten,
   * die künftig für Logging-, Diagnose- oder Versionszwecke genutzt
   * werden können.
   *
   * Aktuell reserviert und noch nicht aktiv verwendet.
   */
  [StarfleetDirectiveKey.frameworkSettings]: Record<string, unknown>;
}
