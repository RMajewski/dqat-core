import type { StarfleetDirectiveProvider } from '../../../../src/type/starfleetDirective';

/**
 * Ein sehr einfacher Test-Provider.
 * - get(key) liefert exakt passende Werte
 * - list(prefix) liefert flache Keys, optional nach Präfix gefiltert
 */
export class StubStarfleetDirectiveProvider
  implements StarfleetDirectiveProvider
{
  readonly name: string;
  private readonly map: Record<string, unknown>;
  private readonly sep = '.';

  constructor(name: string, map: Record<string, unknown>) {
    this.name = name;
    this.map = { ...map };
  }

  get(key: string): unknown {
    return Object.hasOwn(this.map, key) ? this.map[key] : undefined;
  }

  list(prefix?: string): Record<string, unknown> {
    if (!prefix) {
      return { ...this.map };
    }
    const out: Record<string, unknown> = {};
    const start = prefix + this.sep;
    for (const [key, value] of Object.entries(this.map)) {
      if (key === prefix || key.startsWith(start)) {
        out[key] = value;
      }
    }
    return out;
  }
}
