# 📘 StarfleetDirectives – Erstellung & Nutzung der Provider

Diese README erklärt **wie du StarfleetDirectives erstellst**, wie die **Provider-Kette** funktioniert und **wie du EnvProvider, MemoryProvider und JsonFileProvider** einsetzt. Beispiele sind bewusst minimal gehalten und folgen deinem Clean‑Code‑Stil.

---

## 🧭 Ziel & Begriffe

- **StarfleetDirectives**: Zentrale, **schreibgeschützte** Konfiguration/Parameter für Tests.
- **Provider**: Datenquellen, die das Interface `StarfleetDirectiveProvider` implementieren (`name`, `get(key)`, `list(prefix?)`).
- **Kette/Priorität**: Provider werden **geordnet** übergeben – _First‑hit‑wins_: der erste Provider, der einen Wert liefert, gewinnt.

🧠 **Was passiert hier?**
StarfleetDirectives kapselt mehrere Quellen hinter einem konsistenten API (`resolveDirective`, `hasDirective`, `listDirectives`). So bleiben Tests **deterministisch**, unabhängig davon, ob Werte aus ENV, In‑Memory‑Mocks oder JSON‑Dateien kommen.

---

## 🚀 Quickstart

1. **Provider instanziieren** (Reihenfolge = Priorität):
   - `MemoryProvider` – z. B. für Test‑Defaults oder Mocks
   - `EnvProvider` – für Umgebungsvariablen (CI, lokal, Secrets)
   - `JsonFileProvider` – für strukturierte Dateien (lokale Presets)

2. **StarfleetDirectives erzeugen** mit der Factory `createStarfleetDirectives([...])`.

3. **Nutzung im Test**:
   - `resolveDirective('schluessel.pfad')` → Wert oder `undefined`
   - `hasDirective('schluessel.pfad')` → `true|false`
   - `listDirectives('prefix')` → flaches Key‑Value‑Objekt unterhalb eines Prefix

> **Hinweis:** Die Beispiele unten verwenden sprechende Variablennamen.

---

## 🧩 Provider im Detail

### 1) MemoryProvider

**Einsatz:** schnelle, inline definierte Werte (Mocks, Default‑Konfigurationen).

**Eigenschaften:**

- Nimmt ein **beliebig verschachteltes Objekt** entgegen und liefert über `list()` eine **flache** Struktur.
- **Funktionen werden ausgefiltert** (JSON‑taugliche Ergebnisse).
- Umgang mit `undefined` hängt von der Option `dropUndefined` ab.

**Beispiel (skizziert):**

```ts
import { MemoryProvider } from 'src/factory/provider/memoryProvider';
import { createStarfleetDirectives } from 'src/factory/starfleetDirective';

const inMemoryDefaults = {
  database: { host: 'localhost', port: 3306 },
  feature: { enableTelemetry: true },
};

const memoryProvider = new MemoryProvider(inMemoryDefaults, { name: 'memory' });

const directives = createStarfleetDirectives([memoryProvider]);

const databasePort = directives.resolveDirective('database.port');
```

🧠 **Was passiert hier?**
Der `MemoryProvider` flacht das Eingabeobjekt ab (z. B. `database.port`) und liefert nur **serialisierbare** Werte. Das ist ideal für reproduzierbare Default‑Werte in Tests.

---

### 2) EnvProvider

**Einsatz:** Konfiguration über **Umgebungsvariablen** (lokal, CI/CD, Secrets).

**Kern‑Verhalten:**

- **Namensauflösung**: unterstützt u. a. `separator` (Standard: `.`), `doubleUnderscoreIsSeparator` (z. B. `APP__DATABASE__PORT` → `app.database.port`), `stripPrefix` (z. B. `APP_`), `toLowerCase`.
- **Parsing**: Strings werden gemäß aktivierten Flags **konvertiert** (JSON → Boolean → Number). Beispiel: `'true'` → `true`, `'42'` → `42`.
- **`dropUndefined`**: steuert, ob fehlende ENV‑Variablen unterdrückt werden.

**Konstruktor (skizziert):**

```ts
new EnvProvider(envMap, envOptions?)
// envMap: Record<string, string | undefined> (z. B. process.env)
```

**Beispiel (skizziert):**

```ts
import { EnvProvider } from 'src/factory/provider/envProvider';
import { createStarfleetDirectives } from 'src/factory/starfleetDirective';

const envProvider = new EnvProvider(process.env, {
  name: 'env',
  stripPrefix: 'APP_',
  doubleUnderscoreIsSeparator: true,
  toLowerCase: true,
  // parse: { json: true, boolean: true, number: true },
  // dropUndefined: true,
});

const directives = createStarfleetDirectives([envProvider]);

const port = directives.resolveDirective('database.port');
```

🧠 **Was passiert hier?**
`EnvProvider` mappt ENV‑Keys auf logische Schlüssel. Mit `__` als Trenner und `stripPrefix` lassen sich robuste Konventionen abbilden (z. B. `APP__DATABASE__PORT` → `database.port`). Werte werden – sofern konfiguriert – **typisiert** (JSON/Boolean/Number).

---

### 3) JsonFileProvider

**Einsatz:** Laden einer **JSON‑Datei** als flaches Key‑Value‑Set (z. B. Presets pro Umgebung, Szenario‑Konfigurationen).

**Kern‑Verhalten:**

- Liest eine Datei von einem Pfad; **wirft** bei ungültigem JSON einen **aussagekräftigen SyntaxError** (inkl. Dateipfad).
- Nutzt internes **Flattening** zu `a.b.c`‑Schlüsseln.
- **Funktionen** werden (falls vorhanden) verworfen – Ergebnis bleibt **JSON‑safe**.
- **Dateiendung muss `.json` sein** (sonst Fehler).

**Beispiel (präzise):**

````ts
import { JsonFileProvider } from 'src/factory/provider/jsonFileProvider';
import { createStarfleetDirectives } from 'src/factory/starfleetDirective';

const jsonProvider = new JsonFileProvider(
  './config/app.config.json',
  { name: 'json' },
);

const directives = createStarfleetDirectives([jsonProvider]);

const enableTelemetry = directives.resolveDirective('feature.enableTelemetry');
```ts
import { JsonFileProvider } from '...';
import { createStarfleetDirectives } from '...';

const jsonProvider = new JsonFileProvider({
  filePath: './config/app.config.json',
  name: 'json',
  // workingDirectory?: process.cwd(),
  // encoding?: 'utf-8',
  // dropUndefined?: true,
});

const directives = createStarfleetDirectives([jsonProvider]);

const enableTelemetry = directives.resolveDirective('feature.enableTelemetry');
````

> **Fehlerbild bei ungültigem JSON:**
> `SyntaxError: JsonFileProvider: Ungültiges JSON in "<pfad>"[: <originale Fehlermeldung>]`

🧠 **Was passiert hier?**
Die Datei wird gelesen, sicher geparst und zu flachen Schlüsseln umgeformt. Dadurch können JSON‑Konfigurationen **deterministisch** mit ENV‑/Memory‑Werten kombiniert werden.

---

## 🏗️ StarfleetDirectives erstellen

**Factory‑Funktion:** `createStarfleetDirectives(providers, options?)`

- `providers`: geordnete Liste von `StarfleetDirectiveProvider`‑Instanzen.
- **Priorität**: _First‑hit‑wins_ – die Reihenfolge ist entscheidend.
- **Rückgabewerte** sind **JSON‑sicher**; **Funktionen** werden unterdrückt.
- Optional kann eine **Immutability** aktiviert werden (Deep‑Freeze), um versehentliche Mutationen in Tests zu verhindern.

**API der Rückgabe:**

- `resolveDirective(key: string): unknown`
- `hasDirective(key: string): boolean`
- `listDirectives(prefix?: string): Record<string, unknown>`

**Beispiel: Kombinierte Kette**

```ts
const directives = createStarfleetDirectives([
  new EnvProvider(process.env, { name: 'env', stripPrefix: 'APP_' }),
  new JsonFileProvider({ filePath: './config/defaults.json', name: 'json' }),
  new MemoryProvider(
    { feature: { enableTelemetry: false } },
    { name: 'memory' },
  ),
]);

// First‑hit‑wins → ENV hat Vorrang vor JSON, vor Memory
const value = directives.resolveDirective('feature.enableTelemetry');
```

🧠 **Was passiert hier?**
Beim `resolveDirective` wird die Kette von oben nach unten abgefragt. Der **erste** Provider, der den Key kennt, bestimmt den Wert. `listDirectives('feature')` lieferte ein **zusammengeführtes**, flaches Objekt für den Bereich `feature.*` (ohne Funktionswerte).

---

## 🔎 Debugging & Testbarkeit

- **Provider‑Namen** (`provider.name`) werden validiert – eindeutige Namen helfen beim Debugging/Logging.
- **`listDirectives(prefix)`**: Ideal, um effektive Werte zu inspizieren (z. B. im Test‑Output).
- **EnvProvider** bietet `getOptions()` für Tests/Asserts gegen die Normalisierung.
- **Gezielte Fehlerbilder**: JsonFileProvider wirft bei Parse‑Fehlern einen aussagekräftigen `SyntaxError` mit `cause`.

---

## 🛡️ Safety & Best Practices

- **Determinismus**: Nutze für Tests **konstante Quellen** (Memory/JSON) und setze ENV nur für Secrets/Varia.
- **Konventionen für ENV**: `APP__FOO__BAR` + `stripPrefix: 'APP_'` + `doubleUnderscoreIsSeparator: true` sichern robuste Schlüssel wie `foo.bar`.
- **Kein Funktions‑Leak**: Provider filtern Funktionswerte aus – das Ergebnis bleibt JSON‑safe.
- **Undefined‑Politik**: Wähle `dropUndefined` konsistent, um leere Werte nicht versehentlich zu überschreiben.
- **Immutability in Tests**: Aktiviere Deep‑Freeze in der Factory, um seiteneffektsichere Assertions zu bekommen.

---

## ✅ Checkliste für die Integration

- [ ] Provider‑Reihenfolge bewusst wählen (Prioritäten).
- [ ] Einheitliche Key‑Konvention definieren (`separator`, `__`, `stripPrefix`).
- [ ] Parsing‑Flags (JSON/Boolean/Number) projektweit klären.
- [ ] `dropUndefined` einheitlich entscheiden (pro Provider).
- [ ] Sinnvolle Defaults im `MemoryProvider` hinterlegen.
- [ ] JSON‑Dateien mit Linter/CI validieren.
- [ ] `listDirectives()` in den Tests nutzen, um effektive Werte zu verifizieren.

---

## 📎 Referenz (Kurzüberblick)

### StarfleetDirectives (Factory‑Ergebnis)

- `resolveDirective(key)` → Wert
- `hasDirective(key)` → boolean
- `listDirectives(prefix?)` → flaches Objekt

### Provider

- **MemoryProvider**: konstruiert mit Objekt + Optionen; flacht Keys; filtert Funktionen.
- **EnvProvider**: `(envMap, options)`; Key‑Normalisierung (`__`, Prefix, Case); Parsing von Strings.
- **JsonFileProvider**: `({ filePath, ...options })`; parst Datei sicher; flacht Keys; wirft `SyntaxError` bei ungültigem JSON.

---

## 📚 Referenz – Optionen & Defaults (präzise)

### Gemeinsame Basistypen

- **BaseProviderOptions** (src/type/provider/providerOptions.ts)
  - `name?: string` – Logischer Name.
  - `separator?: string` – Trenner für Dot‑Keys. **Default:** `'.'`. fileciteturn2file15turn2file1

### EnvProviderOptions (+ Normalisierung)

- Felder: `stripPrefix?: string`, `doubleUnderscoreIsSeparator?: boolean`, `toLowerCase?: boolean`, `parse?: boolean | { numbers?: boolean; booleans?: boolean; json?: boolean }`, `dropUndefined?: boolean`, `name?: string`, `separator?: string`. fileciteturn2file15
- **Defaults (NormalizedEnvOptions):**
  - `separator: '.'`, `doubleUnderscoreIsSeparator: true`, `toLowerCase: false`, `parse: { numbers: true, booleans: true, json: true }`, `dropUndefined: true`. fileciteturn2file1

- **Name‑Default:** `'env'`. fileciteturn2file0

### MemoryProviderOptions (+ Normalisierung)

- Felder: `flatten?: boolean`, `includeArrayIndices?: boolean`, `dropUndefined?: boolean`, `name?: string`, `separator?: string`. fileciteturn2file10
- **Defaults (NormalizedMemoryOptions):**
  - `separator: '.'`, `flatten: true`, `includeArrayIndices: true`, `dropUndefined: true`. fileciteturn2file1

- **Name‑Default:** `'memory'`. fileciteturn2file4

### JsonFileProviderOptions (+ Normalisierung)

- Felder: keine zusätzlichen gegenüber Base (nur `name?`, `separator?`). fileciteturn2file13
- **Defaults (NormalizedJsonFileOptions):**
  - `separator: '.'`. fileciteturn2file1

- **Name‑Default:** `'json'`. **Datei muss auf `.json` enden.** fileciteturn2file7

### Factory‑Optionen `StarfleetDirectivesOptions`

- `preferFirst?: boolean` – **Default:** `true` (First‑hit‑wins vs. Last‑hit‑wins). fileciteturn1file10
- `freeze?: boolean` – **Default:** `true` (Deep‑Freeze von Rückgaben). fileciteturn1file2
- **Validierung:** Doppelte Provider‑Namen führen zu `Error("Duplicate StarfleetDirectiveProvider name: <name>")`. fileciteturn2file17

---

## 🔌 Konstruktor‑Signaturen & Methoden (präzise)

- **EnvProvider** (src/factory/provider/envProvider.ts)
  - `new EnvProvider(env: Record<string, string | undefined>, options?: EnvProviderOptions)`.
  - `get(key)`, `list(prefix?)` (liefert **frozen** Record), `getOptions()`. fileciteturn2file0turn2file12

- **MemoryProvider** (src/factory/provider/memoryProvider.ts)
  - `new MemoryProvider(input: Record<string, unknown> | string | number | boolean | null | undefined, options?: MemoryProviderOptions)`.
  - `get(key)`, `list(prefix?)` (mutable Kopie), `getOptions()`. fileciteturn2file4turn2file11

- **JsonFileProvider** (src/factory/provider/jsonFileProvider.ts)
  - `new JsonFileProvider(fileName: string, options?: JsonFileProviderOptions)`.
  - `get(key)`, `list(prefix?)` (**frozen**), `getOptions()`, `getFilePath()`.
  - **Fehlerbilder:**
    - Fehlende Datei → `Error("JsonFileProvider: Die Datei \"<path>\" wurde nicht gefunden.")`
    - Kein `.json` → `Error("JsonFileProvider: \"<path>\" hat keine ".json"-Endung.")`
    - Ungültiges JSON → `SyntaxError("JsonFileProvider: Ungültiges JSON in \"<path>\"[: <message>]")`
    - Root nicht Plain‑Object → `Error("JsonFileProvider: Root von \"<path>\" ist kein JSON-Objekt. Erwartet wurde ein Plain Object.")`. fileciteturn2file7turn2file8

- **Factory** (src/factory/starfleetDirective.ts)
  - `createStarfleetDirectives(providers: readonly StarfleetDirectiveProvider[], opts?: StarfleetDirectivesOptions): StarfleetDirectives`
  - **API:** `resolveDirective<T>(key): T | undefined`, `hasDirective(key): boolean`, `listDirectives(prefix?): Readonly<Record<string, unknown>>`. fileciteturn1file10turn2file17

---

## 📦 Imports & Pfade (final)

- `src/type/provider/providerOptions.ts`
- `src/type/starfleetDirective.ts`
- `src/factory/starfleetDirective.ts`
- `src/factory/provider/envProvider.ts`
- `src/factory/provider/memoryProvider.ts`
- `src/factory/provider/jsonFileProvider.ts`
- `src/util/provider/flatten.ts`
- `src/util/provider/guards.ts` _(in den Dateien verwendet)_
- `src/util/provider/keyResolution.ts` _(in den Dateien verwendet)_
- `src/util/provider/optionNormalization.ts` _(in den Dateien verwendet)_
- `src/util/provider/parsing.helper.ts`
- `src/util/provider/parsing.ts`
- `src/util/provider/providerDefaults.ts`

---

## 🧪 Beispieltest (Skizze)

```ts
import { describe, it, expect } from 'vitest';
import { EnvProvider } from 'src/factory/provider/envProvider';
import { MemoryProvider } from 'src/factory/provider/memoryProvider';
import { createStarfleetDirectives } from 'src/factory/starfleetDirective';

describe('StarfleetDirectives – Priorität', () => {
  it('nimmt den ersten Treffer aus der Kette (First‑hit‑wins)', () => {
    // Arrange
    const memory = new MemoryProvider(
      { feature: { enableTelemetry: false } },
      { name: 'memory' },
    );
    const env = new EnvProvider(
      { APP__FEATURE__ENABLETELEMETRY: 'true' },
      { name: 'env', stripPrefix: 'APP_', doubleUnderscoreIsSeparator: true },
    );

    const directives = createStarfleetDirectives([env, memory], {
      preferFirst: true,
      freeze: true,
    });

    // Act
    const value = directives.resolveDirective<boolean>(
      'feature.enableTelemetry',
    );

    // Assert
    expect(value).toBe(true);
  });
});
```

---

## 🧨 Troubleshooting (kurz)

- **Leeres Ergebnis aus ENV erwartet?** Prüfe `stripPrefix`, `toLowerCase`, `doubleUnderscoreIsSeparator`, `separator` und `dropUndefined`. Nutze `env.getOptions()` zur Verifikation. fileciteturn2file12
- **JSON wird nicht geladen?** Stelle die **`.json`‑Endung** sicher und dass die Datei existiert. Bei Parse‑Fehlern kommt ein **`SyntaxError`** mit Original‑Message. fileciteturn2file7turn2file8
- **Konfliktierende Provider‑Namen?** Die Factory wirft einen eindeutigen Fehler; Namen müssen **innerhalb der Instanz** einzigartig sein. fileciteturn2file17

---

## 📄 Lizenz & Autorenschaft

- Lizenz gemäß Paket (z. B. **EUPL‑1.2**).
- © René Majewski – DQAT (Delta Quadrant Acceptance Testing).
