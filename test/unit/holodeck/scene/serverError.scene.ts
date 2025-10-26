import type { HolodeckSceneDocument } from '../../../../src/type/holodeck/sceneDocument.ts';

/**
 * Szene „serverError“ – simuliert kritischen Warp-Kern-Fehler.
 * - Keine Variablen
 * - 500 Internal Error
 */
export const serverErrorScene: HolodeckSceneDocument = {
  name: 'serverError',
  version: 1,
  description: 'Warp core breach imminent – internal subsystem failure.',
  routes: [
    {
      id: 'get-warp-core-status',
      request: {
        method: 'GET',
        path: '/api/warp-core/status',
      },
      response: {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: {
          error: 'WarpCoreFailure',
          at: '{{nowEpochMs}}',
        },
      },
      times: { unlimited: true },
    },
  ],
};
