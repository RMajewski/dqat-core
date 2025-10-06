import type { IWorldOptions } from '@cucumber/cucumber';
import type { ICucumberWorld } from '../type/ICucumberWorld.ts';

/**
 * DQAT-World (Iteration 1 – ohne Astrometrics-Implementierung)
 *
 * Ziele:
 * – Szenario-lokaler Speicher (get/set)
 * – MissionLog als In-Memory-Puffer (log)
 * – Ressourcen-Lifecycle (attachResource, disposeAll)
 * – Tag-Parsing für @clock:*, @clockOffset:*, @worldSeed:* (nur Ableitung -> effectiveDirectives)
 *
 * Noch NICHT enthalten:
 * – Reale Clock/Store/MissionLog-Objekte aus Astrometrics
 * – Wirkung der Tags über eine echte Astrometrics-Instanz
 */
export class DqatWorld implements ICucumberWorld {
  /**
   * Szenario-lokaler Key-Value-Speicher
   */
  private runtimeStore: Map<string, unknown> = new Map();

  /**
   * Einfache Missionslogs (nur für Debug dieser Iteration)
   */
  private missionLogBuffer: Array<{
    timestamp: Date;
    level: 'info' | 'warn' | 'error';
    message: string;
    details?: Record<string, unknown>;
  }> = [];

  /**
   * LIFO-Stack für Disposer-Funktionen (Cleanup am Szenarioende)
   */
  private disposerStack: Array<() => void | Promise<void>> = [];

  constructor(_options: IWorldOptions) {}

  /**
   * Liefert die aktuelle Zeit.
   * In dieser Iteration: echte Systemzeit (wird später durch Astrometrics.now() ersetzt).
   */
  public now = (): Date => new Date();

  /**
   * Liest einen Wert aus dem szenario-lokalen Store.
   */
  public get = (key: string): unknown => this.runtimeStore.get(key);

  /**
   * Schreibt einen Wert in den szenario-lokalen Store (überschreibt vorhandene Werte).
   */
  public set = (key: string, value: unknown): void => {
    this.runtimeStore.set(key, value);
  };

  /**
   * Fügt einen Missionslog-Eintrag hinzu (nur Puffer für diese Iteration).
   * Spätere Iteration delegiert an Astrometrics.missionLog().append(...)
   */
  public log = (
    level: 'info' | 'warn' | 'error',
    message: string,
    details?: Record<string, unknown>,
  ): void => {
    this.missionLogBuffer.push({
      timestamp: this.now(),
      level,
      message,
      details,
    });
  };

  /**
   * Registriert einen Disposer, der beim Szenario-Ende aufgerufen wird.
   * Disposer MUSS idempotent sein.
   */
  public attachResource = (
    resourceName: string,
    disposer: () => void | Promise<void>,
  ): void => {
    // Für die Nachvollziehbarkeit im Log mitschreiben
    this.log('info', 'resource attached', { resourceName });
    this.disposerStack.push(disposer);
  };

  /**
   * Führt alle Disposer in LIFO-Reihenfolge aus.
   * Fehler werden geloggt, der Prozess läuft fort (idempotent).
   */
  public async disposeAll(): Promise<{ disposed: number }> {
    let disposedCount = 0;
    while (this.disposerStack.length > 0) {
      const disposer = this.disposerStack.pop();
      if (!disposer) {
        continue;
      }
      try {
        await disposer();
      } catch (error) {
        this.log('error', 'resource dispose failed', { error: String(error) });
      } finally {
        disposedCount += 1;
      }
    }
    return { disposed: disposedCount };
  }
}
