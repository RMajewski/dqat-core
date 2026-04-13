import type { HolodeckSceneDocument } from '../../../../src/type/holodeck/sceneDocument.ts';

/**
 * Szene „time“ – testet deterministische Zeitpunkte ({{now}} und {{nowEpochMs}}).
 * - Keine Variablen
 * - Ziel: sicherstellen, dass Zeitwerte korrekt eingesetzt werden
 */
export const timeScene: HolodeckSceneDocument = {
  name: 'time',
  version: 1,
  description: 'Temporal markers stabilized at current Astrometric reading.',
  routes: [
    {
      id: 'get-astrometric-time',
      request: {
        method: 'GET',
        path: '/api/astrometrics/time',
      },
      response: {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: {
          stardate: '{{now}}',
          epoch: '{{nowEpochMs}}',
        },
      },
      times: { unlimited: true },
    },
  ],
};
