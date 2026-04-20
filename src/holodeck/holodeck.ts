import type { LoadedHolodeckScene } from '../type/holodeck/holodeck.ts';
import type {
  HolodeckConfig,
  HolodeckStartResult,
} from '../type/holodeck/holodeckConfig.ts';
import type { HolodeckIntrospection } from '../type/holodeck/introspection.ts';
import type { HolodeckEngineAdapterBase } from './engine/adapterBase.ts';
import { HolodeckEmbeddedEngineAdapter } from './engine/embeddedEngineAdapter.ts';
import { HolodeckRemoteEngineAdapter } from './engine/remoteEngineAdapter.ts';
import type { SceneLoader } from './sceneLoader.ts';

/**
 * Holodeck ist die zentrale Fassade für simulierte externe Dienste.
 *
 * Diese Klasse kapselt:
 * - den Lebenszyklus des MockServers (start / stop)
 * - die Aktivierung von Szenen (loadScene)
 * - das Leeren / Zurücksetzen des MockServers (reset)
 * - Diagnosedaten auslesen (introspect)
 *
 * Holodeck abstrahiert den konkreten Betriebsmodus:
 * - "embedded": Der MockServer-Prozess wird lokal durch Node gestartet
 *               (über mockserver-node).
 * - "remote":   Es wird kein Prozess gestartet; stattdessen verbindet sich
 *               Holodeck mit einem bereits laufenden MockServer, z. B. in Docker,
 *               über mockserver-client.
 *
 * Für Tests bedeutet das:
 * - Der Aufrufer interagiert nur noch mit Holodeck.
 * - Er muss weder wissen, wie der MockServer gestartet wird,
 *   noch wie genau Expectations gesetzt werden.
 */
export class Holodeck {
  /**
   * Hostname oder IP, unter der der MockServer erreichbar ist.
   */
  private readonly host: string;

  /**
   * HTTP-Port des MockServers.
   */
  private readonly port: number;

  /**
   * (Optional) Separater Admin-/Control-Port des MockServers.
   * Wird nur für Diagnosezwecke (z. B. adminUrl) zurückgegeben.
   */
  private readonly adminPort?: number;

  /**
   * Sicherheits-Flag gegen versehentliche Nutzung in Produktivumgebungen.
   * Wenn dieses Flag aktiv ist, darf Holodeck in "Produktionsumgebung"
   * (Definition projektspezifisch) nicht gestartet werden.
   */
  private readonly forbidProd: boolean;

  /**
   * Loader, der Szenen-Dokumente (JSON) liest, validiert, Variablen auflöst
   * und Template-Platzhalter ersetzt. Ergebnis ist eine lauffähige,
   * deterministische Szene vom Typ LoadedHolodeckScene.
   */
  private readonly sceneLoader: SceneLoader;

  /**
   * Technischer Adapter für die Kommunikation mit dem MockServer.
   * Die konkrete Implementierung hängt vom Modus ab:
   * - HolodeckEmbeddedEngineAdapter (lokaler Prozess)
   * - HolodeckRemoteEngineAdapter   (bereits laufender Dienst)
   *
   * Der Adapter kapselt:
   * - start() / stop()
   * - registerScene()
   * - reset()
   * - introspect()
   */
  private readonly adapter: HolodeckEngineAdapterBase;

  /**
   * Interner Zustand, ob start() erfolgreich ausgeführt wurde.
   * loadScene(), reset() und introspect() dürfen nur nach start() genutzt werden.
   */
  private hasStarted: boolean = false;

  /**
   * Erstellt eine neue Holodeck-Instanz.
   *
   * @param config Konfiguration für Host, Port, Sicherheitsverhalten und Modus.
   *               Die SceneLoader-Instanz wird hier injiziert.
   */
  constructor(config: HolodeckConfig) {
    this.host = config.host;
    this.port = config.port;
    this.adminPort = config.adminPort;
    this.forbidProd = config.forbidProd;
    this.sceneLoader = config.sceneLoader;

    this.adapter =
      config.mode === 'embedded'
        ? new HolodeckEmbeddedEngineAdapter(config.host, config.port)
        : new HolodeckRemoteEngineAdapter(config.host, config.port);
  }

  /**
   * Startet oder initialisiert den zugrunde liegenden MockServer-Prozess
   * über den konfigurierten Adapter.
   *
   * - embedded: MockServer wird via mockserver-node lokal hochgefahren.
   *             Der Adapter erzwingt dabei ein hohes Loglevel (trace: true),
   *             damit Anfragen später über /retrieve bzw. introspect
   *             nachvollzogen werden können.
   *
   * - remote:   Es wird kein Prozess gestartet. Holodeck prüft nur,
   *             dass die Verbindung über den Client möglich ist.
   *
   * @returns HolodeckStartResult
   *          Enthält insbesondere die baseUrl, unter der der MockServer
   *          von der Anwendung / vom Test angesprochen werden soll.
   */
  public async start(): Promise<HolodeckStartResult> {
    // TODO: forbidProd-Check einbauen (z. B. NODE_ENV === 'production' verbieten)
    this.forbidProd;
    await this.adapter.start();
    this.hasStarted = true;

    return {
      baseUrl: `http://${this.host}:${this.port}`,
      port: this.port,
      adminUrl: this.adminPort
        ? `http://${this.host}:${this.adminPort}`
        : undefined,
    };
  }

  /**
   * Stoppt oder trennt den MockServer über den Adapter.
   *
   * - embedded: Der lokal gestartete Prozess wird heruntergefahren.
   * - remote:   Kein echter Shutdown, nur logisches Freigeben.
   *
   * Der Aufruf ist idempotent: Wurde start() nie aufgerufen oder wurde
   * bereits gestoppt, passiert einfach nichts.
   */
  public async stop(): Promise<void> {
    if (!this.hasStarted) {
      return;
    }

    await this.adapter.stop();
    this.hasStarted = false;
  }

  /**
   * Lädt eine Szene anhand des Szenen-Namens und optionaler Parameter,
   * registriert die daraus resultierenden Expectations beim MockServer
   * (über den Adapter) und gibt einen technischen Handle zurück.
   *
   * Der Handle kann z. B. im Test-Log oder im Reporter verwendet werden,
   * um später nachvollziehen zu können, welche Szene aktiv war.
   *
   * @param sceneName Name der Szene, z. B. "happy" oder "serverError"
   * @param sceneParams Parameter-Werte für Variablen in der Szene
   * @returns Ein Szenen-Handle, z. B. "serverError#1730123456789"
   */
  public async loadScene(
    sceneName: string,
    sceneParams: Record<string, unknown>,
  ): Promise<string> {
    if (!this.hasStarted) {
      throw new Error(
        'Holodeck has not been started. Call start() before loadScene().',
      );
    }

    // 1. Szene deterministisch rendern (Templates, Variablen usw.)
    const loadedScene: LoadedHolodeckScene = await this.sceneLoader.loadScene(
      sceneName,
      sceneParams,
    );

    // 2. Szene beim MockServer registrieren
    await this.adapter.registerScene(loadedScene);

    // 3. Handle für Diagnose / Nachvollziehbarkeit zurückgeben
    return `${loadedScene.name}#${Date.now()}`;
  }

  /**
   * Entfernt alle gesetzten Expectations und aufgezeichneten Requests,
   * ohne den MockServer selbst zu stoppen.
   *
   * Das ist für die Reinigung zwischen zwei Testfällen gedacht,
   * ohne dass start() erneut nötig ist.
   */
  public async reset(): Promise<void> {
    if (!this.hasStarted) {
      return;
    }

    await this.adapter.reset();
  }

  /**
   * Liefert Diagnose-Informationen über den aktuellen Zustand des MockServers.
   *
   * Dazu gehören u. a. die registrierten Routen sowie Metriken wie Trefferzahlen.
   * Das Ergebnis folgt dem neutralen Typ HolodeckIntrospection, damit Testcode
   * und Reporter keine mockserver-spezifischen Strukturen kennen müssen.
   */
  public async introspect(): Promise<HolodeckIntrospection> {
    if (!this.hasStarted) {
      return { routes: [], totalRequests: 0 };
    }

    return this.adapter.introspect();
  }

  /**
   * Liefert die aktuell vom MockServer aufgezeichneten Log-Nachrichten.
   *
   * Die zurückgegebenen Logs enthalten interne Debug-Informationen des
   * MockServers, wie z. B. Matching-Entscheidungen, eingehende Requests
   * sowie generierte Responses – abhängig vom konfigurierten Log-Level.
   *
   * Die Methode greift ausschließlich lesend auf die Logs zu und verändert
   * den Zustand des MockServers nicht. Insbesondere werden die Logs nicht
   * automatisch geleert.
   *
   * Typischer Anwendungsfall ist das Schreiben der Logs in eine Report-Datei
   * (z. B. pro Szenario), um die Konsolenausgabe sauber zu halten und dennoch
   * vollständige Debug-Informationen verfügbar zu haben.
   */
  public async retrieveLogMessages(): Promise<string[]> {
    return this.adapter.retrieveLogMessages();
  }
}
