import type { HolodeckSceneDocument } from '../../../../src/type/holodeck/sceneDocument.ts';

/**
 * Szene „bodyFileWithTemplate“ – lädt den Response-Body aus einer Datei mit Template-Variable.
 *
 * Diese Szene prüft, ob Variablen auch innerhalb eines per `bodyFile`
 * geladenen Dateiinhalts gerendert werden.
 */
export const bodyFileWithTemplateScene: HolodeckSceneDocument = {
  name: 'bodyFileWithTemplate',
  version: 1,
  description:
    'Scene with response body loaded from a fixture file and rendered with variables.',
  variables: {
    title: {
      type: 'string',
      default: 'Schwarze Wegameise',
    },
  },
  routes: [
    {
      id: 'body-file-template-route',
      request: {
        method: 'GET',
        path: '/body-file-template',
      },
      response: {
        statusCode: 200,
        headers: { 'Content-Type': 'text/html' },
        bodyFile: 'html/test-template.html',
      },
      times: { unlimited: true },
    },
  ],
};
