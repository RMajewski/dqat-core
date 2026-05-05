/**
 * Enthält die kleineren Bausteine, aus denen eine Holodeck-Szene besteht:
 * - HTTP-Anfrage (HolodeckRequestSpec)
 * - HTTP-Antwort (HolodeckResponseSpec)
 * - Aufrufbegrenzung (HolodeckTimesSpec)
 *
 * Diese Typen werden sowohl
 * - im rohen Szenen-Dokument (HolodeckSceneDocument)
 * als auch
 * - in der gerenderten Szene (LoadedHolodeckScene)
 * wiederverwendet.
 *
 * Alle Namen sind sprechend gewählt, um die Absicht im Testkontext klar
 * darzustellen. Technische Details von MockServer tauchen hier bewusst nicht auf.
 */

/**
 * Unterstützte HTTP-Methoden für Holodeck-Routen.
 * Diese Werte decken alle üblichen Request-Typen ab, die wir im Mock brauchen.
 */
export type HolodeckHttpMethod =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'PATCH'
  | 'DELETE'
  | 'OPTIONS'
  | 'HEAD';

/**
 * Beschreibt, wie eine eingehende HTTP-Anfrage aussehen muss,
 * damit die Route greift.
 *
 * Diese Spezifikation ist deklarativ. Sie spiegelt nicht direkt die
 * konkrete Syntax von mock-server.com wider, sondern ist unsere
 * abstrahierte Sicht.
 */
export interface HolodeckRequestSpec {
  /**
   * HTTP-Methode der Anfrage (z. B. "GET").
   */
  method: HolodeckHttpMethod;

  /**
   * Pfad, auf den die Anfrage passen muss (z. B. "/api/orders").
   * Muss mit "/" beginnen.
   */
  path: string;

  /**
   * Erwartete Query-Parameter.
   * Ein Query-Key kann entweder einen einzelnen Wert oder mehrere Werte haben.
   */
  query?: Record<string, string | string[]>;

  /**
   * Erwartete Request-Header.
   * Keys sind Header-Namen, Values sind erwartete Header-Werte.
   */
  headers?: Record<string, string>;

  /**
   * Erwarteter Body der Anfrage.
   * - Bei `object` wird die Struktur (oder ein Teil davon) erwartet.
   * - Bei `string` kann es sich z. B. um einen Literal-Matcher handeln.
   *
   * v1: exakter/naiver Vergleich.
   * v2: Teil-/Subset-Matching ist geplant.
   */
  bodyMatcher?: Record<string, unknown> | string;
}

/**
 * Beschreibt, welche Antwort der Mock liefern soll,
 * wenn die Route gematcht wurde.
 */
export interface HolodeckResponseSpec {
  /**
   * HTTP-Statuscode der Antwort (100 bis 599).
   */
  statusCode: number;

  /**
   * Antwort-Header, die zurückgegeben werden sollen.
   */
  headers?: Record<string, string>;

  /**
   * Antwort-Body. Muss JSON-serialisierbar sein.
   * Darf Template-Strings wie "{{now}}" enthalten,
   * bevor das Dokument vom SceneLoader gerendert wird.
   */
  body?: unknown;

  /**
   * Dateiverweis für den Antwort-Body.
   *
   * Wenn gesetzt, wird der Inhalt der angegebenen Datei geladen
   * und als `response.body` verwendet.
   *
   * Der Pfad wird relativ zu `holodeck.fixturesDir` aufgelöst.
   * Unterverzeichnisse sind erlaubt (z. B. "html/test1.html").
   *
   * Der geladene Inhalt darf ebenfalls Template-Strings enthalten
   * und wird durch den SceneLoader gerendert.
   *
   * Hinweis:
   * - Es muss entweder `body` oder `bodyFile` gesetzt sein.
   * - Beide gleichzeitig sind nicht erlaubt (Schema-Validierung).
   */
  bodyFile?: string;

  /**
   * Künstliche Verzögerung in Millisekunden.
   *
   * Im rohen Dokument (SceneDocument):
   * - number (z. B. 0, 5000)
   * - oder Template-String wie "{{latencyMs}}"
   *
   * Nach dem Rendering durch den SceneLoader:
   * - immer number.
   */
  delayMs?: number | string;
}

/**
 * Beschreibt, wie oft eine Route ausgeliefert werden darf.
 * - `unlimited: true` bedeutet, dass die Route unbegrenzt oft gültig ist.
 * - `remaining: number` begrenzt die Anzahl der Treffer.
 *
 * Diese Information landet später z. B. in MockServer "times".
 */
export type HolodeckTimesSpec = { unlimited: true } | { remaining: number };
