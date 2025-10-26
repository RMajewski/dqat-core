import { describe, expect, it } from 'vitest';
import { mapHolodeckResponseToMockServerResponse } from '../../../../../src/holodeck/engine/mapper/response.mapper.ts';
import type { LoadedHolodeckResponse } from '../../../../../src/type/holodeck/holodeck.ts';

describe('mapHolodeckResponseToMockServerResponse', () => {
  it('übernimmt den Statuscode 1:1', () => {
    const input: LoadedHolodeckResponse = {
      statusCode: 201,
    };

    const result = mapHolodeckResponseToMockServerResponse(input);

    expect(result.statusCode).toBe(201);
  });

  it('wandelt Header-Record in Array mit name / values um', () => {
    const input: LoadedHolodeckResponse = {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-Trace': 'abc-123',
      },
    };

    const result = mapHolodeckResponseToMockServerResponse(input);

    expect(result.headers).toEqual([
      { name: 'Content-Type', values: ['application/json'] },
      { name: 'X-Trace', values: ['abc-123'] },
    ]);
  });

  it('serialisiert body als JSON-String, wenn Content-Type application/json ist', () => {
    const input: LoadedHolodeckResponse = {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: { warpCore: 'STABLE', tempCelsius: 312.5 },
    };

    const result = mapHolodeckResponseToMockServerResponse(input);

    expect(result.body).toBe(
      JSON.stringify({ warpCore: 'STABLE', tempCelsius: 312.5 }),
    );
  });

  it('übernimmt body als String direkt, wenn kein JSON-Content-Type gesetzt ist', () => {
    const input: LoadedHolodeckResponse = {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/plain',
      },
      body: 'Warp core nominal.',
    };

    const result = mapHolodeckResponseToMockServerResponse(input);

    expect(result.body).toBe('Warp core nominal.');
  });

  it('stringifiziert body als Fallback, wenn kein JSON-Content-Type gesetzt ist und body kein String ist', () => {
    const input: LoadedHolodeckResponse = {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/plain',
      },
      body: { note: 'Diagnostic channel open' },
    };

    const result = mapHolodeckResponseToMockServerResponse(input);

    // trotz text/plain, aber body ist Objekt -> wir serialisieren defensiv
    expect(result.body).toBe(
      JSON.stringify({ note: 'Diagnostic channel open' }),
    );
  });

  it('mappt delayMs auf delay.timeUnit=MILLISECONDS', () => {
    const input: LoadedHolodeckResponse = {
      statusCode: 200,
      delayMs: 1500,
    };

    const result = mapHolodeckResponseToMockServerResponse(input);

    expect(result.delay).toEqual({
      timeUnit: 'MILLISECONDS',
      value: 1500,
    });
  });

  it('enthält kein delay-Feld, wenn delayMs nicht gesetzt ist', () => {
    const input: LoadedHolodeckResponse = {
      statusCode: 200,
    };

    const result = mapHolodeckResponseToMockServerResponse(input);

    expect(result.delay).toBeUndefined();
  });

  it('lässt headers und body weg, wenn sie nicht gesetzt sind', () => {
    const input: LoadedHolodeckResponse = {
      statusCode: 204,
    };

    const result = mapHolodeckResponseToMockServerResponse(input);

    expect(result.headers).toBeUndefined();
    expect(result.body).toBeUndefined();
  });
});
