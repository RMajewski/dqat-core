import assert from 'node:assert';
import type { DqatWorld } from '../setup/DqatWorld.ts';
import {
  assertMonotonicNonDecreasing,
  expectApproximatelyEqualMs,
} from '../util/step/clock.assertions.ts';

/**
 * Uhr einfrieren: Setzt die World-Uhr auf den angegebenen Zeitpunkt im Modus „frozen“.
 *
 * @example
 * ```feature
 * Angenommen die Uhr ist auf den Zeitpunkt "2025-10-05T12:00:00Z" eingefroren
 * ```
 */
export function freezeClockAt(this: DqatWorld, timestamp: string): void {
  assert(this.astrometrics, 'Astrometrics ist nicht initialisiert');
  const clockAnchor = this.astrometrics.clock.setAnchor({
    mode: 'frozen',
    anchor: timestamp,
  });
  this.set('clockAnchorMs', clockAnchor.now.getTime() - clockAnchor.offsetMs);
}

/**
 * Zeit notieren: Speichert die aktuelle World-Zeit in der World für spätere Vergleiche.
 *
 * @example
 * ```feature
 * Wenn ich die aktuelle Zeit notiere
 * ```
 */
export function noteCurrentWorldTime(this: DqatWorld): void {
  const noted: number[] = this.get('notedWorldTimesMs') ?? [];
  this.set('notedWorldTimesMs', [...noted, this.now().getTime()]);
}

/**
 * Uhr vorwärts bewegen: Verschiebt die simulierte World-Zeit um den angegebenen Betrag.
 *
 * @example
 * ```feature
 * Wenn ich die Zeit um 5000 Millisekunden vorwärts bewege
 * ```
 */
export function advanceWorldClock(this: DqatWorld, milliseconds: number): void {
  this.astrometrics?.clock.advanceClock(milliseconds);
}

/**
 * Exakte Gleichheit der Zeitstempel prüfen.
 *
 * @example
 * ```feature
 * Dann sind beide Zeitstempel exakt gleich
 * ```
 */
export function assertTimesExactlyEqual(this: DqatWorld): void {
  const times: number[] = this.get('notedWorldTimesMs') ?? [];
  assert(times.length >= 2, 'Es wurden weniger als zwei Zeitstempel notiert.');
  assert.strictEqual(
    times.at(-1),
    times.at(-2),
    'Zeitstempel sind nicht exakt gleich.',
  );
}

/**
 * Exakte Zeitdifferenz zwischen erstem und letztem Zeitstempel prüfen.
 *
 * @example
 * ```feature
 * Dann liegt der neue Zeitstempel exakt 5000 Millisekunden über dem ersten
 * ```
 */
export function assertTimeDifferenceExact(
  this: DqatWorld,
  milliseconds: number,
): void {
  const times: number[] = this.get('notedWorldTimesMs') ?? [];
  assert(times.length >= 2, 'Es wurden weniger als zwei Zeitstempel notiert.');
  const expected = times[0] + milliseconds;
  assert.strictEqual(
    times.at(-1),
    expected,
    `Erwartet ${expected}, erhalten ${times.at(-1)}`,
  );
}

/**
 * Prüfung: Zweiter Zeitstempel ist größer oder gleich dem ersten.
 *
 * @example
 * ```feature
 * Dann ist der zweite Zeitstempel größer oder gleich dem ersten
 * ```
 */
export function assertSecondTimeNotBeforeFirst(this: DqatWorld): void {
  const times: number[] = this.get('notedWorldTimesMs') ?? [];
  assert(times.length >= 2, 'Es wurden weniger als zwei Zeitstempel notiert.');
  assert(
    times[1] >= times[0],
    `Zweiter Zeitstempel kleiner: ${times[1]} < ${times[0]}`,
  );
}

/**
 * Prüfung: Sequenz der notierten Zeitstempel ist monoton nicht fallend.
 *
 * @example
 * ```feature
 * Dann ist die Sequenz der Zeitstempel monoton nicht fallend
 * ```
 */
export function assertTimesMonotonic(this: DqatWorld): void {
  const times: number[] = this.get('notedWorldTimesMs') ?? [];
  assert(times.length >= 2, 'Es wurden weniger als zwei Zeitstempel notiert.');
  assertMonotonicNonDecreasing(times);
}

/**
 * System- und World-Zeit parallel notieren.
 *
 * @example
 * ```feature
 * Wenn ich die Systemzeit und die World-Zeit parallel notiere
 * ```
 */
export function noteParallelSystemAndWorldTime(this: DqatWorld): void {
  const worldMs = this.now().getTime();
  const systemMs = Date.now();
  const worldList: number[] = this.get('notedWorldTimesMs') ?? [];
  const systemList: number[] = this.get('notedSystemTimesMs') ?? [];
  this.set('notedWorldTimesMs', [...worldList, worldMs]);
  this.set('notedSystemTimesMs', [...systemList, systemMs]);
}

/**
 * Prüfung: World-Zeit liegt exakt über der Systemzeit.
 *
 * @example
 * ```feature
 * Dann liegt die World-Zeit exakt 2000 Millisekunden über der Systemzeit
 * ```
 */
export function assertWorldAboveSystem(
  this: DqatWorld,
  milliseconds: number,
): void {
  const worldTimes: number[] = this.get('notedWorldTimesMs') ?? [];
  const systemTimes: number[] = this.get('notedSystemTimesMs') ?? [];
  const diff = worldTimes.at(-1)! - systemTimes.at(-1)!;
  expectApproximatelyEqualMs(diff, milliseconds, 5);
}

/**
 * Prüfung: World-Zeit liegt exakt unter der Systemzeit.
 *
 * @example
 * ```feature
 * Dann liegt die World-Zeit exakt 3600000 Millisekunden unter der Systemzeit
 * ```
 */
export function assertWorldBelowSystem(
  this: DqatWorld,
  milliseconds: number,
): void {
  const worldTimes: number[] = this.get('notedWorldTimesMs') ?? [];
  const systemTimes: number[] = this.get('notedSystemTimesMs') ?? [];
  const diff = worldTimes.at(-1)! - systemTimes.at(-1)!;
  expectApproximatelyEqualMs(diff, -Math.abs(milliseconds), 5);
}
