import { Given, Then } from '@cucumber/cucumber';

Given(
  'ich registriere eine Ressource {string} mit Disposer',
  async function (resourceName: string) {
    return 'pending';
  },
);

Then(
  'werden die Disposer in der Reihenfolge {string} aufgerufen',
  async function (order: string) {
    return 'pending';
  },
);

Then(
  'sind ausschließlich die Ressourcen dieses Szenarios aufgeräumt',
  async function () {
    return 'pending';
  },
);

Then(
  'nach dem Aufräumen sind keine aktiven Timer oder Sockets mehr vorhanden',
  async function () {
    return 'pending';
  },
);
