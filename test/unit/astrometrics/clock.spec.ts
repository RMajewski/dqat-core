import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AstrometricsClock } from '../../../src/astrometrics/clock.ts';

const SYSTEM_DATE = '2025-10-05T12:00:00.000Z';

function expectExactMilliseconds(actual: number, expected: number): void {
  expect({ actual }).toEqual({ actual: expected });
}

describe('Astrometrics-Clock – Iteration 1', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('Systemuhr: wendet positiven Offset deterministisch an', () => {
    const baseSystemDate = new Date(SYSTEM_DATE);
    vi.setSystemTime(baseSystemDate);

    const clock = new AstrometricsClock({ mode: 'realtime', offsetMs: 2000 });

    const currentWorldDate = clock.now();

    expectExactMilliseconds(
      currentWorldDate.getTime(),
      baseSystemDate.getTime() + 2000,
    );
  });

  it('Systemuhr: wendet negativen Offset deterministisch an', () => {
    const baseSystemDate = new Date(SYSTEM_DATE);
    vi.setSystemTime(baseSystemDate);

    const clock = new AstrometricsClock({
      mode: 'realtime',
      offsetMs: -3600000,
    });

    const currentWorldDate = clock.now();

    expectExactMilliseconds(
      currentWorldDate.getTime(),
      baseSystemDate.getTime() - 3600000,
    );
  });

  it('Eingefrorene Uhr: bleibt stabil bis zur Vorwärtsbewegung', () => {
    const anchorDate = new Date(SYSTEM_DATE);
    const clock = new AstrometricsClock({
      mode: 'frozen',
      anchor: anchorDate,
      offsetMs: 0,
    });

    const first = clock.now();
    const second = clock.now();

    expectExactMilliseconds(first.getTime(), second.getTime());

    clock.advanceClock(1500);
    const afterAdvance = clock.now();

    expectExactMilliseconds(
      afterAdvance.getTime(),
      anchorDate.getTime() + 1500,
    );
  });

  it('Eingefrorene Uhr: kombiniert Anker + Offset + Vorwärtsbewegung', () => {
    const anchorDate = new Date(SYSTEM_DATE);
    const clock = new AstrometricsClock({
      mode: 'frozen',
      anchor: anchorDate,
      offsetMs: 2000,
    });

    clock.advanceClock(3000);
    const currentWorldDate = clock.now();

    expectExactMilliseconds(
      currentWorldDate.getTime(),
      anchorDate.getTime() + 5000,
    );
  });

  it('Monotone Uhr: schreitet mit High-Res-Zeit ohne Systemdrift fort', () => {
    let fakeHighResNow = 0;
    const hrNow = (): number => fakeHighResNow;
    const anchorDate = new Date(SYSTEM_DATE);

    const clock = new AstrometricsClock({
      mode: 'monotonic',
      anchor: anchorDate,
      offsetMs: 0,
      hrNow,
    });

    const t0 = clock.now();
    expectExactMilliseconds(t0.getTime(), anchorDate.getTime());

    fakeHighResNow += 20;
    const t1 = clock.now();

    expectExactMilliseconds(t1.getTime(), anchorDate.getTime() + 20);

    clock.advanceClock(1000);
    const t2 = clock.now();

    expectExactMilliseconds(t2.getTime(), anchorDate.getTime() + 1020);
  });

  it('setAnchor: aktualisiert Modus, Anker und Offset atomar', () => {
    vi.setSystemTime(new Date(SYSTEM_DATE));
    const clock = new AstrometricsClock();

    const newAnchorDate = new Date('2025-10-06T08:30:00.000Z');
    clock.setAnchor({ mode: 'frozen', anchor: newAnchorDate, offsetMs: 300 });

    const currentWorldDate = clock.now();
    expectExactMilliseconds(
      currentWorldDate.getTime(),
      newAnchorDate.getTime() + 300,
    );
  });
});
