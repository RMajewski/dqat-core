/**
 * Beschreibt die gemeinsame World-Schnittstelle für Szenarien.
 * Keine Implementierung, nur Typdefinition.
 *
 * Ziel:
 * - Klare, schlanke Zugriffspunkte für Steps
 * - Astrometrics wird später hier eingebunden (Komposition)
 */
export interface ICucumberWorld {
  // Platzhalter für spätere Astrometrics-Integration
  // astrometrics: Astrometrics; // kommt in M1-Implementierung

  /**
   * Kurzform für Zeit (wird später an Astrometrics delegiert).
   * In der Setup-Phase bleibt das ein No-Op-Stub in Hooks.
   */
  now: () => Date;

  /**
   * Kontextzugriff (später delegiert an Astrometrics-Store).
   */
  get: (key: string) => unknown;
  set: (key: string, value: unknown) => void;
}
