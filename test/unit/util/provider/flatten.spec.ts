import { describe, expect, it } from 'vitest';
import {
  flattenObject,
  handleUndefined,
  isTerminal,
  makeKey,
  pushArrayChildren,
  pushObjectEntries,
  writeTerminal,
} from '../../../../src/util/provider/flatten.ts';

type StackEntry = { key: string | undefined; value: unknown };
type Out = Record<string, unknown>;

const TITLE_SPECIFIED_RESULT_IT =
  'gibt korrektes Ergebnis zurück, wenn es %s' as const;

const TITLE_SPECIFIED_RESULT =
  'gibt korrektes Ergebnis zurück, wenn %s' as const;

const expectFlattenObject = (
  out: Record<string, unknown>,
  expected: Out,
): void => {
  // Für Date/Funktion reicht Deep-Equal an den jeweiligen Stellen:
  Object.entries(expected).forEach(([k, v]) => {
    if (v instanceof Date) {
      expect(out[k]).toEqual(v);
    } else if (typeof v === 'function') {
      expect(typeof out[k]).toBe('function');
    } else {
      expect(out[k]).toEqual(v);
    }
  });
};

describe('Flatten Hilfsfunktionen', () => {
  describe('flattenObject', () => {
    describe('früher Ausstieg / Terminalwerte am Root', () => {
      const cases: ReadonlyArray<
        [
          string,
          unknown,
          {
            separator: string;
            includeArrayIndices: boolean;
            dropUndefined: boolean;
          },
          Out,
        ]
      > = [
        [
          'Zahl am Root wird unter leerem Key abgelegt',
          42,
          { separator: '.', includeArrayIndices: true, dropUndefined: false },
          { '': 42 },
        ],
        [
          'String am Root wird unter leerem Key abgelegt',
          'x',
          { separator: '.', includeArrayIndices: true, dropUndefined: false },
          { '': 'x' },
        ],
        [
          'undefined am Root wird bei dropUndefined=true verworfen',
          undefined,
          { separator: '.', includeArrayIndices: true, dropUndefined: true },
          {},
        ],
      ];

      it.for(cases)(TITLE_SPECIFIED_RESULT, ([, input, options, expected]) => {
        const out = flattenObject(input, options);
        expect(out).toEqual(expected);
      });
    });

    describe('Null-Behandlung', () => {
      const cases: ReadonlyArray<
        [
          string,
          unknown,
          {
            separator: string;
            includeArrayIndices: boolean;
            dropUndefined: boolean;
          },
          Out,
        ]
      > = [
        [
          'null am Root wird unter leerem Key abgelegt',
          null,
          { separator: '.', includeArrayIndices: true, dropUndefined: false },
          { '': null },
        ],
        [
          'null in verschachtelter Struktur bleibt null',
          { a: null },
          { separator: '.', includeArrayIndices: true, dropUndefined: false },
          { a: null },
        ],
      ];

      it.for(cases)(TITLE_SPECIFIED_RESULT, ([, input, options, expected]) => {
        const out = flattenObject(input, options);
        expect(out).toEqual(expected);
      });
    });

    describe('Arrays mit Indizes (includeArrayIndices=true)', () => {
      const cases: ReadonlyArray<
        [
          string,
          unknown,
          {
            separator: string;
            includeArrayIndices: boolean;
            dropUndefined: boolean;
          },
          Out,
        ]
      > = [
        [
          'Array am Root erzeugt Index-Keys 0..n-1',
          ['a', 'b', 'c'],
          { separator: '.', includeArrayIndices: true, dropUndefined: false },
          { '0': 'a', '1': 'b', '2': 'c' },
        ],
        [
          'verschachteltes Array nutzt Parent-Key und Indizes',
          { p: ['x', 'y'] },
          { separator: '.', includeArrayIndices: true, dropUndefined: false },
          { 'p.0': 'x', 'p.1': 'y' },
        ],
        [
          'undefined-Elemente im Array werden bei dropUndefined=true ausgelassen',
          { p: [1, undefined, 3] },
          { separator: '.', includeArrayIndices: true, dropUndefined: true },
          { 'p.0': 1, 'p.2': 3 },
        ],
        [
          'undefined-Elemente im Array bleiben erhalten bei dropUndefined=false',
          { p: [1, undefined] },
          { separator: '.', includeArrayIndices: true, dropUndefined: false },
          { 'p.0': 1, 'p.1': undefined },
        ],
      ];

      it.for(cases)(TITLE_SPECIFIED_RESULT, ([, input, options, expected]) => {
        const out = flattenObject(input, options);
        expect(out).toEqual(expected);
      });
    });

    describe('Arrays ohne Indizes (includeArrayIndices=false)', () => {
      const cases: ReadonlyArray<
        [
          string,
          unknown,
          {
            separator: string;
            includeArrayIndices: boolean;
            dropUndefined: boolean;
          },
          Out,
        ]
      > = [
        [
          'Array am Root überschreibt auf leerem Key → letzter Wert bleibt',
          ['a', 'b', 'c'],
          { separator: '.', includeArrayIndices: false, dropUndefined: false },
          { '': 'c' },
        ],
        [
          'verschachteltes Array überschreibt auf Parent-Key → letzter Wert bleibt',
          { p: [10, 20] },
          { separator: '.', includeArrayIndices: false, dropUndefined: false },
          { p: 20 },
        ],
        [
          'mit undefined-Elementen und dropUndefined=true: nur definierte Werte beeinflussen das Ergebnis',
          { p: [undefined, 'X'] },
          { separator: '.', includeArrayIndices: false, dropUndefined: true },
          { p: 'X' },
        ],
        [
          'mit undefined-Elementen und dropUndefined=false: letzter Wert (auch undefined) bleibt erhalten',
          { p: [1, undefined] },
          { separator: '.', includeArrayIndices: false, dropUndefined: false },
          { p: undefined },
        ],
      ];

      it.for(cases)(TITLE_SPECIFIED_RESULT, ([, input, options, expected]) => {
        const out = flattenObject(input, options);
        expect(out).toEqual(expected);
      });
    });

    describe('Plain-Objects', () => {
      const cases: ReadonlyArray<
        [
          string,
          unknown,
          {
            separator: string;
            includeArrayIndices: boolean;
            dropUndefined: boolean;
          },
          Out,
        ]
      > = [
        [
          'einfaches Objekt wird mit Separator geflattet',
          { a: 1, b: 'x' },
          { separator: '.', includeArrayIndices: true, dropUndefined: false },
          { a: 1, b: 'x' },
        ],
        [
          'verschachteltes Objekt wird tief geflattet',
          { a: { b: 2 } },
          { separator: '.', includeArrayIndices: true, dropUndefined: false },
          { 'a.b': 2 },
        ],
        [
          'benutzerdefinierter Separator "/" wird respektiert',
          { a: { b: { c: 3 } } },
          { separator: '/', includeArrayIndices: true, dropUndefined: false },
          { 'a/b/c': 3 },
        ],
        [
          'undefined-Properties werden bei dropUndefined=true ausgelassen',
          { a: undefined, b: 1 },
          { separator: '.', includeArrayIndices: true, dropUndefined: true },
          { b: 1 },
        ],
        [
          'undefined-Properties bleiben bei dropUndefined=false erhalten',
          { a: undefined },
          { separator: '.', includeArrayIndices: true, dropUndefined: false },
          { a: undefined },
        ],
      ];

      it.for(cases)(TITLE_SPECIFIED_RESULT, ([, input, options, expected]) => {
        const out = flattenObject(input, options);
        expect(out).toEqual(expected);
      });
    });

    describe('Nicht-Plain-Objects (als Terminal behandeln)', () => {
      const date = new Date(0);
      const cases: ReadonlyArray<
        [
          string,
          unknown,
          {
            separator: string;
            includeArrayIndices: boolean;
            dropUndefined: boolean;
          },
          Out,
        ]
      > = [
        [
          'Date-Instanz wird als Terminalwert geschrieben',
          { d: date },
          { separator: '.', includeArrayIndices: true, dropUndefined: false },
          { d: date },
        ],
        [
          'Funktion wird als Terminalwert geschrieben',
          {
            f: function fn() {
              /* noop */
            },
          },
          { separator: '.', includeArrayIndices: true, dropUndefined: false },
          { f: expect.any(Function) as unknown as unknown },
        ],
      ];

      it.for(cases)(TITLE_SPECIFIED_RESULT, ([, input, options, expected]) => {
        const out = flattenObject(input, options);
        expectFlattenObject(out, expected);
      });
    });
  });

  describe('isTerminal', () => {
    const truthyTests: ReadonlyArray<[string, unknown]> = [
      ['null ist', null],
      ['undefined ist', undefined],
      ['eine Zahl (primitiv) ist', 42],
      ['eine Zeichenkette (primitiv) ist', 'abc'],
      ['ein Boolean (primitiv) ist', false],
      ['ein Symbol ist', Symbol('x')],
      ['ein BigInt ist', BigInt(10)],
      ['eine Funktion ist', () => {}],
      ['ein Date-Objekt ist', new Date()],
      ['ein RegExp-Objekt ist', /abc/],
      ['ein Map-Objekt ist', new Map()],
      ['ein Set-Objekt ist', new Set()],
      [
        'eine Instanz einer Klasse ist',
        new (class Example {
          v = 1;
        })(),
      ],
      ['ein TypedArray ist', new Uint8Array([1, 2, 3])],
    ];

    // Nicht terminal = false (nur Arrays und Plain-Objects)

    const falsyTests: ReadonlyArray<[string, unknown]> = [
      ['ein leeres Array ist', []],
      ['ein Array mit Werten ist', [1, 2, 3]],
      ['ein leeres Plain-Object ist', {}],
      ['ein Plain-Object mit Eigenschaft ist', { a: 1 }],
      ['ein Objekt ohne Prototyp ist', Object.create(null)],
    ];

    it.for(truthyTests)('gibt true zurück, wenn der Wert %s', ([, value]) => {
      expect(isTerminal(value)).toBe(true);
    });

    it.for(falsyTests)('gibt false zurück, wenn der Wert %s', ([, value]) => {
      expect(isTerminal(value)).toBe(false);
    });
  });

  describe('writeTerminal', () => {
    const truthyTests: ReadonlyArray<
      [
        string,
        Record<string, unknown>,
        string | undefined,
        unknown,
        boolean,
        Record<string, unknown>,
      ]
    > = [
      [
        'den Wert unter dem angegebenen Schlüssel speichert',
        {},
        'foo',
        42,
        false,
        { foo: 42 },
      ],
      [
        'den Wert unter einem leeren Schlüssel speichert, wenn kein Schlüssel angegeben ist',
        {},
        undefined,
        'bar',
        false,
        { '': 'bar' },
      ],
      [
        'den Wert `undefined` speichert, wenn `dropUndefined` false ist',
        {},
        'x',
        undefined,
        false,
        { x: undefined },
      ],
    ];

    const falsyTests: ReadonlyArray<
      [
        string,
        Record<string, unknown>,
        string | undefined,
        unknown,
        boolean,
        Record<string, unknown>,
      ]
    > = [
      [
        'nichts schreibt, wenn der Wert `undefined` ist und `dropUndefined` true',
        {},
        'y',
        undefined,
        true,
        {},
      ],
    ];

    it.for(truthyTests)(
      TITLE_SPECIFIED_RESULT,
      ([, out, key, value, dropUndefined, expected]) => {
        writeTerminal(out, key, value, dropUndefined);
        expect(out).toEqual(expected);
      },
    );

    it.for(falsyTests)(
      TITLE_SPECIFIED_RESULT,
      ([, out, key, value, dropUndefined, expected]) => {
        writeTerminal(out, key, value, dropUndefined);
        expect(out).toEqual(expected);
      },
    );
  });

  describe('handleUndefined', () => {
    const truthyTests: ReadonlyArray<
      [
        string,
        Record<string, unknown>,
        string | undefined,
        boolean,
        Record<string, unknown>,
      ]
    > = [
      [
        'den Wert `undefined` unter dem angegebenen Schlüssel speichert, wenn `dropUndefined` false ist',
        {},
        'foo',
        false,
        { foo: undefined },
      ],
      [
        'den Wert `undefined` unter einem leeren Schlüssel speichert, wenn kein Schlüssel angegeben ist und `dropUndefined` false ist',
        {},
        undefined,
        false,
        { '': undefined },
      ],
    ];

    const falsyTests: ReadonlyArray<
      [
        string,
        Record<string, unknown>,
        string | undefined,
        boolean,
        Record<string, unknown>,
      ]
    > = [
      [
        'keine Änderung vornimmt, wenn `dropUndefined` true ist (mit Schlüssel)',
        { existing: 1 },
        'bar',
        true,
        { existing: 1 },
      ],
      [
        'keine Änderung vornimmt, wenn `dropUndefined` true ist (ohne Schlüssel)',
        { existing: 1 },
        undefined,
        true,
        { existing: 1 },
      ],
    ];

    it.for(truthyTests)(
      TITLE_SPECIFIED_RESULT,
      ([, out, key, dropUndefined, expected]) => {
        handleUndefined(out, key, dropUndefined);
        expect(out).toEqual(expected);
      },
    );

    it.for(falsyTests)(
      TITLE_SPECIFIED_RESULT,
      ([, out, key, dropUndefined, expected]) => {
        handleUndefined(out, key, dropUndefined);
        expect(out).toEqual(expected);
      },
    );
  });

  describe('pushArrayChildren', () => {
    describe('leeres Array', () => {
      const cases: ReadonlyArray<
        [string, string | undefined, unknown[], boolean, string, StackEntry[]]
      > = [
        [
          'einen Eintrag mit parentKey und [] auf den Stack schiebt',
          'root',
          [],
          true,
          '.',
          [{ key: 'root', value: [] }],
        ],
        [
          'einen Eintrag mit undefined-Key und [] auf den Stack schiebt, wenn parentKey fehlt',
          undefined,
          [],
          false,
          '.',
          [{ key: undefined, value: [] }],
        ],
      ];

      it.for(cases)(
        TITLE_SPECIFIED_RESULT_IT,
        ([, parentKey, arr, includeArrayIndices, separator, expected]) => {
          const stack: StackEntry[] = [];
          pushArrayChildren(
            stack,
            parentKey,
            arr,
            includeArrayIndices,
            separator,
          );

          expect(stack.length).toBe(expected.length);
          expect(stack).toEqual(expected);
        },
      );
    });

    describe('mit Indizes (includeArrayIndices = true)', () => {
      const cases: ReadonlyArray<
        [string, string | undefined, unknown[], boolean, string, StackEntry[]]
      > = [
        [
          'rückwärts pusht und Keys mit Index bildet (Standard-Separator ".")',
          'p',
          ['a', 'b', 'c'],
          true,
          '.',
          [
            { key: 'p.2', value: 'c' },
            { key: 'p.1', value: 'b' },
            { key: 'p.0', value: 'a' },
          ],
        ],
        [
          'bei parentKey = undefined reine Index-Keys erzeugt',
          undefined,
          ['x', 'y'],
          true,
          '.',
          [
            { key: '1', value: 'y' },
            { key: '0', value: 'x' },
          ],
        ],
        [
          'einen benutzerdefinierten Separator respektiert',
          'root',
          [10, 20],
          true,
          '/',
          [
            { key: 'root/1', value: 20 },
            { key: 'root/0', value: 10 },
          ],
        ],
      ];

      it.for(cases)(
        TITLE_SPECIFIED_RESULT_IT,
        ([, parentKey, arr, includeArrayIndices, separator, expected]) => {
          const stack: StackEntry[] = [];
          pushArrayChildren(
            stack,
            parentKey,
            arr,
            includeArrayIndices,
            separator,
          );

          expect(stack.length).toBe(expected.length);
          expect(stack).toEqual(expected);
        },
      );
    });

    describe('ohne Indizes (includeArrayIndices = false)', () => {
      const cases: ReadonlyArray<
        [string, string | undefined, unknown[], boolean, string, StackEntry[]]
      > = [
        [
          'rückwärts pusht und denselben parentKey für alle Kinder verwendet',
          'p',
          ['a', 'b', 'c'],
          false,
          '.',
          [
            { key: 'p', value: 'c' },
            { key: 'p', value: 'b' },
            { key: 'p', value: 'a' },
          ],
        ],
        [
          'bei fehlendem parentKey undefined als Key belässt',
          undefined,
          [1, 2],
          false,
          '.',
          [
            { key: undefined, value: 2 },
            { key: undefined, value: 1 },
          ],
        ],
      ];

      it.for(cases)(
        TITLE_SPECIFIED_RESULT_IT,
        ([, parentKey, arr, includeArrayIndices, separator, expected]) => {
          const stack: StackEntry[] = [];
          pushArrayChildren(
            stack,
            parentKey,
            arr,
            includeArrayIndices,
            separator,
          );

          expect(stack.length).toBe(expected.length);
          expect(stack).toEqual(expected);
        },
      );
    });

    describe('Stack-Verhalten', () => {
      const cases: ReadonlyArray<
        [
          string,
          StackEntry[],
          string | undefined,
          unknown[],
          boolean,
          string,
          StackEntry[],
        ]
      > = [
        [
          'bestehende Einträge am Stack-Anfang unverändert lässt',
          [{ key: 'pre', value: 'keep' }],
          'p',
          [0, 1],
          true,
          '.',
          [
            { key: 'pre', value: 'keep' },
            { key: 'p.1', value: 1 },
            { key: 'p.0', value: 0 },
          ],
        ],
      ];

      it.for(cases)(
        TITLE_SPECIFIED_RESULT_IT,
        ([
          ,
          initial,
          parentKey,
          arr,
          includeArrayIndices,
          separator,
          expected,
        ]) => {
          const stack: StackEntry[] = [...initial];
          pushArrayChildren(
            stack,
            parentKey,
            arr,
            includeArrayIndices,
            separator,
          );

          expect(stack.length).toBe(expected.length);
          expect(stack).toEqual(expected);
        },
      );
    });
  });

  describe('pushObjectEntries', () => {
    describe('leeres Objekt', () => {
      const cases: ReadonlyArray<
        [
          string,
          string | undefined,
          Record<string, unknown>,
          string,
          StackEntry[],
        ]
      > = [
        [
          'einen Eintrag mit parentKey und {} auf den Stack schiebt',
          'root',
          {},
          '.',
          [{ key: 'root', value: {} }],
        ],
        [
          'einen Eintrag mit undefined-Key und {} auf den Stack schiebt, wenn parentKey fehlt',
          undefined,
          {},
          '.',
          [{ key: undefined, value: {} }],
        ],
      ];

      it.for(cases)(
        TITLE_SPECIFIED_RESULT_IT,
        ([, parentKey, obj, separator, expected]) => {
          const stack: StackEntry[] = [];
          pushObjectEntries(stack, parentKey, obj, separator);

          expect(stack.length).toBe(expected.length);
          expect(stack).toEqual(expected);
        },
      );
    });

    describe('Standardverhalten (Einfügereihenfolge, rückwärts pushen)', () => {
      const cases: ReadonlyArray<
        [
          string,
          string | undefined,
          Record<string, unknown>,
          string,
          StackEntry[],
        ]
      > = [
        [
          'rückwärts pusht und Keys mit Separator bildet (".")',
          'p',
          { a: 1, b: 2, c: 3 },
          '.',
          [
            { key: 'p.c', value: 3 },
            { key: 'p.b', value: 2 },
            { key: 'p.a', value: 1 },
          ],
        ],
        [
          'bei parentKey = undefined nur Kind-Keys ohne Präfix erzeugt',
          undefined,
          { x: 'X', y: 'Y' },
          '.',
          [
            { key: 'y', value: 'Y' },
            { key: 'x', value: 'X' },
          ],
        ],
      ];

      it.for(cases)(
        TITLE_SPECIFIED_RESULT_IT,
        ([, parentKey, obj, separator, expected]) => {
          const stack: StackEntry[] = [];
          pushObjectEntries(stack, parentKey, obj, separator);

          expect(stack.length).toBe(expected.length);
          expect(stack).toEqual(expected);
        },
      );
    });

    describe('Separator-Verhalten', () => {
      const cases: ReadonlyArray<
        [
          string,
          string | undefined,
          Record<string, unknown>,
          string,
          StackEntry[],
        ]
      > = [
        [
          'einen benutzerdefinierten Separator respektiert ("/")',
          'root',
          { k1: 10, k2: 20 },
          '/',
          [
            { key: 'root/k2', value: 20 },
            { key: 'root/k1', value: 10 },
          ],
        ],
      ];

      it.for(cases)(
        TITLE_SPECIFIED_RESULT_IT,
        ([, parentKey, obj, separator, expected]) => {
          const stack: StackEntry[] = [];
          pushObjectEntries(stack, parentKey, obj, separator);

          expect(stack.length).toBe(expected.length);
          expect(stack).toEqual(expected);
        },
      );
    });

    describe('Stack-Verhalten', () => {
      const cases: ReadonlyArray<
        [
          string,
          StackEntry[],
          string | undefined,
          Record<string, unknown>,
          string,
          StackEntry[],
        ]
      > = [
        [
          'vorhandene Stack-Einträge am Anfang unverändert lässt',
          [{ key: 'pre', value: 'keep' }],
          'p',
          { first: 1, second: 2 },
          '.',
          [
            { key: 'pre', value: 'keep' },
            { key: 'p.second', value: 2 },
            { key: 'p.first', value: 1 },
          ],
        ],
      ];

      it.for(cases)(
        TITLE_SPECIFIED_RESULT_IT,
        ([, initial, parentKey, obj, separator, expected]) => {
          const stack: StackEntry[] = [...initial];
          pushObjectEntries(stack, parentKey, obj, separator);

          expect(stack.length).toBe(expected.length);
          expect(stack).toEqual(expected);
        },
      );
    });

    describe('Schlüssel, die wie Zahlen aussehen', () => {
      const cases: ReadonlyArray<
        [
          string,
          string | undefined,
          Record<string, unknown>,
          string,
          StackEntry[],
        ]
      > = [
        [
          'Zahlenschlüssel werden als Strings behandelt und korrekt kombiniert',
          'p',
          { '0': 'x', '1': 'y' },
          '.',
          [
            { key: 'p.1', value: 'y' },
            { key: 'p.0', value: 'x' },
          ],
        ],
      ];

      it.for(cases)(
        TITLE_SPECIFIED_RESULT_IT,
        ([, parentKey, obj, separator, expected]) => {
          const stack: StackEntry[] = [];
          pushObjectEntries(stack, parentKey, obj, separator);

          expect(stack.length).toBe(expected.length);
          expect(stack).toEqual(expected);
        },
      );
    });
  });

  describe('makeKey', () => {
    const cases: ReadonlyArray<
      [string, string | undefined, string, string, string]
    > = [
      [
        'Parent vorhanden → Parent, Separator und Child werden kombiniert',
        'root',
        'child',
        '.',
        'root.child',
      ],
      [
        'Parent fehlt → nur Child wird zurückgegeben',
        undefined,
        'item',
        '.',
        'item',
      ],
      [
        'benutzerdefinierter Separator "/" wird respektiert',
        'a',
        'b',
        '/',
        'a/b',
      ],
      ['Separator "-" wird korrekt verwendet', 'foo', 'bar', '-', 'foo-bar'],
      [
        'Parent ist leerer String → wird wie „fehlt“ behandelt',
        '',
        'key',
        '.',
        'key',
      ],
      [
        'Child kann selbst Separator enthalten, ohne verändert zu werden',
        'base',
        'sub.part',
        '.',
        'base.sub.part',
      ],
    ];

    it.for(cases)(
      TITLE_SPECIFIED_RESULT,
      ([, parent, current, separator, expected]) => {
        const result = makeKey(parent, current, separator);
        expect(result).toBe(expected);
      },
    );
  });
});
