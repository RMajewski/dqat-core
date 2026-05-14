import type { Linter } from 'eslint';
import holodeckSceneSchema from '../schemas/holodeck.scene.v1.json' with { type: 'json' };
import { createJsonSchemaValidationConfig } from './createJsonSchemaValidationConfig.ts';

/**
 * Vorgefertigte ESLint-Konfiguration für Holodeck-Szenen.
 */
export const holodeckSceneConfig: Linter.Config[] =
  createJsonSchemaValidationConfig({
    files: ['**/*.scene.json'],
    fileMatch: ['**/*.scene.json'],
    schema: holodeckSceneSchema,
  });
