import { Then } from '@cucumber/cucumber';
import assert from 'node:assert';
import type { DqatAcceptanceWorld } from '../type/acceptanceWorld.ts';

Then(
  'sollte die Zeichenkettenliste {commonStringList} den Werten {commonStringList} entsprechen',
  function (
    this: DqatAcceptanceWorld,
    actualValues: string[],
    expectedValues: string[],
  ): void {
    assert.deepStrictEqual(actualValues, expectedValues);
  },
);
