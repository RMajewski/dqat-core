import type { Astrometrics } from '../astrometrics/astrometrics.ts';

/**
 * Beschreibt die gemeinsame World-Schnittstelle für Szenarien.
 * Keine Implementierung, nur Typdefinition.
 *
 * Ziel:
 * - Klare, schlanke Zugriffspunkte für Steps
 * - Astrometrics wird später hier eingebunden (Komposition)
 */
export interface ICucumberWorld {
  /**
   * Instanz der Astrometrics-World-Zeit.
   *
   * Zweck:
   * - Liefert eine deterministische Referenzzeit für Assertions.
   * - Ermöglicht kontrolliertes Vorwärtsbewegen der Zeit (z. B. in „frozen“/„monotonic“).
   * - Bleibt unabhängig von der Systemzeit des SUT (kein Seiteneffekt auf das Produktivsystem).
   */
  astrometrics?: Astrometrics;

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
