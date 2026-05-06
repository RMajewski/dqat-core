import type { IWorld } from '@cucumber/cucumber';
import type { Astrometrics } from '../astrometrics/astrometrics.ts';
import type {
  IStarfleetDirectiveSchema,
  TStarfleetDirectiveKey,
} from '../config/starfleetDirectives.keys.ts';
import type { Holodeck } from '../holodeck/holodeck.ts';
import type { HttpResponseSnapshot } from './httpResponse.ts';
import type { StarfleetDirectives } from './starfleetDirective.ts';

/**
 * Beschreibt die gemeinsame World-Schnittstelle für Szenarien.
 * Keine Implementierung, nur Typdefinition.
 *
 * Ziel:
 * - Klare, schlanke Zugriffspunkte für Steps
 * - Astrometrics wird später hier eingebunden (Komposition)
 * - eine fertig aufgebaute StarfleetDirectives-Instanz für Lookups bereit,
 * - Hilfs-Methoden zum typsicheren Lesen/Prüfen/Listen von Directives,
 * - sowie eine Möglichkeit, szenario-lokale Overrides (höchste Priorität)
 *   über den Memory-Provider zu setzen.
 */
export interface ICucumberWorld extends IWorld {
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
   * Laufende Holodeck-Instanz, falls gestartet.
   * Wird von `startHolodeckCallback` gesetzt und von `stopHolodeckCallback` wieder entfernt.
   */
  holodeck?: Holodeck;

  /**
   * Das zuletzt erfasste HTTP-Antwort-Snapshot-Objekt.
   * Wird typischerweise von fetchRequestCallback gesetzt
   * und dann von Assertions (z. B. expectLastResponseStatusCallback)
   * ausgewertet.
   */
  lastResponse?: HttpResponseSnapshot;

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

  /**
   * Liefert die schreibgeschützte StarfleetDirectives-Instanz für das Szenario.
   * @returns IStarfleetDirectives
   */
  getStarfleetDirectives(): StarfleetDirectives;

  /**
   * Typsicherer Zugriff auf Directives über vordefinierte Schlüssel.
   * @param key Schlüsselliteral aus den bekannten Starfleet-Directive-Keys
   * @returns Wert in passendem Typ oder `undefined`, falls unbekannt
   */
  getDirective<K extends TStarfleetDirectiveKey>(
    key: K,
  ): IStarfleetDirectiveSchema[K] | undefined;

  /**
   * Prüft, ob ein Directive-Key verfügbar ist (einschließlich Memory-Overrides).
   * @param key Schlüsselliteral
   * @returns true, wenn Wert existiert
   */
  hasDirective(key: TStarfleetDirectiveKey): boolean;

  /**
   * Listet alle bekannten Directives als flache Map. Optional per Präfix filtern.
   * Rückgabe ist immutable (Deep-Freeze in der Factory).
   * @param prefix Optionaler Präfix (z. B. "frontend.")
   */
  listDirectives(prefix?: string): Readonly<Record<string, unknown>>;

  /**
   * Setzt oder überschreibt einen Wert szenario-lokal im Memory-Provider
   * (höchste Priorität in der Provider-Kette).
   *
   * Beispiel:
   * ```ts
   * world.setDirectiveOverride(
   *   StarfleetDirectiveKey.frontendBaseUrl,
   *   `http://localhost:${port}`,
   * );
   * ```
   *
   * @param key Schlüsselliteral aus StarfleetDirectiveKey
   * @param value Wert im passenden Typ laut IStarfleetDirectiveSchema
   */
  setDirectiveOverride<K extends TStarfleetDirectiveKey>(
    key: K,
    value: IStarfleetDirectiveSchema[K],
  ): void;
}
