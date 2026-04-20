import { beforeEach, describe, expect, it, vi } from 'vitest';

// Wichtig: Wir mocken das externe Modul "mockserver-node".
vi.mock(
  '../../../../src/types/external/ignore-me-runtime/mockserver-node-runtime',
  () => ({}),
);
// Erklärung: gleich unten.
// Wir mocken gleich aber wirklich 'mockserver-node' – siehe vi.mock('mockserver-node', ...)

vi.mock('mockserver-node', () => {
  return {
    default: {
      start_mockserver: vi.fn().mockResolvedValue(undefined),
      stop_mockserver: vi.fn().mockResolvedValue(undefined),
    },
    start_mockserver: vi.fn().mockResolvedValue(undefined),
    stop_mockserver: vi.fn().mockResolvedValue(undefined),
  };
});

import mockserver from 'mockserver-node';
import { HolodeckEmbeddedEngineAdapter } from '../../../../src/holodeck/engine/embeddedEngineAdapter.ts';

describe('HolodeckEmbeddedEngineAdapter', () => {
  const host = 'localhost';
  const port = 1080;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('start() ruft mockserver.start_mockserver mit Port und trace: true auf', async () => {
    const adapter = new HolodeckEmbeddedEngineAdapter(host, port);

    await adapter.start();

    expect(mockserver.start_mockserver).toHaveBeenCalledTimes(1);
    expect(mockserver.start_mockserver).toHaveBeenCalledWith({
      serverPort: 1080,
      trace: true,
      verbose: true,
      jvmOptions: ['-Dmockserver.disableSystemOut=true'],
    });
  });

  it('stop() ruft mockserver.stop_mockserver mit Port auf', async () => {
    const adapter = new HolodeckEmbeddedEngineAdapter(host, port);

    await adapter.stop();

    expect(mockserver.stop_mockserver).toHaveBeenCalledTimes(1);
    expect(mockserver.stop_mockserver).toHaveBeenCalledWith({
      serverPort: 1080,
    });
  });
});
