/**
 * Repräsentiert den gespeicherten Stand einer HTTP-Antwort,
 * damit spätere Prüf-Schritte (Assertions) darauf zugreifen können.
 *
 * Dieses Objekt wird z. B. von fetchRequestCallback gesetzt und
 * von expectLastResponseStatusCallback ausgewertet.
 *
 * bodyText ist bewusst ein String, um Binär-/JSON-/Plaintext-Antworten
 * zunächst unverändert zu puffern. Eine Interpretation (z. B. JSON.parse)
 * findet erst in spezialisierten Auswertefunktionen statt.
 */
export interface HttpResponseSnapshot {
  /**
   * HTTP-Statuscode der Antwort (z. B. 200, 404, 500).
   */
  status: number;

  /**
   * Response-Header in normalisierter Form.
   * Schlüssel werden in Kleinbuchstaben erwartet.
   */
  headers: Record<string, string>;

  /**
   * Antwort-Body als Rohtext.
   */
  bodyText: string;
}
