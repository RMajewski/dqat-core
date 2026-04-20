import type { DataTable } from '@cucumber/cucumber';
import { Given, Then, When } from '@cucumber/cucumber';
import assert from 'node:assert';
import { isStarfleetDirectiveKey } from '../../../../src/util/provider/keyResolution.ts';
import { makeJsonFile } from '../../../util/jsonFileProvider.helper.ts';
import type { DqatAcceptanceWorld } from '../../type/acceptanceWorld.ts';

Given(
  'folgende JSON-Konfigurationsdateien existieren:',
  async function (this: DqatAcceptanceWorld, dataTable: DataTable) {
    const rows = dataTable.hashes();
    for (const row of rows) {
      if (row.Pfad) {
        this.testPaths.push(
          makeJsonFile(
            row.Pfad,
            'dqat-acceptance-setup',
            row.JSON ? JSON.parse(row.JSON) : {},
          ),
        );
      }
    }
  },
);

Given(
  'die ENV-Variable {string} ist gesetzt auf {string}',
  async function (
    this: DqatAcceptanceWorld,
    envVariable: string,
    value: string,
  ) {
    if (!envVariable || !value) {
      throw new Error('Env variable name and value must be set.');
    }
    process.env[envVariable] = value;
  },
);

Given(
  'es existieren folgende Starfleet Directives',
  async function (this: DqatAcceptanceWorld, dataTable: DataTable) {
    const rows = dataTable.hashes();
    for (const row of rows) {
      const key = row.Key;
      if (!key || !isStarfleetDirectiveKey(key)) {
        console.warn(`The key “${key}” is not a valid key.`);
      }
      this.setDirectiveOverride(key, row.Wert);
    }
  },
);

When(
  'die Starfleet Directives geladen werden',
  async function (this: DqatAcceptanceWorld) {
    this.loadStarfleetDirectives(this.testPaths);
  },
);

Then(
  'sollte der JSON-Provider für {string} existieren',
  async function (this: DqatAcceptanceWorld, providerName: string) {
    assert.ok(
      this.getStarfleetDirectives().hasProvider(providerName),
      `Der Provider "${providerName}" wurde nicht geladen`,
    );
  },
);

Then(
  'der JSON-Provider für {string} existieren',
  async function (this: DqatAcceptanceWorld, providerName: string) {
    assert.ok(
      this.getStarfleetDirectives().hasProvider(providerName),
      `Der Provider "${providerName}" wurde nicht geladen`,
    );
  },
);

Then(
  'der ENV-Provider sollte geladen sein',
  async function (this: DqatAcceptanceWorld) {
    assert.ok(
      this.getStarfleetDirectives().hasProvider('env'),
      `Der Env-Provider wurde nicht geladen`,
    );
  },
);

Then(
  'der Memory-Provider sollte geladen sein',
  async function (this: DqatAcceptanceWorld) {
    assert.ok(
      this.getStarfleetDirectives().hasProvider('memory'),
      `Der Memory-Provider wurde nicht geladen`,
    );
  },
);

Then(
  'sollte der Memory-Provider höchste Priorität haben',
  async function (this: DqatAcceptanceWorld) {
    const directiveValue =
      this.getStarfleetDirectives().resolveDirective('test');

    assert.notStrictEqual(
      directiveValue,
      undefined,
      `Für den Key "test" wurde kein Wert gefunden.`,
    );

    assert.strictEqual(
      directiveValue,
      'false',
      'Der Memory-Provider hat nicht die höchste Priorität.',
    );
  },
);

Then(
  'der ENV-Provider sollte die JSON-Provider überschreiben',
  async function (this: DqatAcceptanceWorld) {
    const value = this.getStarfleetDirectives().resolveDirective('path');

    // Existenz prüfen
    assert.notStrictEqual(
      value,
      undefined,
      'Erwarteter Wert aus ENV ist undefined',
    );

    // Inhalt prüfen
    assert.strictEqual(
      value,
      'env',
      'ENV-Provider hat JSON-Wert nicht überschrieben',
    );
  },
);

Then(
  'die Datei "./test/acceptance/test.config.json" sollte Vorrang vor "./test/test.config.json" haben',
  async function (this: DqatAcceptanceWorld) {
    // Write code here that turns the phrase above into concrete actions
    return 'pending';
  },
);
