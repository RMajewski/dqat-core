import { Given, Then, When } from '@cucumber/cucumber';
import {
  advanceWorldClock,
  assertSecondTimeNotBeforeFirst,
  assertTimeDifferenceExact,
  assertTimesExactlyEqual,
  assertTimesMonotonic,
  assertWorldAboveSystem,
  assertWorldBelowSystem,
  freezeClockAt,
  noteCurrentWorldTime,
  noteParallelSystemAndWorldTime,
} from '../callback/clock.ts';

Given('die Uhr ist auf den Zeitpunkt {string} eingefroren', freezeClockAt);

When('ich die aktuelle Zeit notiere', noteCurrentWorldTime);

When('ich notiere die aktuelle Zeit erneut', noteCurrentWorldTime);

When('ich die Zeit um {int} Millisekunden vorwärts bewege', advanceWorldClock);

Then('sind beide Zeitstempel exakt gleich', assertTimesExactlyEqual);

Then(
  'liegt der neue Zeitstempel exakt {int} Millisekunden über dem ersten',
  assertTimeDifferenceExact,
);

Then(
  'ist der zweite Zeitstempel größer oder gleich dem ersten',
  assertSecondTimeNotBeforeFirst,
);

Then(
  'ist die Sequenz der Zeitstempel monoton nicht fallend',
  assertTimesMonotonic,
);

When(
  'ich die Systemzeit und die World-Zeit parallel notiere',
  noteParallelSystemAndWorldTime,
);

Then(
  'liegt die World-Zeit exakt {int} Millisekunden über der Systemzeit',
  assertWorldAboveSystem,
);

Then(
  'liegt die World-Zeit exakt {int} Millisekunden unter der Systemzeit',
  assertWorldBelowSystem,
);
