import type { Linter } from 'eslint';
import jsonSchemaValidator from 'eslint-plugin-json-schema-validator';
import holodeckSceneSchema from './schemas/holodeck.scene.v1.json' with { type: 'json' };

/**
 * Vorgefertigte ESLint-Konfiguration für Holodeck-Szenen.
 */
export const holodeckSceneConfig: Linter.Config[] = [
  ...jsonSchemaValidator.configs.base,
  {
    files: ['**/*.scene.json'],
    rules: {
      'json-schema-validator/no-invalid': [
        'error',
        {
          schemas: [
            {
              fileMatch: ['**/*.scene.json'],
              schema: holodeckSceneSchema,
            },
          ],
        },
      ],
    },
  },
];

/**
 * Stellt die ESLint-Erweiterungen von DQAT bereit.
 */
export default {
  configs: {
    holodeck: holodeckSceneConfig,
  },
};
