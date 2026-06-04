import type { StandardScenario } from '../../../../type/StandardScenario.ts';

export const normalizeArtifactFiletestId: StandardScenario<
  {
    value: string;
    maxLength?: number;
  },
  string
>[] = [
  {
    testId: 'wandelt ä in a um',
    input: { value: 'Käptin Janeway' },
    expected: 'kaptin-janeway',
  },
  {
    testId: 'wandelt ö in o um',
    input: { value: 'Föderation im Delta-Quadranten' },
    expected: 'foderation-im-delta-quadranten',
  },
  {
    testId: 'wandelt ü in u um',
    input: { value: 'Zurück zur Erde' },
    expected: 'zuruck-zur-erde',
  },
  {
    testId: 'wandelt Ä in a um',
    input: { value: 'Ärger mit den Kazon' },
    expected: 'arger-mit-den-kazon',
  },
  {
    testId: 'wandelt Ö in o um',
    input: { value: 'Öffne den Raumspalt' },
    expected: 'offne-den-raumspalt',
  },
  {
    testId: 'wandelt Ü in u um',
    input: { value: 'Überquere den Nebel' },
    expected: 'uberquere-den-nebel',
  },
  {
    testId: 'wandelt ß in ss um',
    input: { value: 'Außenmission der Voyager' },
    expected: 'aussenmission-der-voyager',
  },
  {
    testId: 'ersetzt einzelnes Anführungszeichen',
    input: { value: "Tuvok's Analyse" },
    expected: 'tuvok-s-analyse',
  },
  {
    testId: 'ersetzt doppeltes Anführungszeichen',
    input: { value: 'Janeway sagt "Kurs setzen"' },
    expected: 'janeway-sagt-kurs-setzen',
  },
  {
    testId: 'ersetzt Doppelpunkt',
    input: { value: 'Mission: Rückkehr' },
    expected: 'mission-ruckkehr',
  },
  {
    testId: 'ersetzt Komma',
    input: { value: 'Voyager, Kurs setzen' },
    expected: 'voyager-kurs-setzen',
  },
  {
    testId: 'behält einfachen Bindestrich als Trenner',
    input: { value: 'Delta-Quadrant' },
    expected: 'delta-quadrant',
  },
  {
    testId: 'ersetzt langen Gedankenstrich',
    input: { value: 'Voyager – Heimreise' },
    expected: 'voyager-heimreise',
  },
  {
    testId: 'ersetzt Punkt',
    input: { value: 'U.S.S. Voyager' },
    expected: 'u-s-s-voyager',
  },
  {
    testId: 'ersetzt Raute',
    input: { value: 'Mission #47' },
    expected: 'mission-47',
  },
  {
    testId: 'ersetzt kleiner-als-Zeichen',
    input: { value: 'Warp < 9' },
    expected: 'warp-9',
  },
  {
    testId: 'ersetzt größer-als-Zeichen',
    input: { value: 'Warp > 9' },
    expected: 'warp-9',
  },
  {
    testId: 'ersetzt Pipe-Zeichen',
    input: { value: 'Janeway | Chakotay' },
    expected: 'janeway-chakotay',
  },
  {
    testId: 'ersetzt Fragezeichen',
    input: { value: 'Zurück nach Hause?' },
    expected: 'zuruck-nach-hause',
  },
  {
    testId: 'entfernt Bindestrich am Anfang',
    input: { value: '-Voyager startet' },
    expected: 'voyager-startet',
  },
  {
    testId: 'entfernt Bindestrich am Ende',
    input: { value: 'Voyager landet-' },
    expected: 'voyager-landet',
  },
  {
    testId: 'ersetzt Leerzeichen',
    input: { value: 'Delta Quadrant' },
    expected: 'delta-quadrant',
  },
  {
    testId: 'ersetzt Zeilenumbruch',
    input: { value: 'Janeway\nsetzt Kurs' },
    expected: 'janeway-setzt-kurs',
  },
  {
    testId: 'begrenzt Länge standardmäßig auf 120 Zeichen',
    input: {
      value:
        'Die Voyager folgt einem unbekannten Signal durch den Nekrit-Raum und dokumentiert jede Abweichung im Missionsprotokoll der Sternenflotte',
    },
    expected:
      'die-voyager-folgt-einem-unbekannten-signal-durch-den-nekrit-raum-und-dokumentiert-jede-abweichung-im-missionsprotokoll-d',
  },
  {
    testId: 'begrenzt Länge auf 10 Zeichen',
    input: {
      value: 'Voyager setzt Kurs nach Hause',
      maxLength: 10,
    },
    expected: 'voyager-se',
  },
];
