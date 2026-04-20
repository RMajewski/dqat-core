/**
 * @file loadStarfleetDirectives.ts
 * @description Baut pro Szenario eine neue IStarfleetDirectives-Instanz auf Basis von:
 *  - JSON-Providern (nur wenn Datei existiert)
 *  - ENV-Provider (bekommt ungefiltert process.env + ggf. Optionen aus erster JSON-Datei)
 *  - Memory-Provider (leer, szenario-lokal, höchste Priorität)
 *
 * Priorität (wegen preferFirst:true → erster gewinnt):
 *  1) Memory
 *  2) Env
 *  3) JSON: ./test/acceptance/dqat.config.json
 *  4) JSON: ./test/dqat.config.json
 *  5) JSON: ./dqat.config.json
 */

import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { STARFLEET_DIRECTIVE_CONFIG_FILES } from '../config/starfleetDirectives.config.ts';
import { StarfleetDirectiveKey } from '../config/starfleetDirectives.keys.ts';
import { EnvProvider } from '../factory/provider/envProvider.ts';
import { JsonFileProvider } from '../factory/provider/jsonFileProvider.ts';
import { MemoryProvider } from '../factory/provider/memoryProvider.ts';
import { createStarfleetDirectives } from '../factory/starfleetDirective.ts';
import type { IEnvProviderOptions } from '../type/provider/providerOptions.ts';
import type {
  LoadedStarfleetDirectives,
  StarfleetDirectiveProvider,
} from '../type/starfleetDirective.ts';

/**
 * Erstellt pro Szenario eine frische Directives-Instanz.
 *
 * Ablauf:
 * 1) JSON-Dateien in Prioritätsreihenfolge prüfen; pro vorhandener Datei einen JsonFileProvider erzeugen.
 *    - Erste Datei mit Env-Optionen bestimmt die Env-Provider-Konfiguration (Key: "envProviderOptions").
 * 2) Env-Provider mit vollständigem process.env und ggf. Options erzeugen.
 * 3) Leeren Memory-Provider erzeugen.
 * 4) Provider-Liste in Prioritätsreihenfolge zusammenstellen.
 * 5) createStarfleetDirectives() mit preferFirst:true aufrufen.
 */
export function loadStarfleetDirectives(
  additionalPaths: string[] = [],
): LoadedStarfleetDirectives {
  const jsonProviders: StarfleetDirectiveProvider[] = [];
  let envProviderOptionsFromConfig: Partial<IEnvProviderOptions> | undefined;

  const paths: string[] = [
    ...STARFLEET_DIRECTIVE_CONFIG_FILES,
    ...additionalPaths,
  ];
  for (const relativePath of paths) {
    const absolutePath = resolve(process.cwd(), relativePath);
    if (!existsSync(absolutePath)) {
      continue;
    }

    const providerName = `json:${relativePath}`;
    const jsonFileProvider = new JsonFileProvider(absolutePath, {
      name: providerName,
    });
    jsonProviders.push(jsonFileProvider);

    if (envProviderOptionsFromConfig === undefined) {
      const maybeEnvOptions = extractEnvProviderOptionsFromFlatRecord(
        jsonFileProvider.list(StarfleetDirectiveKey.envProviderOptions),
      );

      if (maybeEnvOptions && typeof maybeEnvOptions === 'object') {
        envProviderOptionsFromConfig = maybeEnvOptions;
      }
    }
  }

  const environmentMap: Record<string, string | undefined> = { ...process.env };
  const envProvider = new EnvProvider(environmentMap, {
    name: 'env',
    ...(envProviderOptionsFromConfig ?? {}),
  });

  const memoryProvider = new MemoryProvider({}, { name: 'memory' });

  const providersInPriorityOrder: StarfleetDirectiveProvider[] = [
    memoryProvider,
    envProvider,
    ...jsonProviders,
  ];

  // TODO Optionen aus starfleetDirectives laden
  const starfleetDirectives = createStarfleetDirectives(
    providersInPriorityOrder,
    { preferFirst: true, freeze: true },
  );

  return {
    starfleetDirectives,
    memoryProvider,
  };
}

/**
 * Extrahiert EnvProviderOptions aus flachen Starfleet-Directive-Keys
 * und baut daraus ein verschachteltes Objekt.
 *
 * Unterstützt ausschließlich Keys der Form:
 *   envProviderOptions.xxx
 *
 * Regeln:
 * - Keys ohne Unterstruktur (z. B. "envProviderOptions") werden ignoriert
 * - Unterstrukturen werden rekursiv aufgebaut (z. B. parse.numbers)
 * - Wenn ein Key sowohl als Wert als auch als Objekt verwendet wird,
 *   wird der direkte Wert ignoriert und die Unterstruktur verwendet
 * - Mehrfache Definitionen desselben finalen Keys führen zu einem Fehler
 * - Wenn keine passenden Keys existieren, wird `undefined` zurückgegeben
 *
 * @param flatRecord Flaches Record aus Provider.list()
 * @returns Partial<IEnvProviderOptions> oder undefined
 */
function extractEnvProviderOptionsFromFlatRecord(
  flatRecord: Record<string, unknown>,
): Partial<IEnvProviderOptions> | undefined {
  const prefix = 'envProviderOptions.';
  const result: Record<string, unknown> = {};

  let hasMatchingEntries = false;

  for (const [fullKey, value] of Object.entries(flatRecord)) {
    if (!fullKey.startsWith(prefix)) {
      continue;
    }

    hasMatchingEntries = true;

    const relativeKey = fullKey.slice(prefix.length);
    assignNestedValue(result, relativeKey, value, fullKey);
  }

  return hasMatchingEntries
    ? (result as Partial<IEnvProviderOptions>)
    : undefined;
}

/**
 * Schreibt einen Wert anhand eines Punkt-Pfades in ein verschachteltes Objekt.
 *
 * @param target Zielobjekt
 * @param relativeKey Schlüssel ohne Prefix, z. B. "parse.numbers"
 * @param value Zu setzender Wert
 * @param originalKey Ursprünglicher vollständiger Schlüssel für Fehlermeldungen
 */
function assignNestedValue(
  target: Record<string, unknown>,
  relativeKey: string,
  value: unknown,
  originalKey: string,
): void {
  const pathSegments = relativeKey.split('.');
  const lastSegmentIndex = pathSegments.length - 1;

  let current = target;

  for (const [index, segment] of pathSegments.entries()) {
    const isLastSegment = index === lastSegmentIndex;

    if (isLastSegment) {
      assignFinalValue(current, segment, value, originalKey);
      return;
    }

    current = ensureNestedObject(current, segment);
  }
}

/**
 * Stellt sicher, dass unter dem angegebenen Segment ein Objekt existiert.
 * Falls dort bereits ein primitiver Wert steht, wird dieser verworfen.
 *
 * @param target Zielobjekt
 * @param segment Aktuelles Pfadsegment
 * @returns Das verschachtelte Objekt für das nächste Segment
 */
function ensureNestedObject(
  target: Record<string, unknown>,
  segment: string,
): Record<string, unknown> {
  const existingValue = target[segment];

  if (
    existingValue === undefined ||
    typeof existingValue !== 'object' ||
    existingValue === null
  ) {
    target[segment] = {};
  }

  return target[segment] as Record<string, unknown>;
}

/**
 * Setzt einen finalen Wert. Doppelte finale Keys führen zu einem Fehler.
 *
 * @param target Zielobjekt
 * @param segment Finales Pfadsegment
 * @param value Zu setzender Wert
 * @param originalKey Ursprünglicher vollständiger Schlüssel für Fehlermeldungen
 */
function assignFinalValue(
  target: Record<string, unknown>,
  segment: string,
  value: unknown,
  originalKey: string,
): void {
  if (Object.hasOwn(target, segment)) {
    throw new Error(
      `Duplicate EnvProviderOptions key detected: "${originalKey}"`,
    );
  }

  target[segment] = value;
}
