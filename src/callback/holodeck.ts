import Ajv2020 from 'ajv/dist/2020.js';
import { resolve } from 'node:path';
import { Holodeck } from '../holodeck/holodeck.ts';
import { SceneLoader } from '../holodeck/sceneLoader.ts';
import type { DqatWorld } from '../setup/DqatWorld.ts';
import { readBodyFileContent } from '../util/holodeck/readBodyFile.ts';
import { readSceneDocumentByName } from '../util/holodeck/readScene.ts';
import { shutdownHolodeckWithLogs } from '../util/holodeck/shutdown.ts';

/**
 * Startet das Holodeck im gewünschten Modus (z. B. "embedded" oder "remote").
 *
 * Diese Funktion erzeugt bzw. initialisiert eine Holodeck-Instanz und ruft
 * deren `start()`-Methode auf.
 *
 * Wichtig:
 * - Der zurückgelieferte Wert von `holodeck.start()` (z. B. baseUrl)
 *   wird hier nicht dauerhaft irgendwo gespeichert. Der typische Anwendungsfall
 *   ist, daraus einen Mission-Log-Eintrag für den Report zu erzeugen.
 * - Falls schon ein Holodeck aktiv ist, sollte es idealerweise vorher sauber
 *   gestoppt werden. Diese Schutzlogik kann später ergänzt werden.
 *
 * Typischer Gherkin-Schritt:
 *
 *   Angenommen das Holodeck wurde im Modus "embedded" gestartet
 *
 * @example
 * Gherkin (Feature-Datei, deutsch):
 *   Angenommen das Holodeck wurde im Modus "embedded" gestartet
 *
 * @param this DqatWorld – Gemeinsamer Szenario-Kontext.
 * @param mode "embedded" | "remote" – Steuerung, ob das Holodeck selbst einen
 *             MockServer-Prozess hochfahren soll oder sich nur verbindet.
 */
export async function startHolodeckCallback(
  this: DqatWorld,
  mode: 'embedded' | 'remote',
): Promise<void> {
  if (mode !== 'embedded' && mode !== 'remote') {
    throw new Error(
      `Unbekannter Holodeck-Modus "${mode}". Erlaubt sind nur "embedded" und "remote".`,
    );
  }

  if (this.holodeck) {
    await this.holodeck.stop();
    this.holodeck = undefined;
  }

  const fixturesDir =
    this.get<string>('holodeck.fixturesDir') ??
    resolve(process.cwd(), 'test/acceptance/fixtures/holodeck');

  const sceneLoader = new SceneLoader({
    readSceneDocumentByName: (sceneName) =>
      readSceneDocumentByName(fixturesDir, sceneName),

    readBodyFileContent: (bodyFilePath) =>
      readBodyFileContent(fixturesDir, bodyFilePath),

    nowProvider: () => this.now(),
    ajvInstance: new Ajv2020({
      allErrors: true,
      strict: true,
      allowUnionTypes: true,
      coerceTypes: false,
    }),
  });

  const holodeck = new Holodeck({
    host: 'localhost',
    port: 1080,
    mode,
    forbidProd: true,
    sceneLoader,
  });

  const startResult = await holodeck.start();
  this.holodeck = holodeck;
  this.set('baseUrl', startResult.baseUrl);

  this.log('info', 'holodeck started', {
    mode,
    baseUrl: startResult.baseUrl,
    fixturesDir,
  });
}

/**
 * Lädt eine Szene in das laufende Holodeck.
 *
 * Die Szene beschreibt vorbereitete Routen / Responses, die über den
 * MockServer bereitgestellt werden. Nach dem Laden der Szene sind
 * nachfolgende Requests (z. B. über fetchRequestCallback) deterministisch
 * reproduzierbar.
 *
 * Voraussetzung:
 * - Das Holodeck muss bereits gestartet worden sein.
 *
 * Typischer Gherkin-Schritt:
 *
 *   Wenn die Holodeck-Szene "happy" geladen wird
 *
 * @example
 * Gherkin (Feature-Datei, deutsch):
 *   Wenn die Holodeck-Szene "happy" geladen wird
 *
 * @param this DqatWorld – Gemeinsamer Szenario-Kontext.
 * @param sceneName string – Logischer Szenen-Name, z. B. "happy".
 */
export async function loadSceneCallback(
  this: DqatWorld,
  sceneName: string,
): Promise<void> {
  if (!this.holodeck) {
    throw new Error(
      'Das Holodeck ist nicht gestartet. Starte es vor dem Laden einer Szene.',
    );
  }

  const sceneHandle = await this.holodeck.loadScene(sceneName, {});
  this.set('holodeck.sceneHandle', sceneHandle);
  this.log('info', 'holodeck scene loaded', { sceneName, sceneHandle });
}

/**
 * Stoppt das aktuell laufende Holodeck.
 *
 * Dieser Schritt ist für Aufräum-Prozesse gedacht und soll idempotent sein:
 * - Wenn kein Holodeck aktiv ist, passiert einfach nichts.
 * - Wenn ein Holodeck aktiv ist, wird dessen `stop()` aufgerufen
 *   und anschließend die Referenz entfernt.
 *
 * Typischer Gherkin-Schritt:
 *
 *   Wenn das Holodeck gestoppt wird
 *
 * oder als Validierungsschritt:
 *
 *   Dann ist kein Holodeck mehr aktiv
 *
 * @example
 * Gherkin (Feature-Datei, deutsch):
 *   Wenn das Holodeck gestoppt wird
 *
 * @param this DqatWorld – Gemeinsamer Szenario-Kontext.
 */
export async function stopHolodeckCallback(this: DqatWorld): Promise<void> {
  await shutdownHolodeckWithLogs(this);
}

/**
 * Prüft, dass aktuell kein Holodeck in der World registriert ist.
 *
 * Dieser Callback ist bewusst klein gehalten, damit die fachliche Aussage
 * direkt im Gherkin lesbar bleibt und die eigentliche Prüf-Logik nicht
 * inline in der Step-Definition steht.
 *
 * @example
 * Gherkin (Feature-Datei, deutsch):
 *   Dann ist kein Holodeck mehr aktiv
 *
 * @param this DqatWorld – Gemeinsamer Szenario-Kontext.
 */
export function expectNoActiveHolodeckCallback(this: DqatWorld): void {
  if (this.holodeck) {
    throw new Error(
      'Es ist noch ein Holodeck aktiv, obwohl keines aktiv sein sollte.',
    );
  }
}
