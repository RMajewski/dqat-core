/**
 * Prüft, ob der Wert `undefined` ist.
 */
export function isUndefined(value: unknown): value is undefined {
  return value === undefined;
}

/**
 * Prüft, ob der Wert `null` ist.
 */
export function isNull(value: unknown): value is null {
  return value === null;
}

/**
 * Prüft, ob der Wert ein Array ist.
 */
export function isArray<T = unknown>(value: unknown): value is T[] {
  return Array.isArray(value);
}

/**
 * Prüft, ob der Wert ein String ist.
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

/**
 * Prüft, ob ein Wert wie eine Zahl aussieht (Integer oder Dezimal, mit optionalem Vorzeichen).
 *
 * Beispiel:
 * ```ts
 * isNumberLike("42") // true
 * isNumberLike("-3.14") // true
 * isNumberLike("abc") // false
 * ```
 */
export function isNumberLike(value: unknown): boolean {
  if (!isString(value)) {
    return false;
  }
  return /^-?(?:\d+|\d*\.\d+|\d*e\d+|\d*\.\d*e\d+)$/.test(value.trim());
}

/**
 * Prüft, ob ein Wert ein echtes Plain Object ist.
 * Erlaubt sind nur:
 * - Literale Objekte ({})
 * - Objekte ohne Prototyp (Object.create(null))
 *
 * Keine Arrays, keine Klasseninstanzen, keine eingebauten Typen (Date, Map, etc.).
 */
export function isPlainObject(
  value: unknown,
): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  if (Array.isArray(value)) {
    return false;
  }

  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}
