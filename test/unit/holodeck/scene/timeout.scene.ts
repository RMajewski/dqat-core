import type { HolodeckSceneDocument } from '../../../../src/type/holodeck/sceneDocument.ts';

/**
 * Szene „timeout“ – simuliert eine Kommunikationsverzögerung.
 * - Latenz über Variable steuerbar
 */
export const timeoutScene: HolodeckSceneDocument = {
  name: 'timeout',
  version: 1,
  description: 'Subspace communication delay detected.',
  variables: {
    latencyMs: { type: 'number', default: 5000 },
  },
  routes: [
    {
      id: 'get-subspace-signal',
      request: {
        method: 'GET',
        path: '/api/subspace/signal',
      },
      response: {
        statusCode: 200,
        body: { signal: 'OK' },
        delayMs: '{{latencyMs}}',
      },
      times: { unlimited: true },
    },
  ],
};
