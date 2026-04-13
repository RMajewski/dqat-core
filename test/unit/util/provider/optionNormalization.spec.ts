import { describe, expect, it } from 'vitest';
import {
  DEFAULT_DOUBLE_UNDERSCORE_IS_SEPARATOR,
  DEFAULT_DROP_UNDEFINED,
  DEFAULT_ENV_PARSE,
  DEFAULT_FLATTEN,
  DEFAULT_INCLUDE_ARRAY_INDICES,
  DEFAULT_SEPARATOR,
  DEFAULT_TO_LOWER_CASE,
} from '../../../../src/config/starfleetDirectives.config.ts';
import type {
  IEnvProviderOptions,
  IJsonFileProviderOptions,
  IMemoryProviderOptions,
  NormalizedEnvOptions,
  NormalizedJsonFileOptions,
  NormalizedMemoryOptions,
} from '../../../../src/type/provider/providerOptions.ts';
import {
  normalizeEnvOptions,
  normalizeJsonFileOptions,
  normalizeMemoryOptions,
} from '../../../../src/util/provider/optionNormalization.ts';

describe('optionNormalization Hilfsfunktionen', () => {
  describe('normalizeEnvOptions', () => {
    const tests: ReadonlyArray<
      [string, IEnvProviderOptions | undefined, NormalizedEnvOptions]
    > = [
      [
        'alle Werte standardmäßig gesetzt werden, wenn kein Input vorhanden ist',
        undefined,
        {
          name: undefined,
          separator: DEFAULT_SEPARATOR,
          stripPrefix: undefined,
          doubleUnderscoreIsSeparator: DEFAULT_DOUBLE_UNDERSCORE_IS_SEPARATOR,
          toLowerCase: DEFAULT_TO_LOWER_CASE,
          parse: { numbers: false, booleans: false, json: false },
          dropUndefined: DEFAULT_DROP_UNDEFINED,
        },
      ],
      [
        'explizite Werte korrekt übernommen werden',
        {
          name: 'env',
          separator: ':',
          stripPrefix: 'APP_',
          doubleUnderscoreIsSeparator: false,
          toLowerCase: true,
          parse: { numbers: false, booleans: false, json: false },
          dropUndefined: false,
        },
        {
          name: 'env',
          separator: ':',
          stripPrefix: 'APP_',
          doubleUnderscoreIsSeparator: false,
          toLowerCase: true,
          parse: { numbers: false, booleans: false, json: false },
          dropUndefined: false,
        },
      ],
      [
        'teilweise gesetzte Werte korrekt kombiniert werden',
        {
          separator: '_',
          toLowerCase: true,
        },
        {
          name: undefined,
          separator: '_',
          stripPrefix: undefined,
          doubleUnderscoreIsSeparator: DEFAULT_DOUBLE_UNDERSCORE_IS_SEPARATOR,
          toLowerCase: true,
          parse: {
            json: false,
            booleans: false,
            numbers: false,
          },
          dropUndefined: DEFAULT_DROP_UNDEFINED,
        },
      ],
      [
        'parse = true zu DEFAULT_ENV_PARSE expandiert wird',
        {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          parse: true as unknown as any, // simulate user-flag-style usage
        },
        {
          name: undefined,
          separator: DEFAULT_SEPARATOR,
          stripPrefix: undefined,
          doubleUnderscoreIsSeparator: DEFAULT_DOUBLE_UNDERSCORE_IS_SEPARATOR,
          toLowerCase: DEFAULT_TO_LOWER_CASE,
          parse: DEFAULT_ENV_PARSE,
          dropUndefined: DEFAULT_DROP_UNDEFINED,
        },
      ],
      [
        'parse = false deaktiviert alle Parsing-Flags',
        {
          parse: { numbers: false, booleans: false, json: false },
        },
        {
          name: undefined,
          separator: DEFAULT_SEPARATOR,
          stripPrefix: undefined,
          doubleUnderscoreIsSeparator: DEFAULT_DOUBLE_UNDERSCORE_IS_SEPARATOR,
          toLowerCase: DEFAULT_TO_LOWER_CASE,
          parse: { numbers: false, booleans: false, json: false },
          dropUndefined: DEFAULT_DROP_UNDEFINED,
        },
      ],
    ] as const;

    it.for(tests)(
      'liefert korrekt normalisierte Optionen, wenn %s',
      ([, input, expected]) => {
        const result = normalizeEnvOptions(input as IEnvProviderOptions);
        expect(result).toEqual(expected);
      },
    );
  });

  describe('normalizeJsonFileOptions', () => {
    const tests: ReadonlyArray<
      [string, IJsonFileProviderOptions | undefined, NormalizedJsonFileOptions]
    > = [
      [
        'explizite Werte korrekt übernommen werden',
        {
          name: 'json',
          separator: ':',
        },
        {
          name: 'json',
          separator: ':',
        },
      ],
      [
        'nur separator gesetzt → name bleibt undefined',
        {
          separator: '_',
        },
        {
          name: undefined,
          separator: '_',
        },
      ],
      [
        'nur name gesetzt → separator erhält DEFAULT_SEPARATOR',
        {
          name: 'config',
        },
        {
          name: 'config',
          separator: DEFAULT_SEPARATOR,
        },
      ],
      [
        'leeres Objekt → Defaults werden gesetzt',
        {},
        {
          name: undefined,
          separator: DEFAULT_SEPARATOR,
        },
      ],
      [
        'undefined als Input → Defaults werden gesetzt',
        undefined,
        {
          name: undefined,
          separator: DEFAULT_SEPARATOR,
        },
      ],
      [
        'nicht relevante Felder werden ignoriert',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        { name: 'cfg', separator: '-', extra: 123 } as any,
        {
          name: 'cfg',
          separator: '-',
        },
      ],
    ] as const;

    it.for(tests)(
      'liefert korrekt normalisierte Optionen, wenn %s',
      ([, input, expected]) => {
        const result = normalizeJsonFileOptions(
          input as IJsonFileProviderOptions,
        );
        expect(result).toEqual(expected);
      },
    );
  });

  describe('normalizeMemoryOptions', () => {
    const tests: ReadonlyArray<
      [string, IMemoryProviderOptions | undefined, NormalizedMemoryOptions]
    > = [
      [
        'explizite Werte korrekt übernommen werden',
        {
          name: 'memory',
          separator: ':',
          flatten: true,
          includeArrayIndices: false,
          dropUndefined: false,
        },
        {
          name: 'memory',
          separator: ':',
          flatten: true,
          includeArrayIndices: false,
          dropUndefined: false,
        },
      ],
      [
        'nur separator gesetzt → übrige Felder erhalten Defaults',
        { separator: '_' },
        {
          name: undefined,
          separator: '_',
          flatten: DEFAULT_FLATTEN,
          includeArrayIndices: DEFAULT_INCLUDE_ARRAY_INDICES,
          dropUndefined: DEFAULT_DROP_UNDEFINED,
        },
      ],
      [
        'nur name gesetzt → alle anderen Felder erhalten Defaults',
        { name: 'cfg' },
        {
          name: 'cfg',
          separator: DEFAULT_SEPARATOR,
          flatten: DEFAULT_FLATTEN,
          includeArrayIndices: DEFAULT_INCLUDE_ARRAY_INDICES,
          dropUndefined: DEFAULT_DROP_UNDEFINED,
        },
      ],
      [
        'leeres Objekt → ausschließlich Defaults werden gesetzt',
        {},
        {
          name: undefined,
          separator: DEFAULT_SEPARATOR,
          flatten: DEFAULT_FLATTEN,
          includeArrayIndices: DEFAULT_INCLUDE_ARRAY_INDICES,
          dropUndefined: DEFAULT_DROP_UNDEFINED,
        },
      ],
      [
        'undefined als Input → ausschließlich Defaults werden gesetzt',
        undefined,
        {
          name: undefined,
          separator: DEFAULT_SEPARATOR,
          flatten: DEFAULT_FLATTEN,
          includeArrayIndices: DEFAULT_INCLUDE_ARRAY_INDICES,
          dropUndefined: DEFAULT_DROP_UNDEFINED,
        },
      ],
      [
        'nicht relevante Felder werden ignoriert',

        {
          name: 'x',
          flatten: false,
          includeArrayIndices: true,
          extra: 123,
        } as any,
        {
          name: 'x',
          separator: DEFAULT_SEPARATOR,
          flatten: false,
          includeArrayIndices: true,
          dropUndefined: DEFAULT_DROP_UNDEFINED,
        },
      ],
    ] as const;

    it.for(tests)(
      'liefert korrekt normalisierte Optionen, wenn %s',
      ([, input, expected]) => {
        const result = normalizeMemoryOptions(input as IMemoryProviderOptions);
        expect(result).toEqual(expected);
      },
    );
  });
});
