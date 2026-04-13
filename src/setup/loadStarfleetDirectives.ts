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
  ILoadedStarfleetDirectives,
  IStarfleetDirectiveProvider,
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
): ILoadedStarfleetDirectives {
  const jsonProviders: IStarfleetDirectiveProvider[] = [];
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
      const maybeEnvOptions = jsonFileProvider.get(
        StarfleetDirectiveKey.envProviderOptions,
      ) as Partial<IEnvProviderOptions> | undefined;

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

  const providersInPriorityOrder: IStarfleetDirectiveProvider[] = [
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
