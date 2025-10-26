import { describe, expect, it } from 'vitest';
import { mapHolodeckTimesToMockServerTimes } from '../../../../../src/holodeck/engine/mapper/times.mapper.ts';
import type { HolodeckTimesSpec } from '../../../../../src/type/holodeck/request.ts';

describe('mapHolodeckTimesToMockServerTimes', () => {
  it('gibt undefined zurück, wenn keine times definiert ist', () => {
    const result = mapHolodeckTimesToMockServerTimes(undefined);
    expect(result).toBeUndefined();
  });

  it('mapped { unlimited: true } auf { unlimited: true }', () => {
    const times: HolodeckTimesSpec = { unlimited: true };

    const result = mapHolodeckTimesToMockServerTimes(times);

    expect(result).toEqual({ unlimited: true });
  });

  it('mapped { remaining: 3 } auf { remainingTimes: 3 }', () => {
    const times: HolodeckTimesSpec = { remaining: 3 };

    const result = mapHolodeckTimesToMockServerTimes(times);

    expect(result).toEqual({ remainingTimes: 3 });
  });

  it('ändert keine Werte außer der Umbenennung der Properties', () => {
    const times: HolodeckTimesSpec = { remaining: 42 };

    const result = mapHolodeckTimesToMockServerTimes(times);

    // wichtig: kein "unlimited" wenn remaining genutzt wird
    expect(result).toEqual({ remainingTimes: 42 });
    expect('unlimited' in result!).toBe(false);
  });
});
