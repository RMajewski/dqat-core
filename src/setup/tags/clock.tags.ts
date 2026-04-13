import {
  CLOCK_OFFSET_PREFIX,
  CLOCK_PREFIX,
  WORLD_SEED_PREFIX,
} from '../../config/astrometrics.config.ts';
import type { AstrometricsInitTags } from '../../type/astrometrics/astrometrics.ts';

/**
 * Erlaubte Rohwerte für @clock:<value>-Tags.
 */
type AllowedClockTag = 'system' | 'realtime' | 'frozen' | 'monotonic';

/**
 * Extrahiert aus einer Liste von Cucumber-Tag-Strings die für Astrometrics relevanten
 * Initialisierungswerte (Uhrenmodus, Offset, Seed) und liefert sie in strukturierter Form zurück.
 *
 * Erwartete Tag-Formate:
 * - @clock:system | @clock:frozen | @clock:monotonic
 * - @clockOffset:+<ms> | @clockOffset:-<ms>
 * - @worldSeed:<string|number>
 *
 * Rückgabe:
 * - `clockMode`: 'system' (entspricht intern 'realtime'), 'frozen' oder 'monotonic'
 * - `clockOffsetMs`: Millisekunden (positiv/negativ)
 * - `worldSeed`: string oder number (falls numerisch interpretierbar)
 *
 * Design-Hinweis:
 * - Keine verschachtelten Ternary-Operatoren (Tiefenlimit = 1).
 * - Defensives Parsen; unbekannte Tags werden ignoriert.
 */
export function extractAstrometricsInitFromTags(
  tags: readonly string[],
): AstrometricsInitTags {
  const trimmedTags = tags.map((t) => t.trim());

  const clockModeTag = trimmedTags.find((t) => t.startsWith(CLOCK_PREFIX));
  const clockOffsetTag = trimmedTags.find((t) =>
    t.startsWith(CLOCK_OFFSET_PREFIX),
  );
  const worldSeedTag = trimmedTags.find((t) => t.startsWith(WORLD_SEED_PREFIX));

  const clockMode = parseClockModeTag(clockModeTag);
  const clockOffsetMs = parseClockOffsetTag(clockOffsetTag);
  const worldSeed = parseWorldSeedTag(worldSeedTag);

  return {
    clockMode,
    clockOffsetMs,
    worldSeed,
  };
}

/**
 * Parst @clock:<value> in 'system' | 'frozen' | 'monotonic'.
 * Für Astrometrics wird 'system' intern als 'realtime' interpretiert.
 */
export function parseClockModeTag(
  tag?: string,
): AstrometricsInitTags['clockMode'] {
  if (!tag) {
    return undefined;
  }

  const raw = tag.slice(CLOCK_PREFIX.length).trim().toLowerCase();
  if (!isAllowedClockTag(raw)) {
    return undefined;
  }

  // Normalisierung der Werte (realtime → system)
  if (raw === 'realtime') {
    return 'system';
  }
  if (raw === 'system') {
    return 'system';
  }
  if (raw === 'frozen') {
    return 'frozen';
  }
  if (raw === 'monotonic') {
    return 'monotonic';
  }

  // Fallback (erreichen wir durch den Guard praktisch nie)
  return undefined;
}

/**
 * Parst @clockOffset:<signed-ms> nach number (Millisekunden).
 * Beispiel: +2000 → 2000, -3600000 → -3600000
 */
export function parseClockOffsetTag(tag?: string): number | undefined {
  if (!tag) {
    return undefined;
  }

  const raw = tag.slice(CLOCK_OFFSET_PREFIX.length).trim();
  if (raw.length === 0) {
    return undefined;
  }

  const isNegative = raw.startsWith('-');
  const normalized =
    raw.startsWith('+') || raw.startsWith('-') ? raw.slice(1) : raw;

  const value = Number(normalized);
  if (!Number.isFinite(value)) {
    return undefined;
  }

  if (isNegative) {
    return -Math.abs(value);
  }
  return Math.abs(value);
}

/**
 * Parst @worldSeed:<value> als string oder number (falls numerisch).
 */
export function parseWorldSeedTag(tag?: string): string | number | undefined {
  if (!tag) {
    return undefined;
  }
  const raw = tag.slice(WORLD_SEED_PREFIX.length).trim();

  // Zahl erkennen
  const asNumber = Number(raw);
  if (raw !== '' && Number.isFinite(asNumber)) {
    return asNumber;
  }

  return raw || undefined;
}

/**
 * Typ-Guard: Prüft, ob ein string ein erlaubter Clock-Tag-Wert ist.
 * Vermeidet jegliches `any`/`unknown` und verschachtelte Ternaries.
 */
function isAllowedClockTag(value: string): value is AllowedClockTag {
  switch (value) {
    case 'system':
    case 'realtime':
    case 'frozen':
    case 'monotonic':
      return true;
    default:
      return false;
  }
}
