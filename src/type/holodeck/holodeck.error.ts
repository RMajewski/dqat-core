/**
 * Definiert die Fehlerstruktur, die innerhalb des Holodeck-Subsystems verwendet wird.
 *
 * Diese Fehler treten typischerweise im Zusammenhang mit Szenen-Verarbeitung auf,
 * also während des Ladens, Validierens oder Renderns von Holodeck-Szenen.
 *
 * Alle Fehler sind klar typisiert, sodass sie sowohl in Unit-Tests als auch
 * im Produktivcode programmatisch ausgewertet werden können.
 *
 * Beispiel:
 * ```ts
 * try {
 *   await sceneLoader.loadScene('badTemplate', {});
 * } catch (error) {
 *   if (error instanceof HolodeckSceneLoadError) {
 *     console.error(error.code, error.path, error.message);
 *   }
 * }
 * ```
 */

/**
 * Eindeutige Fehlercodes für Fehler, die während des Ladens einer Szene auftreten können.
 *
 * Jeder Code steht für eine klar definierte Kategorie:
 * - `UNKNOWN_SCENE` – Die angeforderte Szene wurde nicht gefunden.
 * - `SCHEMA_VIOLATION` – Das Szenen-Dokument verletzt das JSON-Schema oder enthält ungültige Templates.
 * - `INVALID_PARAMS` – Übergebene sceneParams stimmen typmäßig nicht mit `variables` überein.
 * - `ENGINE_ERROR` – Ein technischer Fehler aus der zugrunde liegenden Engine (z. B. MockServer) wurde weitergereicht.
 */
export enum HolodeckSceneLoadErrorCode {
  /**
   * Die angeforderte Szene wurde nicht gefunden.
   */
  UNKNOWN_SCENE = 'unknownScene',

  /**
   * Die Szene verletzt das JSON-Schema oder enthält fehlerhafte Templates.
   */
  SCHEMA_VIOLATION = 'schemaViolation',

  /**
   * Übergebene Parameter sind ungültig (Typfehler oder nicht definierte Variable).
   */
  INVALID_PARAMS = 'invalidParams',

  /**
   * Fehler aus der Mock-Engine oder einer anderen technischen Quelle.
   */
  ENGINE_ERROR = 'engineError',

  /**
   * Fehler beim Zugriff auf das Dateisystem, z. B. beim Laden von `bodyFile`.
   *
   * Dieser Fehler tritt auf, wenn die Szene zwar gültig ist, aber externe Ressourcen
   * nicht geladen werden können. Typische Ursachen sind:
   *
   * - Die angegebene Datei existiert nicht.
   * - Der Pfad liegt außerhalb des erlaubten `holodeck.fixturesDir`.
   * - Die Datei kann nicht gelesen werden (z. B. fehlende Berechtigungen).
   * - Der angegebene Pfad ist ungültig oder nicht auflösbar.
   */
  FILESYSTEM_ERROR = 'filesystemError',
}

/**
 * Struktur des Initialisierungsobjekts für einen Holodeck-Fehler.
 *
 * Diese Struktur dient dazu, einen konsistenten Fehlerzustand aufzubauen,
 * ohne auf unstrukturierte Error-Objekte angewiesen zu sein.
 */
export interface HolodeckSceneLoadErrorInit {
  /**
   * Fehlercode (aus HolodeckSceneLoadErrorCode).
   */
  code: HolodeckSceneLoadErrorCode;

  /**
   * Menschlich lesbare Fehlermeldung.
   */
  message: string;

  /**
   * JSON-Pfad, an dem der Fehler auftrat (z. B. `"routes[0].response.delayMs"`).
   * Erlaubt präzises Reporting, Logging und Test-Assertions.
   */
  path?: string;

  /**
   * Optionales JSON-Schema-Keyword, das verletzt wurde
   * (z. B. `"type"`, `"minimum"`, `"enum"`).
   */
  keyword?: string;

  /**
   * Der tatsächlich empfangene Wert (kann für Debugging verwendet werden).
   */
  received?: unknown;
}
