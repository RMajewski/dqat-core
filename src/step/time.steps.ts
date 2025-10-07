import { Given, Then, When } from '@cucumber/cucumber';

Given(
  'die Uhr ist auf den Zeitpunkt {string} eingefroren',
  async function (timestamp: string) {
    return 'pending';
  },
);

When('ich die aktuelle Zeit notiere', async function () {
  return 'pending';
});

When(
  'ich die Zeit um {int} Millisekunden vorwärts bewege',
  async function (milliseconds: number) {
    return 'pending';
  },
);

Then('sind beide Zeitstempel exakt gleich', async function () {
  return 'pending';
});

Then(
  'liegt der neue Zeitstempel exakt {int} Millisekunden über dem ersten',
  async function (milliseconds: number) {
    return 'pending';
  },
);

Then(
  'ist der zweite Zeitstempel größer oder gleich dem ersten',
  async function () {
    return 'pending';
  },
);

Then(
  'ist die Sequenz der Zeitstempel monoton nicht fallend',
  async function () {
    return 'pending';
  },
);

When(
  'ich die Systemzeit und die World-Zeit parallel notiere',
  async function () {
    return 'pending';
  },
);

Then(
  'liegt die World-Zeit exakt {int} Millisekunden über der Systemzeit',
  async function (milliseconds: number) {
    return 'pending';
  },
);

Then(
  'liegt die World-Zeit exakt {int} Millisekunden unter der Systemzeit',
  async function (milliseconds: number) {
    return 'pending';
  },
);
