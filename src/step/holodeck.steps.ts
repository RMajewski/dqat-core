import { Given, Then, When } from '@cucumber/cucumber';
import {
  expectNoActiveHolodeckCallback,
  loadSceneCallback,
  startHolodeckCallback,
  stopHolodeckCallback,
} from '../callback/holodeck.ts';

Given('das Holodeck wurde im Modus {string} gestartet', startHolodeckCallback);

When('die Holodeck-Szene {string} geladen wird', loadSceneCallback);

When('das Holodeck gestoppt wird', stopHolodeckCallback);

Then('ist kein Holodeck mehr aktiv', expectNoActiveHolodeckCallback);
