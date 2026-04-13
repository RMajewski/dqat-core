/**
 * Default-High-Res-Zeitquelle (Millis) – relativ, monoton steigend.
 * - Browser: performance.now()
 * - Node: process.hrtime.bigint()
 * - Fallback: Date.now() (nicht strikt monoton, aber ausreichend)
 */
export function defaultHighResNow(): number {
  // Browser / Deno
  const perf = (globalThis as any)?.performance?.now?.bind(
    (globalThis as any)?.performance,
  );
  if (typeof perf === 'function') {
    return perf();
  }

  // Node (>=10) – ns → ms
  const hr = (process as any)?.hrtime?.bigint?.bind(process?.hrtime);
  if (typeof hr === 'function') {
    const ns = hr() as bigint;
    return Number(ns / BigInt(1_000_000));
  }

  // Fallback
  return Date.now();
}
