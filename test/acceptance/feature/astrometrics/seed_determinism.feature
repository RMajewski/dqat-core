# language: de
@astrometrics @worldSeed
Funktionalität: Seed stellt Reproduzierbarkeit sicher
  Um deterministische Daten zu erzeugen,
  möchte ich Seeds pro Szenario festlegen.

  @worldSeed:42 @SkipOnPipeline
  Szenario: Gleicher Seed liefert gleiche Ergebnisse (Lauf A)
    Angenommen die World ist initialisiert
    Und ich erzeuge seed-abhängige Testdaten mit denselben Eingaben
    Wenn ich die erzeugten Werte notiere
    Dann entsprechen die Werte der bekannten Baseline für Seed "42"

  @worldSeed:42 @SkipOnPipeline
  Szenario: Gleicher Seed liefert gleiche Ergebnisse (Lauf B)
    Angenommen die World ist initialisiert
    Und ich erzeuge seed-abhängige Testdaten mit denselben Eingaben
    Wenn ich die erzeugten Werte notiere
    Dann entsprechen die Werte exakt den Werten aus Lauf A

  @worldSeed:A @SkipOnPipeline
  Szenario: Unterschiedliche Seeds unterscheiden sich erwartungsgemäß
    Angenommen die World ist initialisiert
    Und ich erzeuge seed-abhängige Testdaten mit denselben Eingaben
    Wenn ich die erzeugten Werte notiere
    Dann unterscheiden sich die Werte von einer Referenz mit Seed "B"
