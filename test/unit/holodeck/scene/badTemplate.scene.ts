import type { HolodeckSceneDocument } from '../../../../src/type/holodeck/sceneDocument.ts';

/**
 * Szene „badTemplate“ – absichtlich fehlerhaft.
 * - Verweist auf eine nicht definierte Variable ({{unknownVariable}})
 * - Dient der Prüfung von schemaViolation im SceneLoader
 */
export const badTemplateScene: HolodeckSceneDocument = {
  name: 'badTemplate',
  version: 1,
  description: 'Faulty scene template for negative validation test.',
  routes: [
    {
      id: 'invalid-variable-ref',
      request: {
        method: 'GET',
        path: '/api/diagnostics',
      },
      response: {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: {
          message: 'Template variable missing: {{unknownVariable}}',
        },
      },
      times: { unlimited: true },
    },
  ],
};
