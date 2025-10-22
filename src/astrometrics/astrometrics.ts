import type { AstrometricsInitTags } from '../type/astrometrics/astrometrics.ts';
import { AstrometricsClock } from './clock.ts';

export class Astrometrics {
  /**
   * Die Clock-Instanz der World.
   */
  public readonly clock: AstrometricsClock;

  /**
   * Erstellt eine Astrometrics-Instanz und konfiguriert die Clock aus Tags.
   */
  public constructor(init?: AstrometricsInitTags) {
    const modeFromTag =
      init?.clockMode === 'system' ? 'realtime' : init?.clockMode;

    this.clock = new AstrometricsClock({
      mode: modeFromTag ?? 'realtime',
      offsetMs: Number.isFinite(init?.clockOffsetMs as number)
        ? Number(init?.clockOffsetMs)
        : 0,
      anchor: init?.anchor,
      seedValue: init?.worldSeed,
    });
  }

  /**
   * Gibt die aktuelle World-Zeit zurück (Delegation an Clock).
   */
  public now(): Date {
    return this.clock.now();
  }
}
