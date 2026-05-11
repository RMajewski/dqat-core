import { describe, expect, it } from 'vitest';
import { normalizeArtifactFileName } from '../../../../../src/util/common/string.ts';

describe('Zeichenketten-Hilfsfunktionen', () => {
  const scenarios: ReadonlyArray<{
    name: string;
    input: { value: string; maxLength?: number };
    expected: string;
  }> = [
    {
      name: 'wandelt ä in a um',
      input: { value: 'Käptin Janeway' },
      expected: 'kaptin-janeway',
    },
    {
      name: 'wandelt ö in o um',
      input: { value: 'Föderation im Delta-Quadranten' },
      expected: 'foderation-im-delta-quadranten',
    },
    {
      name: 'wandelt ü in u um',
      input: { value: 'Zurück zur Erde' },
      expected: 'zuruck-zur-erde',
    },
    {
      name: 'wandelt Ä in a um',
      input: { value: 'Ärger mit den Kazon' },
      expected: 'arger-mit-den-kazon',
    },
    {
      name: 'wandelt Ö in o um',
      input: { value: 'Öffne den Raumspalt' },
      expected: 'offne-den-raumspalt',
    },
    {
      name: 'wandelt Ü in u um',
      input: { value: 'Überquere den Nebel' },
      expected: 'uberquere-den-nebel',
    },
    {
      name: 'wandelt ß in ss um',
      input: { value: 'Außenmission der Voyager' },
      expected: 'aussenmission-der-voyager',
    },
    {
      name: 'ersetzt einzelnes Anführungszeichen',
      input: { value: "Tuvok's Analyse" },
      expected: 'tuvok-s-analyse',
    },
    {
      name: 'ersetzt doppeltes Anführungszeichen',
      input: { value: 'Janeway sagt "Kurs setzen"' },
      expected: 'janeway-sagt-kurs-setzen',
    },
    {
      name: 'ersetzt Doppelpunkt',
      input: { value: 'Mission: Rückkehr' },
      expected: 'mission-ruckkehr',
    },
    {
      name: 'ersetzt Komma',
      input: { value: 'Voyager, Kurs setzen' },
      expected: 'voyager-kurs-setzen',
    },
    {
      name: 'behält einfachen Bindestrich als Trenner',
      input: { value: 'Delta-Quadrant' },
      expected: 'delta-quadrant',
    },
    {
      name: 'ersetzt langen Gedankenstrich',
      input: { value: 'Voyager – Heimreise' },
      expected: 'voyager-heimreise',
    },
    {
      name: 'ersetzt Punkt',
      input: { value: 'U.S.S. Voyager' },
      expected: 'u-s-s-voyager',
    },
    {
      name: 'ersetzt Raute',
      input: { value: 'Mission #47' },
      expected: 'mission-47',
    },
    {
      name: 'ersetzt kleiner-als-Zeichen',
      input: { value: 'Warp < 9' },
      expected: 'warp-9',
    },
    {
      name: 'ersetzt größer-als-Zeichen',
      input: { value: 'Warp > 9' },
      expected: 'warp-9',
    },
    {
      name: 'ersetzt Pipe-Zeichen',
      input: { value: 'Janeway | Chakotay' },
      expected: 'janeway-chakotay',
    },
    {
      name: 'ersetzt Fragezeichen',
      input: { value: 'Zurück nach Hause?' },
      expected: 'zuruck-nach-hause',
    },
    {
      name: 'entfernt Bindestrich am Anfang',
      input: { value: '-Voyager startet' },
      expected: 'voyager-startet',
    },
    {
      name: 'entfernt Bindestrich am Ende',
      input: { value: 'Voyager landet-' },
      expected: 'voyager-landet',
    },
    {
      name: 'ersetzt Leerzeichen',
      input: { value: 'Delta Quadrant' },
      expected: 'delta-quadrant',
    },
    {
      name: 'ersetzt Zeilenumbruch',
      input: { value: 'Janeway\nsetzt Kurs' },
      expected: 'janeway-setzt-kurs',
    },
    {
      name: 'begrenzt Länge standardmäßig auf 120 Zeichen',
      input: {
        value:
          'Die Voyager folgt einem unbekannten Signal durch den Nekrit-Raum und dokumentiert jede Abweichung im Missionsprotokoll der Sternenflotte',
      },
      expected:
        'die-voyager-folgt-einem-unbekannten-signal-durch-den-nekrit-raum-und-dokumentiert-jede-abweichung-im-missionsprotokoll-d',
    },
    {
      name: 'begrenzt Länge auf 10 Zeichen',
      input: {
        value: 'Voyager setzt Kurs nach Hause',
        maxLength: 10,
      },
      expected: 'voyager-se',
    },
  ];

  it.each(scenarios)(
    'normalizeArtifactFileName: $name',
    ({ input, expected }) => {
      const output = normalizeArtifactFileName(input.value, input.maxLength);
      expect(output).toEqual(expected);
    },
  );
});
