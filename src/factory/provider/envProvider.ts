import type {
  IEnvProviderOptions,
  NormalizedEnvOptions,
} from '../../type/provider/providerOptions.ts';
import type { StarfleetDirectiveProvider } from '../../type/starfleetDirective.ts';
import {
  applyStripPrefix,
  mapDoubleUnderscoreToSeparator,
  maybeToLowerCase,
  removeLeadingUnderscores,
} from '../../util/provider/keyResolution.ts';
import { normalizeEnvOptions } from '../../util/provider/optionNormalization.ts';
import {
  coerceString,
  normalizeParse,
  type ParseFlags,
} from '../../util/provider/parsing.ts';

/**
 * Provider zum Lesen von Umgebungsvariablen.
 *
 * Implementiert StarfleetDirectiveProvider:
 * - `name` (z. B. "env" oder aus Options)
 * - `get(key)`
 * - `list(prefix?)`
 */
export class EnvProvider implements StarfleetDirectiveProvider {
  /** Logischer Name des Providers (für Logs/Debugging). */
  public readonly name: string;

  private readonly options: NormalizedEnvOptions;
  private readonly normalizedEnv: Record<string, string | undefined>;

  /**
   * Erstellt eine neue Instanz des EnvProviders.
   * @param env Map der Umgebungsvariablen (anstelle von process.env).
   * @param inputOptions Konfigurationsobjekt für diesen Provider.
   */
  public constructor(
    env: Record<string, string | undefined>,
    inputOptions?: IEnvProviderOptions,
  ) {
    this.options = normalizeEnvOptions(inputOptions ?? {});
    this.name = this.options.name ?? 'env';

    this.normalizedEnv = {};
    for (const rawKey in env) {
      const normalizedKey = this.normalizeKey(rawKey);
      if (normalizedKey.length === 0) {
        continue;
      }

      // Safety-Net: nur Strings weiterreichen; alles andere wie 'undefined' behandeln
      const rawValue = env[rawKey];
      const sanitized: string | undefined =
        typeof rawValue === 'string' ? rawValue : undefined;

      if (sanitized === undefined && this.options.dropUndefined) {
        continue;
      }

      this.normalizedEnv[normalizedKey] = sanitized;
    }
  }

  /**
   * Bereitet einen Schlüssel gemäß den konfigurierten Regeln auf.
   */
  private normalizeKey(rawKey: string): string {
    const keyAfterPrefix = applyStripPrefix(rawKey, this.options.stripPrefix);
    const keyLowered = maybeToLowerCase(
      keyAfterPrefix,
      this.options.toLowerCase,
    );
    const removedLeadingUnderscores = removeLeadingUnderscores(keyLowered);
    return mapDoubleUnderscoreToSeparator(
      removedLeadingUnderscores,
      this.options.separator,
      this.options.doubleUnderscoreIsSeparator,
    );
  }

  /**
   * Holt den Wert einer einzelnen Umgebungsvariablen.
   */
  public get(key: string): unknown {
    const normalizedKey = this.normalizeKey(key);
    const rawValue = this.normalizedEnv[normalizedKey];

    if (rawValue === undefined) {
      return this.options.dropUndefined ? undefined : rawValue;
    }

    const parseFlags = normalizeParse(this.options.parse);
    return coerceString(rawValue, parseFlags);
  }

  /**
   * Liefert alle Schlüssel/Werte dieses Providers als flaches Objekt.
   * Optional gefiltert nach Präfix (auf **eingabeseitig**em Key).
   *
   * Niedrige kognitive Last via Delegation.
   */
  public list(prefix?: string): Record<string, unknown> {
    const output: Record<string, unknown> = {};
    const parseFlags = normalizeParse(this.options.parse);

    for (const entryKey of Object.keys(this.normalizedEnv)) {
      if (!this.shouldIncludeKey(entryKey, prefix)) {
        continue;
      }
      const result = this.processEntry(entryKey, parseFlags);
      if (!result) {
        continue;
      }
      const [normalizedKey, value] = result;
      output[normalizedKey] = value;
    }

    return Object.freeze(output);
  }

  private shouldIncludeKey(entryKey: string, prefix?: string): boolean {
    return !prefix || entryKey.startsWith(prefix);
  }

  private processEntry(
    entryKey: string,
    parseFlags: ParseFlags,
  ): [normalizedKey: string, value: unknown] | undefined {
    const rawValue = this.normalizedEnv[entryKey];

    if (rawValue === undefined) {
      if (this.options.dropUndefined) {
        return undefined;
      }
      return [entryKey, undefined];
    }

    return [entryKey, coerceString(rawValue, parseFlags)];
  }

  /**
   * Gibt die aktiven Provider-Optionen zurück (Debug/Tests).
   */
  public getOptions(): NormalizedEnvOptions {
    return this.options;
  }
}
