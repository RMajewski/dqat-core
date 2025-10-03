import { describe, expect, it } from 'vitest';
import { EnvProvider } from '../../../../src/factory/provider/envProvider';

const makeEnvProvider = (
  environmentObject: Record<string, string | undefined>,
  options?: ConstructorParameters<typeof EnvProvider>[1],
): EnvProvider => new EnvProvider(environmentObject, options);

describe('EnvProvider', () => {
  describe('Basics', () => {
    it('setzt den Default-Namen auf "env"', () => {
      const provider = makeEnvProvider({});
      expect(provider.name).toBe('env');
    });

    it('akzeptiert einen benutzerdefinierten Namen', () => {
      const provider = makeEnvProvider({}, { name: 'environment' });
      expect(provider.name).toBe('environment');
    });

    it('liefert für unbekannte Keys undefined zurück', () => {
      const provider = makeEnvProvider({});
      expect(provider.get('does.not.exist')).toBeUndefined();
    });

    it('liefert undefined zurück, wenn kein Schlüssel angegeben wurde', () => {
      const provider = makeEnvProvider({}, { name: 'environment' });
      expect(provider.get('')).toBeUndefined();
    });
  });

  describe('Flatten (dot-Notation)', () => {
    it('mappt DQ_DB__HOST → db.host (stripPrefix, __→".", lowercase)', () => {
      const environmentObject = { DQ_DB__HOST: 'localhost' };
      const provider = makeEnvProvider(environmentObject, {
        stripPrefix: 'DQ_',
      });

      expect(provider.get('db.host')).toBe('localhost');
    });

    it('mappt mehrere Werte auf flache Keys', () => {
      const environmentObject = {
        DQ_DB__HOST: 'localhost',
        DQ_DB__PORT: '3306',
      };
      const provider = makeEnvProvider(environmentObject, {
        stripPrefix: 'DQ_',
      });

      const flattened = provider.list();
      expect(flattened).toEqual({ 'db.host': 'localhost', 'db.port': '3306' });
    });
  });

  describe('Prefix-Filter & Separator', () => {
    it('filtert per Prefix exakt und via Prefix + Separator', () => {
      const environmentObject = {
        DQ_APP__NAME: 'dqat',
        DQ_APP__CFG__MODE: 'prod',
      };
      const provider = makeEnvProvider(environmentObject, {
        stripPrefix: 'DQ_',
        doubleUnderscoreIsSeparator: true,
      });

      expect(provider.list('app')).toEqual({
        'app.name': 'dqat',
        'app.cfg.mode': 'prod',
      });
      expect(provider.list('app.name')).toEqual({ 'app.name': 'dqat' });
    });

    it('unterstützt einen benutzerdefinierten Separator ("/")', () => {
      const environmentObject = { APP__CFG__NAME: 'voyager' };
      const provider = makeEnvProvider(environmentObject, {
        stripPrefix: 'APP_',
        separator: '/',
        doubleUnderscoreIsSeparator: true,
      });

      expect(provider.get('cfg/name')).toBe('voyager');
      expect(provider.list('cfg')).toEqual({ 'cfg/name': 'voyager' });
    });

    it('respektiert toLowerCase=false und behält Groß-/Kleinschreibung', () => {
      const environmentObject = { APP_CFG__Host: 'LOCAL' };
      const provider = makeEnvProvider(environmentObject, {
        stripPrefix: 'APP_',
        toLowerCase: false,
      });

      expect(provider.get('CFG.Host')).toBe('LOCAL');
      expect(provider.list('CFG')).toEqual({ 'CFG.Host': 'LOCAL' });
    });

    it('überspringt leere Keys nach stripPrefix und Separator-Trim (continue-Zweig in buildMap)', () => {
      const environmentObject: Record<string, string | undefined> = {
        DQ___: 'ignored',
        DQ_VALID__KEY: 'kept',
      };
      const provider = makeEnvProvider(environmentObject, {
        stripPrefix: 'DQ_',
        separator: '.',
        doubleUnderscoreIsSeparator: true,
      });

      expect(provider.list()).toEqual({ 'valid.key': 'kept' });
      expect(provider.get('')).toBeUndefined();
    });
  });

  describe('Parsing', () => {
    it('parst Booleans (true/false, case-insensitive) bei parse=true', () => {
      const environmentObject = { DQ_BOOL_T: 'true', DQ_BOOL_F: 'FALSE' };
      const provider = makeEnvProvider(environmentObject, {
        stripPrefix: 'DQ_',
        parse: true,
      });

      expect(provider.get('bool_t')).toBe(true);
      expect(provider.get('bool_f')).toBe(false);
    });

    it('parst Zahlen inkl. Exponent (z. B. "-2.5e1") bei parse=true', () => {
      const environmentObject = { DQ_INT: '42', DQ_FLOAT: '-2.5e1' };
      const provider = makeEnvProvider(environmentObject, {
        stripPrefix: 'DQ_',
        parse: true,
      });

      expect(provider.get('int')).toBe(42);
      expect(provider.get('float')).toBe(-25);
    });

    it('parst JSON-Objekte, -Arrays und -Strings bei parse=true', () => {
      const environmentObject = {
        DQ_JSON_OBJ: '{"a":1,"b":[2,3]}',
        DQ_JSON_ARR: '["x","y"]',
        DQ_JSON_STR: '"hello"',
      };
      const provider = makeEnvProvider(environmentObject, {
        stripPrefix: 'DQ_',
        parse: true,
      });

      expect(provider.get('json_obj')).toEqual({ a: 1, b: [2, 3] });
      expect(provider.get('json_arr')).toEqual(['x', 'y']);
      expect(provider.get('json_str')).toBe('hello');
    });

    it('belässt freie Texte unverändert, wenn sie nicht JSON-ähnlich sind', () => {
      const environmentObject = { DQ_TEXT: '  not-json  ' };
      const provider = makeEnvProvider(environmentObject, {
        stripPrefix: 'DQ_',
        parse: true,
      });

      expect(provider.get('text')).toBe('  not-json  ');
    });

    it('unterstützt feingranulare Parse-Konfiguration (nur booleans)', () => {
      const environmentObject = { DQ_X: 'true', DQ_Y: '123' };
      const provider = makeEnvProvider(environmentObject, {
        stripPrefix: 'DQ_',
        parse: { booleans: true, numbers: false, json: false },
      });

      expect(provider.get('x')).toBe(true);
      expect(provider.get('y')).toBe('123');
    });
  });

  describe('includeUndefined', () => {
    it('dropt undefined standardmäßig (includeUndefined=false)', () => {
      const environmentObject = { DQ_EMPTY: undefined };
      const provider = makeEnvProvider(environmentObject, {
        stripPrefix: 'DQ_',
      });

      const flattened = provider.list();
      expect(flattened).toEqual({});
      expect(provider.get('empty')).toBeUndefined();
    });

    it('behält undefined bei includeUndefined=true und liefert für get(...) undefined', () => {
      const environmentObject = { DQ_FOO__BAR: undefined };
      const provider = makeEnvProvider(environmentObject, {
        stripPrefix: 'DQ_',
        includeUndefined: true,
      });

      const flattened = provider.list();
      expect(flattened).toHaveProperty('foo.bar');
      expect(provider.get('foo.bar')).toBeUndefined();
    });

    it('dropt undefined standardmäßig (continue-Zweig in buildMap)', () => {
      const environmentObject: Record<string, string | undefined> = {
        DQ_SHOULD_BE_DROPPED: undefined,
        DQ_PRESENT: 'ok',
      };
      const provider = makeEnvProvider(environmentObject, {
        stripPrefix: 'DQ_',
      });

      expect(provider.list()).toEqual({ present: 'ok' });
      expect(provider.get('should_be_dropped')).toBeUndefined();
    });
  });

  describe('Immutability & Safety', () => {
    it('liefert bei list() ein eingefrorenes Objekt zurück (immutable)', () => {
      const environmentObject = { DQ_A__B: '1', DQ_C: '2' };
      const provider = makeEnvProvider(environmentObject, {
        stripPrefix: 'DQ_',
      });

      const allEntries = provider.list();
      expect(allEntries).toEqual({ 'a.b': '1', c: '2' });
      expect(Object.isFrozen(allEntries)).toBe(true);
    });

    it('gibt niemals Funktionswerte aus (Safety-Net)', () => {
      const environmentObject = { DQ_FN: '() => 1' };
      const provider = makeEnvProvider(environmentObject, {
        stripPrefix: 'DQ_',
      });

      expect(typeof provider.get('fn')).toBe('string');
      expect(provider.list('fn')).toEqual({ fn: '() => 1' });
    });

    it('exportiert die Klasse direkt (Kontrolltest Import)', () => {
      const provider = new EnvProvider({});
      expect(provider.name).toBe('env');
    });
  });
});
