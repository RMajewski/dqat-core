/**
 * Ergebnis des Startvorgangs des Holodecks.
 *
 * Dieses Objekt beschreibt den laufenden Mock-Dienst aus Sicht der Tests.
 * Es wird von Holodeck.start() zurückgegeben, nachdem der zugrunde liegende
 * MockServer entweder gestartet (embedded-Modus) oder erfolgreich erreicht
 * wurde (remote-Modus).
 */
export interface HolodeckStartResult {
  /**
   * Basis-URL, unter der die getestete Anwendung den Mock erreichen soll.
   * Beispiel: "http://localhost:1080"
   */
  baseUrl: string;

  /**
   * Port, auf dem der Mock-HTTP-Endpunkt erreichbar ist.
   * Beispiel: 1080
   */
  port: number;

  /**
   * (Optional) Administrative URL, z. B. Management-/Debug-Endpunkte.
   * Kann im remote-Modus entfallen.
   */
  adminUrl?: string;
}

/**
 * Konfigurationsobjekt für das Holodeck.
 *
 * Dieses Objekt beschreibt, wie das Holodeck betrieben werden soll,
 * inklusive Sicherheitsvorkehrungen und Szenen-Quelle.
 *
 * Wichtiger Aspekt: Holodeck kapselt zwei mögliche Betriebsarten:
 * - embedded: Der MockServer-Prozess wird lokal durch Node gestartet
 *             (z. B. via "mockserver-node").
 * - remote:   Es existiert bereits ein laufender MockServer (z. B. Docker-Container),
 *             mit dem wir uns nur verbinden.
 */
export interface HolodeckConfig {
  /**
   * Hostname oder IP, unter der der MockServer erreichbar sein soll.
   * Beispiel: "localhost"
   */
  host: string;

  /**
   * Port für den HTTP-Endpunkt des MockServers.
   * Beispiel: 1080
   */
  port: number;

  /**
   * (Optional) Separater Admin-/Control-Port, falls vorhanden.
   */
  adminPort?: number;

  /**
   * Sicherheitsflag, um versehentliche Nutzung in produktiven Umgebungen
   * zu verhindern. Falls true und die Umgebung als "produktiv" erkannt wird,
   * darf Holodeck nicht starten.
   */
  forbidProd: boolean;

  /**
   * Liefert Szenen in einer bereits gerenderten, validierten Form.
   * Der SceneLoader kapselt JSON-Schema-Validierung, Template-Auflösung und
   * Variablen-Merge.
   */
  sceneLoader: import('../holodeck/sceneLoaderConfig').SceneLoaderConfig['readSceneDocumentByName'] extends never
    ? never
    : import('../../holodeck/sceneLoader').SceneLoader;

  /**
   * Geplanter Betriebsmodus des Holodecks.
   * - "embedded": Holodeck startet und stoppt den MockServer-Prozess selbst.
   * - "remote":   Holodeck verbindet sich nur mit einem bereits laufenden MockServer,
   *               z. B. in einem Docker-Container.
   */
  mode: 'embedded' | 'remote';
}
