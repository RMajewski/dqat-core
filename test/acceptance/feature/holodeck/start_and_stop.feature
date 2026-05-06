# language: de
@holodeck
Funktionalität: Holodeck starten, Szene laden und Antwort prüfen
  Um deterministische Tests zu ermöglichen,
  möchte ich ein Holodeck starten, eine vorbereitete Szene aktivieren
  und die Antworten dieser Szene über HTTP abrufen.

  Hintergrund:
    Angenommen das Holodeck wurde im Modus "embedded" gestartet

  Szenario: Happy-Path: bekannte Szene "happy" laden und erfolgreichen Endpunkt abrufen
    Wenn die Holodeck-Szene "happy" geladen wird
    Und ich den Endpunkt "/api/status" über GET abrufe
    Dann erwarte ich den HTTP-Statuscode 200
    Und das Holodeck gestoppt wird

  Szenario: Cleanup: Holodeck stoppen nach dem Testlauf
    Wenn das Holodeck gestoppt wird
    Dann ist kein Holodeck mehr aktiv

  @Wip
  Szenario: Eine Holodeck-Szene liefert einen Response-Body aus einer HTML-Datei aus
    Wenn die Holodeck-Szene "body-file-html" geladen wird
    Und ich den Endpunkt "/test.html" über GET abrufe
    Dann erwarte ich den HTTP-Statuscode 200
    Und der Response-Body enthält "<h1>U.S.S. Voyager</h1>"
    Und der Response-Body enthält "<h2 class=\"css-test\">Intrepid-Klasse</h2>"
    Und das Holodeck gestoppt wird
