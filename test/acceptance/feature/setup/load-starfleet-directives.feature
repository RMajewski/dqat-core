# language: de
@setup
@Wip
Funktionalität: Laden der Starfleet Directives

  Ziel:
  Überprüfen, dass beim Start eines Szenarios die Konfigurationsdateien,
  ENV-Variablen und der Memory-Provider korrekt geladen und
  miteinander kombiniert werden.

  Hintergrund:
    Angenommen folgende JSON-Konfigurationsdateien existieren:
        | Pfad                               | JSON                                    |
        | ./test.config.json                 | {"test": true}                          |
        | ./test/test.config.json            | {"test2": "Dies ist ein Test"}          |
        | ./test/acceptance/test.config.json | {"test3": "Dies ist ein erneuter Test"} |
    Und die ENV-Variable "DQ_TEST_MODE" ist gesetzt auf "true"

  Szenario: Laden aller gültigen Provider
    Wenn die Starfleet Directives für das Szenario geladen werden
    Dann sollte der JSON-Provider für "test/acceptance/test.config.json" existieren
    Und der JSON-Provider für "test/test.config.json" existieren
    Und der JSON-Provider für "test.config.json" existieren
    Und der ENV-Provider sollte geladen sein
    Und der Memory-Provider sollte geladen sein

  Szenario: Priorität der Provider
    Angenommen es existieren folgende Starfleet Directives
        | Key  | Wert  |
        | test | false |
    Wenn die Starfleet Directives geladen werden
    Dann sollte der Memory-Provider höchste Priorität haben
    Und der ENV-Provider sollte die JSON-Provider überschreiben
    Und die Datei "./test/acceptance/dqat.config.json" sollte Vorrang vor "./test/dqat.config.json" haben

  Szenario: Laden der ENV-Provider-Optionen aus erster Datei
    Angenommen die Datei "./test/acceptance/dqat.config.json" enthält den Eintrag "envProviderOptions"
    Wenn die Starfleet Directives geladen werden
    Dann sollten die ENV-Provider-Optionen aus dieser Datei übernommen werden
    Und keine späteren Dateien dürfen diese überschreiben

  Szenario: Keine JSON-Dateien vorhanden
    Angenommen keine der Standard-Konfigurationsdateien existiert
    Wenn die Starfleet Directives geladen werden
    Dann sollte nur der ENV-Provider und der Memory-Provider aktiv sein
    Und es sollte kein Fehler geworfen werden
