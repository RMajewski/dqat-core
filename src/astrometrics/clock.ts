import type {
  AstrometricsClockOptions,
  ClockMode,
  SetAnchorParams,
} from '../type/astrometrics/clock.ts';
import { defaultHighResNow } from '../util/astrometrics/clock.ts';

export class AstrometricsClock {
  /**
   * Aktueller Modus der Uhr.
   */
  private mode: ClockMode;

  /**
   * UTC-Millisekunden des Ankerzeitpunkts (für frozen/monotonic).
   */
  private anchorUtcMs: number | undefined;

  /**
   * Konfigurierter Offset in Millisekunden.
   */
  private offsetMs: number;

  /**
   * Logische Basiszeit für den monotonic-Modus (UTC-Millisekunden).
   */
  private monotonicBaseMs: number | undefined;

  /**
   * High-Res-Zeit bei Start/Anker des monotonic-Modus.
   */
  private monotonicStartHr: number | undefined;

  /**
   * Zeitpräzision (Millisekunden).
   */
  private precisionMs: number;

  /**
   * High-Res-Zeitquelle (injizierbar).
   */
  private hrNow: () => number;

  /**
   * Optional: Seed der Testwelt (nur zu Debug/Tracing in v1).
   */
  private seedValue: string | number | undefined;

  /**
   * Erstellt eine neue Clock-Instanz (nur Skelett). In Iteration 1 werden
   * Felder und Defaultwerte vorbereitet; die eigentliche Logik folgt in Schritt 4 (GREEN).
   */
  public constructor(options: AstrometricsClockOptions = {}) {
    this.mode = options.mode ?? 'realtime';
    this.offsetMs = Number.isFinite(options.offsetMs as number)
      ? Number(options.offsetMs)
      : 0;
    this.precisionMs = Number.isFinite(options.precisionMs as number)
      ? Number(options.precisionMs)
      : 1;
    this.hrNow = options.hrNow ?? defaultHighResNow;
    this.seedValue = options.seedValue;

    const parsedAnchor = this.parseAnchorToUtcMs(options.anchor);

    // Initiale Felder abhängig vom Modus vorbereiten
    if (this.mode === 'frozen') {
      // Bei "frozen" muss ein Anker festliegen (fallback: Date.now()).
      this.anchorUtcMs = parsedAnchor ?? Date.now();
      this.monotonicBaseMs = undefined;
      this.monotonicStartHr = undefined;
    } else if (this.mode === 'monotonic') {
      // "monotonic" braucht Base + StartHr; Anker ist logische Basis.
      const base = this.parseAnchorToUtcMs(options.anchor) ?? Date.now();
      this.anchorUtcMs = base;
      this.monotonicBaseMs = base;
      this.monotonicStartHr = this.hrNow();
    } else {
      // "realtime": Anker ohne Bedeutung
      this.anchorUtcMs = undefined;
      this.monotonicBaseMs = undefined;
      this.monotonicStartHr = undefined;
    }
  }

  /**
   * Liefert die aktuelle World-Zeit als Date-Objekt.
   *
   * v1 (Skelett): Noch ohne Berechnungslogik; wird in GREEN implementiert.
   */
  public now(): Date {
    const utcMillis = this.computeUtcMilliseconds();
    return new Date(this.roundToPrecision(utcMillis));
  }

  /**
   * Setzt Anker/Modus/Offset atomar und gibt den aktuellen Snapshot zurück.
   *
   * @returns aktueller Zustand (z.B. für Logging/Debugging)
   */
  public setAnchor(params: SetAnchorParams): {
    now: Date;
    mode: ClockMode;
    offsetMs: number;
  } {
    const nextMode: ClockMode = params.mode ?? this.mode;

    // --- Offset festlegen ---
    if (typeof params.offsetMs !== 'undefined') {
      const nextOffset = Number(params.offsetMs);
      if (Number.isFinite(nextOffset)) {
        this.offsetMs = nextOffset;
      }
    }

    // --- Anker vorbereiten ---
    const nextAnchorMs = this.parseAnchorToUtcMs(params.anchor);

    // --- Moduswechsel ---
    if (nextMode === 'frozen') {
      this.applyFrozenMode(nextAnchorMs);
    } else if (nextMode === 'monotonic') {
      this.applyMonotonicMode(nextAnchorMs);
    } else {
      this.applyRealtimeMode();
    }

    const snapshotNow = this.now();
    return { now: snapshotNow, mode: this.mode, offsetMs: this.offsetMs };
  }

  /**
   * Bewegt die Uhr um deltaMs vorwärts (Modus-abhängig interpretiert).
   */
  public advanceClock(deltaMs: number): { now: Date } {
    const delta = Number(deltaMs) || 0;

    if (this.mode === 'frozen') {
      if (typeof this.anchorUtcMs !== 'number') {
        this.anchorUtcMs = Date.now();
      }
      this.anchorUtcMs += delta;
    } else if (this.mode === 'monotonic') {
      // robuste Initialisierung (falls jemals unset)
      if (typeof this.monotonicBaseMs !== 'number') {
        const base =
          typeof this.anchorUtcMs === 'number' ? this.anchorUtcMs : Date.now();
        this.monotonicBaseMs = base;
        this.monotonicStartHr = this.hrNow();
      }
      // reine Verschiebung der *Basis*, keine doppelten Additionen
      this.monotonicBaseMs = (this.monotonicBaseMs ?? 0) + delta;
    } else {
      this.offsetMs += delta;
    }

    return { now: this.now() };
  }

  /**
   * Parst einen Ankerwert in UTC-Millis.
   */
  protected parseAnchorToUtcMs(
    anchor: Date | number | string | undefined,
  ): number | undefined {
    if (anchor == null) {
      return undefined;
    }

    if (anchor instanceof Date) {
      const t = anchor.getTime();
      return Number.isFinite(t) ? t : undefined;
    }

    if (typeof anchor === 'number') {
      // Wir interpretieren Zahlen als Epoch-Millisekunden.
      return Number.isFinite(anchor) ? anchor : undefined;
    }

    if (typeof anchor === 'string') {
      const parsed = Date.parse(anchor);
      return Number.isFinite(parsed) ? parsed : undefined;
    }

    return undefined;
  }

  /**
   * Setzt den Modus auf „frozen“ und verwaltet den Anker:
   * - Wenn ein gültiger neuer Anker übergeben wurde, wird er gesetzt.
   * - Wenn kein neuer Anker übergeben wurde, aber bereits ein Anker existiert, bleibt er unverändert.
   * - Wenn weder neuer noch vorhandener Anker existiert, wird auf die aktuelle Systemzeit gesetzt.
   *
   * Nebenwirkung: monotonic-Felder werden zurückgesetzt.
   */
  private applyFrozenMode(nextAnchorMs: number | undefined): void {
    this.mode = 'frozen';

    if (typeof nextAnchorMs === 'number') {
      this.anchorUtcMs = nextAnchorMs;
    } else if (typeof this.anchorUtcMs !== 'number') {
      // Es existiert noch kein Anker → auf jetzt setzen
      this.anchorUtcMs = Date.now();
    }
    // Falls bereits ein Anker existiert und kein neuer übergeben wurde → unverändert lassen

    this.monotonicBaseMs = undefined;
    this.monotonicStartHr = undefined;
  }

  /**
   * Setzt den Modus auf „monotonic“ und initialisiert die Basis:
   * - Basis ist Priorität 1: übergebener Anker
   * - sonst Priorität 2: vorhandene monotonic-Basis
   * - sonst Priorität 3: vorhandener allgemeiner Anker
   * - sonst Fallback: aktuelle Systemzeit
   *
   * Nebenwirkung: monotonicStartHr wird aus hrNow() initialisiert,
   * anchorUtcMs wird auf die ermittelte Basis gesetzt.
   */
  private applyMonotonicMode(nextAnchorMs: number | undefined): void {
    this.mode = 'monotonic';

    let base: number | undefined = undefined;

    if (typeof nextAnchorMs === 'number') {
      base = nextAnchorMs;
    } else if (typeof this.monotonicBaseMs === 'number') {
      base = this.monotonicBaseMs;
    } else if (typeof this.anchorUtcMs === 'number') {
      base = this.anchorUtcMs;
    } else {
      base = Date.now();
    }

    this.anchorUtcMs = base;
    this.monotonicBaseMs = base;
    this.monotonicStartHr = this.hrNow();
  }

  private applyRealtimeMode(): void {
    this.mode = 'realtime';
    this.anchorUtcMs = undefined;
    this.monotonicBaseMs = undefined;
    this.monotonicStartHr = undefined;
  }

  /**
   * Setzt den Modus auf „realtime“ (Systemzeit + offsetMs) und
   * räumt alle anker- bzw. monotonic-bezogenen Felder auf, da sie
   * in diesem Modus nicht benötigt werden.
   */
  private computeUtcMilliseconds(): number {
    if (this.mode === 'realtime') {
      return Date.now() + this.offsetMs;
    }

    if (this.mode === 'frozen') {
      const anchor =
        typeof this.anchorUtcMs === 'number' ? this.anchorUtcMs : Date.now();
      return anchor + this.offsetMs;
    }

    // --- monotonic ---
    let base: number;
    if (typeof this.monotonicBaseMs === 'number') {
      base = this.monotonicBaseMs;
    } else if (typeof this.anchorUtcMs === 'number') {
      base = this.anchorUtcMs;
    } else {
      base = Date.now();
    }

    const startHr =
      typeof this.monotonicStartHr === 'number'
        ? this.monotonicStartHr
        : this.hrNow();
    const nowHr = this.hrNow();
    const elapsed = nowHr - startHr;

    // optional: Guard, falls eine Uhr zurückspringt
    const safeElapsed = elapsed >= 0 ? elapsed : 0;

    return base + safeElapsed + this.offsetMs;
  }

  /**
   * Rundet Millisekunden auf precisionMs.
   */
  private roundToPrecision(ms: number): number {
    const p = this.precisionMs > 0 ? this.precisionMs : 1;
    return Math.round(ms / p) * p;
  }
}
