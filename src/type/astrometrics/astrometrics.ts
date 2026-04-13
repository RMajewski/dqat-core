import type { ClockMode } from './clock.ts';

export interface AstrometricsInitTags {
  /**
   * Aus Tags: @clock:system|frozen|monotonic
   */
  clockMode?: ClockMode | 'system';

  /**
   * Aus Tags: @clockOffset:<ms>
   */
  clockOffsetMs?: number;

  /**
   * Optional: @worldSeed:* (nur Spiegelung)
   */
  worldSeed?: string | number;

  /**
   * Optionaler Startanker (z.B. aus Step)
   */
  anchor?: Date | number | string;
}
