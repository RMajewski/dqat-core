import { Then, When } from '@cucumber/cucumber';

When(
  'ich einen Missionslog-Eintrag mit Level {string} und Nachricht {string} schreibe',
  async function (level: string, message: string) {
    return 'pending';
  },
);

Then(
  'enthält der Eintrag einen Zeitstempel aus der World-Zeit',
  async function () {
    return 'pending';
  },
);

Then(
  'die Details enthalten correlation mit runId, scenarioId und stepId',
  async function () {
    return 'pending';
  },
);

Then(
  'existiert ein Missionslog-Eintrag mit Level {string} zu den ignorierten Tags',
  async function (level: string) {
    return 'pending';
  },
);
