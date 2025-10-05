import { isArray, isPlainObject } from './guards';

export type FlattenOptions = Readonly<{
  separator: string;
  includeArrayIndices: boolean;
  dropUndefined: boolean;
}>;

/**
 * Flacht eine verschachtelte Struktur (Objekte/Arrays) zu einem
 * flachen Objekt mit Dot-Keys ab.
 *
 * Niedrige kognitive Last via Guard-Helper:
 * - tryHandleUndefinedOrNull
 * - tryHandleArray
 * - tryHandleObject
 */
export function flattenObject(
  input: unknown,
  options: FlattenOptions,
): Record<string, unknown> {
  const { separator, includeArrayIndices, dropUndefined } = options;

  const out: Record<string, unknown> = {};
  type Frame = { key: string | undefined; value: unknown };

  // Früher Ausstieg für primitive/terminierende Werte
  if (isTerminal(input)) {
    writeTerminal(out, undefined, input, dropUndefined);
    return out;
  }

  const stack: Frame[] = [{ key: undefined, value: input }];

  while (stack.length > 0) {
    const { key: parentKey, value } = stack.pop() as Frame;

    if (tryHandleUndefinedOrNull(out, parentKey, value, dropUndefined)) {
      continue;
    }

    if (
      tryHandleArray(
        out,
        stack,
        parentKey,
        value,
        includeArrayIndices,
        separator,
      )
    ) {
      continue;
    }

    if (tryHandleObject(out, stack, parentKey, value, separator)) {
      continue;
    }

    // Primitive / sonstige Terminalwerte
    writeTerminal(out, parentKey, value, false);
  }

  return out;
}

/**
 * Prüft, ob der Eingabewert ein terminaler Wert ist
 * (kein Array, kein Plain-Object), inkl. null/undefined.
 */
export function isTerminal(value: unknown): boolean {
  if (value === null || value === undefined) {
    return true;
  }
  if (isArray(value)) {
    return false;
  }
  if (isPlainObject(value)) {
    return false;
  }
  return true;
}

/**
 * Schreibt einen Terminalwert ins Ergebnis. Wenn `key` fehlt, wird der leere Key ("")
 * verwendet, um Einzelwerte konsistent abzulegen.
 */
export function writeTerminal(
  out: Record<string, unknown>,
  key: string | undefined,
  value: unknown,
  dropUndefined: boolean,
): void {
  if (value === undefined && dropUndefined) {
    return;
  }
  out[key ?? ''] = value;
}

/**
 * Behandelt `undefined`-Werte gemäß Option `dropUndefined`.
 */
export function handleUndefined(
  out: Record<string, unknown>,
  key: string | undefined,
  dropUndefined: boolean,
): void {
  if (dropUndefined) {
    return;
  }
  out[key ?? ''] = undefined;
}

/**
 * Guard: Behandelt `undefined` und `null`.
 * @returns true, wenn der Fall vollständig verarbeitet wurde.
 */
function tryHandleUndefinedOrNull(
  out: Record<string, unknown>,
  parentKey: string | undefined,
  value: unknown,
  dropUndefined: boolean,
): boolean {
  if (value === undefined) {
    handleUndefined(out, parentKey, dropUndefined);
    return true;
  }
  if (value === null) {
    writeTerminal(out, parentKey, null, false);
    return true;
  }
  return false;
}

/**
 * Schiebt die Kinder eines Arrays auf den Stack.
 * Respektiert `includeArrayIndices` für die Key-Bildung.
 */
export function pushArrayChildren(
  stack: Array<{ key: string | undefined; value: unknown }>,
  parentKey: string | undefined,
  arr: unknown[],
  includeArrayIndices: boolean,
  separator: string,
): void {
  // ✅ Leeres Array: genau ein Frame mit [] pushen (Kompatibilität für Unit-Tests)
  if (arr.length === 0) {
    stack.push({ key: parentKey, value: [] });
    return;
  }

  // Rückwärts pushen, damit die natürliche Reihenfolge bei pop() erhalten bleibt
  for (let i = arr.length - 1; i >= 0; i--) {
    const childKey = includeArrayIndices
      ? makeKey(parentKey, String(i), separator)
      : parentKey;
    stack.push({ key: childKey, value: arr[i] });
  }
}

/**
 * Guard: Behandelt Arrays inkl. Leerfall.
 * @returns true, wenn der Fall vollständig verarbeitet wurde.
 */
function tryHandleArray(
  out: Record<string, unknown>,
  stack: Array<{ key: string | undefined; value: unknown }>,
  parentKey: string | undefined,
  value: unknown,
  includeArrayIndices: boolean,
  separator: string,
): boolean {
  if (!isArray(value)) {
    return false;
  }

  if (value.length === 0) {
    // Leer-Array als Terminalwert schreiben (Kompatibilität + kein Loop)
    writeTerminal(out, parentKey, [], false);
    return true;
  }

  pushArrayChildren(stack, parentKey, value, includeArrayIndices, separator);
  return true;
}

/**
 * Schiebt die Einträge eines Plain-Objects auf den Stack.
 */
export function pushObjectEntries(
  stack: Array<{ key: string | undefined; value: unknown }>,
  parentKey: string | undefined,
  obj: Record<string, unknown>,
  separator: string,
): void {
  const entries = Object.entries(obj);

  // ✅ Leeres Objekt: genau ein Frame mit {} pushen (Kompatibilität für Unit-Tests)
  if (entries.length === 0) {
    stack.push({ key: parentKey, value: {} });
    return;
  }

  for (let i = entries.length - 1; i >= 0; i--) {
    const [rawKey, childValue] = entries[i];
    const childKey = makeKey(parentKey, rawKey, separator);
    stack.push({ key: childKey, value: childValue });
  }
}

/**
 * Guard: Behandelt Plain-Objects inkl. Leerfall.
 * @returns true, wenn der Fall vollständig verarbeitet wurde.
 */
function tryHandleObject(
  out: Record<string, unknown>,
  stack: Array<{ key: string | undefined; value: unknown }>,
  parentKey: string | undefined,
  value: unknown,
  separator: string,
): boolean {
  if (!isPlainObject(value)) {
    return false;
  }
  if (Object.keys(value).length === 0) {
    // Leeres Objekt als Terminalwert schreiben (verhindert Endlosschleifen)
    writeTerminal(out, parentKey, {}, false);
    return true;
  }
  pushObjectEntries(stack, parentKey, value, separator);
  return true;
}

/**
 * Fügt einen Child-Key an einen optionalen Parent-Key an.
 */
export function makeKey(
  parent: string | undefined,
  current: string,
  separator: string,
): string {
  return parent ? `${parent}${separator}${current}` : current;
}
