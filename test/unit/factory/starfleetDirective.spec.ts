import { describe, expect, it } from 'vitest';
import { createStarfleetDirectives } from '../../../src/factory/starfleetDirective';
import type {
  StarfleetDirectiveProvider,
  StarfleetDirectives,
} from '../../../src/type/starfleetDirective';
import { StubStarfleetDirectiveProvider } from './provider/stubProvider';

const make = (
  providers: StarfleetDirectiveProvider[],
  opts?: Parameters<typeof createStarfleetDirectives>[1],
): StarfleetDirectives => createStarfleetDirectives(providers, opts);

describe('createStarfleetDirectives', () => {
  describe('resolve/has', () => {
    it('liefert undefined für unbekannte Schlüssel', () => {
      const provider = make([new StubStarfleetDirectiveProvider('A', {})]);
      expect(provider.resolveDirective('unbekannt')).toBeUndefined();
      expect(provider.hasDirective('unbekannt')).toBeFalsy();
    });

    it('first-hit-wins (Standard): erster Provider gewinnt', () => {
      const provider = make([
        new StubStarfleetDirectiveProvider('A', { x: 'A' }),
        new StubStarfleetDirectiveProvider('B', { x: 'B' }),
      ]);
      expect(provider.resolveDirective<string>('x')).toBe('A');
    });

    it('last-hit-wins: letzter Provider gewinnt, wenn preferFirst:false', () => {
      const provider = make(
        [
          new StubStarfleetDirectiveProvider('A', { x: 'A' }),
          new StubStarfleetDirectiveProvider('B', { x: 'B' }),
        ],
        { preferFirst: false },
      );
      expect(provider.resolveDirective<string>('x')).toBe('B');
    });

    it('Funktionen werden bei resolve ignoriert (sanitize)', () => {
      const fn = (): string => 'nope';
      const provider = make([
        new StubStarfleetDirectiveProvider('A', { fun: fn }),
      ]);
      expect(provider.resolveDirective('fun')).toBeUndefined();
    });

    it('Objekt-Rückgaben sind (tief) eingefroren, wenn freeze:true', () => {
      type TestConfig = { a: { b: number } };
      const provider = make(
        [new StubStarfleetDirectiveProvider('A', { cfg: { a: { b: 1 } } })],
        { freeze: true },
      );
      const cfg = provider.resolveDirective<TestConfig>('cfg');
      expect(cfg && Object.isFrozen(cfg)).toBe(true);
      expect(cfg && Object.isFrozen(cfg.a)).toBe(true);
    });
  });

  describe('listDirectives', () => {
    it('vereint Anbieter in Reihenfolge, first-hit-wins überschreibt NICHT spätere', () => {
      const provider = make([
        new StubStarfleetDirectiveProvider('A', { k: 'A', 'a.x': 1 }),
        new StubStarfleetDirectiveProvider('B', { k: 'B', 'b.y': 2 }),
      ]);
      expect(provider.listDirectives()).toEqual({ k: 'A', 'a.x': 1, 'b.y': 2 });
    });

    it('last-hit-wins überschreibt frühere Werte', () => {
      const provider = make(
        [
          new StubStarfleetDirectiveProvider('A', { k: 'A', 'a.x': 1 }),
          new StubStarfleetDirectiveProvider('B', { k: 'B', 'a.x': 9 }),
        ],
        { preferFirst: false },
      );
      expect(provider.listDirectives()).toEqual({ k: 'B', 'a.x': 9 });
    });

    it('prefix-Filter gibt nur passende Keys zurück', () => {
      const provider = make([
        new StubStarfleetDirectiveProvider('A', {
          'db.host': 'localhost',
          'db.port': 3306,
          // eslint-disable-next-line sonarjs/no-clear-text-protocols
          'api.url': 'http://x',
        }),
      ]);
      expect(provider.listDirectives('db')).toEqual({
        'db.host': 'localhost',
        'db.port': 3306,
      });
    });

    it('Funktionswerte werden gefiltert (nicht im Ergebnis)', () => {
      const provider = make([
        // Beachte: auch wenn ein Provider (falsch) Funktionen listet, filtert die Factory sie heraus
        new StubStarfleetDirectiveProvider('A', { safe: 1, bad: () => 'fn' }),
      ]);
      const listed = provider.listDirectives();
      expect(listed).toHaveProperty('safe', 1);
      expect(Object.hasOwn(listed, 'bad')).toBe(false);
    });

    it('Rückgabe ist eingefroren (immutable)', () => {
      const provider = make([
        new StubStarfleetDirectiveProvider('A', { a: 1, b: 2 }),
      ]);
      const listed = provider.listDirectives();
      expect(Object.isFrozen(listed)).toBe(true);
    });
  });

  describe('Fehlerszenarien', () => {
    it('wirft bei doppelten Provider-Namen', () => {
      expect(() =>
        make([
          new StubStarfleetDirectiveProvider('dup', {}),
          new StubStarfleetDirectiveProvider('dup', {}),
        ]),
      ).toThrow(/Duplicate/i);
    });
  });

  describe('Hilfsfunktionen', () => {
    it('listDirectives: friert nicht ein, wenn freeze:false (deckt deepFreeze → return input)', () => {
      const provider = make(
        [new StubStarfleetDirectiveProvider('A', { a: 1 })],
        { freeze: false },
      );
      const listed = provider.listDirectives();
      expect(Object.isFrozen(listed)).toBe(false); // deepFreeze wurde aufgerufen, aber mit early-return
    });

    it('cloneSafe: nutzt JSON.parse(JSON.stringify(...)) wenn structuredClone fehlt', () => {
      const original = (globalThis as any).structuredClone;
      (globalThis as any).structuredClone = undefined; // Pfad erzwingen
      try {
        const object = { a: { b: 1 } };
        const provider = make(
          [new StubStarfleetDirectiveProvider('A', { obj: object })],
          { freeze: false },
        );
        const result = provider.resolveDirective<typeof object>('obj');
        expect(result).toEqual(object);
        expect(result).not.toBe(object); // tiefe Kopie über JSON-Parse
      } finally {
        (globalThis as any).structuredClone = original;
      }
    });

    it('cloneSafe: catch-Zweig gibt Original zurück, wenn JSON.stringify wirft (zyklisch)', () => {
      const original = (globalThis as any).structuredClone;
      (globalThis as any).structuredClone = undefined; // zwingt JSON-Stringify Pfad
      try {
        const circle: any = {};
        circle.self = circle; // zyklische Referenz ⇒ JSON.stringify wirft
        const provider = make(
          [new StubStarfleetDirectiveProvider('A', { circ: circle })],
          {
            freeze: false,
          },
        );
        const result = provider.resolveDirective<typeof circle>('circ');
        expect(result).toBe(circle); // catch → return val
      } finally {
        (globalThis as any).structuredClone = original;
      }
    });
  });
});
