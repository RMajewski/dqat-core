/**
 * Definiert die Typen für das rohe Szenen-Dokument, so wie es
 * in JSON/YAML hinterlegt wird, bevor es vom SceneLoader validiert
 * und gerendert wird.
 *
 * Dieses Dokument ist absichtlich deklarativ und engine-agnostisch.
 * Es beschreibt also eine gewünschte Test-Situation,
 * nicht die technische Implementierung im MockServer.
 */

import type {
  HolodeckRequestSpec,
  HolodeckResponseSpec,
  HolodeckTimesSpec,
} from './request.ts';

/**
 * Unterstützte Typen für Variablen im Szenen-Dokument.
 * Diese Variablen können später in Route-Definitionen
 * als Templates (z. B. "{{latencyMs}}") verwendet werden.
 */
export type HolodeckVariableType = 'number' | 'string' | 'boolean' | 'object';

/**
 * Beschreibt eine einzelne Variable innerhalb des Szenen-Dokuments.
 * Diese Variablen dienen zwei Zwecken:
 *
 * 1. Dokumentation / Absichtserklärung:
 *    "Wofür steht diese Variable? Welchen Typ erwarte ich?"
 *
 * 2. Parametrisierung:
 *    Testfälle können beim Laden der Szene eigene Werte
 *    für diese Variablen übergeben (sceneParams).
 */
export interface HolodeckVariableSpec {
  /**
   * Erwarteter Datentyp (number, string, boolean, object).
   * Der SceneLoader prüft diesen Typ strikt.
   */
  type: HolodeckVariableType;

  /**
   * Standardwert, der verwendet wird, falls der Testfall
   * keinen eigenen Wert liefert.
   */
  default?: unknown;

  /**
   * Freitext-Beschreibung für Menschen.
   * Erleichtert Dokumentation und Debugging.
   */
  description?: string;
}

/**
 * Beschreibt eine einzelne Mock-Route innerhalb einer Szene.
 * Eine Szene kann mehrere Routen definieren.
 */
export interface HolodeckRouteSpec {
  /**
   * Eindeutige ID innerhalb der Szene.
   * Wird u. a. in introspect() verwendet.
   */
  id: string;

  /**
   * Optionale Priorität.
   * Höhere Werte bedeuten: diese Route wird bevorzugt gematcht,
   * falls mehrere Routen zugleich passen könnten.
   */
  priority?: number;

  /**
   * Welche eingehende Anfrage soll diese Route matchen?
   */
  request: HolodeckRequestSpec;

  /**
   * Welche Antwort soll zurückgegeben werden?
   */
  response: HolodeckResponseSpec;

  /**
   * Begrenzung der Aufrufhäufigkeit.
   * Entspricht später dem "times"-Konzept von MockServer.
   */
  times?: HolodeckTimesSpec;
}

/**
 * Das rohe Szenen-Dokument.
 *
 * Dieses Objekt repräsentiert die gewünschte Test-Simulation vor
 * jeglicher Verarbeitung.
 *
 * Es kann Templates enthalten (z. B. "{{now}}", "{{latencyMs}}").
 * Es kann Variablen definieren.
 * Es muss mindestens eine Route enthalten.
 */
export interface HolodeckSceneDocument {
  /**
   * Szenen-Name als Slug, z. B. "happy" oder "timeout".
   * Wird als Identifikator aus Tests heraus verwendet.
   */
  name: string;

  /**
   * Interne Versionsnummer dieses Dokuments.
   * Erhöht sich bei Breaking Changes in der Struktur.
   */
  version: number;

  /**
   * Freitext-Beschreibung der Szene für Menschen
   * (z. B. "200 OK für Orders").
   */
  description?: string;

  /**
   * Zusätzliche Metadaten für Filterung, Kategorisierung, Reporting.
   */
  meta?: {
    /** Beliebige Tags, z. B. ["error", "timeout", "critical-flow"]. */
    tags?: string[];
  };

  /**
   * Variablen, die innerhalb der Szene referenziert werden dürfen.
   * Diese Variablen können spätere Templates füllen.
   */
  variables?: Record<string, HolodeckVariableSpec>;

  /**
   * Die in dieser Szene simulierten Routen.
   * Darf nicht leer sein.
   */
  routes: HolodeckRouteSpec[];
}
