import {
  DEFAULT_DOUBLE_UNDERSCORE_IS_SEPARATOR,
  DEFAULT_DROP_UNDEFINED,
  DEFAULT_ENV_PARSE,
  DEFAULT_FLATTEN,
  DEFAULT_INCLUDE_ARRAY_INDICES,
  DEFAULT_SEPARATOR,
  DEFAULT_TO_LOWER_CASE,
} from '../../config/starfleetDirectives.config.ts';
import type {
  IEnvProviderOptions,
  IJsonFileProviderOptions,
  IMemoryProviderOptions,
  NormalizedEnvOptions,
  NormalizedJsonFileOptions,
  NormalizedMemoryOptions,
} from '../../type/provider/providerOptions.ts';
import { normalizeParse } from './parsing.ts';

/**
 * Normalisiert Optionen für den Env-Provider.
 *
 * Setzt konsistente Defaults:
 * - separator → DEFAULT_SEPARATOR
 * - doubleUnderscoreIsSeparator → DEFAULT_DOUBLE_UNDERSCORE_IS_SEPARATOR
 * - toLowerCase → DEFAULT_TO_LOWER_CASE
 * - parse → zu Flags (per normalizeParse, auf Basis DEFAULT_ENV_PARSE)
 * - dropUndefined → DEFAULT_DROP_UNDEFINED
 *
 * Lässt `name` und `stripPrefix` optional.
 */
export function normalizeEnvOptions(
  input: IEnvProviderOptions,
): NormalizedEnvOptions {
  const {
    name,
    separator = DEFAULT_SEPARATOR,
    stripPrefix,
    doubleUnderscoreIsSeparator = DEFAULT_DOUBLE_UNDERSCORE_IS_SEPARATOR,
    toLowerCase = DEFAULT_TO_LOWER_CASE,
    parse,
    dropUndefined = DEFAULT_DROP_UNDEFINED,
  } = input ?? {};

  return {
    name,
    separator,
    stripPrefix,
    doubleUnderscoreIsSeparator,
    toLowerCase,
    parse: normalizeParse(parse, DEFAULT_ENV_PARSE),
    dropUndefined,
  };
}

/**
 * Normalisiert Optionen für den JSON-Datei-Provider.
 * Setzt ausschließlich den Separator-Default; `name` bleibt optional.
 */
export function normalizeJsonFileOptions(
  input: IJsonFileProviderOptions,
): NormalizedJsonFileOptions {
  const { name, separator = DEFAULT_SEPARATOR } = input ?? {};
  return { name, separator };
}

/**
 * Normalisiert Optionen für den In-Memory-Provider.
 * Setzt konsistente Defaults:
 * - separator, flatten, includeArrayIndices, dropUndefined
 * `name` bleibt optional.
 */
export function normalizeMemoryOptions(
  input: IMemoryProviderOptions,
): NormalizedMemoryOptions {
  const {
    name,
    separator = DEFAULT_SEPARATOR,
    flatten = DEFAULT_FLATTEN,
    includeArrayIndices = DEFAULT_INCLUDE_ARRAY_INDICES,
    dropUndefined = DEFAULT_DROP_UNDEFINED,
  } = input ?? {};

  return {
    name,
    separator,
    flatten,
    includeArrayIndices,
    dropUndefined,
  };
}
