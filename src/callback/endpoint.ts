// src/callback/endpoint.ts

import type { DqatWorld } from '../setup/DqatWorld.ts';
import type { HttpResponseSnapshot } from '../type/httpResponse.ts';

/**
 * Führt einen HTTP-Request aus und speichert das Ergebnis (Statuscode,
 * Header, Body-Text) in `this.lastResponse`.
 *
 * Diese Funktion ist bewusst NICHT an Holodeck gekoppelt.
 * Sie funktioniert für jede erreichbare URL, z. B.:
 * - den vom Holodeck bereitgestellten MockServer,
 * - ein echtes Staging-Backend,
 * - einen lokalen Dev-Server.
 *
 * URL-Auflösung:
 *
 * 1. Wenn `pathOrUrl` bereits mit "http://" oder "https://" beginnt,
 *    wird dieser Wert direkt als vollständige URL verwendet.
 *
 * 2. Andernfalls:
 *    - Es wird versucht, eine Basis-URL über `this.get<string>('basisUrl')`
 *      zu beziehen.
 *      Beispiel: "http://localhost:1080"
 *
 *    - Falls keine Basis-URL konfiguriert ist, wird ein Error geworfen.
 *
 *    - Die endgültige URL ergibt sich dann aus:
 *         <basisUrl><pathOrUrl>
 *
 * Typischer Gherkin-Schritt:
 *
 *   Wenn ich den Endpunkt "/api/status" über GET abrufe
 *
 * oder alternativ mit absoluter Adresse:
 *
 *   Wenn ich den Endpunkt "https://api.example.test/health" über GET abrufe
 *
 * @example
 * Gherkin (Feature-Datei, deutsch):
 *   Wenn ich den Endpunkt "/api/status" über GET abrufe
 *
 * @param this DqatWorld – Gemeinsamer Szenario-Kontext.
 * @param method string – HTTP-Methode wie "GET", "POST", "PATCH", "DELETE".
 * @param pathOrUrl string – Entweder ein relativer Pfad (z. B. "/api/status")
 *                           oder bereits eine vollständige URL
 *                           (z. B. "https://api.example.test/health").
 */
export async function fetchRequestCallback(
  this: DqatWorld,
  pathOrUrl: string,
  method: string,
): Promise<void> {
  // Schritt 1: finale URL bestimmen
  let finalUrl: string;

  const looksAbsolute =
    pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://');

  if (looksAbsolute) {
    finalUrl = pathOrUrl;
  } else {
    const baseUrl = this.get('basisUrl') as string;
    console.debug('baseUrl', { baseUrl });
    if (!baseUrl) {
      throw new Error(
        `Es wurde keine Basis-URL gefunden (Schlüssel "basisUrl"), und der Pfad "${pathOrUrl}" ist nicht absolut.`,
      );
    }
    finalUrl = `${baseUrl}${pathOrUrl}`;
  }

  // Schritt 2: Request senden
  // TODO: Echte Implementierung mit fetch(finalUrl, { method })
  // const response = await fetch(finalUrl, { method });
  // const bodyText = await response.text();
  //
  // const headers: Record<string, string> = {};
  // response.headers.forEach((value, key) => {
  //   headers[key.toLowerCase()] = value;
  // });
  //
  // const snapshot: HttpResponseSnapshot = {
  //   status: response.status,
  //   headers,
  //   bodyText,
  // };
  //
  // this.lastResponse = snapshot;

  // Platzhalter, bis die echte HTTP-Logik integriert wird:
  const snapshot: HttpResponseSnapshot = {
    status: 200,
    headers: {
      'content-type': 'application/json',
      'x-dqat-debug-url': finalUrl,
      'x-dqat-debug-method': method,
    },
    bodyText: '{"ok":true}',
  };

  this.lastResponse = snapshot;
}

/**
 * Prüft, dass der Statuscode der zuletzt gespeicherten HTTP-Antwort
 * (`this.lastResponse`) dem erwarteten Wert entspricht.
 *
 * Wenn der erwartete Status nicht übereinstimmt, wird ein Fehler geworfen,
 * wodurch das Cucumber-Szenario fehlschlägt.
 *
 * Typischer Gherkin-Schritt:
 *
 *   Dann erwarte ich den HTTP-Statuscode 200
 *
 * @example
 * Gherkin (Feature-Datei, deutsch):
 *   Dann erwarte ich den HTTP-Statuscode 200
 *
 * @param this DqatWorld – Gemeinsamer Szenario-Kontext.
 * @param expectedStatus number – Erwarteter HTTP-Statuscode (z. B. 200, 404, 500).
 */
export function expectLastResponseStatusCallback(
  this: DqatWorld,
  expectedStatus: number,
): void {
  if (!this.lastResponse) {
    throw new Error(
      'Es liegt keine letzte Response vor, die geprüft werden kann.',
    );
  }

  if (this.lastResponse.status !== expectedStatus) {
    throw new Error(
      `Unerwarteter Statuscode: erwartet ${expectedStatus}, aber erhalten ${this.lastResponse.status}`,
    );
  }
}
