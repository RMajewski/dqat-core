import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { HolodeckSceneLoadError } from '../../holodeck/holodeck.error.ts';
import { HolodeckSceneLoadErrorCode } from '../../type/holodeck/holodeck.error.ts';

/**
 * Lädt den Inhalt einer Body-Datei synchron aus dem Dateisystem.
 *
 * Der Pfad wird relativ zu `fixturesDir` aufgelöst.
 *
 * Sicherheitsregel:
 * - Der finale Pfad muss innerhalb von `fixturesDir` liegen.
 *
 * Fehlerbehandlung:
 * - Datei nicht gefunden / nicht lesbar → FILESYSTEM_ERROR
 *
 * @param fixturesDir - Basisverzeichnis für Holodeck-Fixtures.
 * @param bodyFilePath - Relativer Pfad zur Body-Datei (z. B. "html/test1.html").
 * @returns Inhalt der Datei als String.
 */
export function readBodyFileContent(
  fixturesDir: string,
  bodyFilePath: string,
): string {
  const resolvedPath = resolve(fixturesDir, bodyFilePath);

  if (!resolvedPath.startsWith(resolve(fixturesDir))) {
    throw new HolodeckSceneLoadError({
      code: HolodeckSceneLoadErrorCode.FILESYSTEM_ERROR,
      message: `Invalid bodyFile path: ${bodyFilePath}`,
      path: 'response.bodyFile',
      received: bodyFilePath,
    });
  }

  try {
    return readFileSync(resolvedPath, 'utf8');
  } catch {
    throw new HolodeckSceneLoadError({
      code: HolodeckSceneLoadErrorCode.FILESYSTEM_ERROR,
      message: `Failed to read body file: ${bodyFilePath}`,
      path: 'response.bodyFile',
      received: bodyFilePath,
    });
  }
}
