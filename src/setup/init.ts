import type { ITestCaseHookParameter } from '@cucumber/cucumber';
import type { EffectiveDirectives } from '../type/setup.ts';

/**
 * Default-Directives (würden später aus StarfleetDirectives gelesen).
 */
export function defaultDirectives(): EffectiveDirectives {
  return {
    clockMode: 'system',
    clockOffsetMs: 0,
    worldSeed: undefined,
  };
}

/**
 * Extrahiert Tag-Namen aus Feature- und Szenario-Kontext.
 */
export function collectTagNames(
  hookParameter: ITestCaseHookParameter,
): string[] {
  const featureTags =
    hookParameter.gherkinDocument?.feature?.tags?.map((t) => t.name) ?? [];
  const scenarioTags = hookParameter.pickle?.tags?.map((t) => t.name) ?? [];
  // Feature-Tags zuerst, dann Scenario-Tags – Scenario überschreibt (Last Wins)
  return [...featureTags, ...scenarioTags];
}

/**
 * Wendet einen einzelnen Tag auf die Directives an (Last-Wins-Strategie).
 */
export function applyTagToDirectives(
  tag: string,
  current: EffectiveDirectives,
  log: (
    lvl: 'info' | 'warn' | 'error',
    msg: string,
    details?: Record<string, unknown>,
  ) => void,
): EffectiveDirectives {
  // @clock:<mode>
  if (/^@clock:(system|frozen|monotonic)$/.test(tag)) {
    const mode = tag.split(':')[1] as 'system' | 'frozen' | 'monotonic';
    return { ...current, clockMode: mode };
  }

  // @clockOffset:<signedMs>
  if (/^@clockOffset:[+-]?\d+$/.test(tag)) {
    const value = Number(tag.split(':')[1]);
    if (Number.isFinite(value)) {
      return { ...current, clockOffsetMs: value };
    }
    log('warn', 'invalid clockOffset tag ignored', { tag });
    return current;
  }

  // @worldSeed:<value>
  if (/^@worldSeed:.+/.test(tag)) {
    const raw = tag.substring('@worldSeed:'.length);
    const numeric = Number(raw);
    const seed: string | number = Number.isFinite(numeric) ? numeric : raw;
    return { ...current, worldSeed: seed };
  }

  // Unbekannter Tag – in dieser Iteration ignorieren, aber vermerken
  if (tag.startsWith('@clock') || tag.startsWith('@worldSeed')) {
    log('warn', 'unknown astrometrics-related tag ignored', { tag });
  }
  return current;
}

/**
 * Leitet aus Tag-Liste effektive Directives ab.
 */
export function deriveEffectiveDirectives(
  tags: string[],
  log: (
    lvl: 'info' | 'warn' | 'error',
    msg: string,
    details?: Record<string, unknown>,
  ) => void,
): EffectiveDirectives {
  return tags.reduce<EffectiveDirectives>(
    (acc, tag) => applyTagToDirectives(tag, acc, log),
    defaultDirectives(),
  );
}
