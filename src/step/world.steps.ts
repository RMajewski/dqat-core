import { worldInit } from '#callback';
import { Given, When } from '@cucumber/cucumber';

Given('die World ist initialisiert', worldInit);

Given(
  'ein WorldSeed mit dem Wert {string} ist gesetzt',
  async function (seedValue: string) {
    return 'pending';
  },
);

When('das Szenario startet', async function () {
  return 'pending';
});

When('das Szenario endet', async function () {
  return 'pending';
});
