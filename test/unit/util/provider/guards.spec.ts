import { describe, expect, it } from 'vitest';
import {
  isArray,
  isNull,
  isNumberLike,
  isPlainObject,
  isString,
  isUndefined,
} from '../../../../src/util/provider/guards.ts';

describe('Provider-Guards Hilfsfunktionen', () => {
  describe('isUndefined', () => {
    it('gibt true zurück,  undefined übergeben wird', () => {
      expect(isUndefined(undefined)).toBeTruthy();
    });

    it('gibt false zurück,  ein Wert übergeben wird', () => {
      expect(isUndefined('Test')).toBeFalsy();
    });
  });

  describe('isNull', () => {
    it('gibt true zurück,  null übergeben wird', () => {
      expect(isNull(null)).toBeTruthy();
    });

    it('gibt false zurück,  ein Wert übergeben wird', () => {
      expect(isNull('Test')).toBeFalsy();
    });
  });

  describe('isArray', () => {
    it('gibt true zurück,  ein Array übergeben wird', () => {
      expect(isArray(['Test', 'Wert'])).toBeTruthy();
    });

    it('gibt false zurück,  kein Array übergeben wird', () => {
      expect(isArray('Test')).toBeFalsy();
    });
  });

  describe('isString', () => {
    it('gibt true zurück,  eine Zeichenkette übergeben wird', () => {
      expect(isString('Zeichenkette')).toBeTruthy();
    });

    it('gibt false zurück,  keine Zeichenkette übergeben wird', () => {
      expect(isString(true)).toBeFalsy();
    });
  });

  describe('isNumberLike', () => {
    const truthyTests = [
      ['Null', '0'],
      ['Ganzzahl', '42'],
      ['negative Ganzzahl', '-123'],
      ['positive Dezimalzahl', '3.14'],
      ['negative Dezimalzahl', '-0.99'],
      ['eine positive Dezimalzahl mit führenden Punkt', '.5'],
      ['eine Zahl mit führenden Leerzeichen', ' 5'],
      ['eine Zahl mit nachgestellten Leerzeichen', '7 '],
      ['eine Zahl mit führenden und nachgestellten Leerzeichen', '  9  '],
      ['eine Zahl mit einem Tab', '\t8'],
      ['eine Zahl mit dem Zeichen für eine neue Zeile', '8\n'],
      ['eine wissenschaftliche Notation ist', '1e2'],
    ];

    const falsyTests = [
      ['Buchstaben enthält', '123a'],
      ['kein Dezimalpunkt, sondern Komma verwendet', '3,14'],
      ['leer ist', ''],
      ['nur aus Leerzeichen besteht', ' '],
      ['nur ein Punkt ist', '.'],
      ['nur ein Vorzeichen ist', '-'],
      ['ein Plus als Vorzeichen hat', '+7'],
      ['eine Dezimalzahl ohne Nachkommastellen ist', '7.'],
      ['nur Vorzeichen und Dezimalpunkt hat', '-.'],

      // Keine Zeichenketten
      ['eine Zahl ist', 43],
      ['ein Objekt ist', { value: 42 }],
      ['ein Array ist', ['10', '11']],
      ['null ist', null],
      ['undefined ist', undefined],
      ['ein Boolean ist', true],
    ];

    it.for(truthyTests)('gibt true zurück,  es eine %s ist', ([_, value]) => {
      expect(isNumberLike(value)).toBe(true);
    });

    it.for(falsyTests)('gibt false zurück,  der Wert %s', ([_, value]) => {
      expect(isNumberLike(value)).toBe(false);
    });
  });

  describe('isPlainObject', () => {
    const truthyTests: ReadonlyArray<[string, unknown]> = [
      ['ein leeres Objekt ist', {}],
      ['ein Objekt mit Eigenschaft ist', { a: 1 }],
      ['ein Objekt ohne Prototyp ist', Object.create(null)],
    ];

    const falsyTests: ReadonlyArray<[string, unknown]> = [
      ['ein Array ist', []],
      ['null ist', null],
      ['undefined ist', undefined],
      ['eine Funktion ist', () => {}],
      ['eine Instanz einer Klasse ist', new (class {})()],
      ['ein Date-Objekt ist', new Date()],
      ['ein Map-Objekt ist', new Map()],
      ['ein Set-Objekt ist', new Set()],
      ['ein RegExp-Objekt ist', /abc/],
      ['eine Zeichenkette (primitiv) ist', 'abc'],
      ['eine Zahl (primitiv) ist', 42],
      ['ein Boolean (primitiv) ist', false],
      ['ein Symbol ist', Symbol('x')],
      ['ein BigInt ist', BigInt(10)],
    ];

    it.for(truthyTests)('gibt true zurück, wenn der Wert %s', ([, value]) => {
      expect(isPlainObject(value)).toBe(true);
    });

    it.for(falsyTests)('gibt false zurück, wenn der Wert %s', ([, value]) => {
      expect(isPlainObject(value)).toBe(false);
    });
  });
});
