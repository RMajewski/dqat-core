import type { HolodeckSceneDocument } from '../../../../src/type/holodeck/sceneDocument.ts';

/**
 * Szene „happy“ – alles funktioniert:
 * - Subraumkanäle aktiv
 * - Systeme antworten sofort (delayMs = 0)
 * - Beispiel für erfolgreiche Kommunikation
 */
export const happyScene: HolodeckSceneDocument = {
  name: 'happy',
  version: 1,
  description: 'Nominal operation – all subsystems responding.',
  variables: {
    latencyMs: { type: 'number', default: 0 },
  },
  routes: [
    {
      id: 'get-sensor-data',
      request: {
        method: 'GET',
        path: '/api/sensors',
      },
      response: {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: {
          sensors: [
            {
              id: 'warp-core-temp',
              status: 'STABLE',
              updatedAt: '{{now}}',
            },
          ],
        },
        delayMs: '{{latencyMs}}',
      },
      times: { unlimited: true },
    },
  ],
};
