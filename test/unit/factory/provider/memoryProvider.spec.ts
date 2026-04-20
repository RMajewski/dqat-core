import { describe, expect, it } from 'vitest';
import { MemoryProvider } from '../../../../src/factory/provider/memoryProvider.ts';
import type { IMemoryProviderOptions } from '../../../../src/type/provider/providerOptions.ts';

const make = (input: unknown, opts?: IMemoryProviderOptions): MemoryProvider =>
  new MemoryProvider(input as Record<string, unknown>, opts);

const FEATURE_ENABLED = 'feature.enabled';

describe('MemoryProvider', () => {
  describe('Basics', () => {
    it('setzt den Default-Namen "memory" (überschreibbar)', () => {
      const providerA = make({});
      const providerB = make({}, { name: 'custom' });
      expect(providerA.name).toBe('memory');
      expect(providerB.name).toBe('custom');
    });

    it('get liefert exakten Key, unbekannte Keys → undefined', () => {
      const p = make({ a: 1, b: 2 }, { flatten: false });
      expect(p.get('a')).toBe(1);
      expect(p.get('x')).toBeUndefined();
    });

    it('list gibt flaches Objekt zurück (Kopie, kein Ref auf intern)', () => {
      const provider = make({ a: 1, b: 2 }, { flatten: false });
      const listed1 = provider.list();
      listed1.a = 999 as unknown as never;
      const listed2 = provider.list();
      expect(listed2).toEqual({ a: 1, b: 2 });
    });
  });

  describe('set', () => {
    it('setzt einen neuen Key, der anschließend mit get gelesen werden kann', () => {
      const provider = make({}, { flatten: false });

      provider.set(FEATURE_ENABLED, true);

      expect(provider.get(FEATURE_ENABLED)).toBe(true);
    });

    it('überschreibt einen bestehenden Key', () => {
      const provider = make({ 'feature.enabled': false }, { flatten: false });

      provider.set(FEATURE_ENABLED, true);

      expect(provider.get(FEATURE_ENABLED)).toBe(true);
    });

    it('list enthält einen neu gesetzten Key', () => {
      const provider = make({}, { flatten: false });

      provider.set('api.baseUrl', 'https://example.test');

      expect(provider.list()).toEqual({
        'api.baseUrl': 'https://example.test',
      });
    });

    it('list(prefix) filtert nach gesetzten Werten weiterhin korrekt', () => {
      const provider = make({}, { flatten: false });

      provider.set('db.host', 'localhost');
      provider.set('db.port', 3306);
      provider.set('api.url', 'https://example.test');

      expect(provider.list('db')).toEqual({
        'db.host': 'localhost',
        'db.port': 3306,
      });
    });

    it('verhält sich bei überschriebenen Werten konsistent mit der bisherigen Provider-Logik', () => {
      const provider = make(
        { 'feature.enabled': false, 'feature.name': 'alpha' },
        { flatten: false },
      );

      provider.set(FEATURE_ENABLED, true);

      expect(provider.get(FEATURE_ENABLED)).toBe(true);
      expect(provider.list()).toEqual({
        'feature.enabled': true,
        'feature.name': 'alpha',
      });
    });

    it('entfernt einen Key bei undefined, wenn dropUndefined aktiv ist', () => {
      const provider = make(
        { 'feature.enabled': true },
        { flatten: false, dropUndefined: true },
      );

      provider.set(FEATURE_ENABLED, undefined);

      expect(provider.get(FEATURE_ENABLED)).toBeUndefined();
      expect(provider.list()).toEqual({});
    });

    it('behält undefined bei, wenn dropUndefined deaktiviert ist', () => {
      const provider = make(
        { 'feature.enabled': true },
        { flatten: false, dropUndefined: false },
      );

      provider.set(FEATURE_ENABLED, undefined);

      const listed = provider.list();

      expect(Object.hasOwn(listed, FEATURE_ENABLED)).toBeTruthy();
      expect(listed[FEATURE_ENABLED]).toBeUndefined();
    });

    it('speichert Funktionswerte nicht', () => {
      const provider = make({ 'feature.enabled': true }, { flatten: false });

      provider.set(FEATURE_ENABLED, () => true);

      expect(provider.get(FEATURE_ENABLED)).toBeUndefined();
      expect(provider.list()).toEqual({});
    });
  });

  describe('Flatten (dot-Notation)', () => {
    it('flacht verschachtelte Objekte zu dot-Keys ab', () => {
      const provider = make({
        db: { host: 'localhost', port: 3306 },
        api: { url: 'https://x' },
      });
      expect(provider.list()).toEqual({
        'db.host': 'localhost',
        'db.port': 3306,
        'api.url': 'https://x',
      });
      expect(provider.get('db.host')).toBe('localhost');
      expect(provider.get('db.port')).toBe(3306);
    });

    it('berücksichtigt Array-Indizes wenn includeArrayIndices:true (Default)', () => {
      const provider = make({ arr: [{ x: 1 }, { x: 2 }] });
      expect(provider.list()).toEqual({ 'arr.0.x': 1, 'arr.1.x': 2 });
    });

    it('letzter Wert, wenn includeArrayIndices:false', () => {
      const provider = make(
        { arr: [{ x: 1 }, { x: 2 }] },
        { includeArrayIndices: false },
      );
      console.log('list', provider.list());
      expect(provider.list()).toEqual({ 'arr.x': 2 });
    });

    it('ignoriert Funktionen und (optional) undefined-Werte beim Einlesen', () => {
      const provider1 = make({ a: 1, b: undefined, c: () => 'fn' });
      expect(provider1.list()).toEqual({ a: 1 });

      const provider2 = make({ a: 1, b: undefined }, { dropUndefined: false });
      expect(Object.hasOwn(provider2.list(), 'b')).toBeTruthy();
    });

    it('akzeptiert ein beliebiges Primitiv als Input → wird als { value: <input> } verfügbar', () => {
      const provider = new MemoryProvider('hello');
      expect(provider.get('value')).toBe('hello');
      expect(provider.list()).toEqual({ value: 'hello' });
    });

    it('flattenObject: entries.length === 0 → leeres Objekt unter key schreiben', () => {
      const provider = new MemoryProvider({ empty: {} });
      expect(provider.list()).toEqual({ empty: {} });
      expect(provider.get('empty')).toEqual({});
    });

    it('flattenObject: makeKey gibt c zurück, wenn parent leer ist', () => {
      const provider = new MemoryProvider({ '': { z: 5 } });
      expect(provider.list()).toEqual({ z: 5 });
      expect(provider.get('z')).toBe(5);
    });
  });

  describe('Prefix-Filter & Separator', () => {
    it('list(prefix) gibt nur Keys für exakten Präfix bzw. "prefix." zurück', () => {
      const provider = make({
        db: { host: 'localhost', port: 3306 },
        api: { url: 'https://x' },
      });
      expect(provider.list('db')).toEqual({
        'db.host': 'localhost',
        'db.port': 3306,
      });
      expect(provider.list('api')).toEqual({ 'api.url': 'https://x' });
      expect(provider.list('x')).toEqual({});
    });

    it('unterstützt konfigurierbaren Separator', () => {
      const provider = make(
        { db: { host: 'localhost', port: 3306 } },
        { separator: ':' },
      );
      expect(provider.list()).toEqual({
        'db:host': 'localhost',
        'db:port': 3306,
      });
      expect(provider.list('db')).toEqual({
        'db:host': 'localhost',
        'db:port': 3306,
      });
      expect(provider.get('db:host')).toBe('localhost');
    });
  });

  describe('Flatten abschalten (flatten:false)', () => {
    it('nutzt filterFlatRecord-Pfad: übernimmt flaches Record unverändert (bis auf Filter)', () => {
      const provider = make({ a: 1, b: undefined, c: 'x' }, { flatten: false });
      expect(provider.list()).toEqual({ a: 1, c: 'x' });
      expect(provider.get('a')).toBe(1);
      expect(provider.get('b')).toBeUndefined(); // undefined wurde gedroppt
      expect(provider.get('c')).toBe('x');
    });

    it('lässt undefined stehen, wenn dropUndefined:false', () => {
      const provider = make(
        { a: undefined, b: 2 },
        { flatten: false, dropUndefined: false },
      );
      const listed = provider.list();
      expect(Object.hasOwn(listed, 'a')).toBeTruthy();
      expect(listed.a).toBeUndefined();
    });
  });
});
