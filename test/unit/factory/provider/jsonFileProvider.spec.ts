import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { JsonFileProvider } from '../../../../src/factory/provider/jsonFileProvider.ts';
import { makeJsonFile } from '../../../util/jsonFileProvider.helper.ts';

const JSON_TEMP_PATH = 'dqat-json-file-provider' as const;

describe('JsonFileProvider', () => {
  describe('Basics', () => {
    it('setzt den Default-Namen auf "json"', () => {
      const filePath = makeJsonFile('config.json', JSON_TEMP_PATH, {
        app: { name: 'dqat' },
      });
      const provider = new JsonFileProvider(filePath);
      expect(provider.name).toBe('json');
    });

    it('akzeptiert einen benutzerdefinierten Namen', () => {
      const filePath = makeJsonFile('config.json', JSON_TEMP_PATH, {
        feature: { enabled: true },
      });
      const provider = new JsonFileProvider(filePath, { name: 'config' });
      expect(provider.name).toBe('config');
    });

    it('liefert für unbekannte Keys undefined zurück', () => {
      const filePath = makeJsonFile('config.json', JSON_TEMP_PATH, {
        foo: 'bar',
      });
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
      const filePath = makeJsonFile('broken.json', JSON_TEMP_PATH, {
        ok: true,
      });
      writeFileSync(filePath, '{ invalid', { encoding: 'utf-8' }); // Datei „kaputt“ schreiben
      expect(() => new JsonFileProvider(filePath)).toThrow(/Ungültiges JSON/);
    });

    it('wirft, wenn das Root kein Plain Object ist (z. B. Array)', () => {
      const filePath = makeJsonFile('array.json', JSON_TEMP_PATH, [1, 2, 3]);
      expect(() => new JsonFileProvider(filePath)).toThrow(/kein JSON-Objekt/);
    });
  });

  describe('JsonFileProvider > Flatten (dot-Notation)', () => {
    it('flacht verschachtelte Objekte zu dot-Keys ab', () => {
      const filePath = makeJsonFile('deep.json', JSON_TEMP_PATH, {
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
      const filePath = makeJsonFile('arr.json', JSON_TEMP_PATH, {
        list: { items: [1, 2, 3] },
      });
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
      const filePath = makeJsonFile('prefix.json', JSON_TEMP_PATH, {
        app: { name: 'dqat', cfg: { mode: 'prod' } },
      });
      const provider = new JsonFileProvider(filePath);

      expect(provider.list('app.name')).toEqual({ 'app.name': 'dqat' });
    });

    it('filtert per Prefix: Prefix + Separator', () => {
      const filePath = makeJsonFile('prefix2.json', JSON_TEMP_PATH, {
        app: { name: 'dqat', cfg: { mode: 'prod' } },
      });
      const provider = new JsonFileProvider(filePath);

      expect(provider.list('app')).toEqual({
        'app.name': 'dqat',
        'app.cfg.mode': 'prod',
      });
    });

    it('unterstützt einen benutzerdefinierten Separator ("/")', () => {
      const filePath = makeJsonFile('sep.json', JSON_TEMP_PATH, {
        a: { b: { c: 1 } },
      });
      const provider = new JsonFileProvider(filePath, { separator: '/' });

      expect(provider.list('a/b')).toEqual({ 'a/b/c': 1 });
    });
  });

  describe('Immutability & Safety', () => {
    it('gibt via list() ein eingefrorenes Objekt zurück (immutable)', () => {
      const filePath = makeJsonFile('immutable.json', JSON_TEMP_PATH, {
        x: { y: 1 },
      });
      const provider = new JsonFileProvider(filePath);

      const allEntries = provider.list();
      expect(Object.isFrozen(allEntries)).toBe(true);
    });

    it('liefert get() für bekannte Keys korrekt aufgelöste Werte', () => {
      const filePath = makeJsonFile('values.json', JSON_TEMP_PATH, {
        clock: { offsetMs: 500 },
      });
      const provider = new JsonFileProvider(filePath);

      expect(provider.get('clock.offsetMs')).toBe(500);
    });
  });
});
