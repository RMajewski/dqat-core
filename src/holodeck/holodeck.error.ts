/**
 * Diese Datei definiert Fehlerobjekte, die vom SceneLoader (und später
 * vom Holodeck selbst) geworfen werden.
 *
 * Motivation:
 * - Der Aufrufer soll programmatisch unterscheiden können, WARUM etwas schief ging.
 * - Die Fehlermeldungen müssen in Berichten und Logs verständlich weitergegeben werden können.
 */

import type {
  HolodeckSceneLoadErrorCode,
  HolodeckSceneLoadErrorInit,
} from '../type/holodeck/holodeck.error.ts';

/**
 * Einheitlicher Fehler-Typ für das Holodeck-Subsystem.
 *
 * Dieser Error wird bei allen validierungs- und ladebezogenen Problemen geworfen
 * und kann in Tests gezielt mit `expect().rejects.toMatchObject(...)` geprüft werden.
 */
export class HolodeckSceneLoadError extends Error {
  /**
   * Fehlercode zur programmgesteuerten Auswertung.
   */
  public readonly code: HolodeckSceneLoadErrorCode;

  /**
   * JSON-Pfad zum fehlerhaften Element (optional).
   */
  public readonly path?: string;

  /**
   * Optionales JSON-Schema-Keyword, das verletzt wurde.
   */
  public readonly keyword?: string;

  /**
   * Ursprünglich empfangener Wert (z. B. für Typfehler).
   */
  public readonly received?: unknown;

  /**
   * Erstellt ein neues Fehlerobjekt.
   *
   * @param init Strukturierte Fehler-Informationen
   */
  constructor(init: HolodeckSceneLoadErrorInit) {
    super(init.message);
    this.name = 'HolodeckSceneLoadError';
    this.code = init.code;
    this.path = init.path;
    this.keyword = init.keyword;
    this.received = init.received;
  }
}
