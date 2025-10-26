/**
 * Beschreibt den diagnostischen Zustand des MockServers zu einem Zeitpunkt.
 *
 * Diese Struktur wird von Holodeck.introspect() sowie von den
 * Engine-Adaptern zurückgegeben. Sie dient dazu, Berichte und
 * Debug-Ausgaben testbar und stabil auszuwerten, ohne dass der
 * Testcode direkt vom MockServer-Client-Format abhängt.
 */
export interface HolodeckIntrospection {
  /**
   * Erwartete bzw. registrierte Routen und ihre Laufzeitinformationen.
   */
  routes: Array<{
    /**
     * Szenen- bzw. Routen-Identifikator, typischerweise die Route.id
     * aus der LoadedHolodeckScene.
     */
    id: string;

    /**
     * Wie oft diese Route bisher gematcht wurde.
     * Diese Information kann vom MockServer stammen oder durch Holodeck
     * intern gezählt werden (Adapter-spezifisch).
     */
    hits: number;

    /**
     * Letzte beobachtete Request-Informationen zu dieser Route.
     * Kann fehlen, wenn die Route noch nie aufgerufen wurde.
     */
    lastRequest?: {
      /** HTTP-Methode der letzten Anfrage, z. B. "GET". */
      method: string;
      /** Pfad der letzten Anfrage. */
      path: string;
      /** Zeitpunkt der letzten Anfrage als ISO-String. */
      at: string;
    };
  }>;

  /**
   * Gesamtanzahl aller Requests, die seit dem letzten Reset beim MockServer
   * eingegangen sind.
   */
  totalRequests: number;
}
