# language: de
@astrometrics @missionlog
Funktionalität: MissionLog enthält korrekte Korrelation
  Um Ereignisse nachvollziehen zu können,
  möchte ich strukturierte Logeinträge mit Korrelation schreiben.

  @clock:frozen @worldSeed:42
  Szenario: Logeintrag trägt World-Zeit und Korrelation
    Angenommen die World ist initialisiert
    Und runId, scenarioId und stepId sind gesetzt
    Wenn ich einen Missionslog-Eintrag mit Level "info" und Nachricht "marker" schreibe
    Dann enthält der Eintrag einen Zeitstempel aus der World-Zeit
    Und das Level ist "info"
    Und die Nachricht ist "marker"
    Und die Details enthalten correlation mit runId, scenarioId und stepId
