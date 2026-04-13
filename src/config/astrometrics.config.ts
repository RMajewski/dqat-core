/**
 * Konstanter Tag-Präfix für die Auswahl des Uhrenmodus.
 * Erwartete Werte: @clock:system | @clock:frozen | @clock:monotonic
 *
 * Zweck: Vereinheitlicht die Erkennung des Clock-Tags im Tag-Adapter.
 */
export const CLOCK_PREFIX = '@clock:';

/**
 * Konstanter Tag-Präfix für die Konfiguration eines zeitlichen Offsets (Millisekunden).
 * Beispiele: @clockOffset:+2000, @clockOffset:-3600000
 *
 * Zweck: Dient dem robusten Parsen von positiven/negativen Offsets.
 */
export const CLOCK_OFFSET_PREFIX = '@clockOffset:';

/**
 * Konstanter Tag-Präfix zur Bereitstellung eines World-Seeds (String oder Zahl).
 * Beispiel: @worldSeed:42
 *
 * Zweck: Ermöglicht reproduzierbare Testwelten über eine deterministische Seed-Angabe.
 */
export const WORLD_SEED_PREFIX = '@worldSeed:';
