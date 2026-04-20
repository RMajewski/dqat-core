/**
 * Typdefinitionen für das npm-Paket "mockserver-node".
 *
 * Diese Deklaration macht das CommonJS-Modul für TypeScript nutzbar,
 * ohne auf `any` zurückzufallen.
 *
 * Hinweis:
 * Die Doku beschreibt "comma separated list" bei serverPort, aber die
 * Node-API erwartet praktisch immer eine einzelne Portnummer. Wir
 * typisieren deshalb `serverPort` als number. Falls du später Mehrfach-Ports
 * wirklich brauchst, können wir hier `number | number[] | string` draus machen.
 */
declare module 'mockserver-node' {
  /**
   * Optionen für start_mockserver.
   *
   * Diese Optionen steuern Startverhalten, Logging, Upstream-Forwarding
   * und Debugging des MockServer-Prozesses.
   */
  export interface MockServerStartOptions {
    /**
     * Der Port, auf dem der MockServer HTTP/HTTPS/CONNECT/SOCKS entgegennehmen soll.
     * Laut Doku können mehrere Ports angegeben werden (comma-separated),
     * in der Node-Praxis wird in der Regel ein einzelner Port genutzt.
     * Pflichtfeld.
     */
    serverPort: number;

    /**
     * Optional: Port-Forwarding-Modus aktivieren.
     * Wenn gesetzt, werden alle Anfragen an diesen Ziel-Port weitergeleitet,
     * außer sie matchen eine Expectation.
     */
    proxyRemotePort?: number;

    /**
     * Hostname/IP für das Port-Forwarding.
     * Wird nur ausgewertet, wenn proxyRemotePort gesetzt ist.
     * Default laut Doku: "localhost", falls proxyRemotePort gesetzt ist und
     * kein proxyRemoteHost mitgegeben wurde.
     */
    proxyRemoteHost?: string;

    /**
     * Name des Artifact-Repositories.
     * Default laut Doku: "oss.sonatype.org".
     */
    artifactoryHost?: string;

    /**
     * Pfad innerhalb des Artifact-Repositories, der auf die
     * "mockserver-netty" JAR mit Dependencies zeigt.
     * Default laut Doku:
     * "/content/repositories/releases/org/mock-server/mockserver-netty/"
     */
    artifactoryPath?: string;

    /**
     * Version des MockServers, die heruntergeladen / gestartet werden soll.
     * Default laut Doku: "5.15.0".
     * Darf auch SNAPSHOT-Versionen enthalten.
     */
    mockServerVersion?: string;

    /**
     * Schaltet "verbose" Logging an:
     * - schreibt zusätzliche Logs auf die Konsole
     * - setzt das Log-Level auf DEBUG
     * - schreibt Logs in mockserver.log im aktuellen Verzeichnis
     *
     * Hinweis:
     * Laut Doku triggert das auch detailliertere Matcher-Logs.
     */
    verbose?: boolean;

    /**
     * Schaltet "trace" Logging an:
     * - setzt das Log-Level auf TRACE
     * - TRACE enthält zusätzlich zu INFO auch alle Matcher-Details
     *
     * Wichtig:
     * Um Request-Logs später via /retrieve zu bekommen, muss mindestens
     * INFO geloggt werden. Das ist bei trace: true garantiert.
     */
    trace?: boolean;

    /**
     * Aktiviert Remote-Debugging der JVM.
     * Wenn gesetzt, wird die JVM mit einem jdwp-Agent gestartet:
     *   - transport=dt_socket
     *   - server=y
     *   - suspend=y
     *   - address=<javaDebugPort>
     *
     * Laut Doku wartet der Start dann bis zu 50 Sekunden auf den Debugger.
     */
    javaDebugPort?: number;

    /**
     * Zusätzliche JVM-Optionen / System Properties.
     *
     * Beispiel laut Doku:
     * "-Dmockserver.enableCORSForAllResponses=true"
     */
    jvmOptions?: string[];

    /**
     * Anzahl der Startup-Retry-Schleifen, um zu prüfen,
     * ob der MockServer wirklich bereit ist.
     *
     * Default laut Doku:
     * - ohne javaDebugPort: 110 (~11 Sekunden)
     * - mit javaDebugPort: 500
     *
     * Auf langsameren Maschinen kann das angepasst werden.
     */
    startupRetries?: number;
  }

  /**
   * Optionen für stop_mockserver.
   *
   * Es reicht, den Port zu nennen, den wir stoppen wollen.
   */
  export interface MockServerStopOptions {
    /**
     * Der Port des laufenden MockServers, der beendet werden soll.
     */
    serverPort: number;
  }

  /**
   * Startet einen lokalen MockServer-Prozess (Java).
   *
   * Die Funktion resolved, wenn der Server erfolgreich erreichbar ist.
   * Sie rejected, wenn der Prozess nicht stabil gestartet werden konnte
   * (z. B. nach Ablauf von startupRetries).
   */
  export function start_mockserver(
    options: MockServerStartOptions,
  ): Promise<void>;

  /**
   * Stoppt einen laufenden MockServer-Prozess.
   *
   * Die Funktion resolved, wenn der Prozess für den gegebenen Port
   * beendet wurde. Falls kein Prozess auf diesem Port läuft, sollte
   * der Aufruf idempotent sein.
   */
  export function stop_mockserver(
    options: MockServerStopOptions,
  ): Promise<void>;

  /**
   * Das Modul exportiert außerdem ein Default-Objekt mit den beiden
   * Funktionen als Properties. Das macht den Import-Stil
   * `import mockserver from 'mockserver-node'` möglich.
   */
  const _default: {
    start_mockserver: typeof start_mockserver;
    stop_mockserver: typeof stop_mockserver;
  };

  export default _default;
}
