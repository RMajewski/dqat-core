import { existsSync, mkdirSync, mkdtempSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { dirname, join } from 'path';

/**
 * Erstellt eine temporäre JSON-Datei mit dem gegebenen Inhalt
 * und gibt den absoluten Pfad zurück.
 */
export function makeJsonFile(
  fileName: string,
  tempPath: string,
  jsonValue: unknown,
): string {
  const temporaryDirectory = mkdtempSync(join(tmpdir(), tempPath));
  const fullPath = join(temporaryDirectory, fileName);

  const path = dirname(fullPath);
  if (!existsSync(path)) {
    mkdirSync(path, { recursive: true });
  }

  writeFileSync(fullPath, JSON.stringify(jsonValue), { encoding: 'utf-8' });
  return fullPath;
}
