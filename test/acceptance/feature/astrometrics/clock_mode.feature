# language: de
@astrometrics @clock
Funktionalität: Uhr-Modi werden korrekt angewandt
  Damit zeitabhängige Schritte deterministisch ablaufen,
  möchte ich die World-Zeit über Modi steuern können.

  @clock:system
  Szenario: Systemuhr liefert aufsteigende Zeitstempel
    Angenommen die World ist initialisiert
    Wenn ich die aktuelle Zeit notiere
    Und ich notiere die aktuelle Zeit erneut
    Dann ist der zweite Zeitstempel größer oder gleich dem ersten
    Und der effektive Offset wird berücksichtigt

  @clock:frozen
  Szenario: Eingefrorene Uhr bleibt konstant bis zur Vorwärtsbewegung
    Angenommen die World ist initialisiert
    Und die Uhr ist auf den Zeitpunkt "2025-10-05T12:00:00Z" eingefroren
    Wenn ich die aktuelle Zeit notiere
    Und ich notiere die aktuelle Zeit erneut
    Dann sind beide Zeitstempel exakt gleich
    Wenn ich die Zeit um 5000 Millisekunden vorwärts bewege
    Und ich notiere die aktuelle Zeit erneut
    Dann liegt der neue Zeitstempel exakt 5000 Millisekunden über dem ersten

  @clock:monotonic
  Szenario: Monotone Uhr verhindert Rücksprünge
    Angenommen die World ist initialisiert
    Wenn ich mehrfach nacheinander die aktuelle Zeit notiere
    Dann ist die Sequenz der Zeitstempel monoton nicht fallend
