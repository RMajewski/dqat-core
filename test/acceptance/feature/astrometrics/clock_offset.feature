# language: de
@astrometrics @clock @offset
Funktionalität: Uhr-Offsets wirken deterministisch
  Um Zeitzonen/Drift simulieren zu können,
  möchte ich Offsets auf alle Modi anwenden.

  @clock:system @clockOffset:+2000
  Szenario: Positiver Offset auf Systemuhr
    Angenommen die World ist initialisiert
    Wenn ich die Systemzeit und die World-Zeit parallel notiere
    Dann liegt die World-Zeit exakt 2000 Millisekunden über der Systemzeit

  @clock:system @clockOffset:-3600000
  Szenario: Negativer Offset (eine Stunde zurück)
    Angenommen die World ist initialisiert
    Wenn ich die Systemzeit und die World-Zeit parallel notiere
    Dann liegt die World-Zeit exakt 3600000 Millisekunden unter der Systemzeit

  @clock:frozen @clockOffset:+2000
  Szenario: Offset + eingefrorene Uhr + Vorwärtsbewegung
    Angenommen die World ist initialisiert
    Und die Uhr ist auf den Zeitpunkt "2025-10-05T12:00:00Z" eingefroren
    Wenn ich die Zeit um 3000 Millisekunden vorwärts bewege
    Dann liegt die World-Zeit exakt 5000 Millisekunden über dem Ankerzeitpunkt
