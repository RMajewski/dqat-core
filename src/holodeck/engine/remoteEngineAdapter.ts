import { HolodeckEngineAdapterBase } from './adapterBase.ts';

/**
 * Engine-Adapter für den remote-Modus.
 *
 * In diesem Modus existiert der MockServer bereits (z. B. als Docker-Container).
 * Holodeck verbindet sich nur über den mockserver-client und nimmt keinerlei
 * Lifecycle-Management vor.
 */
export class HolodeckRemoteEngineAdapter extends HolodeckEngineAdapterBase {
  public async start(): Promise<void> {
    // Remote-Modus: nichts zu starten.
  }

  public async stop(): Promise<void> {
    // Remote-Modus: nichts zu stoppen.
  }
}
