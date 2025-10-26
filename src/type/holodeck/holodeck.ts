/**
 * Definiert die normalisierte Form einer Szene nach erfolgreichem
 * Laden und Rendern durch den SceneLoader.
 *
 * In dieser Phase sind:
 * - alle Templates aufgelöst,
 * - Variablen gemergt,
 * - delayMs-Werte in echte Zahlen konvertiert.
 *
 * Diese Strukturen sind damit direkt geeignet,
 * um z. B. Expectations im MockServer zu registrieren.
 */

import type { HolodeckRequestSpec, HolodeckTimesSpec } from './request.ts';

/**
 * Vollständig gerenderte Antwort-Spezifikation einer Route.
 * Diese Form enthält keine Template-Strings mehr.
 */
export interface LoadedHolodeckResponse {
  /**
   * HTTP-Statuscode (100 – 599).
   */
  statusCode: number;

  /**
   * Header der Antwort.
   */
  headers?: Record<string, string>;

  /**
   * Antwort-Body, bereits mit konkreten Werten.
   */
  body?: unknown;

  /**
   * Künstliche Verzögerung in Millisekunden.
   * Wurde durch den SceneLoader garantiert in einen number umgewandelt.
   */
  delayMs?: number;
}

/**
 * Eine Route nach dem Rendering.
 * Diese Route ist bereit, in den eigentlichen MockServer übersetzt zu werden.
 */
export interface LoadedHolodeckRoute {
  /**
   * ID der Route (identisch zur ID aus dem Szenen-Dokument).
   */
  id: string;

  /**
   * Optionale Priorität für Matching.
   */
  priority?: number;

  /**
   * Vollständig gerenderter Request.
   * Template-Strings in bodyMatcher etc. wurden aufgelöst.
   */
  request: HolodeckRequestSpec;

  /**
   * Vollständig gerenderte Response.
   * Alle Templates ersetzt, delayMs als number.
   */
  response: LoadedHolodeckResponse;

  /**
   * Aufrufbegrenzung für die Route.
   */
  times?: HolodeckTimesSpec;
}

/**
 * Ergebnis des SceneLoaders.
 *
 * Diese Struktur beschreibt eine komplette Szene,
 * nachdem:
 * - JSON-Schema-Validierung durchlaufen wurde,
 * - Parameter (sceneParams) eingearbeitet wurden,
 * - Templates ersetzt wurden.
 *
 * Diese Form wird später an das eigentliche Holodeck (MockServer-Adapter)
 * übergeben, um Expectations zu registrieren.
 */
export interface LoadedHolodeckScene {
  /**
   * Szenen-Name (Slug).
   */
  name: string;

  /**
   * Szenen-Versionsnummer.
   */
  version: number;

  /**
   * Freitext-Beschreibung der Szene.
   */
  description?: string;

  /**
   * Optionale Tags / Metadaten.
   */
  meta?: {
    tags?: string[];
  };

  /**
   * Vollständig gerenderte, einsatzbereite Routen.
   */
  routes: LoadedHolodeckRoute[];
}
