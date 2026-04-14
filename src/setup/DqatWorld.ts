import type { Astrometrics } from '../astrometrics/astrometrics.ts';
import type {
  IStarfleetDirectiveSchema,
  TStarfleetDirectiveKey,
} from '../config/starfleetDirectives.keys.ts';
import { MemoryProvider } from '../factory/provider/memoryProvider.ts';
import type { Holodeck } from '../holodeck/holodeck.ts';
import type { ICucumberWorld } from '../type/ICucumberWorld.ts';
import type {
  MissionLogEntry,
  MissionLogLevel,
} from '../type/astrometrics/missionLog.ts';
import type { HttpResponseSnapshot } from '../type/httpResponse.ts';
import type { StarfleetDirectives } from '../type/starfleetDirective.ts';
import { loadStarfleetDirectives } from './loadStarfleetDirectives.ts';

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
  public astrometrics?: Astrometrics;
  public holodeck?: Holodeck;
  public lastResponse?: HttpResponseSnapshot;

  /**
   * Szenario-lokaler Key-Value-Speicher
   */
  private runtimeStore: Map<string, unknown> = new Map();

  /**
   * Einfache Missionslogs (nur für Debug dieser Iteration)
   */
  private missionLogBuffer: Array<MissionLogEntry> = [];

  /**
   * LIFO-Stack für Disposer-Funktionen (Cleanup am Szenarioende)
   */
  private disposerStack: Array<() => void | Promise<void>> = [];

  /**
   * Schreibgeschützte Directives-Instanz (liefert gefreezte Werte).
   */
  private directives?: StarfleetDirectives;

  /**
   * Konkreter Memory-Provider (mutierbar, höchste Priorität).
   * Hinweis: Wir halten die konkrete Klasse, damit `set` verfügbar ist.
   */
  private memoryProvider?: MemoryProvider;

  /**
   * Liefert die aktuelle Zeit der World.
   *
   * Semantik:
   * - Wenn Astrometrics vorhanden ist: nutze ausschließlich `astrometrics.now()`.
   * - Andernfalls Fallback auf echte Systemzeit (`new Date()`), z. B. in sehr frühen Hooks.
   *
   * Dadurch sind alle Zeitabfragen über die World zentralisiert und
   * respektieren die gesetzte Clock (frozen, offset, advance, etc.).
   */
  public now = (): Date => {
    if (this.astrometrics) {
      return this.astrometrics.now();
    }
    return new Date();
  };

  /**
   * Liest einen Wert aus dem Szenario-lokalen Store.
   *
   * @returns T | undefined, wenn Schlüssel nicht gesetzt ist
   */
  public get<T = unknown>(key: string): T | undefined {
    return this.runtimeStore.get(key) as T | undefined;
  }

  /**
   * Schreibt einen Wert in den Szenario-lokalen Store (überschreibt vorhandene Werte).
   */
  public set<T = unknown>(key: string, value: T): void {
    this.runtimeStore.set(key, value);
  }

  /**
   * Fügt einen Missionslog-Eintrag hinzu (nur Puffer für diese Iteration).
   * Spätere Iteration delegiert an Astrometrics.missionLog().append(...)
   */
  public log = (
    level: MissionLogLevel,
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

  public getMissionLogBuffer(): MissionLogEntry[] {
    return this.missionLogBuffer;
  }

  /**
   * @inheritdoc
   */
  public getStarfleetDirectives(): StarfleetDirectives {
    if (!this.directives) {
      throw new Error('Keine StarfleetDirectives geladen');
    }
    return this.directives;
  }

  /**
   * @inheritdoc
   */
  public getDirective<K extends TStarfleetDirectiveKey>(
    key: K,
  ): IStarfleetDirectiveSchema[K] | undefined {
    if (!this.directives) {
      throw new Error('Keine StarfleetDirectives geladen');
    }
    return this.directives.resolveDirective<IStarfleetDirectiveSchema[K]>(key);
  }

  /**
   * @inheritdoc
   */
  public hasDirective(key: TStarfleetDirectiveKey): boolean {
    if (!this.directives) {
      throw new Error('Keine StarfleetDirectives geladen');
    }
    return this.directives.hasDirective(key);
  }

  /**
   * @inheritdoc
   */
  public listDirectives(prefix?: string): Readonly<Record<string, unknown>> {
    if (!this.directives) {
      throw new Error('Keine StarfleetDirectives geladen');
    }
    return this.directives.listDirectives(prefix);
  }

  /**
   * @inheritdoc
   */
  public setDirectiveOverride<K extends TStarfleetDirectiveKey>(
    key: K,
    value: IStarfleetDirectiveSchema[K],
  ): void {
    if (!this.memoryProvider) {
      throw new Error('Es ist kein Memory-Provider initialisiert.');
    }

    this.memoryProvider.set(key, value);
  }

  /**
   * Erstellt eine neue World-Instanz für ein einzelnes Szenario.
   * Lädt JSON-, ENV- und Memory-Provider gemäß Prioritätsregeln.
   */
  public loadStarfleetDirectives(additionalPaths: string[]): void {
    const { starfleetDirectives, memoryProvider } =
      loadStarfleetDirectives(additionalPaths);

    // Konkreten Memory-Provider sicherstellen (für set-Operationen)
    if (!(memoryProvider instanceof MemoryProvider)) {
      // Falls dein Loader zukünftig ein anderes Konstrukt liefert,
      // ist dies ein expliziter, frühzeitiger Hinweis.
      throw new Error(
        'DqatWorld: Erwarteter MemoryProvider ist keine Instanz von MemoryProvider.',
      );
    }

    this.directives = starfleetDirectives;
    this.memoryProvider = memoryProvider;
  }
}
