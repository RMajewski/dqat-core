# language: de
@setup
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
    Dann sollte der Starfleet Directive Key "test" den Wert "false" haben
    Dann sollte der Starfleet Directive Key "test2" den Wert "Dies ist ein Test" haben
    Dann sollte der Starfleet Directive Key "path" den Wert "env" haben

  Szenario: Laden der ENV-Provider-Optionen aus erster Datei
    # Angenommen die Datei "./test/acceptance/providerOptions.config.json" enthält die Provider-Optionen
    #     | Property                    | Wert  |
    #     | stripPrefix                 | TEST_ |
    #     | toLowerCase                 | true  |
    #     | parse                       | true  |
    #     | defaultSeparator            | ;     |
    #     | doubleUnderscoreIsSeparator | false |
    #     | dropUndefined               | false |
    Wenn die Starfleet Directives geladen werden
    Dann sollten die ENV-Provider-Optionen so eingestellt sein
        | Property    | Wert |
        | stripPrefix | DQ_  |
        | toLowerCase | true |
        | parse       | true |

  @SkipOnPipeline
  Szenario: Keine JSON-Dateien vorhanden
    Angenommen keine der Standard-Konfigurationsdateien existiert
    Wenn die Starfleet Directives geladen werden
    Dann der ENV-Provider sollte geladen sein
    Und der Memory-Provider sollte geladen sein
    Und es sollte kein Fehler geworfen werden
