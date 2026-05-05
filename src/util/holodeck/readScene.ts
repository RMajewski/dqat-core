import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { HolodeckSceneLoadError } from '../../holodeck/holodeck.error.ts';
import { HolodeckSceneLoadErrorCode } from '../../type/holodeck/holodeck.error.ts';
import type { HolodeckSceneDocument } from '../../type/holodeck/sceneDocument.ts';

/**
 * Lädt ein Holodeck-Szenen-Dokument aus dem Dateisystem.
 *
 * Der Dateiname wird aus dem Szenennamen gebildet:
 *   <fixturesDir>/<sceneName>.scene.json
 *
 * Fehlerbehandlung:
 * - Datei nicht gefunden → UNKNOWN_SCENE
 * - Ungültiges JSON → SCHEMA_VIOLATION
 *
 * @param fixturesDir - Basisverzeichnis für Holodeck-Fixtures.
 * @param sceneName - Name der Szene (ohne Dateiendung).
 * @returns Das geparste Szenen-Dokument.
 */
export async function readSceneDocumentByName(
  fixturesDir: string,
  sceneName: string,
): Promise<HolodeckSceneDocument> {
  const sceneFilePath = join(fixturesDir, `${sceneName}.scene.json`);

  let documentText: string;

  try {
    documentText = await readFile(sceneFilePath, 'utf8');
  } catch (error) {
    const isMissingFile =
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code?: string }).code === 'ENOENT';

    if (isMissingFile) {
      throw new HolodeckSceneLoadError({
        code: HolodeckSceneLoadErrorCode.UNKNOWN_SCENE,
        message: `Scene "${sceneName}" not found in ${fixturesDir}`,
        path: 'scene',
      });
    }

    throw error;
  }

  try {
    return JSON.parse(documentText) as HolodeckSceneDocument;
  } catch {
    throw new HolodeckSceneLoadError({
      code: HolodeckSceneLoadErrorCode.SCHEMA_VIOLATION,
      message: `Scene "${sceneName}" contains invalid JSON`,
      path: sceneFilePath,
    });
  }
}
