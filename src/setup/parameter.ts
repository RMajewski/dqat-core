import { defineParameterType } from '@cucumber/cucumber';

/**
 * Registriert alle eigene Parameter bei Cucumber, die in Test-Schritten genutzt werden können.
 */
export function registerParameter(): void {
  registerAstrometricsParameter();
  registerHolodeckParameter();
}

/**
 * Registriert alle Parameter für Astrometrics.
 */
export function registerAstrometricsParameter(): void {
  defineParameterType({
    name: 'missionLogLevel',
    regexp: /'info' | 'warn' | 'error'/,
    transformer: (s) => s.toString(),
  });
}

/**
 * Registriert alle Parameter für Holodeck
 */
export function registerHolodeckParameter(): void {}
