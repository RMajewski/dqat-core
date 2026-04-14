# language: de
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
