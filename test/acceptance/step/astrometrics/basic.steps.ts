import { Then } from '@cucumber/cucumber';
import type { DqatWorld } from '@RMajewski/dqat-core/setup';
import assert from 'node:assert';

type EffectiveDirectives = {
  clockMode: 'system' | 'frozen' | 'monotonic';
  clockOffsetMs: number;
  worldSeed?: string | number;
};

function getEffectiveDirectives(
  world: DqatWorld,
): EffectiveDirectives | undefined {
  return world.get?.('effectiveDirectives') as EffectiveDirectives | undefined;
}

Then(
  'die World verwendet die Default-Directives',
  async function (this: DqatWorld) {
    const eff = getEffectiveDirectives(this);
    assert.ok(eff, 'effectiveDirectives fehlen in der World');
    // Defaults aus der ersten Iteration
    assert.strictEqual(
      eff?.clockMode,
      'system',
      'clockMode ist nicht "system" (Default)',
    );
    assert.strictEqual(
      eff?.clockOffsetMs,
      0,
      'clockOffsetMs ist nicht 0 (Default)',
    );
  },
);

Then(
  'entsprechen die Werte der bekannten Baseline für WorldSeed {string}',
  async function (seedValue: string) {
    return 'pending';
  },
);

Then(
  'unterscheiden sich die Werte von einer Referenz mit WorldSeed {string}',
  async function (seedValue: string) {
    return 'pending';
  },
);
