# language: de
@astrometrics
@tags
@Wip
Funktionalität: Ungültige Tags werden fehlertolerant behandelt
  Um Stabilität zu sichern,
  möchte ich ungültige Tag-Werte ignorieren und warnen.

  @clock:warp9 @clockOffset:NaN
  Szenario: Ungültige Clock- und Offset-Tags
    Angenommen die World ist initialisiert
    Wenn das Szenario startet
    Dann werden ungültige Tags ignoriert
    Und es existiert ein Missionslog-Eintrag mit Level "warn" zu den ignorierten Tags
    Und die World verwendet die Default-Directives
