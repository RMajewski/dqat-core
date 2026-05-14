import { createDqatConfigValidationConfig } from './config/createDqatConfigValidationConfig.ts';
import { holodeckSceneConfig } from './config/holodeckSceneConfig.ts';

export { createJsonSchemaValidationConfig } from './config/createJsonSchemaValidationConfig.ts';
export { createDqatConfigValidationConfig, holodeckSceneConfig };

/**
 * Stellt die ESLint-Erweiterungen von DQAT bereit.
 */
export default {
  configs: {
    holodeck: holodeckSceneConfig,
    dqatConfigValidationConfig: createDqatConfigValidationConfig(),
  },
  createDqatConfigValidationConfig,
};
