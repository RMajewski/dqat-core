/**
 * Normalisiert einen Artefakt-Dateinamen für eine sichere plattformübergreifende
 * Verwendung.
 *
 * Der Dateiname wird:
 *
 * - in Kleinbuchstaben umgewandelt
 * - auf ASCII-Zeichen reduziert
 * - von Sonderzeichen bereinigt
 * - auf `-` als Trenner normalisiert
 * - auf eine maximale Länge begrenzt
 *
 * Die Dateiendung wird nicht automatisch ergänzt.
 *
 * @param value - Ursprünglicher Dateiname
 * @param maxLength - Maximale Länge des normalisierten Namens
 * @returns Plattformunabhängiger Dateiname
 */
export function normalizeArtifactFileName(
  value: string,
  maxLength = 120,
): string {
  return value
    .normalize('NFKD')
    .replaceAll(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replaceAll('ß', 'ss')
    .replaceAll(/[^a-z0-9]+/g, '-')
    .replaceAll(/-+/g, '-')
    .replaceAll(/^-/g, '')
    .replaceAll(/-$/g, '')
    .substring(0, maxLength);
}

/**
 * Zerlegt eine kommaseparierte Zeichenkette in einzelne bereinigte Werte.
 *
 * Leerzeichen am Anfang und Ende einzelner Werte werden entfernt.
 * Leere Einträge werden ignoriert. Die Reihenfolge der Werte bleibt erhalten.
 *
 * @param value - Kommaseparierte Zeichenkette
 * @returns Bereinigte Liste einzelner Werte
 */
export function parseCommaSeparatedList(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}
