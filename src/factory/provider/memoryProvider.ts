import type {
  IMemoryProviderOptions,
  NormalizedMemoryOptions,
} from '../../type/provider/providerOptions.ts';
import type { IStarfleetDirectiveProvider } from '../../type/starfleetDirective.ts';
import { flattenObject } from '../../util/provider/flatten.ts';
import { normalizeMemoryOptions } from '../../util/provider/optionNormalization.ts';

/**
 * Provider für In-Memory-Datenquellen (z. B. Mocks/Testdaten).
 *
 * Implementiert StarfleetDirectiveProvider:
 * - `name` (z. B. "memory" oder aus Options)
 * - `get(key)`
 * - `list(prefix?)`
 */
export class MemoryProvider implements IStarfleetDirectiveProvider {
  /** Logischer Name des Providers (für Logs/Debugging). */
  public readonly name: string;

  private readonly options: NormalizedMemoryOptions;
  private readonly flatData: Record<string, unknown>;

  /**
   * @param input Einstellungen/Daten, die dieser Provider bereitstellt.
   * @param inputOptions Steuerung des Flatten-Verhaltens und der Key-Aufbereitung.
   */
  constructor(
    input: Record<string, unknown>,
    inputOptions?: IMemoryProviderOptions,
  );
  constructor(
    input: string | number | boolean | null | undefined,
    inputOptions?: IMemoryProviderOptions,
  );
  constructor(input: unknown, inputOptions: IMemoryProviderOptions = {}) {
    this.options = normalizeMemoryOptions(inputOptions ?? {});
    this.name = this.options.name ?? 'memory';

    if (this.isPrimitiveScalar(input)) {
      if (input === undefined && this.options.dropUndefined) {
        this.flatData = {};
      } else {
        this.flatData = { value: input };
      }
      return;
    }

    if (this.options.flatten) {
      const flat = flattenObject(input, {
        separator: this.options.separator,
        includeArrayIndices: this.options.includeArrayIndices,
        dropUndefined: this.options.dropUndefined,
      });
      this.flatData = this.sanitizeFlatRecord(flat, this.options.dropUndefined);
      return;
    }

    this.flatData = this.sanitizeFlatRecord(
      input as Record<string, unknown>,
      this.options.dropUndefined,
    );
  }

  /** Gibt einen einzelnen Wert zurück. */
  public get(key: string): unknown {
    return this.flatData[key];
  }

  /**
   * Liefert alle Key-Value-Paare. Optionales Präfix filtert auf Dot-Key-Basis.
   */
  public list(prefix?: string): Record<string, unknown> {
    if (!prefix) {
      return { ...this.flatData };
    }
    const out: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(this.flatData)) {
      if (key.startsWith(prefix)) {
        out[key] = value;
      }
    }
    return out;
  }

  /** Aktive Optionen (Debug/Tests). */
  public getOptions(): NormalizedMemoryOptions {
    return this.options;
  }

  private isPrimitiveScalar(
    v: unknown,
  ): v is string | number | boolean | null | undefined {
    return (
      v === null ||
      v === undefined ||
      typeof v === 'string' ||
      typeof v === 'number' ||
      typeof v === 'boolean'
    );
  }

  private sanitizeFlatRecord(
    source: Record<string, unknown>,
    dropUndefined: boolean,
  ): Record<string, unknown> {
    const out: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(source)) {
      if (val === undefined) {
        if (!dropUndefined) {
          out[key] = undefined;
        }
        continue;
      }
      if (typeof val === 'function') {
        // niemals Funktionswerte ausgeben
        continue;
      }
      out[key] = val;
    }
    return out;
  }
}
