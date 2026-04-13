import { defineParameterType } from '@cucumber/cucumber';

/**
 * Registriert alle eigene Parameter bei Cucumber, die in Test-Schritten genutzt werden können.
 */
export function registerParameter(): void {
  registerAstrometricsParameter();
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
