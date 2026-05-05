import type { HolodeckSceneDocument } from '../../../../src/type/holodeck/sceneDocument.ts';

/**
 * Szene „bodyAndBodyFile“ – absichtlich fehlerhaft.
 *
 * Diese Szene enthält gleichzeitig `response.body` und `response.bodyFile`.
 * Sie dient der Prüfung, dass das JSON-Schema genau eine Body-Quelle erlaubt.
 */
export const bodyAndBodyFileScene: HolodeckSceneDocument = {
  name: 'bodyAndBodyFile',
  version: 1,
  description:
    'Invalid scene with response body and response body file at the same time.',
  routes: [
    {
      id: 'body-and-body-file-route',
      request: {
        method: 'GET',
        path: '/body-and-body-file',
      },
      response: {
        statusCode: 200,
        headers: { 'Content-Type': 'text/html' },
        body: '<h1>Direkter Body</h1>',
        bodyFile: 'html/test1.html',
      },
      times: { unlimited: true },
    },
  ],
};
