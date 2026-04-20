import assert from 'node:assert';
import type { DqatWorld } from '../setup/DqatWorld.ts';

/**
 * Prüft, ob ein Starfleet-Directive-Key auf den erwarteten String-Wert aufgelöst wird.
 *
 * Dieser Callback eignet sich für exportierte Cucumber-Step-Definitionen,
 * wenn das Verhalten der geladenen Starfleet Directives überprüft werden soll,
 * ohne Aussagen über die interne Provider-Reihenfolge direkt in den Step-Text
 * zu kodieren.
 *
 * @example
 * ```feature
 * Dann sollte der Starfleet Directive Key "path" den Wert "env" haben
 * ```
 *
 * @param key Zu prüfender Directive-Key
 * @param expectedValue Erwarteter Wert
 */
export function assertDirectiveHasValueCallback(
  this: DqatWorld,
  key: string,
  expectedValue: string,
): void {
  const actualValue = this.getStarfleetDirectives().resolveDirective(key);

  assert.notStrictEqual(
    actualValue,
    undefined,
    `Für den Starfleet Directive Key "${key}" wurde kein Wert gefunden.`,
  );

  assert.strictEqual(
    actualValue,
    expectedValue,
    `Der Starfleet Directive Key "${key}" hat nicht den erwarteten Wert.`,
  );
}
