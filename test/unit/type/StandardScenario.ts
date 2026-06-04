/**
 * Beschreibt ein standardisiertes Testszenario mit einer eindeutigen ID, einem Eingabewert
 * und einem erwarteten Ergebnis.
 *
 * @typeParam TInput - Typ des Eingabewerts (Standard: `unknown`).
 * @typeParam TExpected - Typ des erwarteten Ergebnisses (Standard: `unknown`).
 */
export type StandardScenario<TInput = unknown, TExpected = unknown> = {
  testId: string;
  input: TInput;
  expected: TExpected;
};
