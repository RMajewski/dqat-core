import assert from 'assert';
import { Astrometrics } from '../astrometrics/astrometrics.ts';
import type { DqatWorld } from '../setup/index.ts';

/**
 * World-Initialisierung: In unserer Setup-Iteration erzeugen die Hooks
 * pro Szenario bereits eine World. Wir stellen hier nur sicher,
 * dass die World nutzbar ist.
 *
 * @example
 * ```feature
 * Angenommen die World ist initialisiert
 * ```
 */
export function worldInit(this: DqatWorld): void {
  this.astrometrics ??= new Astrometrics();

  // Minimalchecks auf die im Setup bereitgestellten Funktionen
  assert.strictEqual(
    typeof this.get,
    'function',
    'World.get ist nicht verfügbar',
  );
  assert.strictEqual(
    typeof this.set,
    'function',
    'World.set ist nicht verfügbar',
  );
  assert.strictEqual(
    typeof this.now,
    'function',
    'World.now ist nicht verfügbar',
  );
}
