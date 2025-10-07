import { Then, When } from '@cucumber/cucumber';
import {
  missionLogContainsATimestampFromWorldTime,
  missionLogHasEntryWithLevelToIgnoredTags,
  missionLogTheDetailsContainCorrelationWithRunIdAndScenarioIdAndStepId,
  missionLogWriteEntryWithLevelAndMessage,
} from '../callback/mission-log.ts';

When(
  'ich einen Missionslog-Eintrag mit Level {string} und Nachricht {string} schreibe',
  missionLogWriteEntryWithLevelAndMessage,
);

Then(
  'enthält der Eintrag einen Zeitstempel aus der World-Zeit',
  missionLogContainsATimestampFromWorldTime,
);

Then(
  'die Details enthalten correlation mit runId, scenarioId und stepId',
  missionLogTheDetailsContainCorrelationWithRunIdAndScenarioIdAndStepId,
);

Then(
  'existiert ein Missionslog-Eintrag mit Level {string} zu den ignorierten Tags',
  missionLogHasEntryWithLevelToIgnoredTags,
);
