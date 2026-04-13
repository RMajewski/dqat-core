/**
 * Beschreibt einen passiven Mess-Speicher ("Probe") für die Astrometrics-Clock.
 * Die Probe liest World-Zeit ausschließlich über den übergebenen nowProvider.
 */
export interface ClockProbe {
  /**
   * Eindeutige Kennung für Lookup/Debugging.
   */
  readonly id: string;

  /**
   * Anzahl maximal vorgehaltener Messpunkte (Ringpuffer), optional.
   */
  readonly maxNotes?: number;

  /**
   * Nur-lesen-Zugriff auf gespeicherte World-Zeitstempel (UTC, ms).
   */
  getWorldTimesMs(): ReadonlyArray<number>;

  /**
   * Nur-lesen-Zugriff auf gespeicherte System-Zeitstempel (UTC, ms).
   */
  getSystemTimesMs(): ReadonlyArray<number>;

  /**
   * Notiert die aktuelle World-Zeit (über nowProvider) und gibt den
   * Zeitstempel (ms) zurück.
   */
  recordWorldNow(): number;

  /**
   * Notiert parallel Systemzeit (`Date.now()`) und World-Zeit.
   * Liefert die beiden Zeitstempel zurück.
   */
  recordParallelSystemAndWorld(): { systemMs: number; worldMs: number };

  /**
   * Löscht alle gespeicherten Messwerte.
   */
  reset(): void;
}

/**
 * Typ-Alias für das Clock-Objekt einer Astrometrics-Instanz.
 * Wir erwarten nur ein Objekt, kein spezielles Interface.
 */
export type ClockLike = object;
