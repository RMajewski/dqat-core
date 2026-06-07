import type { ITestCaseHookParameter } from '@cucumber/cucumber';
import { Before } from '@cucumber/cucumber';
import { Astrometrics } from '../../astrometrics/astrometrics.ts';
import type { DqatWorld } from '../DqatWorld.ts';
import { collectTagNames, deriveEffectiveDirectives } from '../init.ts';
import { extractAstrometricsInitFromTags } from '../tags/clock.tags.ts';

/**
 * Before-Hook (pro Szenario)
 * – Tags sammeln und zu Effective-Directives ableiten
 * – Korrelation setzen (runId/scenarioId, minimal gehalten)
 * – Start-Log schreiben
 */
export function beforeScenarioGeneral(): void {
  Before(function (this: DqatWorld, scenario: ITestCaseHookParameter) {
    const tagNames = collectTagNames(scenario);
    const effectiveDirectives = deriveEffectiveDirectives(
      tagNames,
      this.recordMissionEvent,
    );

    this.loadStarfleetDirectives([]);

    // Minimalistische Korrelation (kann später durch echte IDs ersetzt werden)
    const runId = (this.get('run.id') as string) ?? `run-${Date.now()}`;
    const scenarioId = `scenario-${Date.now()}`;

    // TODO René: Ein Objekt mit allen Keys erstellen, so dass diese immer gleich geschrieben werden
    this.set('run.id', runId);
    this.set('scenario.id', scenarioId);
    this.set('scenario.cucumberScenarioId', scenario.pickle.id);
    this.set('scenario.name', scenario.pickle.name);
    this.set('scenario.language', scenario.pickle.language);
    this.set('effectiveDirectives', effectiveDirectives);
    this.set('tags', tagNames);

    this.recordMissionEvent('info', 'scenario started', {
      correlation: { runId, scenarioId },
      effectiveDirectives,
    });
  });
}

/**
 * Before-Hook (wenn @astrometrics gesetzt ist)
 * - Initialisiert Astrometrics mit
 */
export function beforeHookAstrometricsTags(): void {
  Before(
    { tags: '@astrometrics' },
    function (this: DqatWorld, scenario: ITestCaseHookParameter) {
      const tagNames = collectTagNames(scenario);

      const init = extractAstrometricsInitFromTags(tagNames);
      this.astrometrics = new Astrometrics(init);
    },
  );
}
