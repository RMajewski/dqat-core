import type { ClockMode } from '../type/astrometrics/clock.ts';
import { AstrometricsClock } from './clock.ts';

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

export class Astrometrics {
  /**
   * Die Clock-Instanz der World.
   */
  public readonly clock: AstrometricsClock;

  /**
   * Erstellt eine Astrometrics-Instanz und konfiguriert die Clock aus Tags.
   */
  public constructor(init?: AstrometricsInitTags) {
    // TODO: Tags in ClockOptions übersetzen ("system" ⇒ "realtime", Offset/Anker setzen)
    // Hinweis: In Iteration 1 noch ohne Seiteneffekte (Store/MissionLog etc.).
    this.clock = new AstrometricsClock();
  }

  /**
   * Gibt die aktuelle World-Zeit zurück (Delegation an Clock).
   */
  public now(): Date {
    // TODO: Delegation implementieren, sobald Clock.now() GREEN ist
    throw new Error('NotImplemented: Astrometrics.now');
  }
}
