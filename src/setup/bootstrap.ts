import { afterHookGeneral } from './hooks/after.ts';
import {
  beforeHookAstrometricsTags,
  beforeScenarioGeneral,
} from './hooks/before.ts';
import { registerParameter } from './parameter.ts';

export function dqatBootstrap(): void {
  registerParameter();

  beforeScenarioGeneral();
  beforeHookAstrometricsTags();

  afterHookGeneral();
}
