import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type Mock,
} from 'vitest';

vi.mock('../../../../src/util/provider/parsing.helper', () => ({
  tryParseJson: vi.fn(),
  tryParseBoolean: vi.fn(),
  tryParseNumber: vi.fn(),
}));

import * as parsingHelper from '../../../../src/util/provider/parsing.helper.ts';
import type {
  EnvParseOptions,
  ParseFlags,
} from '../../../../src/util/provider/parsing.ts';
import {
  coerceString,
  normalizeParse,
} from '../../../../src/util/provider/parsing.ts';

describe('Provider-Guards Hilfsfunktionen', () => {
  describe('parsing.normalizeParse', () => {
    const defaultsForTest: Readonly<ParseFlags> = Object.freeze({
      numbers: true,
      booleans: false,
      json: true,
    });

    /**
     * Tuple-Struktur:
     * [fallName, inputValue, defaultsToUse, expectedOutput, assertNewReference]
     *
     * - expectedOutput: Wenn gesetzt, wird ausschließlich Gleichheit geprüft.
     * - assertNewReference: Wenn true, wird ausschließlich geprüft, dass eine neue Referenz zurückkommt.
     *   (Eigener Aspekt → eigener Eintrag.)
     */
    const singleAspectCases: ReadonlyArray<
      [
        fallName: string,
        inputValue: EnvParseOptions,
        defaultsToUse: ParseFlags,
        expectedOutput?: ParseFlags,
        assertNewReference?: boolean,
      ]
    > = [
      // input === true
      [
        'true → Werte identisch zu defaults',
        true,
        defaultsForTest,
        defaultsForTest,
      ],
      ['true → neue Referenz', true, defaultsForTest, undefined, true],

      // input === false
      [
        'false → alle Flags false (unabhängig von defaults)',
        false,
        { numbers: true, booleans: true, json: true },
        { numbers: false, booleans: false, json: false },
      ],

      // input === undefined
      [
        'undefined → alle Flags false (unabhängig von defaults)',
        undefined,
        { numbers: false, booleans: true, json: false },
        { numbers: false, booleans: false, json: false },
      ],

      // Objekt-Input: fehlende Felder kommen aus defaults
      [
        '{} → fehlende Felder aus defaults',
        {},
        defaultsForTest,
        { ...defaultsForTest },
      ],
      [
        '{ numbers:false } → booleans/json aus defaults',
        { numbers: false },
        defaultsForTest,
        { numbers: false, booleans: false, json: true },
      ],
      [
        '{ booleans:true } → numbers/json aus defaults',
        { booleans: true },
        defaultsForTest,
        { numbers: true, booleans: true, json: true },
      ],
      [
        '{ json:false } → numbers/booleans aus defaults',
        { json: false },
        defaultsForTest,
        { numbers: true, booleans: false, json: false },
      ],

      // Objekt-Input: vollständig gesetzte Felder werden 1:1 übernommen
      [
        'voll gesetzt → Übernahme 1:1 (false/true/false)',
        { numbers: false, booleans: true, json: false },
        defaultsForTest,
        { numbers: false, booleans: true, json: false },
      ],
      [
        'voll gesetzt → Übernahme 1:1 (true/false/true)',
        { numbers: true, booleans: false, json: true },
        defaultsForTest,
        { numbers: true, booleans: false, json: true },
      ],
    ] as const;

    it.for(singleAspectCases)(
      'parsing.normalizeParse: %s',
      ([, inputValue, defaultsToUse, expectedOutput, assertNewReference]) => {
        const result = normalizeParse(inputValue, defaultsToUse);

        if (assertNewReference) {
          // eigener Aspekt: nur Referenz prüfen
          expect(result).not.toBe(defaultsToUse);
          return;
        }

        // Standard-Aspekt: Ergebnisgleichheit prüfen
        expect(result).toEqual(expectedOutput);
      },
    );

    // Separat: Immutability (eigener Aspekt, nicht Teil der Falltabelle)
    it('verändert defaults nicht (Immutability)', () => {
      const snapshotOfDefaults: ParseFlags = { ...defaultsForTest };
      normalizeParse({ numbers: false }, defaultsForTest);
      expect(defaultsForTest).toEqual(snapshotOfDefaults);
    });
  });

  describe('coerceString', () => {
    const defaultFlags: Readonly<ParseFlags> = Object.freeze({
      numbers: true,
      booleans: true,
      json: true,
    });

    const mockJson = parsingHelper.tryParseJson as Mock;
    const mockBool = parsingHelper.tryParseBoolean as Mock;
    const mockNum = parsingHelper.tryParseNumber as Mock;

    beforeEach(() => {
      vi.clearAllMocks();
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    /**
     * Tuple:
     * [Fallname, input, flags, [jsonReturn, boolReturn, numReturn], expected, jsonCalls, boolCalls, numCalls, assertTrim?, assertFlags?]
     */
    const singleAspectCases = [
      [
        'JSON parsed → liefert JSON-Wert, Boolean/Number nicht aufgerufen',
        '  {"a":1}  ',
        defaultFlags,
        [
          { parsed: true, value: { a: 1 } },
          { parsed: false, value: undefined },
          { parsed: false, value: undefined },
        ],
        { a: 1 },
        1,
        0,
        0,
        false,
        false,
      ],
      [
        'Boolean parsed nach JSON false → Number nicht aufgerufen',
        '  true  ',
        defaultFlags,
        [
          { parsed: false, value: undefined },
          { parsed: true, value: true },
          { parsed: false, value: undefined },
        ],
        true,
        1,
        1,
        0,
        false,
        false,
      ],
      [
        'Number parsed nach JSON/Boolean false',
        '  42  ',
        defaultFlags,
        [
          { parsed: false, value: undefined },
          { parsed: false, value: undefined },
          { parsed: true, value: 42 },
        ],
        42,
        1,
        1,
        1,
        false,
        false,
      ],
      [
        'kein Parser erfolgreich → originaler (ungetrimmter) String',
        '  hello  ',
        defaultFlags,
        [
          { parsed: false, value: undefined },
          { parsed: false, value: undefined },
          { parsed: false, value: undefined },
        ],
        '  hello  ',
        1,
        1,
        1,
        false,
        false,
      ],
      [
        'Trim: Helper erhalten getrimmten Text',
        '   false   ',
        defaultFlags,
        [
          { parsed: false, value: undefined },
          { parsed: true, value: false },
          { parsed: false, value: undefined },
        ],
        false,
        1,
        1,
        0,
        true,
        false,
      ],
      [
        'Flags: werden unverändert an alle Helper übergeben',
        '  0  ',
        { numbers: false, booleans: false, json: false } as ParseFlags,
        [
          { parsed: false, value: undefined },
          { parsed: false, value: undefined },
          { parsed: false, value: undefined },
        ],
        '  0  ',
        1,
        1,
        1,
        false,
        true,
      ],
    ] as const;

    it.for(singleAspectCases)(
      'coerceString: %s',
      ([
        _caseName,
        inputValue,
        flagsToUse,
        [jsonReturn, boolReturn, numReturn],
        expectedResult,
        expectedJsonCalls,
        expectedBoolCalls,
        expectedNumCalls,
        assertTrim,
        assertFlags,
      ]) => {
        // Arrange: Set mock impls + optionale Assertions auf Argumente
        mockJson.mockImplementation(
          (receivedText: string, receivedFlags: ParseFlags) => {
            if (assertTrim) {
              expect(receivedText).toBe(inputValue.trim());
            }
            if (assertFlags) {
              expect(receivedFlags).toBe(flagsToUse);
            }
            return jsonReturn;
          },
        );
        mockBool.mockImplementation(
          (receivedText: string, receivedFlags: ParseFlags) => {
            if (assertTrim) {
              expect(receivedText).toBe(inputValue.trim());
            }
            if (assertFlags) {
              expect(receivedFlags).toBe(flagsToUse);
            }
            return boolReturn;
          },
        );
        mockNum.mockImplementation(
          (receivedText: string, receivedFlags: ParseFlags) => {
            if (assertTrim) {
              expect(receivedText).toBe(inputValue.trim());
            }
            if (assertFlags) {
              expect(receivedFlags).toBe(flagsToUse);
            }
            return numReturn;
          },
        );

        // Act
        const result = coerceString(inputValue, flagsToUse);

        // Assert: Ergebnis + Call-Counts (Short-Circuit)
        expect(result).toEqual(expectedResult);
        expect(mockJson).toHaveBeenCalledTimes(expectedJsonCalls);
        expect(mockBool).toHaveBeenCalledTimes(expectedBoolCalls);
        expect(mockNum).toHaveBeenCalledTimes(expectedNumCalls);
      },
    );

    // Separat: Immutability der Flags
    it('verändert die übergebenen Flags nicht (Immutability)', () => {
      const flagsBefore: ParseFlags = {
        numbers: false,
        booleans: true,
        json: false,
      };
      const snapshot: ParseFlags = { ...flagsBefore };

      mockJson.mockReturnValue({ parsed: false, value: undefined });
      mockBool.mockReturnValue({ parsed: false, value: undefined });
      mockNum.mockReturnValue({ parsed: true, value: 0 });

      coerceString('0', flagsBefore);

      expect(flagsBefore).toEqual(snapshot);
    });
  });
});
