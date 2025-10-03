import type { EnvProviderOptions } from '../../type/provider/envProviderOptions';
import type { StarfleetDirectiveProvider } from '../../type/starfleetDirective';

type ParseConfig = {
  numbers: boolean;
  booleans: boolean;
  json: boolean;
};

/**
 * 🌐 EnvProvider – Adapter für ENV-ähnliche Objekte.
 *
 * Liest ein flaches Mapping (Record<string, string | undefined>) und erzeugt
 * daraus normalisierte dot-Keys. Optional können Werte geparst werden
 * (Zahlen, Booleans, JSON). Funktionswerte werden nie ausgegeben.
 *
 * **Hinweise**
 * - Keine seiteneffektreichen Operationen: Der Input wird nur gelesen,
 *   intern entsteht ein unveränderliches Mapping.
 * - get(key) erwartet exakte dot-Keys (z. B. "db.host").
 * - list(prefix) liefert alle Keys, die exakt `prefix` sind oder mit
 *   `prefix + separator` beginnen.
 *
 * @example
 * // Beispiel: DQ_DB__HOST → db.host
 * const env = {
 *   DQ_DB__HOST: 'localhost',
 *   DQ_DB__PORT: '3306',
 * };
 * const provider = new EnvProvider(env, {
 *   stripPrefix: 'DQ_',
 *   separator: '.',
 *   doubleUnderscoreIsSeparator: true,
 *   toLowerCase: true,
 * });
 * provider.get('db.host'); // "localhost"
 * provider.get('db.port'); // "3306"
 * provider.list('db');     // { "db.host": "localhost", "db.port": "3306" }
 */
export class EnvProvider implements StarfleetDirectiveProvider {
  public readonly name: string;

  /**
   * Unveränderliche Key→Value-Map der normalisierten ENV-Daten.
   */
  private readonly map: Readonly<Record<string, unknown>>;

  /**
   * Effektiver Trenner für dot-Keys.
   */
  private readonly separator: string;

  /** Konfiguration */
  private readonly configuration: Required<
    Omit<EnvProviderOptions, 'parse'>
  > & {
    parse: ParseConfig;
  };

  constructor(
    env: Record<string, string | undefined>,
    options: EnvProviderOptions = {},
  ) {
    this.separator = options.separator ?? '.';

    // parse-Konfiguration auflösen
    const parseConf: ParseConfig = this.normalizeParseConfig(options.parse);

    // Defaults für Rest der Optionen
    this.configuration = {
      name: options.name ?? 'env',
      stripPrefix: options.stripPrefix ?? '',
      separator: this.separator,
      doubleUnderscoreIsSeparator: options.doubleUnderscoreIsSeparator ?? true,
      toLowerCase: options.toLowerCase ?? true,
      includeUndefined: options.includeUndefined ?? false,
      parse: parseConf,
    };

    this.name = this.configuration.name;
    this.map = Object.freeze(this.buildMap(env));
  }

  get(key: string): unknown {
    if (!key) {
      return undefined;
    }
    if (Object.hasOwn(this.map, key)) {
      return this.map[key];
    }
    return undefined;
  }

  list(prefix?: string): Record<string, unknown> {
    if (!prefix) {
      return this.map;
    }

    const out: Record<string, unknown> = {};
    const withSep = `${prefix}${this.separator}`;

    for (const [k, v] of Object.entries(this.map)) {
      if (k === prefix || k.startsWith(withSep)) {
        out[k] = v;
      }
    }
    return Object.freeze(out);
  }

  /**
   * Erzeugt das normalisierte Mapping aus dem Input-ENV.
   */
  private buildMap(
    env: Record<string, string | undefined>,
  ): Record<string, unknown> {
    const out: Record<string, unknown> = {};

    for (const [rawKey, rawVal] of Object.entries(env)) {
      // optional undefined droppen
      if (
        typeof rawVal === 'undefined' &&
        !this.configuration.includeUndefined
      ) {
        continue;
      }

      const key = this.normalizeKey(rawKey);
      if (!key) {
        // leere/nicht verwendbare Keys überspringen

        continue;
      }

      // Werte ggf. parsen
      const value =
        typeof rawVal === 'undefined'
          ? undefined
          : this.parseValue(rawVal, this.configuration.parse);

      // Funktionswerte nie listen (bei ENV unwahrscheinlich, aber Safety-Net)
      if (typeof value === 'function') {
        continue;
      }

      out[key] = value;
    }

    return out;
  }

  /**
   * Normalisiert einen ENV-Key gemäß Konfiguration.
   */
  private normalizeKey(originalKey: string): string {
    let workingKey = originalKey;

    // 1) Präfix entfernen (nur am Anfang)
    if (
      this.configuration.stripPrefix &&
      workingKey.startsWith(this.configuration.stripPrefix)
    ) {
      workingKey = workingKey.slice(this.configuration.stripPrefix.length);

      // Übergangskante: Nur ein einzelnes "_" direkt nach dem Präfix entfernen.
      // Wenn "__" folgt, NICHT schneiden – das wird unten korrekt in den Separator
      // umgewandelt und anschließend via trim entfernt (leerer Key → skip).
      if (
        this.configuration.doubleUnderscoreIsSeparator &&
        workingKey.startsWith('_') &&
        !workingKey.startsWith('__')
      ) {
        workingKey = workingKey.slice(1);
      }
    }

    // 2) Doppelter Unterstrich als Separator interpretieren (optional)
    if (this.configuration.doubleUnderscoreIsSeparator) {
      workingKey = workingKey.replace(/__+/g, this.separator);
    }

    // 3) Optional auf Kleinbuchstaben normalisieren
    if (this.configuration.toLowerCase) {
      workingKey = workingKey.toLowerCase();
    }

    // 4) Führende/abschließende Trenner entfernen
    workingKey = this.trimSeparator(workingKey, this.separator);

    return workingKey;
  }

  private trimSeparator(s: string, sep: string): string {
    if (!s) {
      return s;
    }
    let out = s;
    // nur einfache, konservative Trims – keine Magie
    while (out.startsWith(sep)) {
      out = out.slice(sep.length);
    }
    while (out.endsWith(sep)) {
      out = out.slice(0, out.length - sep.length);
    }
    return out;
  }

  /** parse-Optionen normalisieren. */
  private normalizeParseConfig(
    input: EnvProviderOptions['parse'],
  ): ParseConfig {
    if (input === true) {
      return { numbers: true, booleans: true, json: true };
    }
    if (input && typeof input === 'object') {
      return {
        numbers: Boolean(input.numbers),
        booleans: Boolean(input.booleans),
        json: Boolean(input.json),
      };
    }
    return { numbers: false, booleans: false, json: false };
  }

  /**
   * Wert-Konvertierung mit niedriger kognitiver Komplexität:
   * - Booleans: "true"/"false" (case-insensitive)
   * - Numbers: robuste Prüfung ohne komplexe/teure Regex
   * - JSON: konservativ nur bei offensichtlichen Strukturen
   */
  private parseValue(rawInput: string, config: ParseConfig): unknown {
    const t = rawInput.trim();

    if (config.booleans) {
      const b = this.parseBoolean(t);
      if (b.matched) {
        return b.value;
      }
    }

    if (config.numbers) {
      const n = this.parseNumber(t);
      if (n.matched) {
        return n.value;
      }
    }

    if (config.json) {
      const j = this.parseJson(t);
      if (j.matched) {
        return j.value;
      }
    }

    return rawInput;
  }

  /**
   * Boolean-Parser: "true"/"false" (case-insensitive).
   */
  private parseBoolean(
    t: string,
  ): { matched: boolean; value: boolean } | { matched: false } {
    const s = t.toLowerCase();
    if (s === 'true') {
      return { matched: true, value: true };
    }
    if (s === 'false') {
      return { matched: true, value: false };
    }
    return { matched: false };
  }

  /**
   * Zahlenerkennung ohne slow-regex, inkl. Exponent.
   */
  private parseNumber(
    t: string,
  ): { matched: boolean; value: number } | { matched: false } {
    if (!this.gateAllowedChars(t)) {
      return { matched: false };
    }

    const { base, exp } = this.splitExponent(t);
    if (!this.validateBase(base)) {
      return { matched: false };
    }
    if (!this.validateExponent(exp)) {
      return { matched: false };
    }

    const n = Number(t.trim());
    if (!Number.isFinite(n)) {
      return { matched: false };
    }

    return { matched: true, value: n };
  }

  /**
   * Nur erlaubte Zeichen – schneller Gatekeeper.
   */
  private gateAllowedChars(t: string): boolean {
    const s = t.trim();
    if (s === '') {
      return false;
    }
    // nur Ziffern, Vorzeichen, Punkt und e/E
    return /^[0-9+-.eE]+$/.test(s);
  }

  /**
   * Teilt in Basis und (optionalen) Exponent.
   */
  private splitExponent(t: string): { base: string; exp: string | null } {
    const s = t.trim();
    const ePos = Math.max(s.indexOf('e'), s.indexOf('E'));
    if (ePos === -1) {
      return { base: s, exp: null };
    }
    return { base: s.slice(0, ePos), exp: s.slice(ePos + 1) };
  }

  /**
   * Validiert die Basis: mind. eine Ziffer, max. ein Punkt, keine nackten Vorzeichen/Punkte.
   */
  private validateBase(base: string): boolean {
    if (base === '+' || base === '-' || base === '.') {
      return false;
    }
    if (base.endsWith('+') || base.endsWith('-') || base.endsWith('.')) {
      return false;
    }
    const dotCount = (base.match(/\./g) || []).length;
    if (dotCount > 1) {
      return false;
    }
    if (!/\d/.test(base)) {
      return false;
    }
    return true;
  }

  /** Validiert den Exponenten (falls vorhanden): optionales Vorzeichen + ≥1 Ziffer. */
  private validateExponent(exp: string | null): boolean {
    if (exp === null) {
      return true;
    }
    if (exp.length === 0) {
      return false;
    }
    // keine unnötigen Escapes: Non-capturing Group
    return /^(?:[+-])?\d+$/.test(exp);
  }

  /**
   * JSON nur parsen, wenn es offensichtlich JSON ist; Fehler werden still ignoriert.
   */
  private parseJson(
    t: string,
  ): { matched: boolean; value: unknown } | { matched: false } {
    if (!this.looksJsonLike(t)) {
      return { matched: false };
    }
    try {
      return { matched: true, value: JSON.parse(t) };
    } catch {
      return { matched: false };
    }
  }

  /**
   * Heuristik: Objekt, Array oder String-Literal → wahrscheinlich JSON.
   */
  private looksJsonLike(t: string): boolean {
    return t.startsWith('{') || t.startsWith('[') || t.startsWith('"');
  }
}
