import type { HolodeckSceneDocument } from '../../../../src/type/holodeck/sceneDocument.ts';

/**
 * Szene „bodyFile“ – lädt den Response-Body aus einer Datei.
 *
 * Diese Szene prüft, ob `response.bodyFile` als Dateiverweis akzeptiert wird
 * und der geladene Dateiinhalt später als `response.body` verwendet werden kann.
 */
export const bodyFileScene: HolodeckSceneDocument = {
  name: 'bodyFile',
  version: 1,
  description: 'Scene with response body loaded from a fixture file.',
  routes: [
    {
      id: 'body-file-route',
      request: {
        method: 'GET',
        path: '/body-file',
      },
      response: {
        statusCode: 200,
        headers: { 'Content-Type': 'text/html' },
        bodyFile: 'html/test1.html',
      },
      times: { unlimited: true },
    },
  ],
};
