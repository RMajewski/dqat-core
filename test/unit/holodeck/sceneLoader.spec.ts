/**
 * Diese Tests prüfen den Scene-Loader des Holodecks.
 *
 * Fokus:
 * - Szenen-Datei wird geladen (happy / timeout / serverError)
 * - JSON-Schema wird strikt validiert
 * - Default-Werte aus "variables" werden angewendet
 * - Übergabe-Parameter (sceneParams) überschreiben Defaults typ-sicher
 * - Templates wie {{latencyMs}}, {{now}}, {{nowEpochMs}} werden korrekt ersetzt
 * - delayMs wird korrekt nach number gecastet
 */

import Ajv2020 from 'ajv/dist/2020.js';
import { describe, expect, it } from 'vitest';
import { HolodeckSceneLoadError } from '../../../src/holodeck/holodeck.error.ts';
import { SceneLoader } from '../../../src/holodeck/sceneLoader.ts';
import { HolodeckSceneLoadErrorCode } from '../../../src/type/holodeck/holodeck.error.ts';
import type { HolodeckSceneDocument } from '../../../src/type/holodeck/sceneDocument.ts';
import { badTemplateScene } from './scene/badTemplate.scene.ts';
import { bodyAndBodyFileScene } from './scene/bodyAndBodyFile.scene.ts';
import { bodyFileScene } from './scene/bodyFile.scene.ts';
import { bodyFileWithTemplateScene } from './scene/bodyFileWithTemplate.scene.ts';
import { happyScene } from './scene/happy.scene.ts';
import { serverErrorScene } from './scene/serverError.scene.ts';
import { timeScene } from './scene/time.scene.ts';
import { timeoutScene } from './scene/timeout.scene.ts';
import { withoutResponseBodyScene } from './scene/withoutResponseBody.scene.ts';

describe('SceneLoader', () => {
  const nowDate = '2025-10-24T15:00:00.000Z' as const;

  describe('happyScene', () => {
    const now = new Date(nowDate);
    const loader = buildLoaderWithInMemoryScenes({ happy: happyScene }, now);

    it('setzt name und version korrekt', async () => {
      const loaded = await loader.loadScene('happy', {});
      expect(loaded.name).toBe('happy');
      expect(loaded.version).toBe(1);
    });

    it('übernimmt request.method und request.path korrekt', async () => {
      const loaded = await loader.loadScene('happy', {});
      const route = loaded.routes[0];
      expect(route.request.method).toBe('GET');
      expect(route.request.path).toBe('/api/sensors');
    });

    it('rendert Templates in response.body ({{now}})', async () => {
      const loaded = await loader.loadScene('happy', {});
      const body: any = loaded.routes[0].response.body;
      expect(body.sensors[0].updatedAt).toBe(nowDate);
    });

    it('wendet Default-Variablenwerte an (latencyMs default 0)', async () => {
      const loaded = await loader.loadScene('happy', {});
      const delayMs = loaded.routes[0].response.delayMs;
      expect(delayMs).toBe(0);
    });

    it('castet delayMs nach number', async () => {
      const loaded = await loader.loadScene('happy', {});
      expect(typeof loaded.routes[0].response.delayMs).toBe('number');
    });

    it('setzt times korrekt auf { unlimited: true }', async () => {
      const loaded = await loader.loadScene('happy', {});
      expect(loaded.routes[0].times).toEqual({ unlimited: true });
    });
  });

  describe('bodyFile', () => {
    const now = new Date(nowDate);

    it('lädt response.body aus bodyFile', async () => {
      const loader = buildLoaderWithInMemoryScenes(
        { bodyFile: bodyFileScene },
        now,
        {
          'html/test1.html': '<h1>Testseite</h1>',
        },
      );

      const loaded = await loader.loadScene('bodyFile', {});
      const body = loaded.routes[0].response.body;

      expect(body).toBe('<h1>Testseite</h1>');
    });

    it('rendert Templates im geladenen bodyFile-Inhalt', async () => {
      const loader = buildLoaderWithInMemoryScenes(
        { bodyFileWithTemplate: bodyFileWithTemplateScene },
        now,
        {
          'html/test-template.html': '<h1>{{title}}</h1>',
        },
      );

      const loaded = await loader.loadScene('bodyFileWithTemplate', {});
      const body = loaded.routes[0].response.body;

      expect(body).toBe('<h1>Schwarze Wegameise</h1>');
    });

    it('wirft schemaViolation bei unbekannter Template-Variable im bodyFile-Inhalt', async () => {
      const loader = buildLoaderWithInMemoryScenes(
        { bodyFile: bodyFileScene },
        now,
        {
          'html/test1.html': '<h1>{{missingTitle}}</h1>',
        },
      );

      await expect(loader.loadScene('bodyFile', {})).rejects.toMatchObject({
        code: HolodeckSceneLoadErrorCode.SCHEMA_VIOLATION,
        path: 'routes[0].response.body',
      });
    });

    it('wirft filesystemError, wenn bodyFile nicht gelesen werden kann', async () => {
      const loader = buildLoaderWithInMemoryScenes(
        { bodyFile: bodyFileScene },
        now,
        {},
      );

      await expect(loader.loadScene('bodyFile', {})).rejects.toMatchObject({
        code: HolodeckSceneLoadErrorCode.FILESYSTEM_ERROR,
        path: 'routes[0].response.bodyFile',
      });
    });
  });

  describe('timeoutScene', () => {
    const now = new Date(nowDate);
    const loader = buildLoaderWithInMemoryScenes(
      { timeout: timeoutScene },
      now,
    );

    it('verwendet Default-Latenz (5000 ms), wenn keine sceneParams übergeben werden', async () => {
      const loaded = await loader.loadScene('timeout', {});
      const delayMs = loaded.routes[0].response.delayMs;
      expect(delayMs).toBe(5000);
    });

    it('überschreibt Default-Latenz über sceneParams', async () => {
      const loaded = await loader.loadScene('timeout', {
        latencyMs: 1234,
      });
      const delayMs = loaded.routes[0].response.delayMs;
      expect(delayMs).toBe(1234);
    });

    it('wirft invalidParams bei falschem Parametertyp', async () => {
      await expect(
        loader.loadScene('timeout', {
          latencyMs: 'warp-distortion', // absichtlich string statt number
        }),
      ).rejects.toMatchObject({
        code: HolodeckSceneLoadErrorCode.INVALID_PARAMS,
        path: 'variables.latencyMs',
      });
    });
  });

  describe('timeScene', () => {
    const now = new Date(nowDate);
    const expectedEpochMs = now.getTime();
    const loader = buildLoaderWithInMemoryScenes({ time: timeScene }, now);

    it('rendert {{now}} als ISO-String', async () => {
      const loaded = await loader.loadScene('time', {});
      const body: any = loaded.routes[0].response.body;
      expect(body.stardate).toBe(nowDate);
    });

    it('rendert {{nowEpochMs}} als number', async () => {
      const loaded = await loader.loadScene('time', {});
      const body: any = loaded.routes[0].response.body;
      expect(typeof body.epoch).toBe('number');
      expect(body.epoch).toBe(expectedEpochMs);
    });
  });

  describe('serverErrorScene', () => {
    const now = new Date(nowDate);
    const loader = buildLoaderWithInMemoryScenes(
      { serverError: serverErrorScene },
      now,
    );

    it('setzt den Statuscode 500 korrekt', async () => {
      const loaded = await loader.loadScene('serverError', {});
      const statusCode = loaded.routes[0].response.statusCode;
      expect(statusCode).toBe(500);
    });

    it('füllt Fehler-Body mit Timestamp ({{nowEpochMs}})', async () => {
      const loaded = await loader.loadScene('serverError', {});
      const body: any = loaded.routes[0].response.body;
      expect(body.error).toBe('WarpCoreFailure');
      expect(typeof body.at).toBe('number');
      expect(body.at).toBe(now.getTime());
    });
  });

  describe('Fehlerfälle', () => {
    const now = new Date(nowDate);

    it('wirft schemaViolation bei unbekannter Template-Variable', async () => {
      const loader = buildLoaderWithInMemoryScenes(
        { badTemplate: badTemplateScene },
        now,
      );

      await expect(loader.loadScene('badTemplate', {})).rejects.toMatchObject({
        code: HolodeckSceneLoadErrorCode.SCHEMA_VIOLATION,
        path: 'routes[0].response.body.message',
      });
    });

    it('wirft UNKNOWN_SCENE, wenn die Szene nicht existiert', async () => {
      const loader = buildLoaderWithInMemoryScenes({ happy: happyScene }, now);

      await expect(loader.loadScene('doesNotExist', {})).rejects.toMatchObject({
        code: HolodeckSceneLoadErrorCode.UNKNOWN_SCENE,
      });
    });

    it('wirft schemaViolation, wenn das Scene-Dokument selbst ungültig ist (z. B. keine routes)', async () => {
      const invalidScene = {
        name: 'broken',
        version: 1,
        // routes fehlt absichtlich -> verletzt Schema
      } as unknown as HolodeckSceneDocument;

      const loader = buildLoaderWithInMemoryScenes(
        { broken: invalidScene },
        now,
      );

      await expect(loader.loadScene('broken', {})).rejects.toMatchObject({
        code: HolodeckSceneLoadErrorCode.SCHEMA_VIOLATION,
        path: 'scene',
      });
    });

    it('wirft schemaViolation, wenn response weder body noch bodyFile enthält', async () => {
      const loader = buildLoaderWithInMemoryScenes(
        { withoutResponseBody: withoutResponseBodyScene },
        now,
      );

      await expect(
        loader.loadScene('withoutResponseBody', {}),
      ).rejects.toMatchObject({
        code: HolodeckSceneLoadErrorCode.SCHEMA_VIOLATION,
        path: 'scene',
      });
    });

    it('wirft schemaViolation, wenn response body und bodyFile gleichzeitig enthält', async () => {
      const loader = buildLoaderWithInMemoryScenes(
        { bodyAndBodyFile: bodyAndBodyFileScene },
        now,
        {
          'html/test1.html': '<h1>Testseite</h1>',
        },
      );

      await expect(
        loader.loadScene('bodyAndBodyFile', {}),
      ).rejects.toMatchObject({
        code: HolodeckSceneLoadErrorCode.SCHEMA_VIOLATION,
        path: 'scene',
      });
    });
  });
});

function buildLoaderWithInMemoryScenes(
  sceneMap: Record<string, HolodeckSceneDocument>,
  fixedNow: Date,
  bodyFileContentMap: Record<string, string | undefined> = {},
): SceneLoader {
  const ajv = new Ajv2020({
    allErrors: true,
    strict: true,
    allowUnionTypes: true,
    coerceTypes: false,
  });

  return new SceneLoader({
    readSceneDocumentByName: async (sceneName: string) => {
      const document = sceneMap[sceneName];
      if (!document) {
        throw new HolodeckSceneLoadError({
          code: HolodeckSceneLoadErrorCode.UNKNOWN_SCENE,
          message: `Scene ${sceneName} not found`,
          path: 'scene',
        });
      }
      return document;
    },
    readBodyFileContent: (bodyFilePath: string) => {
      const content = bodyFileContentMap[bodyFilePath];

      if (content === undefined) {
        throw new HolodeckSceneLoadError({
          code: HolodeckSceneLoadErrorCode.FILESYSTEM_ERROR,
          message: `Body file ${bodyFilePath} not found`,
          path: 'routes[0].response.bodyFile',
        });
      }

      return content;
    },
    nowProvider: () => fixedNow,
    ajvInstance: ajv,
  });
}
