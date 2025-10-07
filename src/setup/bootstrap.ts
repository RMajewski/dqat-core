import type { ITestCaseHookParameter } from '@cucumber/cucumber';
import { After, Before } from '@cucumber/cucumber';
import type { DqatWorld } from './DqatWorld.ts';
import { collectTagNames, deriveEffectiveDirectives } from './init.ts';
import { registerParameter } from './parameter.ts';

export function dqatBootstrap(): void {
  registerParameter();

  /**
   * Before-Hook (pro Szenario)
   * – Tags sammeln und zu Effective-Directives ableiten
   * – Korrelation setzen (runId/scenarioId, minimal gehalten)
   * – Start-Log schreiben
   */
  Before(function (this: DqatWorld, scenario: ITestCaseHookParameter) {
    const tagNames = collectTagNames(scenario);
    const effectiveDirectives = deriveEffectiveDirectives(tagNames, this.log);

    // Minimalistische Korrelation (kann später durch echte IDs ersetzt werden)
    const runId = (this.get('run.id') as string) ?? `run-${Date.now()}`;
    const scenarioId = `scenario-${Date.now()}`;

    this.set('run.id', runId);
    this.set('scenario.id', scenarioId);
    this.set('effectiveDirectives', effectiveDirectives);
    this.set('tags', tagNames);

    this.log('info', 'scenario started', {
      correlation: { runId, scenarioId },
      effectiveDirectives,
    });
  });

  /**
   * After-Hook (pro Szenario)
   * – MissionLog-Ende schreiben
   * – Ressourcen deterministisch aufräumen (LIFO, idempotent)
   * – Store optional leeren (Iteration 1: belassen für Debug)
   */
  After(async function (this: DqatWorld, scenario: ITestCaseHookParameter) {
    const runId = this.get('run.id') as string;
    const scenarioId = this.get('scenario.id') as string;

    this.log('info', 'scenario finished', {
      correlation: { runId, scenarioId },
      result: { status: scenario.result?.status },
    });

    await this.disposeAll();
  });
}
