import type { IWorldOptions } from '@cucumber/cucumber';
import { After, Before, setWorldConstructor } from '@cucumber/cucumber';
import type { ICucumberWorld } from '../../src/type/ICucumberWorld';

/**
 * World-Container (ohne Astrometrics-Logik).
 * - now(): nutzt vorerst echte Zeit (wird später ersetzt)
 * - get/set(): kleiner in-memory Store für die Setup-Phase
 */
class DqatWorld implements ICucumberWorld {
  private store: Map<string, unknown> = new Map();

  constructor(_options: IWorldOptions) {}

  now = (): Date => new Date(); // Platzhalter – wird in M1 ersetzt

  get = (key: string): unknown => this.store.get(key);
  set = (key: string, value: unknown): void => {
    this.store.set(key, value);
  };
}

setWorldConstructor(DqatWorld);

Before(function () {
  // Minimaler Start-Marker – ersetzt sich später durch MissionLog
  this.set('run.start', this.now());
});

After(function () {
  // Minimaler End-Marker – ersetzt sich später durch disposeAll() + Log
  this.set('run.end', this.now());
});
