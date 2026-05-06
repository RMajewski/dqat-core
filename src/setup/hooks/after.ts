import type { ITestCaseHookParameter } from '@cucumber/cucumber';
import { After } from '@cucumber/cucumber';
import { shutdownHolodeckWithLogs } from '../../util/holodeck/shutdown.ts';
import type { DqatWorld } from '../DqatWorld.ts';

/**
 * After-Hook (pro Szenario)
 * – MissionLog-Ende schreiben
 * – Ressourcen deterministisch aufräumen (LIFO, idempotent)
 * – Store optional leeren (Iteration 1: belassen für Debug)
 */
export function afterHookGeneral(): void {
  After(async function (this: DqatWorld, scenario: ITestCaseHookParameter) {
    const runId = this.get('run.id') as string;
    const scenarioId = this.get('scenario.id') as string;

    this.recordMissionEvent('info', 'scenario finished', {
      correlation: { runId, scenarioId },
      result: { status: scenario.result?.status },
    });

    await shutdownHolodeckWithLogs(this);

    await this.disposeAll();
  });
}
