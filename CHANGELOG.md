# [1.0.0-alpha.12](https://github.com/RMajewski/dqat-core/compare/v1.0.0-alpha.11...v1.0.0-alpha.12) (2026-05-20)


### Features

* **starfleet-directives:** IStarfleetDirectiveSchema für externe Pakete exportierbar machen ([f5d59d4](https://github.com/RMajewski/dqat-core/commit/f5d59d4c882224675777f8d4a49e6f542f7cb7eb))

# [1.0.0-alpha.11](https://github.com/RMajewski/dqat-core/compare/v1.0.0-alpha.10...v1.0.0-alpha.11) (2026-05-14)


### Bug Fixes

* **eslint:** Schema-Datei für dqat.config.json wird ins build hinzugefügt ([73e054a](https://github.com/RMajewski/dqat-core/commit/73e054a687b361653b7cd6d9b303711b19b4fd8a))

# [1.0.0-alpha.10](https://github.com/RMajewski/dqat-core/compare/v1.0.0-alpha.9...v1.0.0-alpha.10) (2026-05-14)


### Features

* **eslint:** validiere dqat.config.json über JSON-Schema ([9862bd7](https://github.com/RMajewski/dqat-core/commit/9862bd7952ef81883ad22271c3dc284c4d4fdd09))

# [1.0.0-alpha.9](https://github.com/RMajewski/dqat-core/compare/v1.0.0-alpha.8...v1.0.0-alpha.9) (2026-05-11)


### Bug Fixes

* **utils:** normalizeArtifactFileName im utils-Entry exportieren ([b9db550](https://github.com/RMajewski/dqat-core/commit/b9db550bbd5adec1d5fd50ded5f8a5562c10f7cf))

# [1.0.0-alpha.8](https://github.com/RMajewski/dqat-core/compare/v1.0.0-alpha.7...v1.0.0-alpha.8) (2026-05-11)


### Features

* **normalizeArtifactFileName:** Artefakt-Dateinamen normalisieren ([44dda85](https://github.com/RMajewski/dqat-core/commit/44dda85028959cd94a5df1cd1e84b848f3a57d14))

# [1.0.0-alpha.7](https://github.com/RMajewski/dqat-core/compare/v1.0.0-alpha.6...v1.0.0-alpha.7) (2026-05-06)


### Bug Fixes

* **world:** ICucumberWorld um IWorld erweitern ([a5e3638](https://github.com/RMajewski/dqat-core/commit/a5e3638e5fcc299a8c547420382438484f41a87b))

# [1.0.0-alpha.6](https://github.com/RMajewski/dqat-core/compare/v1.0.0-alpha.5...v1.0.0-alpha.6) (2026-05-05)


### Features

* **holodeck:** Response-Body-Assertion-Schritt und bodyFile-Akzeptanztest ergänzt ([f051c05](https://github.com/RMajewski/dqat-core/commit/f051c0531bb1bbb2d8a44161bb3c63e57aed1621))
* **holodeck:** Unterstützung für bodyFile in Response implementieren ([0a3802d](https://github.com/RMajewski/dqat-core/commit/0a3802dca091bfb665083f94cd3cecf8d6511113))

# [1.0.0-alpha.5](https://github.com/RMajewski/dqat-core/compare/v1.0.0-alpha.4...v1.0.0-alpha.5) (2026-05-05)


### Bug Fixes

* **holodeck:** Scene-Dateien korrekt in Flat Config berücksichtigt ([4ec03c1](https://github.com/RMajewski/dqat-core/commit/4ec03c147c48887eee6d45131ce4d5c6a423e7f1))

# [1.0.0-alpha.4](https://github.com/RMajewski/dqat-core/compare/v1.0.0-alpha.3...v1.0.0-alpha.4) (2026-05-03)

### Features

- **holodeck:** Einstiegspunkt und Holodeck-Szenenvalidierung hinzugefügt ([b540d09](https://github.com/RMajewski/dqat-core/commit/b540d09e2c648575718fe3329aec2bc28e030db4))

# [1.0.0-alpha.3](https://github.com/RMajewski/dqat-core/compare/v1.0.0-alpha.2...v1.0.0-alpha.3) (2026-04-27)

### Features

- **core:** EnvProviderOptions rekonstruieren und MemoryProvider um set erweitern ([db2d7a6](https://github.com/RMajewski/dqat-core/commit/db2d7a66cc8a540dc7a77d98b9b42be2cf4740da))
- **holodeck:** Holodeck-Start und Szenenladen implementieren ([85c1228](https://github.com/RMajewski/dqat-core/commit/85c12285531566371633986c82a46cbaaa31271c))
- **holodeck:** MockServer-System-Output deaktiviert und Logs als Dateien gespeichert ([50d5dd1](https://github.com/RMajewski/dqat-core/commit/50d5dd1b8792b9c6b913884786abcbf8fe7daf7f))
- **starfleet-directives:** Env-Provider-Optionen beim Laden der Directives verfügbar machen ([dc0ea5c](https://github.com/RMajewski/dqat-core/commit/dc0ea5cab4f15ca18eac5297f7a06ae990041e5b))
- **utils:** Add isStarfleetDirectiveKey ([565cf2a](https://github.com/RMajewski/dqat-core/commit/565cf2af6117b9f1b8f76caaf9fffeeb9abf313e))

# [1.0.0-alpha.2](https://github.com/RMajewski/dqat-core/compare/v1.0.0-alpha.1...v1.0.0-alpha.2) (2026-04-14)

### Bug Fixes

- Janeway startet erst, wenn Tuvok grünes Licht gibt. ([15592c3](https://github.com/RMajewski/dqat-core/commit/15592c325efd086536a121255b6be830e8656340))
- Janeway startet erst, wenn Tuvok grünes Licht gibt. ([12f8be9](https://github.com/RMajewski/dqat-core/commit/12f8be926246b97b969836136145bab8c25dc138))
- Janeway trigger ([7dd2f88](https://github.com/RMajewski/dqat-core/commit/7dd2f888076c8a1b357f3d4a896615dfec9a6609))
- Janeway-Action ([6c7d944](https://github.com/RMajewski/dqat-core/commit/6c7d944ceb718a317fbcfedab2e92f5d677fc13f))
- **Setup:** Janeway benutzt richtig Commit. ([91ed1dc](https://github.com/RMajewski/dqat-core/commit/91ed1dc50374aff4c391327cf663fe56695db8fc))

### Features

- **astrometrics:** erste Iteration der Clock-Implementierung hinzugefügt ([838f210](https://github.com/RMajewski/dqat-core/commit/838f2100412cad96aa30423585b4f78ab0d53b4c))
- **holodeck:** implementiere Engine-Adapter-Struktur und Integration in Holodeck ([c576242](https://github.com/RMajewski/dqat-core/commit/c576242ab3e0a755f5c8d1f43331662e7cbf2cb3)), closes [#7](https://github.com/RMajewski/dqat-core/issues/7)
- **holodeck:** implementiere SceneLoader mit Template-Rendering und Schema-Validierung ([cf1aaad](https://github.com/RMajewski/dqat-core/commit/cf1aaaddc28065ad73e9266cab3d8c04e5a4a6a6))

# 1.0.0-alpha.1 (2025-10-03)

### Features

- **Setup:** Basis-Setup ([e187b8e](https://github.com/RMajewski/dqat-core/commit/e187b8edd44d0790a75bd0c6e47e418c5b8f1043))
