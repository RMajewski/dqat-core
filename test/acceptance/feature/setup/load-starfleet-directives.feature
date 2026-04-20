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
        | Pfad                               | JSON                                                               |
        | ./test.config.json                 | {"test": true, "path": "root"}                                     |
        | ./test/test.config.json            | {"test2": "Dies ist ein Test", "path": "test"}                     |
        | ./test/acceptance/test.config.json | {"test2": "Dies ist ein erneuter Test", "path": "test/acceptance"} |
    Und die ENV-Variable "DQ_PATH" ist gesetzt auf "env"

  Szenario: Laden aller gültigen Provider
    Wenn die Starfleet Directives geladen werden
    Dann sollte der JSON-Provider für "test/acceptance/test.config.json" existieren
    Und der JSON-Provider für "test/test.config.json" existieren
    Und der JSON-Provider für "test.config.json" existieren
    Und der ENV-Provider sollte geladen sein
    Und der Memory-Provider sollte geladen sein

  Szenario: Priorität der Provider
    Wenn die Starfleet Directives geladen werden
    Und es existieren folgende Starfleet Directives
        | Key  | Wert  |
        | test | false |
    Dann sollte der Memory-Provider höchste Priorität haben
    Und der ENV-Provider sollte die JSON-Provider überschreiben
    Und die Datei "./test/acceptance/test.config.json" sollte Vorrang vor "./test/test.config.json" haben

  Szenario: Laden der ENV-Provider-Optionen aus erster Datei
    Angenommen die Datei "./test/acceptance/dqat.config.json" enthält den Eintrag "envProviderOptions"
    Wenn die Starfleet Directives geladen werden
    Dann sollten die ENV-Provider-Optionen aus dieser Datei übernommen werden
    Und keine späteren Dateien dürfen diese überschreiben

  Szenario: Keine JSON-Dateien vorhanden
    Angenommen keine der Standard-Konfigurationsdateien existiert
    Wenn die Starfleet Directives geladen werden
    Dann der ENV-Provider sollte geladen sein
    Und der Memory-Provider sollte geladen sein
    Und es sollte kein Fehler geworfen werden
