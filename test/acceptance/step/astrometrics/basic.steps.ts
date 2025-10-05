import { Then } from '@cucumber/cucumber';

Then('die World verwendet die Default-Directives', async function () {
  return 'pending';
});

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
