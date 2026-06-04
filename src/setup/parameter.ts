import { defineParameterType } from '@cucumber/cucumber';
import { parseCommaSeparatedList } from '../util/common/string.ts';

/**
 * Registriert alle eigene Parameter bei Cucumber, die in Test-Schritten genutzt werden können.
 */
export function registerParameter(): void {
  registerCommonParameter();
  registerAstrometricsParameter();
  registerHolodeckParameter();
}

/**
 * Registriert allgemeine wiederverwendbare Parameter.
 */
export function registerCommonParameter(): void {
  defineParameterType({
    name: 'commonStringList',
    regexp: /"([^"]*)"/,
    transformer: (value) => parseCommaSeparatedList(value.toString()),
  });
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
