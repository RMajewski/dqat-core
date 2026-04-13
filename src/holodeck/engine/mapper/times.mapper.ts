import type { Times } from 'mockserver-client';
import type { HolodeckTimesSpec } from '../../../type/holodeck/request.ts';

/**
 * Wandelt die Holodeck-"times"-Spezifikation in das Format um,
 * das der mockserver-client erwartet.
 *
 * Holodeck:
 *   { unlimited: true }
 *   oder
 *   { remaining: number }
 *
 * MockServer:
 *   {
 *     unlimited?: boolean;
 *     remainingTimes?: number;
 *   }
 *
 * Diese Funktion ist rein funktional und wirft keine Exceptions.
 */
export function mapHolodeckTimesToMockServerTimes(
  times: HolodeckTimesSpec | undefined,
): Times | undefined {
  if (!times) {
    return undefined;
  }

  if ('unlimited' in times) {
    return { unlimited: true };
  }

  // hier garantiert: { remaining: number }
  return { remainingTimes: times.remaining };
}
