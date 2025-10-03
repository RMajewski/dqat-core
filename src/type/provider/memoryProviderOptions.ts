/**
 * Ein Provider liefert Starfleet-Directives (Test-Konfigurationen) aus einer konkreten Quelle,
 * z.B. In-Memory, Umgebungsvariablen oder JSON-Dateien. Provider dürfen Plattformdetails
 * enthalten, die Kern-Typen bleiben davon unabhängig.
 */
export type MemoryProviderOptions = {
  /**
   * Logischer Name des Providers (z.B. „memory“, „env“, „json“). Hilft beim Debugging
   * und in Log-Ausgaben. Namen sollten innerhalb einer Instanz eindeutig sein.
   */
  name?: string;

  /**
   * Ob ein verschachteltes Eingangsobjekt automatisch in dot-Notation
   * abgeflacht werden soll. Beispiel: { a: { b: 1 } } → { 'a.b': 1 }
   * Default: true
   */
  flatten?: boolean;

  /**
   * Zeichen zwischen Schlüsselteilen.
   * Default: '.'
   */
  separator?: string;

  /**
   * Ob Array-Indizes beim Flatten berücksichtigt werden. Beispiel:
   * { a: [ { b: 1 } ] } → { 'a.0.b': 1 }
   * Default: true
   */
  includeArrayIndices?: boolean;

  /**
   * Ob `undefined`-Werte beim Einlesen verworfen werden sollen. Default: true
   */
  dropUndefined?: boolean;
};
