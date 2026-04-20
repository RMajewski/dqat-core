import type { DqatWorld } from '#setup';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Beendet das Holodeck kontrolliert und sichert zuvor die aufgezeichneten Logs.
 *
 * Die Methode übernimmt einen vollständigen Lifecycle-Abschluss des Holodecks:
 * - Prüft, ob eine Holodeck-Instanz vorhanden ist (no-op, wenn nicht)
 * - Liest alle aktuell vorhandenen Log-Nachrichten aus
 * - Persistiert die Logs (z. B. als Report-Datei pro Szenario)
 * - Beendet anschließend das Holodeck
 * - Entfernt die Referenz aus der World (`world.holodeck = undefined`)
 *
 * Die Reihenfolge ist bewusst gewählt: Logs müssen vor dem Stop ausgelesen werden,
 * da sie danach nicht mehr verfügbar sind.
 *
 * Die Methode ist idempotent ausgelegt und kann mehrfach aufgerufen werden,
 * ohne unerwünschte Seiteneffekte zu verursachen.
 *
 * Typischer Einsatz:
 * - Im Gherkin-Step „Wenn das Holodeck gestoppt wird“
 * - Im After-Hook zur Sicherstellung eines sauberen Testabschlusses
 */
export async function shutdownHolodeckWithLogs(
  world: DqatWorld,
): Promise<void> {
  if (!world.holodeck) {
    return;
  }

  const scenarioId = world.get('scenario.id');
  const reportDirectoryPath = join('test', 'reports', 'mockserver');
  const reportFilePath = join(reportDirectoryPath, `${scenarioId}.log`);
  mkdirSync(reportDirectoryPath, { recursive: true });

  const mockserverMessage = await world.holodeck.retrieveLogMessages();
  const lines: string[] = [
    `Cucumber id: ${world.get('scenario.cucumberScenarioId')}`,
    `Scenario name: ${world.get('scenario.name')}`,
    `Scenario language: ${world.get('scenario.language')}`,
    ...mockserverMessage,
  ];
  writeFileSync(reportFilePath, lines.join('\n'), 'utf8');

  await world.holodeck.stop();
  world.holodeck = undefined;
}
