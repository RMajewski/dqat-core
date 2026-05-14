import type { Linter } from 'eslint';
import jsonSchemaValidator from 'eslint-plugin-json-schema-validator';

type CreateJsonSchemaValidationConfigOptions = {
  /**
   * Dateien, auf die die ESLint-Konfiguration angewendet wird.
   */
  files: string[];

  /**
   * Dateien, die durch das JSON-Schema validiert werden.
   */
  fileMatch: string[];

  /**
   * JSON-Schema, das für die Validierung verwendet wird.
   */
  schema: unknown;
};

/**
 * Erstellt eine ESLint-Konfiguration zur Validierung von JSON-Dateien
 * über `eslint-plugin-json-schema-validator`.
 *
 * Die Funktion bindet die Basis-Konfiguration des Plugins ein und ergänzt
 * eine `no-invalid`-Regel mit dem übergebenen JSON-Schema.
 */
export function createJsonSchemaValidationConfig(
  options: CreateJsonSchemaValidationConfigOptions,
): Linter.Config[] {
  return [
    ...jsonSchemaValidator.configs.base,
    {
      files: options.files,
      rules: {
        'json-schema-validator/no-invalid': [
          'error',
          {
            schemas: [
              {
                fileMatch: options.fileMatch,
                schema: options.schema,
              },
            ],
          },
        ],
      },
    },
  ];
}
