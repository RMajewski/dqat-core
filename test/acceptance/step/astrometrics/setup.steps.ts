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
  'die Datei {string} enthält die Provider-Optionen',
  async function (
    this: DqatAcceptanceWorld,
    filePath: string,
    dataTable: DataTable,
  ) {
    const providerOptions: Record<string, unknown> = {};
    const rows = dataTable.hashes();

    for (const row of rows) {
      if (row.Property) {
        providerOptions[row.Property] = row.Wert;
      }
    }

    this.testPaths.push(
      makeJsonFile(filePath, 'dqat-provider-options', {
        envProviderOptions: providerOptions,
      }),
    );
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

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.setDirectiveOverride(key as any, row.Wert);
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
  'sollten die ENV-Provider-Optionen so eingestellt sein',
  async function (this: DqatAcceptanceWorld, dataTable: DataTable) {
    const rows = dataTable.hashes();
    const envProviderOptions = this.getEnvProviderOptions();

    assert.ok(
      envProviderOptions,
      'Die envProviderOptions sind nicht gesetzt oder konnten nicht geladen werden.',
    );

    for (const row of rows) {
      const key = row.Property;
      const hasProperty = Object.hasOwn(envProviderOptions, key);

      assert.ok(
        hasProperty,
        `In envProviderOptions ist der Key "${key}" nicht gesetzt.`,
      );

      const actualValue =
        envProviderOptions[key as keyof typeof envProviderOptions]?.toString();
      const expectedValue = row.Wert;

      assert.equal(
        actualValue,
        expectedValue,
        `Der Wert der Option "${key}" ist falsch gesetzt`,
      );
    }
  },
);
