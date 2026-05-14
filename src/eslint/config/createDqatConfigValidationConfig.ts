import type { Linter } from 'eslint';
import dqatConfigSchema from '../schemas/dqat.config.v1.json' with { type: 'json' };
import { createJsonSchemaValidationConfig } from './createJsonSchemaValidationConfig.ts';

const DQAT_CONFIG_FILE_MATCH = ['**/dqat.config.json'];

/**
 * Erstellt eine ESLint-Konfiguration zur Validierung der `dqat.config.json`.
 *
 * Wenn kein Schema übergeben wird, wird das in `dqat-core` enthaltene
 * Standard-Schema für die DQAT-Konfiguration verwendet. Dadurch können reine
 * Core-Projekte ohne eigenes Projektschema validiert werden.
 *
 * Für Projekte mit Erweiterungspaketen kann ein zusammengesetztes Schema
 * übergeben werden, das z. B. Core-, Frontend- und DB-Schemas per `$ref`
 * kombiniert.
 */
export function createDqatConfigValidationConfig(
  schema: unknown = dqatConfigSchema,
): Linter.Config[] {
  return createJsonSchemaValidationConfig({
    files: DQAT_CONFIG_FILE_MATCH,
    fileMatch: DQAT_CONFIG_FILE_MATCH,
    schema,
  });
}
