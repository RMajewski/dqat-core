// test/acceptance/steps/clock.steps.ts

import { Then as Dann, When as Wenn } from '@cucumber/cucumber';
import type { DqatAcceptanceWorld } from '../../type/acceptanceWorld.ts';
import { expectApproximatelyEqualMs } from '../../utils/time.assertions.ts';

const ERROR_MESSAGE = 'Astrometrics ist nicht initialisiert.' as const;

/**
 * Holt eine Kopie der gespeicherten World-Zeitstempel (ms, UTC).
 */
function getWorldTimesMs(world: DqatAcceptanceWorld): number[] {
  const list: number[] = world.get('notedWorldTimesMs') ?? [];
  return [...list];
}

/**
 * Speichert die übergebene Liste als neue World-Zeiten.
 */
function setWorldTimesMs(world: DqatAcceptanceWorld, values: number[]): void {
  world.set('notedWorldTimesMs', [...values]);
}

/**
 * Notiert einen World-Zeitstempel (über Astrometrics.now) im Store.
 */
function noteWorldNowMs(world: DqatAcceptanceWorld): number {
  const nowMs = world.astrometrics!.now().getTime();
  const list = getWorldTimesMs(world);
  setWorldTimesMs(world, [...list, nowMs]);
  return nowMs;
}

/**
 * Misst den aktuellen effektiven Offset (World − System) ohne vorherige Notiz.
 */
function measureEffectiveOffsetMs(world: DqatAcceptanceWorld): number {
  const systemMs = Date.now();
  const worldMs = world.astrometrics!.now().getTime();
  return worldMs - systemMs;
}

/**
 * Liefert den im World-Store abgelegten Ankerzeitpunkt (ms).
 * Wirft eine klare Fehlermeldung, wenn kein Anker gesetzt ist.
 */
function getAnchorTimeMs(world: DqatAcceptanceWorld): number {
  const anchorMs = world.get('clockAnchorMs');
  if (typeof anchorMs !== 'number') {
    throw new Error(
      'Kein Ankerzeitpunkt im World-Store gefunden. ' +
        'Bitte sicherstellen, dass der Schritt "die Uhr ist auf den Zeitpunkt {string} eingefroren" ' +
        'den Wert unter dem Schlüssel "clockAnchorMs" ablegt.',
    );
  }
  return anchorMs;
}

/* ==========
   Wenn
   ========== */

/**
 * Notiert in schneller Folge mehrere World-Zeiten (5 Messpunkte).
 */
Wenn(
  'ich mehrfach nacheinander die aktuelle Zeit notiere',
  function (this: DqatAcceptanceWorld) {
    if (!this.astrometrics) {
      throw new Error(ERROR_MESSAGE);
    }
    for (let index = 0; index < 5; index++) {
      noteWorldNowMs(this);
    }
  },
);

/* ==========
   Dann
   ========== */

/**
 * Sanity-Check: Im Realtime-Modus erwarten wir ~0 ms (kleine Toleranz).
 */
Dann(
  'der effektive Offset wird berücksichtigt',
  function (this: DqatAcceptanceWorld) {
    if (!this.astrometrics) {
      throw new Error(ERROR_MESSAGE);
    }
    const measured = measureEffectiveOffsetMs(this);
    expectApproximatelyEqualMs(measured, 0, 10);
  },
);

/**
 * Prüft, dass die aktuelle World-Zeit exakt {deltaMs} Millisekunden
 * über dem zuvor gesetzten Ankerzeitpunkt liegt.
 *
 * Erwartete Abfolge im Szenario:
 * - Uhr einfrieren (legt "clockAnchorMs" im Store ab)
 * - ggf. vorwärts bewegen
 * - hier prüfen
 */
Dann(
  'liegt die World-Zeit exakt {int} Millisekunden über dem Ankerzeitpunkt',
  function (this: DqatAcceptanceWorld, deltaMs: number) {
    if (!this.astrometrics) {
      throw new Error('Astrometrics ist nicht initialisiert.');
    }

    const anchorMs = getAnchorTimeMs(this);
    const currentWorldMs = this.now().getTime(); // delegiert an Astrometrics.now()

    const expected = anchorMs + deltaMs;
    if (currentWorldMs !== expected) {
      throw new Error(
        `Unerwarteter World-Zeitpunkt: erwartet ${expected} ms (Anker ${anchorMs} + ${deltaMs}), ` +
          `erhalten ${currentWorldMs} ms.`,
      );
    }
  },
);
