/**
 * Leichtgewichtige Effective-Directives für diese Iteration.
 */
export type EffectiveDirectives = {
  clockMode: 'system' | 'frozen' | 'monotonic';
  clockOffsetMs: number;
  worldSeed?: string | number;
};
