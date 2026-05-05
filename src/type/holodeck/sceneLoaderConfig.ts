/**
 * Definiert die Konfiguration und Hilfstypen für den SceneLoader.
 *
 * Ziel:
 * - Der SceneLoader soll testbar sein, ohne echte Dateien lesen zu müssen.
 * - Der SceneLoader soll deterministisch sein (kontrollierte Zeitquelle).
 * - Wir wollen stark typisierte Fehler statt untypisiertem Throw.
 */

import type { Ajv } from 'ajv';
import type { HolodeckSceneDocument } from './sceneDocument.ts';

/**
 * Konfiguration, die beim Erstellen eines SceneLoader übergeben wird.
 * Diese Abhängigkeiten machen den Loader austauschbar und testbar.
 */
export interface SceneLoaderConfig {
  /**
   * Liefert ein Szenen-Dokument anhand seines Namens.
   *
   * Beispiel Test:
   *   readSceneDocumentByName: async (name) => inMemoryMap[name]
   *
   * Beispiel Produktion:
   *   readSceneDocumentByName: async (name) => JSON.parse(fs.readFileSync(...))
   */
  readSceneDocumentByName: (
    sceneName: string,
  ) => Promise<HolodeckSceneDocument>;

  /**
   * Lädt den Inhalt einer Body-Datei synchron.
   *
   * Der übergebene Pfad stammt aus `response.bodyFile` und wird von der
   * konkreten Implementierung relativ zu `holodeck.fixturesDir` aufgelöst.
   *
   * Die Methode arbeitet bewusst synchron, damit der Cucumber-JS-Lifecycle
   * nicht durch vergessene `await`-Aufrufe oder verzögerte Dateizugriffe
   * instabil werden kann.
   */
  readBodyFileContent: (bodyFilePath: string) => string;

  /**
   * Liefert die aktuelle Zeit als Date-Objekt.
   * Diese Zeitquelle wird für die Templates {{now}} und {{nowEpochMs}} verwendet.
   *
   * In DQAT soll diese Zeitquelle an Astrometrics.now() gekoppelt sein,
   * damit alle Tests die gleiche "Zeit" sehen.
   */
  nowProvider: () => Date;

  /**
   * Vorgefertigte AJV-Instanz (Draft 2020-12).
   * Der SceneLoader kompiliert damit das Holodeck-JSON-Schema.
   *
   * Wir tippen dies bewusst als Ajv, statt any,
   * um klare Erwartung an den Aufrufer zu formulieren.
   */
  ajvInstance: Ajv;
}

/**
 * Interne Map der aufgelösten Variablenwerte nach Merge von:
 * - defaults aus dem Szenen-Dokument
 * - sceneParams vom Test
 *
 * Diese Map wird beim Template-Rendering verwendet.
 */
export type ResolvedVariableMap = Record<string, unknown>;
