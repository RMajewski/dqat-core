import fs from 'node:fs';
import path, { isAbsolute } from 'node:path';
import type {
  JsonFileProviderOptions,
  NormalizedJsonFileOptions,
} from '../../type/provider/providerOptions.ts';
import type { StarfleetDirectiveProvider } from '../../type/starfleetDirective.ts';
import { flattenObject } from '../../util/provider/flatten.ts';
import { isPlainObject } from '../../util/provider/guards.ts';
import { normalizeJsonFileOptions } from '../../util/provider/optionNormalization.ts';

/**
 * Provider zum Laden und Lesen einer JSON-Datei als flache Key-Value-Struktur.
 *
 * Implementiert StarfleetDirectiveProvider:
 * - `name` (z. B. "json" oder aus Options)
 * - `get(key)`
 * - `list(prefix?)`
 */
export class JsonFileProvider implements StarfleetDirectiveProvider {
  public readonly name: string;

  private readonly options: NormalizedJsonFileOptions;
  private readonly filePath: string;
  private readonly flatData: Record<string, unknown>;

  public constructor(fileName: string, inputOptions?: JsonFileProviderOptions) {
    this.options = normalizeJsonFileOptions(inputOptions ?? {});
    this.name = this.options.name ?? 'json';

    this.validateFilePath(fileName);
    const resolvedPath = path.resolve(fileName);
    this.filePath = resolvedPath;

    if (!fs.existsSync(resolvedPath)) {
      throw new Error(
        `JsonFileProvider: Die Datei "${resolvedPath}" wurde nicht gefunden.`,
      );
    }

    const content = fs.readFileSync(resolvedPath, { encoding: 'utf-8' });
    const parsed = this.safeParseJson(content, resolvedPath);

    if (!isPlainObject(parsed)) {
      throw new Error(
        `JsonFileProvider: Root von "${resolvedPath}" ist kein JSON-Objekt. Erwartet wurde ein Plain Object.`,
      );
    }

    // JSON enthält kein `undefined`; wir droppen daher nichts, behalten alles.
    this.flatData = flattenObject(parsed, {
      separator: this.options.separator,
      includeArrayIndices: true,
      dropUndefined: false,
    });
  }

  /**
   * Überprüft ob die angegeben Datei existiert und mit ".json" endet.
   *
   * @param filePath Diese JSON-Datei soll geladen werden.
   */
  private validateFilePath(filePath: string): void {
    if (typeof filePath !== 'string' || filePath.trim() === '') {
      throw new Error('JsonFileProvider: filePath ist leer oder kein String.');
    }
    const looksLikeJson = filePath.toLowerCase().endsWith('.json');
    if (!looksLikeJson) {
      throw new Error(
        `JsonFileProvider: "${filePath}" hat keine ".json"-Endung.`,
      );
    }

    isAbsolute(filePath);
  }

  public get(dotKey: string): unknown {
    return this.flatData[dotKey];
  }

  public list(prefix?: string): Record<string, unknown> {
    if (!prefix) {
      return Object.freeze({ ...this.flatData });
    }
    const out: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(this.flatData)) {
      if (key.startsWith(prefix)) {
        out[key] = value;
      }
    }
    return Object.freeze(out);
  }

  public getFilePath(): string {
    return this.filePath;
  }

  public getOptions(): NormalizedJsonFileOptions {
    return this.options;
  }

  private safeParseJson(content: string, filePath: string): unknown {
    try {
      return JSON.parse(content);
    } catch (caughtError: unknown) {
      const originalMessage =
        caughtError instanceof Error ? `: ${caughtError.message}` : '';
      // Node 18+/TS lib.es2022.error → ErrorOptions.cause verfügbar
      throw new SyntaxError(
        `JsonFileProvider: Ungültiges JSON in "${filePath}"${originalMessage}`,
        { cause: caughtError },
      );
    }
  }
}
