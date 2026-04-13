import type { DqatWorld } from '../setup/DqatWorld.ts';

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
  // TODO:
  // - Holodeck-Instanz anhand der Konfiguration erstellen
  //   (host, port, forbidProd, sceneLoader, mode).
  // - this.holodeck = new Holodeck(config);
  //
  // - Holodeck starten:
  //   const startResult = await this.holodeck.start();
  //
  // - Optional: Mission-Log-Eintrag schreiben mit startResult.baseUrl usw.
  //
  // Noch keine konkrete Implementierung hier, damit wir später sauber
  // injizieren können (SceneLoader etc.).
  if (mode !== 'embedded' && mode !== 'remote') {
    throw new Error(
      `Unbekannter Holodeck-Modus "${mode}". Erlaubt sind nur "embedded" und "remote".`,
    );
  }

  /*
  const holodeck = new Holodeck({
    host: 'localhost',
    port: 1080,
    mode,
    forbidProd: true,
    sceneLoader:
  });

  const startResult = await holodeck.start();
  this.holodeck = holodeck;

  if (mode === 'embedded') {
    this.set('baseUrl', startResult.baseUrl);
  }
  */
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
  // TODO:
  // - Safety-Check: if (!this.holodeck) throw new Error("Holodeck ist nicht gestartet.");
  // - await this.holodeck.loadScene(sceneName, {});
  //
  // Kein persistenter Scene-Handle in der World nötig, solange du ihn
  // nicht für spätere Auswertung brauchst.
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
  if (!this.holodeck) {
    return;
  }

  await this.holodeck.stop();
  this.holodeck = undefined;
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
