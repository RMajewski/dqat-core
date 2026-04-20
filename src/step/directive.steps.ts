import { Then } from '@cucumber/cucumber';
import { assertDirectiveHasValueCallback } from '../callback/directive.ts';

Then(
  'sollte der Starfleet Directive Key {string} den Wert {string} haben',
  assertDirectiveHasValueCallback,
);
