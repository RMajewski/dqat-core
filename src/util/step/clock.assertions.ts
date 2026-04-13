// src/utils/step/clock.helper.ts

/**
 * Prüft, ob zwei Millisekunden-Werte innerhalb einer Toleranz übereinstimmen.
 *
 * @param actual   Tatsächlicher Wert (Millisekunden)
 * @param expected Erwarteter Wert (Millisekunden)
 * @param toleranceMs Erlaubte Abweichung in Millisekunden (Default: 10)
 *
 * @throws Error, wenn |actual - expected| > toleranceMs
 */
export function expectApproximatelyEqualMs(
  actual: number,
  expected: number,
  toleranceMs = 10,
): void {
  const diff = Math.abs(actual - expected);
  if (diff > toleranceMs) {
    throw new Error(
      `Erwartete ≈ ${expected} ms (±${toleranceMs}), erhalten ${actual} ms (Δ=${diff} ms)`,
    );
  }
}

/**
 * Prüft, ob eine Folge von Millisekunden-Werten monoton nicht fallend ist (a[i+1] >= a[i]).
 *
 * @param values Sequenz von Zeitstempeln in Millisekunden
 *
 * @throws Error, wenn eine Verletzung gefunden wird
 */
export function assertMonotonicNonDecreasing(values: number[]): void {
  for (let i = 0; i < values.length - 1; i++) {
    if (values[i + 1] < values[i]) {
      throw new Error(
        `Sequenz ist nicht monoton nicht fallend bei Index ${i}: ${values[i + 1]} < ${values[i]}`,
      );
    }
  }
}
