# language: de
@astrometrics @lifecycle
Funktionalität: Isolation und Cleanup pro Szenario
  Um Nebeneffekte zu vermeiden,
  möchte ich Ressourcen szenario-lokal verwalten und deterministisch aufräumen.

  @worldSeed:one
  Szenario: Ressourcen werden in LIFO-Reihenfolge entsorgt
    Angenommen die World ist initialisiert
    Und ich registriere eine Ressource "A" mit Disposer
    Und ich registriere eine Ressource "B" mit Disposer
    Und ich registriere eine Ressource "C" mit Disposer
    Wenn das Szenario endet
    Dann werden die Disposer in der Reihenfolge "C", "B", "A" aufgerufen
    Und Fehler in einzelnen Disposern werden protokolliert, blockieren aber das Aufräumen nicht
    Und nach dem Aufräumen sind keine aktiven Timer oder Sockets mehr vorhanden

  @parallel @worldSeed:X
  Szenario: Szenarien sind isoliert (keine Leaks)
    Angenommen die World ist initialisiert
    Und ich registriere eine Ressource "mockServer" mit Disposer
    Wenn das Szenario endet
    Dann sind ausschließlich die Ressourcen dieses Szenarios aufgeräumt
    Und Ressourcen anderer Szenarien bleiben unberührt
