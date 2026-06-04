# language: de
Funktionalität: Allgemeine Cucumber-Parameter

  Szenario: Kommaseparierte Zeichenkettenliste auslesen
    Dann sollte die Zeichenkettenliste "image-alt, button-name" den Werten "image-alt, button-name" entsprechen

  Szenario: Leerzeichen in kommaseparierter Zeichenkettenliste entfernen
    Dann sollte die Zeichenkettenliste " image-alt , button-name " den Werten "image-alt, button-name" entsprechen

  Szenario: Leere Einträge in kommaseparierter Zeichenkettenliste ignorieren
    Dann sollte die Zeichenkettenliste "image-alt, , button-name,," den Werten "image-alt, button-name" entsprechen
