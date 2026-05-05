import type { HolodeckSceneDocument } from '../../../../src/type/holodeck/sceneDocument.ts';

/**
 * Szene „withoutResponseBody“ – absichtlich fehlerhaft.
 *
 * Diese Szene enthält weder `response.body` noch `response.bodyFile`.
 * Sie dient der Prüfung, dass das JSON-Schema eine Response ohne Body-Quelle ablehnt.
 */
export const withoutResponseBodyScene: HolodeckSceneDocument = {
  name: 'withoutResponseBody',
  version: 1,
  description: 'Invalid scene without response body or response body file.',
  routes: [
    {
      id: 'without-response-body-route',
      request: {
        method: 'GET',
        path: '/without-response-body',
      },
      response: {
        statusCode: 200,
      },
      times: { unlimited: true },
    },
  ],
};
