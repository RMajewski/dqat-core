import { describe, expect, it } from 'vitest';
import {
  tryParseBoolean,
  tryParseJson,
  tryParseNumber,
} from '../../../../src/util/provider/parsing.helper.ts';
import type { ParseFlags } from '../../../../src/util/provider/parsing.ts';

describe('Parsing Hilfsfunktionen', () => {
  describe('tryParseBoolean', () => {
    const tests: ReadonlyArray<
      [string, string, ParseFlags, { parsed: boolean; value?: boolean }]
    > = [
      [
        '"true" erkannt wird',
        'true',
        { numbers: false, booleans: true, json: false },
        { parsed: true, value: true },
      ],
      [
        '"TRUE" erkannt wird',
        'TRUE',
        { numbers: false, booleans: true, json: false },
        { parsed: true, value: true },
      ],
      [
        '"TrUe" erkannt wird',
        'TrUe',
        { numbers: false, booleans: true, json: false },
        { parsed: true, value: true },
      ],
      [
        '"false" erkannt wird',
        'false',
        { numbers: false, booleans: true, json: false },
        { parsed: true, value: false },
      ],
      [
        '"FALSE" erkannt wird',
        'FALSE',
        { numbers: false, booleans: true, json: false },
        { parsed: true, value: false },
      ],
      [
        '"FaLsE" erkannt wird',
        'FaLsE',
        { numbers: false, booleans: true, json: false },
        { parsed: true, value: false },
      ],
      [
        'ein leerer String ist',
        '',
        { numbers: false, booleans: true, json: false },
        { parsed: false },
      ],
      [
        '"0" ist',
        '0',
        { numbers: false, booleans: true, json: false },
        { parsed: false },
      ],
      [
        '"1" ist',
        '1',
        { numbers: false, booleans: true, json: false },
        { parsed: false },
      ],
      [
        '"yes" ist',
        'yes',
        { numbers: false, booleans: true, json: false },
        { parsed: false },
      ],
      [
        '"no" ist',
        'no',
        { numbers: false, booleans: true, json: false },
        { parsed: false },
      ],
      [
        '"on" ist',
        'on',
        { numbers: false, booleans: true, json: false },
        { parsed: false },
      ],
      [
        '"off" ist',
        'off',
        { numbers: false, booleans: true, json: false },
        { parsed: false },
      ],
      [
        '" True " (mit Leerzeichen) ist',
        ' True ',
        { numbers: false, booleans: true, json: false },
        { parsed: false },
      ],
      [
        '"falsey" ist',
        'falsey',
        { numbers: false, booleans: true, json: false },
        { parsed: false },
      ],
      [
        '"truthy" ist',
        'truthy',
        { numbers: false, booleans: true, json: false },
        { parsed: false },
      ],
      [
        '" true" (mit führendem Leerzeichen) ist',
        ' true',
        { numbers: false, booleans: true, json: false },
        { parsed: false },
      ],
      [
        '"false " (mit nachgestelltem Leerzeichen) ist',
        'false ',
        { numbers: false, booleans: true, json: false },
        { parsed: false },
      ],
      [
        '"  true  " (mit Leerzeichen) ist',
        '  true  ',
        { numbers: false, booleans: true, json: false },
        { parsed: false },
      ],
      [
        '"\\tfalse" (mit Tabulator) ist',
        '\tfalse',
        { numbers: false, booleans: true, json: false },
        { parsed: false },
      ],
      [
        '"true\\n" (mit Zeilenumbruch) ist',
        'true\n',
        { numbers: false, booleans: true, json: false },
        { parsed: false },
      ],
      [
        '"true" bei deaktiviertem Flag ist',
        'true',
        { numbers: false, booleans: false, json: false },
        { parsed: false },
      ],
      [
        '"false" bei deaktiviertem Flag ist',
        'false',
        { numbers: false, booleans: false, json: false },
        { parsed: false },
      ],
      [
        'beliebiger Text bei deaktiviertem Flag ist',
        'irgendwas',
        { numbers: false, booleans: false, json: false },
        { parsed: false },
      ],
    ] as const;

    it.for(tests)(
      'liefert korrektes Ergebnis, wenn %s',
      ([, text, flags, expected]) => {
        const result = tryParseBoolean(text, flags);
        expect(result.parsed).toBe(expected.parsed);
        expect(result.value).toBe(expected.value);
      },
    );
  });

  describe('tryParseNumber', () => {
    const tests: ReadonlyArray<
      [string, string, ParseFlags, { parsed: boolean; value?: number }]
    > = [
      [
        '"0" erkannt wird',
        '0',
        { numbers: true, booleans: false, json: false },
        { parsed: true, value: 0 },
      ],
      [
        '"42" erkannt wird',
        '42',
        { numbers: true, booleans: false, json: false },
        { parsed: true, value: 42 },
      ],
      [
        '"-17" erkannt wird',
        '-17',
        { numbers: true, booleans: false, json: false },
        { parsed: true, value: -17 },
      ],
      [
        '"3.14" erkannt wird',
        '3.14',
        { numbers: true, booleans: false, json: false },
        { parsed: true, value: 3.14 },
      ],
      [
        '"-0.5" erkannt wird',
        '-0.5',
        { numbers: true, booleans: false, json: false },
        { parsed: true, value: -0.5 },
      ],
      [
        '"007" erkannt wird',
        '007',
        { numbers: true, booleans: false, json: false },
        { parsed: true, value: 7 },
      ],
      [
        '"0.0001" erkannt wird',
        '0.0001',
        { numbers: true, booleans: false, json: false },
        { parsed: true, value: 0.0001 },
      ],
      [
        'eine Zahl mit Leerzeichen ist',
        ' 42 ',
        { numbers: true, booleans: false, json: false },
        { parsed: true, value: 42 },
      ],
      [
        'eine leere Zeichenkette ist',
        '',
        { numbers: true, booleans: false, json: false },
        { parsed: false },
      ],
      [
        'nur Leerzeichen enthält',
        '  ',
        { numbers: true, booleans: false, json: false },
        { parsed: false },
      ],
      [
        'ein Textwert ist',
        'abc',
        { numbers: true, booleans: false, json: false },
        { parsed: false },
      ],
      [
        'eine gemischte Zeichenkette ist',
        '123abc',
        { numbers: true, booleans: false, json: false },
        { parsed: false },
      ],
      [
        'ein Punkt allein ist',
        '.',
        { numbers: true, booleans: false, json: false },
        { parsed: false },
      ],
      [
        'ein Minus allein ist',
        '-',
        { numbers: true, booleans: false, json: false },
        { parsed: false },
      ],
      [
        '"NaN" ist',
        'NaN',
        { numbers: true, booleans: false, json: false },
        { parsed: false },
      ],
      [
        '"Infinity" ist',
        'Infinity',
        { numbers: true, booleans: false, json: false },
        { parsed: false },
      ],
      [
        '"42" bei deaktiviertem Flag ist',
        '42',
        { numbers: false, booleans: false, json: false },
        { parsed: false },
      ],
      [
        '"3.14" bei deaktiviertem Flag ist',
        '3.14',
        { numbers: false, booleans: false, json: false },
        { parsed: false },
      ],
      [
        'beliebiger Text bei deaktiviertem Flag ist',
        'abc',
        { numbers: false, booleans: false, json: false },
        { parsed: false },
      ],
    ] as const;

    it.for(tests)(
      'liefert korrektes Ergebnis, wenn %s',
      ([, text, flags, expected]) => {
        const result = tryParseNumber(text, flags);
        expect(result.parsed).toBe(expected.parsed);
        expect(result.value).toBe(expected.value);
      },
    );
  });

  describe('tryParseJson', () => {
    const tests: ReadonlyArray<
      [string, string, ParseFlags, { parsed: boolean; value?: unknown }]
    > = [
      [
        'ein leeres Objekt "{}" ist',
        '{}',
        { numbers: false, booleans: false, json: true },
        { parsed: true, value: {} },
      ],
      [
        'ein Objekt mit Property ist',
        '{"a":1}',
        { numbers: false, booleans: false, json: true },
        { parsed: true, value: { a: 1 } },
      ],
      [
        'ein leeres Array "[]" ist',
        '[]',
        { numbers: false, booleans: false, json: true },
        { parsed: true, value: [] },
      ],
      [
        'ein Array mit Werten ist',
        '[1,"x",true,null]',
        { numbers: false, booleans: false, json: true },
        { parsed: true, value: [1, 'x', true, null] },
      ],
      [
        'das Literal "null" ist',
        'null',
        { numbers: false, booleans: false, json: true },
        { parsed: true, value: null },
      ],
      [
        'das Literal "true" ist',
        'true',
        { numbers: false, booleans: false, json: true },
        { parsed: true, value: true },
      ],
      [
        'das Literal "false" ist',
        'false',
        { numbers: false, booleans: false, json: true },
        { parsed: true, value: false },
      ],
      [
        'ein leerer JSON-String \'""\' ist',
        '""',
        { numbers: false, booleans: false, json: true },
        { parsed: true, value: '' },
      ],
      [
        'ein JSON-String \'"abc"\' ist',
        '"abc"',
        { numbers: false, booleans: false, json: true },
        { parsed: true, value: 'abc' },
      ],
      [
        'ein JSON-String mit Escapes ist',
        '"a\\n\\t\\"b\\""',
        { numbers: false, booleans: false, json: true },
        { parsed: true, value: 'a\n\t"b"' },
      ],
      [
        'ein fehlerhaftes Objekt ist',
        '{"a":}',
        { numbers: false, booleans: false, json: true },
        { parsed: false },
      ],
      [
        'ein fehlerhaftes Array ist',
        '[1,]',
        { numbers: false, booleans: false, json: true },
        { parsed: false },
      ],
      [
        'ein nicht geschlossener String ist',
        '"abc',
        { numbers: false, booleans: false, json: true },
        { parsed: false },
      ],
      [
        'eine leere Zeichenkette ist',
        '',
        { numbers: false, booleans: false, json: true },
        { parsed: false },
      ],
      [
        'nur Leerzeichen sind',
        '   ',
        { numbers: false, booleans: false, json: true },
        { parsed: false },
      ],
      [
        'eine Zahl ohne Quotes ist',
        '123',
        { numbers: false, booleans: false, json: true },
        { parsed: false },
      ],
      [
        'ein Text ohne Quotes ist',
        'abc',
        { numbers: false, booleans: false, json: true },
        { parsed: false },
      ],
      [
        'ein String mit einfachen Quotes ist',
        "'abc'",
        { numbers: false, booleans: false, json: true },
        { parsed: false },
      ],
      [
        'ein Objekt mit führendem Leerzeichen ist (kein Kandidat)',
        ' {"a":1}',
        { numbers: false, booleans: false, json: true },
        { parsed: false },
      ],
      [
        'ein Array mit führendem Leerzeichen ist (kein Kandidat)',
        ' [1,2]',
        { numbers: false, booleans: false, json: true },
        { parsed: false },
      ],
      [
        '"{}" bei deaktiviertem Flag ist',
        '{}',
        { numbers: false, booleans: false, json: false },
        { parsed: false },
      ],
      [
        '\'"abc"\' bei deaktiviertem Flag ist',
        '"abc"',
        { numbers: false, booleans: false, json: false },
        { parsed: false },
      ],
      [
        '"null" bei deaktiviertem Flag ist',
        'null',
        { numbers: false, booleans: false, json: false },
        { parsed: false },
      ],
    ] as const;

    it.for(tests)(
      'liefert korrektes Ergebnis, wenn %s',
      ([, text, flags, expected]) => {
        const result = tryParseJson(text, flags);

        expect(result.parsed).toBe(expected.parsed);

        // Wertprüfung je nach Typ: primitive via toBe, Arrays/Objekte via toEqual, undefined via toBe(undefined)
        if ('value' in expected) {
          const ev = expected.value as unknown;
          if (Array.isArray(ev) || (ev !== null && typeof ev === 'object')) {
            expect(result.value).toEqual(ev);
          } else {
            expect(result.value).toBe(
              ev as unknown as string | number | boolean | null | undefined,
            );
          }
        } else {
          expect(result.value).toBe(undefined);
        }
      },
    );
  });
});
