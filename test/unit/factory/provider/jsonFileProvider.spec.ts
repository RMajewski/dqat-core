import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { JsonFileProvider } from '../../../../src/factory/provider/jsonFileProvider.ts';

/**
 * Erstellt eine temporäre JSON-Datei mit dem gegebenen Inhalt
 * und gibt den absoluten Pfad zurück.
 */
export function makeJsonFile(fileName: string, jsonValue: unknown): string {
  const temporaryDirectory = mkdtempSync(join(tmpdir(), 'dqat-json-'));
  const fullPath = join(temporaryDirectory, fileName);
  writeFileSync(fullPath, JSON.stringify(jsonValue), { encoding: 'utf-8' });
  return fullPath;
}

describe('JsonFileProvider', () => {
  describe('Basics', () => {
    it('setzt den Default-Namen auf "json"', () => {
      const filePath = makeJsonFile('config.json', { app: { name: 'dqat' } });
      const provider = new JsonFileProvider(filePath);
      expect(provider.name).toBe('json');
    });

    it('akzeptiert einen benutzerdefinierten Namen', () => {
      const filePath = makeJsonFile('config.json', {
        feature: { enabled: true },
      });
      const provider = new JsonFileProvider(filePath, { name: 'config' });
      expect(provider.name).toBe('config');
    });

    it('liefert für unbekannte Keys undefined zurück', () => {
      const filePath = makeJsonFile('config.json', { foo: 'bar' });
      const provider = new JsonFileProvider(filePath);
      expect(provider.get('no.such.key')).toBeUndefined();
    });
  });

  describe('Error Handling', () => {
    it('wirft bei nicht-JSON-Endung eine klare Fehlermeldung', () => {
      const testTemporaryDirectory = mkdtempSync(
        join(tmpdir(), 'dqat-jsonfile-'),
      );
      const wrongExtensionPath = join(
        testTemporaryDirectory,
        'does-not-matter.txt',
      );
      expect(() => new JsonFileProvider(wrongExtensionPath)).toThrow(
        /\.json"-Endung/,
      );
    });

    it('wirft bei ungültigem JSON eine klare Fehlermeldung', () => {
      const filePath = makeJsonFile('broken.json', { ok: true });
      writeFileSync(filePath, '{ invalid', { encoding: 'utf-8' }); // Datei „kaputt“ schreiben
      expect(() => new JsonFileProvider(filePath)).toThrow(/Ungültiges JSON/);
    });

    it('wirft, wenn das Root kein Plain Object ist (z. B. Array)', () => {
      const filePath = makeJsonFile('array.json', [1, 2, 3]);
      expect(() => new JsonFileProvider(filePath)).toThrow(/kein JSON-Objekt/);
    });
  });

  describe('JsonFileProvider > Flatten (dot-Notation)', () => {
    it('flacht verschachtelte Objekte zu dot-Keys ab', () => {
      const filePath = makeJsonFile('deep.json', {
        db: { host: 'localhost', port: 3306, options: { ssl: false } },
      });
      const provider = new JsonFileProvider(filePath);

      expect(provider.list()).toEqual({
        'db.host': 'localhost',
        'db.port': 3306,
        'db.options.ssl': false,
      });
    });

    it('behandelt Arrays als Blattwerte', () => {
      const filePath = makeJsonFile('arr.json', { list: { items: [1, 2, 3] } });
      const provider = new JsonFileProvider(filePath);

      expect(provider.list('list.items')).toEqual({
        'list.items.0': 1,
        'list.items.1': 2,
        'list.items.2': 3,
      });
    });
  });

  describe('Prefix-Filter & Separator', () => {
    it('filtert per Prefix: exakter Key', () => {
      const filePath = makeJsonFile('prefix.json', {
        app: { name: 'dqat', cfg: { mode: 'prod' } },
      });
      const provider = new JsonFileProvider(filePath);

      expect(provider.list('app.name')).toEqual({ 'app.name': 'dqat' });
    });

    it('filtert per Prefix: Prefix + Separator', () => {
      const filePath = makeJsonFile('prefix2.json', {
        app: { name: 'dqat', cfg: { mode: 'prod' } },
      });
      const provider = new JsonFileProvider(filePath);

      expect(provider.list('app')).toEqual({
        'app.name': 'dqat',
        'app.cfg.mode': 'prod',
      });
    });

    it('unterstützt einen benutzerdefinierten Separator ("/")', () => {
      const filePath = makeJsonFile('sep.json', { a: { b: { c: 1 } } });
      const provider = new JsonFileProvider(filePath, { separator: '/' });

      expect(provider.list('a/b')).toEqual({ 'a/b/c': 1 });
    });
  });

  describe('Immutability & Safety', () => {
    it('gibt via list() ein eingefrorenes Objekt zurück (immutable)', () => {
      const filePath = makeJsonFile('immutable.json', { x: { y: 1 } });
      const provider = new JsonFileProvider(filePath);

      const allEntries = provider.list();
      expect(Object.isFrozen(allEntries)).toBe(true);
    });

    it('liefert get() für bekannte Keys korrekt aufgelöste Werte', () => {
      const filePath = makeJsonFile('values.json', {
        clock: { offsetMs: 500 },
      });
      const provider = new JsonFileProvider(filePath);

      expect(provider.get('clock.offsetMs')).toBe(500);
    });
  });
});
