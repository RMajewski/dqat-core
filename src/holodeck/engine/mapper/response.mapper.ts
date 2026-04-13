import type { LoadedHolodeckResponse } from '../../../type/holodeck/holodeck.ts';

/**
 * Wandelt eine LoadedHolodeckResponse in das httpResponse-Objekt um,
 * das mockserver-client.mockAnyResponse erwartet.
 *
 * Diese Funktion ist rein funktional und wirft nicht.
 * Validierungen (z. B. dass delayMs >= 0 ist) passieren bereits früher
 * im SceneLoader.
 */
export function mapHolodeckResponseToMockServerResponse(
  response: LoadedHolodeckResponse,
): {
  statusCode: number;
  headers?: Array<{ name: string; values: string[] }>;
  body?: string;
  delay?: { timeUnit: 'MILLISECONDS'; value: number };
} {
  const headers = response.headers;
  return {
    statusCode: response.statusCode,
    headers: mapHeadersToMockServerFormat(headers),
    body: mapBodyToMockServerBody(response.body, headers),
    delay: mapDelayToMockServerDelay(response.delayMs),
  };
}

/**
 * Interne Hilfsfunktion:
 * Wandelt Header-Record ("Key": "Value") in das Array-Format,
 * das mockserver-client typischerweise erwartet:
 * [{ name: "Key", values: ["Value"] }, ...]
 */
function mapHeadersToMockServerFormat(
  headers: Record<string, string> | undefined,
): Array<{ name: string; values: string[] }> | undefined {
  if (!headers) {
    return undefined;
  }

  return Object.entries(headers).map(([name, value]) => ({
    name,
    values: [value],
  }));
}

/**
 * Bestimmt, ob der Response-Body als JSON serialisiert werden soll.
 *
 * Konvention:
 * - Wenn der Content-Type "application/json" enthält -> true
 * - Andernfalls:
 *   - strings bleiben roh
 *   - alles andere wird trotzdem JSON.stringify() verwendet
 *     (defensiver Fallback)
 */
function shouldSerializeBodyAsJson(
  headers: Record<string, string> | undefined,
): boolean {
  if (!headers) {
    return false;
  }

  const contentTypeHeader = Object.entries(headers).find(
    ([key]) => key.toLowerCase() === 'content-type',
  );

  if (!contentTypeHeader) {
    return false;
  }

  const [, contentTypeValue] = contentTypeHeader;
  return contentTypeValue.toLowerCase().includes('application/json');
}

/**
 * Wandelt den Body aus LoadedHolodeckResponse in das Format um,
 * das mockserver-client akzeptiert.
 *
 * - Bei Content-Type JSON → JSON.stringify(body)
 * - Bei String-Body ohne JSON → String direkt übernehmen
 * - Bei Non-String ohne JSON → JSON.stringify(body) (Fallback)
 */
function mapBodyToMockServerBody(
  body: unknown,
  headers: Record<string, string> | undefined,
): string | undefined {
  if (body === undefined) {
    return undefined;
  }

  const asJson = shouldSerializeBodyAsJson(headers);

  if (asJson) {
    return JSON.stringify(body);
  }

  if (typeof body === 'string') {
    return body;
  }

  return JSON.stringify(body);
}

/**
 * Wandelt delayMs aus LoadedHolodeckResponse in das Objektformat,
 * das mockserver-client erwartet.
 *
 * Holodeck: delayMs?: number
 * MockServer: delay?: { timeUnit: 'MILLISECONDS', value: number }
 */
function mapDelayToMockServerDelay(
  delayMs: number | undefined,
): { timeUnit: 'MILLISECONDS'; value: number } | undefined {
  if (delayMs === undefined) {
    return undefined;
  }

  return {
    timeUnit: 'MILLISECONDS',
    value: delayMs,
  };
}
