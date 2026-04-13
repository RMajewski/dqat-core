/**
 * Ein Provider liefert Starfleet-Directives (Test-Konfigurationen) aus einer konkreten Quelle,
 * z.B. In-Memory, Umgebungsvariablen oder JSON-Dateien. Provider dürfen Plattformdetails
 * enthalten, die Kern-Typen bleiben davon unabhängig.
 */
export interface IStarfleetDirectiveProvider {
  /**
   * Logischer Name des Providers (z.B. „memory“, „env“, „json“). Hilft beim Debugging
   * und in Log-Ausgaben. Namen sollten innerhalb einer Instanz eindeutig sein.
   */
  readonly name: string;

  /**
   * Liefert den Wert für einen exakten Schlüssel (Punkt-Notation ist erlaubt),
   * oder `undefined`, wenn der Schlüssel unbekannt ist. Keine Exceptions für „unbekannt“.
   */
  get(key: string): unknown;

  /**
   * Liefert alle Schlüssel/Werte dieses Providers als **flaches** Objekt (Record).
   * Optional gefiltert nach Präfix: Nur Keys, die mit `prefix` beginnen, werden zurückgegeben.
   * Werte müssen JSON-serialisierbar sein; Funktionen sind ausdrücklich ausgeschlossen.
   */
  list(prefix?: string): Record<string, unknown>;
}

/**
 * Öffentliche API für Tests/Framework-Komponenten, um deterministisch auf
 * Test-Konfigurationen („Directives“) zuzugreifen – unabhängig von der Quelle.
 */
export interface IStarfleetDirectives {
  /**
   * Exakten Key auflösen; unbekannt → `undefined` (kein Throw).
   * Beispiel: `resolveDirective('frontend.baseUrl')`.
   */
  resolveDirective<T = unknown>(key: string): T | undefined;

  /**
   * Prüft, ob ein Key existiert. Implementierungsdetail darf `resolveDirective` nutzen.
   */
  hasDirective(key: string): boolean;

  /**
   * Gibt eine **flache**, optional nach Präfix gefilterte Map zurück. Die Rückgabe ist
   * **immutable** (schreibgeschützt), um unbeabsichtigte Mutationen in Tests zu verhindern.
   */
  listDirectives(prefix?: string): Readonly<Record<string, unknown>>;

  // TODO Docstring hinzufügen
  hasProvider(providerName: string): boolean;
}

/**
 * Optionen zum Erstellen einer StarfleetDirectives-Instanz.
 */
export type StarfleetDirectivesOptions = {
  /**
   * Auflösungspriorität entlang der Provider-Kette:
   * - `true` (Standard) → First-hit-wins (der **erste** Provider mit Treffer gewinnt)
   * - `false` → Last-hit-wins (der **letzte** Provider mit Treffer gewinnt)
   */
  preferFirst?: boolean;

  /**
   * Ob komplexe Rückgaben (Objekte/Arrays) tief eingefroren werden sollen (Deep-Freeze),
   * um Immutability zur Laufzeit zu gewährleisten. Standard: `true`.
   */
  freeze?: boolean;
};

/**
 * Kapselt das Ergebnis des Ladevorgangs von StarfleetDirectives
 * für ein einzelnes Szenario. Wird typischerweise beim Erzeugen
 * einer neuen DqatWorld-Instanz verwendet.
 *
 * Diese Struktur trennt klar zwischen der schreibgeschützten
 * Directives-Instanz und dem mutierbaren Memory-Provider, der
 * Szenario-übergreifend **nicht** geteilt wird.
 */
export interface ILoadedStarfleetDirectives {
  /**
   * Vollständig aufgebaute StarfleetDirectives-Instanz.
   *
   * Sie kombiniert die Werte aller aktiven Provider (JSON, ENV, Memory)
   * gemäß der Prioritätsregel (preferFirst = true) und stellt Methoden
   * wie `resolveDirective()`, `hasDirective()` und `listDirectives()` bereit.
   *
   * Diese Instanz ist während der Laufzeit **immutable** und wird für alle
   * Lookup-Operationen innerhalb des Szenarios verwendet.
   */
  readonly starfleetDirectives: IStarfleetDirectives;

  /**
   * Der szenario-lokale Memory-Provider, der in der Provider-Kette
   * die höchste Priorität besitzt.
   *
   * Er dient dazu, Werte während eines Szenarios dynamisch zu setzen
   * oder zu überschreiben – z. B. wenn ein Step im Testlauf Laufzeitdaten
   * wie Ports, Tokens oder generierte IDs einträgt.
   *
   * Über diesen Provider werden von der DqatWorld-Instanz die Methoden
   * `setDirectiveOverride()` und verwandte Helfer realisiert.
   *
   * Der Memory-Provider ist **mutierbar** und wird nach Abschluss des
   * Szenarios verworfen.
   */
  readonly memoryProvider: IStarfleetDirectiveProvider;
}
