export type ClockMode = 'realtime' | 'frozen' | 'monotonic';

export interface SetAnchorParams {
  /**
   * Optionaler Modus-Wechsel.
   */
  mode?: ClockMode;

  /**
   * Neuer Anker (Date | ISO-String | Epoch-Milliseconds).
   */
  anchor?: Date | number | string;

  /**
   * Neuer Offset in Millisekunden (kann negativ sein).
   */
  offsetMs?: number;
}

export interface AstrometricsClockOptions {
  /**
   * Startmodus (Default: 'realtime').
   * */
  mode?: ClockMode;

  /**
   * Startanker (optional, abhängig vom Modus).
   */
  anchor?: Date | number | string;

  /**
   * Startoffset in Millisekunden (Default: 0).
   */
  offsetMs?: number;

  /**
   * High-Res-Zeitquelle für "monotonic" (injizierbar für Tests).
   */
  hrNow?: () => number;

  /**
   * Zeitpräzision in Millisekunden (Default: 1).
   */
  precisionMs?: number;

  /**
   * Optional: Welt-Seed (nur Spiegelung in v1).
   */
  seedValue?: string | number;
}
