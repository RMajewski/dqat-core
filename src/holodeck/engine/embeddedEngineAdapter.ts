import mockserver from 'mockserver-node';
import { HolodeckEngineAdapterBase } from './adapterBase.ts';

/**
 * Engine-Adapter für den embedded-Modus.
 *
 * In diesem Modus verwaltet Holodeck den Lebenszyklus des MockServers
 * selbst im gleichen Node-Prozess. Der MockServer wird vor Tests gestartet
 * und nach Tests wieder gestoppt.
 */
export class HolodeckEmbeddedEngineAdapter extends HolodeckEngineAdapterBase {
  public async start(): Promise<void> {
    await mockserver.start_mockserver({
      serverPort: this.port,
      // TODO Zur Konfiguration hinzufügen
      verbose: true,
      // TODO Zur Konfiguration hinzufügen
      trace: true,
      // TODO Zur Konfiguration hinzufügen
      jvmOptions: ['-Dmockserver.disableSystemOut=true'],
    });
  }

  public async stop(): Promise<void> {
    await mockserver.stop_mockserver({
      serverPort: this.port,
    });
  }
}
