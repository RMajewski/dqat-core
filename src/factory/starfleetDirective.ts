import type {
  StarfleetDirectiveProvider,
  StarfleetDirectives,
  StarfleetDirectivesOptions,
} from '../type/starfleetDirective.ts';

/**
 * Erstellt eine StarfleetDirectives-Instanz aus einer geordneten Provider-Kette.
 *
 * Grundsätze:
 * - **Deterministisch**: Reihenfolge der Provider bestimmt Priorität.
 * - **First-hit-wins** (Standard): erster Provider mit Treffer gewinnt.
 * - **Immutable Rückgaben**: optionaler Deep-Freeze, um Mutationen in Tests zu vermeiden.
 * - **JSON-safe**: Funktionen werden unterdrückt; komplexe Werte werden sicher geklont.
 */
export function createStarfleetDirectives(
  providers: readonly StarfleetDirectiveProvider[],
  opts: StarfleetDirectivesOptions = {},
): StarfleetDirectives {
  const preferFirst = opts.preferFirst ?? true;
  const doFreeze = opts.freeze ?? true;

  // --- Utils ---------------------------------------------------------------

  const isObjectLike = (v: unknown): v is object =>
    v !== null && typeof v === 'object';

  const deepFreeze = <T>(input: T): T => {
    if (!doFreeze) {
      return input;
    }
    const visited = new WeakSet<object>();
    const visit = (val: unknown): void => {
      if (!isObjectLike(val) || visited.has(val)) {
        return;
      }
      visited.add(val);
      Object.freeze(val);
      for (const v of Object.values(val as Record<string, unknown>)) {
        visit(v);
      }
    };
    visit(input as unknown);
    return input;
  };

  const cloneSafe = <T>(val: T): T => {
    try {
      // @ts-ignore: structuredClone kann fehlen; Fallback unten
      return typeof structuredClone === 'function'
        ? structuredClone(val)
        : JSON.parse(JSON.stringify(val));
    } catch {
      return val;
    }
  };

  const freezeMaybe = <T>(val: T): T =>
    doFreeze && isObjectLike(val) ? deepFreeze(val) : val;

  const sanitize = (v: unknown): unknown =>
    typeof v === 'function' ? undefined : v;

  // Provider-Namen prüfen (Debug)
  const names = new Set<string>();
  for (const p of providers) {
    if (names.has(p.name)) {
      throw new Error(`Duplicate StarfleetDirectiveProvider name: ${p.name}`);
    }
    names.add(p.name);
  }

  const hasProvider = (providerName: string): boolean => {
    for (const name of names) {
      if (name.indexOf(providerName) >= 0) {
        return true;
      }
    }
    return false;
  };

  // --- Kern-Helfer ---------------------------------------------------------

  const findValue = (key: string): unknown | undefined => {
    if (preferFirst) {
      for (const p of providers) {
        const v = sanitize(p.get(key));
        if (v !== undefined) {
          return v;
        }
      }
      return undefined;
    }
    let last: unknown | undefined = undefined;
    for (const p of providers) {
      const v = sanitize(p.get(key));
      if (v !== undefined) {
        last = v;
      }
    }
    return last;
  };

  // Overloads ohne redeclare-Fehler: als const mit Funktions-Typ
  type ResolveDirective = {
    (key: string): unknown;
    <T>(key: string): T | undefined;
  };

  const resolveDirective: ResolveDirective = (key: string) => {
    const raw = findValue(key);
    if (raw === undefined) {
      return undefined as unknown;
    }
    const cloned = cloneSafe(raw);
    return freezeMaybe(cloned) as unknown;
  };

  const hasDirective = (key: string): boolean => findValue(key) !== undefined;

  const listDirectives = (
    prefix?: string,
  ): Readonly<Record<string, unknown>> => {
    const out: Record<string, unknown> = {};

    const shouldSkip = (v: unknown): boolean => typeof v === 'function';
    const assign = (k: string, v: unknown): void => {
      if (preferFirst && Object.hasOwn(out, k)) {
        return;
      }
      out[k] = v;
    };

    for (const p of providers) {
      const entries = p.list(prefix);
      for (const [k, v] of Object.entries(entries)) {
        if (shouldSkip(v)) {
          continue;
        }
        assign(k, v);
      }
    }

    return deepFreeze(cloneSafe(out));
  };

  return { resolveDirective, hasDirective, listDirectives, hasProvider };
}
