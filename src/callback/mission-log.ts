import assert from 'node:assert';
import type { DqatWorld } from '../setup/DqatWorld.ts';
import type { MissionLogLevel } from '../type/astrometrics/missionLog.ts';

/**
 *
 * @param this DqatWorld Das Weltobjekt mit allen Einstellungen und Daten.
 *
 * @param level MissionLogLevel Level des Missionslog-Eintrages.
 *
 * @param message string Nachricht die geloggt werden soll.
 */
export function missionLogWriteEntryWithLevelAndMessage(
  this: DqatWorld,
  level: MissionLogLevel,
  message: string,
): void {
  this.log(level, message);
}

/**
 * Überprüft, ob ein Missionslog-Eintrag einen Zeitstempel der World-Zeit.
 *
 * @param this DqatWorld Das Weltobjekt mit allen Einstellungen und Daten.
 */
export function missionLogContainsATimestampFromWorldTime(
  this: DqatWorld,
): void {
  const buffer = this.getMissionLogBuffer();
  assert.ok(buffer.length > 0, 'Es existiert kein Missionslog-Eintrag');
  const last = buffer[buffer.length - 1];
  assert.ok(
    last.timestamp instanceof Date,
    'timestamp fehlt oder ist kein Date',
  );
}

// TODO: Docstring hinzufügen
export function missionLogTheDetailsContainCorrelationWithRunIdAndScenarioIdAndStepId(
  this: DqatWorld,
): void {
  const buffer = this.getMissionLogBuffer();
  assert.ok(buffer.length > 0, 'Es existiert kein Missionslog-Eintrag');
  const last = buffer[buffer.length - 1];
  const correlation = (last.details as any)?.correlation;
  assert.ok(correlation, 'details.correlation fehlt');
  assert.ok('runId' in correlation, 'runId fehlt in correlation');
  assert.ok('scenarioId' in correlation, 'scenarioId fehlt in correlation');
}

// TODO: Docstring hinzufügen
export function missionLogHasEntryWithLevelToIgnoredTags(
  this: DqatWorld,
  level: MissionLogLevel,
): void {
  const buffer = this.getMissionLogBuffer();
  const anyWarn = buffer.some(
    (e) => e.level === (level as any) && /tag/i.test(e.message),
  );
  assert.ok(
    anyWarn,
    `Kein Missionslog-Eintrag mit Level "${level}" zu ignorierten/ungültigen Tags gefunden`,
  );
}
