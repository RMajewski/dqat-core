import type { MemoryProviderOptions } from '../../type/provider/memoryProviderOptions';
import type { StarfleetDirectiveProvider } from '../../type/starfleetDirective';

/**
 * Testfreundlicher In-Memory-Provider für Directives.
 *
 * Hinweise:
 * - Funktionen werden bereits beim Einlesen ignoriert.
 * - Der Provider liefert **flache** Keys; `get(key)` erwartet einen exakten Key.
 * - `list(prefix)` gibt nur Keys zurück, die entweder exakt `prefix` sind
 * oder mit `prefix + separator` beginnen.
 */
export class MemoryProvider implements StarfleetDirectiveProvider {
  public readonly name: string;
  private readonly map: Record<string, unknown>;
  private readonly sep: string;

  constructor(input: Record<string, unknown>, options?: MemoryProviderOptions);
  constructor(
    input: string | number | boolean | null | undefined,
    options?: MemoryProviderOptions,
  );
  constructor(input: unknown, options: MemoryProviderOptions = {}) {
    this.name = options.name ?? 'memory';
    this.sep = options.separator ?? '.';
    const flatten = options.flatten ?? true;
    const includeArrayIndices = options.includeArrayIndices ?? true;
    const dropUndefined = options.dropUndefined ?? true;

    const sanitized = sanitizeInput(input);
    this.map = flatten
      ? flattenObject(sanitized, {
          separator: this.sep,
          includeArrayIndices,
          dropUndefined,
        })
      : filterFlatRecord(sanitized, {
          dropUndefined,
        });
  }

  // Rückgabe-Typ ist `unknown` (kann faktisch undefined sein); vermeidet Union mit `unknown`.
  get(key: string): unknown {
    return Object.hasOwn(this.map, key) ? this.map[key] : undefined;
  }

  list(prefix?: string): Record<string, unknown> {
    if (!prefix) {
      return { ...this.map };
    }
    const out: Record<string, unknown> = {};
    const base = prefix;
    const start = base + this.sep;
    for (const [k, v] of Object.entries(this.map)) {
      if (k === base || k.startsWith(start)) {
        out[k] = v;
      }
    }
    return out;
  }
}

function sanitizeInput(input: unknown): Record<string, unknown> {
  if (input && typeof input === 'object' && !Array.isArray(input)) {
    // Shallow-Kopie, Funktionen verwerfen
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(input as Record<string, unknown>)) {
      if (typeof v === 'function') {
        continue;
      }
      out[String(k)] = v;
    }
    return out;
  }
  // Für Tests komfortabel: primitiver Wert wird als { value: <input> } verfügbar
  return { value: input };
}

type FlattenOpts = {
  separator: string;
  includeArrayIndices: boolean;
  dropUndefined: boolean;
};

type Frame = { key: string; value: unknown };

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === 'object' && !Array.isArray(v);

const shouldSkip = (v: unknown, opts: FlattenOpts): boolean =>
  typeof v === 'function' || (v === undefined && opts.dropUndefined);

const handleArray = (
  v: unknown,
  key: string,
  stack: Frame[],
  opts: FlattenOpts,
  makeKey: (p: string, c: string) => string,
): boolean => {
  if (!Array.isArray(v)) {
    return false;
  }
  if (!opts.includeArrayIndices) {
    return true;
  } // komplett überspringen
  for (let i = 0; i < v.length; i++) {
    stack.push({ key: makeKey(key, String(i)), value: v[i] });
  }
  return true;
};

const handleObject = (
  v: unknown,
  key: string,
  stack: Frame[],
  out: Record<string, unknown>,
  makeKey: (p: string, c: string) => string,
): boolean => {
  if (!isPlainObject(v)) {
    return false;
  }
  const entries = Object.entries(v);
  if (entries.length === 0) {
    if (key) {
      out[key] = v;
    }
    return true;
  }
  for (const [k, val] of entries) {
    stack.push({ key: makeKey(key, String(k)), value: val });
  }
  return true;
};

const commitPrimitive = (
  key: string,
  value: unknown,
  out: Record<string, unknown>,
): void => {
  if (key) {
    out[key] = value;
  }
};

function flattenObject(
  obj: Record<string, unknown>,
  opts: FlattenOpts,
  parentKey = '',
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  const sep = opts.separator;
  const makeKey = (p: string, c: string): string => (p ? `${p}${sep}${c}` : c);

  const stack: Frame[] = Object.entries(obj).map(([k, v]) => ({
    key: parentKey ? makeKey(parentKey, String(k)) : String(k),
    value: v,
  }));

  while (stack.length) {
    const { key, value } = stack.pop() as Frame;
    if (shouldSkip(value, opts)) {
      continue;
    }
    if (handleArray(value, key, stack, opts, makeKey)) {
      continue;
    }
    if (handleObject(value, key, stack, out, makeKey)) {
      continue;
    }
    commitPrimitive(key, value, out);
  }

  return out;
}

function filterFlatRecord(
  rec: Record<string, unknown>,
  { dropUndefined }: { dropUndefined: boolean },
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(rec)) {
    if (typeof v === 'function') {
      continue;
    }
    if (v === undefined && dropUndefined) {
      continue;
    }
    out[String(k)] = v;
  }
  return out;
}
