import { describe, expect, it } from 'vitest';
import {
  applyStripPrefix,
  buildKey,
  mapDoubleUnderscoreToSeparator,
  maybeToLowerCase,
  removeLeadingUnderscores,
} from '../../../../src/util/provider/keyResolution';

describe('KeyResolution Hilfsfunktionen', () => {
  describe('buildKey', () => {
    const cases: ReadonlyArray<
      [string, string | undefined, string, string, string]
    > = [
      [
        'Parent vorhanden → Parent, Separator und Child werden korrekt kombiniert',
        'app',
        'port',
        '.',
        'app.port',
      ],
      [
        'Parent fehlt → nur Child wird zurückgegeben',
        undefined,
        'version',
        '.',
        'version',
      ],
      [
        'benutzerdefinierter Separator "/" wird respektiert',
        'root',
        'child',
        '/',
        'root/child',
      ],
      ['Separator "-" wird korrekt verwendet', 'foo', 'bar', '-', 'foo-bar'],
      [
        'Parent ist leerer String → wird wie „fehlt“ behandelt',
        '',
        'x',
        '.',
        'x',
      ],
      [
        'Child darf selbst Separator enthalten, ohne verändert zu werden',
        'base',
        'config.value',
        '.',
        'base.config.value',
      ],
      [
        'Parent und Child können numerisch aussehen, werden aber als Strings behandelt',
        '1',
        '2',
        '.',
        '1.2',
      ],
    ];

    it.for(cases)(
      'gibt korrektes Ergebnis zurück, wenn %s',
      ([, parent, current, separator, expected]) => {
        const result = buildKey(parent, current, separator);
        expect(result).toBe(expected);
      },
    );
  });

  describe('mapDoubleUnderscoreToSeparator', () => {
    const cases: ReadonlyArray<
      [string, string, string, boolean | undefined, string]
    > = [
      [
        'doppelte Unterstriche werden durch den Separator "." ersetzt, wenn enabled=true',
        'APP__DB__PORT',
        '.',
        true,
        'APP.DB.PORT',
      ],
      [
        'doppelte Unterstriche werden durch "/" ersetzt, wenn enabled=true',
        'A__B__C',
        '/',
        true,
        'A/B/C',
      ],
      [
        'bei einfachem Unterstrich erfolgt keine Ersetzung',
        'APP_DB_PORT',
        '.',
        true,
        'APP_DB_PORT',
      ],
      [
        'bei fehlendem doppelten Unterstrich bleibt der Key unverändert',
        'CONFIG',
        '.',
        true,
        'CONFIG',
      ],
      [
        'wenn enabled=false, bleibt der Key unverändert',
        'A__B__C',
        '.',
        false,
        'A__B__C',
      ],
      [
        'wenn enabled=undefined, bleibt der Key unverändert',
        'X__Y__Z',
        '.',
        undefined,
        'X__Y__Z',
      ],
      [
        'mehrfache doppelte Unterstriche hintereinander werden alle ersetzt',
        'A____B',
        '.',
        true,
        'A..B',
      ],
      [
        'Separator kann mehr als ein Zeichen enthalten',
        'A__B__C',
        '::',
        true,
        'A::B::C',
      ],
    ];

    it.for(cases)(
      'gibt korrektes Ergebnis zurück, wenn %s',
      ([, key, separator, enabled, expected]) => {
        const result = mapDoubleUnderscoreToSeparator(key, separator, enabled);
        expect(result).toBe(expected);
      },
    );
  });

  describe('maybeToLowerCase', () => {
    const cases: ReadonlyArray<[string, string, boolean | undefined, string]> =
      [
        [
          'den Schlüssel in Kleinbuchstaben umwandelt, wenn toLowerCase=true',
          'APP_PORT',
          true,
          'app_port',
        ],
        [
          'den Schlüssel unverändert lässt, wenn toLowerCase=false',
          'APP_PORT',
          false,
          'APP_PORT',
        ],
        [
          'den Schlüssel unverändert lässt, wenn toLowerCase nicht angegeben ist',
          'DATABASE_URL',
          undefined,
          'DATABASE_URL',
        ],
        [
          'bereits kleingeschriebene Schlüssel unverändert lässt',
          'config_value',
          true,
          'config_value',
        ],
        [
          'gemischte Groß-/Kleinschreibung korrekt in Kleinbuchstaben konvertiert',
          'App_Port_Name',
          true,
          'app_port_name',
        ],
        [
          'Zahlen und Sonderzeichen unverändert beibehält',
          'VAR_123_TEST',
          true,
          'var_123_test',
        ],
        ['leeren String unverändert zurückgibt', '', true, ''],
      ];

    it.for(cases)(
      'gibt korrektes Ergebnis zurück, wenn %s',
      ([, key, toLowerCase, expected]) => {
        const result = maybeToLowerCase(key, toLowerCase);
        expect(result).toBe(expected);
      },
    );
  });

  describe('applyStripPrefix', () => {
    const cases: ReadonlyArray<[string, string, string | undefined, string]> = [
      [
        'das Präfix entfernt, wenn es am Anfang steht',
        'DQ_APP_PORT',
        'DQ_',
        'APP_PORT',
      ],
      [
        'den Schlüssel unverändert lässt, wenn das Präfix nicht übereinstimmt',
        'APP_PORT',
        'DQ_',
        'APP_PORT',
      ],
      [
        'den Schlüssel unverändert lässt, wenn kein Präfix angegeben ist',
        'TEST_KEY',
        undefined,
        'TEST_KEY',
      ],
      [
        'nur das erste Vorkommen des Präfixes am Anfang entfernt, nicht spätere',
        'DQ_DQ_APP',
        'DQ_',
        'DQ_APP',
      ],
      [
        'ein leeres Präfix ignoriert und den Schlüssel unverändert lässt',
        'VAR_NAME',
        '',
        'VAR_NAME',
      ],
      [
        'ein Präfix mit Sonderzeichen korrekt entfernt',
        '$$_CONFIG',
        '$$_',
        'CONFIG',
      ],
      [
        'Groß-/Kleinschreibung beachtet – entfernt nur exakte Präfixe',
        'dq_KEY',
        'DQ_',
        'dq_KEY',
      ],
    ];

    it.for(cases)(
      'gibt korrektes Ergebnis zurück, wenn %s',
      ([, key, stripPrefix, expected]) => {
        const result = applyStripPrefix(key, stripPrefix);
        expect(result).toBe(expected);
      },
    );
  });

  describe('removeLeadingUnderscores', () => {
    const cases = [
      ['ohne', 'test_test', 'test_test'],
      ['mit einem', '_test_test', 'test_test'],
      ['mit mehreren', '___test_test', 'test_test'],
      ['ohne Key', '', ''],
      ['ohne Key mit einem Unterstrich', '_', ''],
    ];
    it.for(cases)(
      'entfernt führende Unterstriche (%s)',
      ([, inputKey, expectedKey]) => {
        const result = removeLeadingUnderscores(inputKey);
        expect(result).toBe(expectedKey);
      },
    );
  });
});
