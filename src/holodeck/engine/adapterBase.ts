import { mockServerClient } from 'mockserver-client';
import type { MockServerClient } from 'mockserver-client/mockServerClient';
import type { LoadedHolodeckScene } from '../../type/holodeck/holodeck.ts';
import type { HolodeckIntrospection } from '../../type/holodeck/introspection.ts';
import { mapHolodeckResponseToMockServerResponse } from './mapper/response.mapper.ts';
import { mapHolodeckTimesToMockServerTimes } from './mapper/times.mapper.ts';

/**
 * Basisklasse für einen Holodeck-Engine-Adapter.
 *
 * Diese Klasse kapselt die Interaktion mit dem laufenden MockServer über
 * den mockserver-client:
 *
 * - Szenen registrieren (registerScene)
 * - Reset durchführen (reset)
 * - Introspektion / Diagnose abrufen (introspect)
 *
 * Die Lebenszyklus-Steuerung des MockServers (start/stop) ist absichtlich
 * abstrakt gelassen, weil sie im embedded-Modus und im remote-Modus
 * unterschiedlich ist.
 *
 * - embedded:   MockServer wird durch Node-Prozess hochgefahren
 * - remote:     MockServer läuft bereits (z. B. Docker-Container)
 */
export abstract class HolodeckEngineAdapterBase {
  /**
   * Hostname oder IP des MockServers.
   */
  protected readonly host: string;

  /**
   * Port des MockServers (HTTP-Schnittstelle).
   */
  protected readonly port: number;

  /**
   * Client für die Kommunikation mit dem MockServer.
   * Dieser Client wird sowohl im embedded- als auch im remote-Modus benötigt.
   */
  protected readonly client: MockServerClient;

  constructor(host: string, port: number) {
    this.host = host;
    this.port = port;
    this.client = mockServerClient(host, port);
  }

  /**
   * Startet oder initialisiert den MockServer.
   * Im embedded-Modus wird der Prozess hochgefahren.
   * Im remote-Modus ist dies ein No-op.
   */
  public abstract start(): Promise<void>;

  /**
   * Stoppt den MockServer oder trennt die Verbindung.
   * Im embedded-Modus wird der Prozess gestoppt.
   * Im remote-Modus ist dies ein No-op.
   */
  public abstract stop(): Promise<void>;

  /**
   * Registriert alle Routen einer gerenderten Szene (LoadedHolodeckScene)
   * beim MockServer in Form von Expectations.
   *
   * Jede Route der Szene wird in eine MockServer-Expectation übersetzt.
   * Dabei werden:
   * - erwartete Requests (Methode, Pfad, Header, Body)
   * - Antworten (Statuscode, Body, Header, Delay)
   * - optionales Times-Verhalten (unlimited / remaining)
   * gesetzt.
   */
  public async registerScene(scene: LoadedHolodeckScene): Promise<void> {
    for (const route of scene.routes) {
      await this.client.mockAnyResponse({
        httpRequest: {
          method: route.request.method,
          path: route.request.path,
          headers: route.request.headers,
          queryStringParameters: route.request.query,
          body: route.request.bodyMatcher,
        },
        httpResponse: mapHolodeckResponseToMockServerResponse(route.response),
        times: mapHolodeckTimesToMockServerTimes(route.times),
      });
    }
  }

  /**
   * Löscht alle gesetzten Expectations und ggf. aufgezeichneten Requests
   * auf dem MockServer.
   *
   * Dies entspricht einem "Soft Reset" zwischen zwei Testfällen.
   */
  public async reset(): Promise<void> {
    await this.client.reset();
  }

  /**
   * Liefert Diagnose-Informationen über die aktuellen Routen und Requests.
   *
   * Ziel ist eine Engine-neutrale Darstellung (HolodeckIntrospection),
   * damit Tests und Reporter nicht vom nativen mockserver-client-Format
   * abhängig sind.
   */
  public async introspect(): Promise<HolodeckIntrospection> {
    // Diese Methode wird später noch angereichert:
    // - aktive Expectations lesen
    // - Request-Historie lesen
    // - Trefferzahlen korrelieren
    //
    // Hier erstmal ein sinnvoller Platzhalter, damit die Form klar ist.

    const activeExpectations = await this.client.retrieveActiveExpectations({});

    // Wir machen hier eine konservative Normalisierung.
    // (Spätere Iteration könnte `hits` und `lastRequest` aus Log-Abfragen holen.)
    const routes = activeExpectations.map((exp: any) => {
      const req = exp.httpRequest ?? {};
      return {
        id: req.path ?? '(unknown)',
        hits: 0,
        lastRequest: undefined,
      };
    });

    return {
      routes,
      totalRequests: routes.length,
    };
  }
}
