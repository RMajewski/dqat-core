/**
 * Entfernt ein optionales Präfix am Anfang eines Schlüssels.
 * Beispiel:
 * ```ts
 * applyStripPrefix("DQ_APP_PORT", "DQ_") // "APP_PORT"
 * ```
 */
export function applyStripPrefix(key: string, stripPrefix?: string): string {
  if (!stripPrefix) {
    return key;
  }
  return key.startsWith(stripPrefix) ? key.slice(stripPrefix.length) : key;
}

/**
 * Konvertiert den Schlüssel optional in Kleinschreibung.
 * Beispiel:
 * ```ts
 * maybeToLowerCase("APP_PORT", true) // "app_port"
 * ```
 */
export function maybeToLowerCase(key: string, toLowerCase?: boolean): string {
  return toLowerCase ? key.toLowerCase() : key;
}

/**
 * Ersetzt doppelte Unterstriche durch den angegebenen Separator.
 * Beispiel:
 * ```ts
 * mapDoubleUnderscoreToSeparator("APP__DB__PORT", ".", true) // "APP.DB.PORT"
 * ```
 */
export function mapDoubleUnderscoreToSeparator(
  key: string,
  separator: string,
  enabled: boolean | undefined,
): string {
  if (!enabled) {
    return key;
  }
  return key.replace(/__/g, separator);
}

/**
 * Entfernt alle führenden Unterstriche eines Schlüssels.
 *
 * Beispiele:
 * - "_HOST"     → "HOST"
 * - "__db__x"   → "db__x"
 * - ""          → ""
 *
 * @param inputKey Der Eingabe-Schlüssel (z. B. nach Prefix-Strip).
 * @returns Der bereinigte Schlüssel ohne führende Unterstriche.
 */
export function removeLeadingUnderscores(inputKey: string): string {
  if (inputKey.length === 0) {
    return inputKey;
  }

  let firstNonUnderscoreIndex = 0;
  while (
    firstNonUnderscoreIndex < inputKey.length &&
    inputKey.charCodeAt(firstNonUnderscoreIndex) === 95 // "_"
  ) {
    firstNonUnderscoreIndex++;
  }

  return firstNonUnderscoreIndex === 0
    ? inputKey
    : inputKey.slice(firstNonUnderscoreIndex);
}

/**
 * Kombiniert Parent- und Child-Key zu einem zusammengesetzten Schlüssel.
 * Beispiel:
 * ```ts
 * buildKey("app", "port", ".") // "app.port"
 * ```
 */
export function buildKey(
  parent: string | undefined,
  current: string,
  separator: string,
): string {
  return parent ? `${parent}${separator}${current}` : current;
}
