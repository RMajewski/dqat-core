import holodeckSceneSchema from '../config/schema/holodeck.scene.v1.json';
import { HolodeckSceneLoadErrorCode } from '../type/holodeck/holodeck.error.ts';
import type {
  LoadedHolodeckRoute,
  LoadedHolodeckScene,
} from '../type/holodeck/holodeck.ts';
import type {
  HolodeckRouteSpec,
  HolodeckSceneDocument,
} from '../type/holodeck/sceneDocument.ts';
import type {
  ResolvedVariableMap,
  SceneLoaderConfig,
} from '../type/holodeck/sceneLoaderConfig.ts';
import { HolodeckSceneLoadError } from './holodeck.error.ts';

/**
 * Ein Chunk innerhalb eines Template-Strings.
 * - text: normaler Literal-Text
 * - placeholder: ein Platzhalter ohne {{ }} Drumherum, z. B. "nowEpochMs"
 */
type TemplateChunk =
  | { type: 'text'; value: string }
  | { type: 'placeholder'; value: string };

/**
 * SceneLoader lädt und rendert Szenen-Dokumente zu LoadedHolodeckScene.
 */
export class SceneLoader {
  private readonly readSceneDocumentByName: SceneLoaderConfig['readSceneDocumentByName'];
  private readonly nowProvider: SceneLoaderConfig['nowProvider'];
  private readonly validateSceneDocument: (data: unknown) => boolean;

  constructor(config: SceneLoaderConfig) {
    this.readSceneDocumentByName = config.readSceneDocumentByName;
    this.nowProvider = config.nowProvider;
    const validateFn = config.ajvInstance.compile(holodeckSceneSchema);
    this.validateSceneDocument = validateFn;
  }

  /**
   * Lädt eine Szene anhand des Namens und wendet:
   * - Schema-Validierung
   * - Parameter-Merge
   * - Template-Rendering
   * an.
   *
   * @param sceneName Name der Szene, z. B. "happy"
   * @param sceneParams Werte für variables.*, überschreiben Defaults
   */
  public async loadScene(
    sceneName: string,
    sceneParams: Record<string, unknown>,
  ): Promise<LoadedHolodeckScene> {
    const rawDocument = await this.readSceneDocumentByName(sceneName);

    // 1. Schema-Validierung
    const isValid = this.validateSceneDocument(rawDocument);
    if (!isValid) {
      throw new HolodeckSceneLoadError({
        code: HolodeckSceneLoadErrorCode.SCHEMA_VIOLATION,
        message: 'Scene document failed schema validation',
        path: 'scene',
      });
    }

    const sceneDocument = rawDocument as HolodeckSceneDocument;

    // 2. Variablen auflösen (Defaults + sceneParams + Typ-Check)
    const resolvedVariables = this.resolveVariables(sceneDocument, sceneParams);

    const now = this.nowProvider();

    // 3. Templates in allen Routen rendern
    const renderedRoutes: LoadedHolodeckScene['routes'] =
      sceneDocument.routes.map((route, index) =>
        this.renderRoute(route, index, now, resolvedVariables),
      );

    // 4. Vollständig gerenderte Szene zurückgeben
    return {
      name: sceneDocument.name,
      version: sceneDocument.version,
      description: sceneDocument.description,
      meta: sceneDocument.meta,
      routes: renderedRoutes,
    };
  }

  /**
   * Rendert eine Route vollständig durch.
   */
  renderRoute(
    route: HolodeckRouteSpec,
    index: number,
    now: Date,
    resolvedVariables: ResolvedVariableMap,
  ): LoadedHolodeckRoute {
    const routePathPrefix = `routes[${index}]`;

    // Request ist rein kopierter Wert (keine Templates außer evtl. in bodyMatcher)
    const renderedRequest = this.renderTemplatesDeep(
      route.request,
      `${routePathPrefix}.request`,
      now,
      resolvedVariables,
    ) as LoadedHolodeckRoute['request'];

    // Response muss Templates rendern (body, headers etc.)
    const renderedResponseRaw = this.castToResponseSpec(
      this.renderTemplatesDeep(
        route.response,
        `${routePathPrefix}.response`,
        now,
        resolvedVariables,
      ),
      `${routePathPrefix}.response`,
    );

    const normalizedDelayMs = this.normalizeDelayMs(
      renderedResponseRaw.delayMs,
      `${routePathPrefix}.response.delayMs`,
    );

    const renderedResponse: LoadedHolodeckRoute['response'] = {
      statusCode: renderedResponseRaw.statusCode,
      headers: renderedResponseRaw.headers,
      body: renderedResponseRaw.body,
      delayMs: normalizedDelayMs,
    };

    return {
      id: route.id,
      priority: route.priority,
      request: renderedRequest,
      response: renderedResponse,
      times: route.times,
    };
  }

  /**
   * Wandelt ein beliebiges Eingabeobjekt in eine typsichere Response-Struktur um.
   *
   * Diese Funktion dient als Sicherheitsbarriere zwischen der Template-Rendering-
   * Phase (`renderTemplatesDeep`) und der typisierten Verarbeitung einer Route.
   *
   * Der Rückgabewert wird nur dann gecastet, wenn die minimale Struktur einer
   * gültigen Response erfüllt ist (d. h. es handelt sich um ein Objekt, das
   * mindestens ein Feld `statusCode` enthält). Andernfalls wird eine
   * `HolodeckSceneLoadError`-Exception mit Code `SCHEMA_VIOLATION` geworfen.
   *
   * @param value       Beliebiges Eingabeobjekt, typischerweise das Ergebnis von `renderTemplatesDeep`
   * @param contextPath JSON-Pfad, der im Fehlerfall im Exception-Objekt angegeben wird
   * @returns Typsicheres Response-Objekt (`LoadedHolodeckRoute['response']`)
   *
   * @throws HolodeckSceneLoadError
   *         Wenn das Eingabeobjekt keine gültige Response-Struktur besitzt.
   *
   * @example
   * ```ts
   * const raw = this.renderTemplatesDeep(route.response, "routes[0].response", now, vars);
   * const response = this.castToResponseSpec(raw, "routes[0].response");
   * ```
   */
  private castToResponseSpec(
    value: unknown,
    contextPath: string,
  ): LoadedHolodeckRoute['response'] {
    if (typeof value === 'object' && value !== null && 'statusCode' in value) {
      return value as LoadedHolodeckRoute['response'];
    }

    throw new HolodeckSceneLoadError({
      code: HolodeckSceneLoadErrorCode.SCHEMA_VIOLATION,
      message: `${contextPath} is not a valid response object`,
      path: contextPath,
    });
  }

  /**
   * Konvertiert delayMs ins finale number-Format.
   * Falls delayMs ein Template war, ist es nach renderTemplatesDeep schon ersetzt.
   * Falls delayMs ein string geblieben ist (sollte nicht passieren), wird
   * schemaViolation geworfen.
   */
  normalizeDelayMs(delayMs: unknown, contextPath: string): number | undefined {
    if (delayMs === undefined) {
      return undefined;
    }

    if (typeof delayMs === 'number') {
      if (delayMs < 0) {
        throw new HolodeckSceneLoadError({
          code: HolodeckSceneLoadErrorCode.SCHEMA_VIOLATION,
          message: `${contextPath} must be integer >= 0`,
          path: contextPath,
          keyword: 'minimum',
          received: delayMs,
        });
      }
      return delayMs;
    }

    // nach dem Rendern sollten keine Templates mehr übrig sein
    throw new HolodeckSceneLoadError({
      code: HolodeckSceneLoadErrorCode.SCHEMA_VIOLATION,
      message: `${contextPath} must resolve to number`,
      path: contextPath,
      keyword: 'type',
      received: delayMs,
    });
  }

  /**
   * Wendet Defaults an und merged sceneParams ein.
   * Validiert nebenbei die Typen.
   */
  resolveVariables(
    scene: HolodeckSceneDocument,
    sceneParams: Record<string, unknown>,
  ): ResolvedVariableMap {
    const resolved: ResolvedVariableMap = {};
    const variableSpecs = scene.variables ?? {};

    for (const [variableName, spec] of Object.entries(variableSpecs)) {
      const paramProvided = Object.prototype.hasOwnProperty.call(
        sceneParams,
        variableName,
      );

      const candidateValue = paramProvided
        ? (sceneParams as Record<string, unknown>)[variableName]
        : spec.default;

      if (candidateValue === undefined) {
        // Kein Wert, kein Default -> das ist für v1 noch erlaubt.
        // Später könnten wir hier Pflichtvariablen erzwingen.
        continue;
      }

      if (!this.isValueOfDeclaredType(spec.type, candidateValue)) {
        throw new HolodeckSceneLoadError({
          code: HolodeckSceneLoadErrorCode.INVALID_PARAMS,
          message: `param "${variableName}" must be ${spec.type}`,
          path: `variables.${variableName}`,
        });
      }

      resolved[variableName] = candidateValue;
    }

    return resolved;
  }

  /**
   * Prüft, ob ein Wert dem erwarteten Variablen-Typ entspricht.
   * Diese Prüfung ist absichtlich simpel gehalten.
   */
  isValueOfDeclaredType(expectedType: string, value: unknown): boolean {
    switch (expectedType) {
      case 'number':
        return typeof value === 'number' && Number.isFinite(value);
      case 'string':
        return typeof value === 'string';
      case 'boolean':
        return typeof value === 'boolean';
      case 'object':
        return typeof value === 'object' && value !== null;
      default:
        return false;
    }
  }

  /**
   * Erzeugt ein Deep-Copy-Objekt mit ersetzten Templates.
   *
   * Diese Funktion dient als zentraler Dispatch:
   * - Primitive / null / undefined → renderPrimitiveWithTemplates
   * - Array                       → renderArrayWithTemplates
   * - Objekt                      → renderObjectWithTemplates
   *
   * Durch diese Aufteilung bleibt die kognitive Komplexität gering.
   */
  private renderTemplatesDeep(
    inputValue: unknown,
    contextPath: string,
    now: Date,
    resolvedVariables: ResolvedVariableMap,
  ): unknown {
    // null, undefined oder primitive Werte
    const isObjectLike = typeof inputValue === 'object' && inputValue !== null;

    if (!isObjectLike) {
      return this.renderPrimitiveWithTemplates(
        inputValue,
        contextPath,
        now,
        resolvedVariables,
      );
    }

    // Array
    if (Array.isArray(inputValue)) {
      return this.renderArrayWithTemplates(
        inputValue,
        contextPath,
        now,
        resolvedVariables,
      );
    }

    // Plain Object
    return this.renderObjectWithTemplates(
      inputValue as Record<string, unknown>,
      contextPath,
      now,
      resolvedVariables,
    );
  }

  /**
   * Rendert einen primitiven Wert und ersetzt Templates in Strings.
   *
   * - Nicht-Strings werden unverändert zurückgegeben.
   * - Strings ohne Templates bleiben unverändert.
   * - Strings mit Templates werden über renderStringWithTemplates verarbeitet.
   *
   * Unbekannte Templates führen zu schemaViolation und brechen den Ladevorgang ab.
   *
   * Diese Funktion bleibt bewusst schmal, um die kognitive Last niedrig zu halten.
   */
  private renderPrimitiveWithTemplates(
    value: unknown,
    contextPath: string,
    now: Date,
    resolvedVariables: ResolvedVariableMap,
  ): unknown {
    if (typeof value !== 'string') {
      return value;
    }

    return this.renderStringWithTemplates(
      value,
      contextPath,
      now,
      resolvedVariables,
    );
  }

  /**
   * Rendert einen String mit möglichen {{...}}-Platzhaltern.
   *
   * Regeln:
   * - Falls der String ausschließlich aus genau EINEM Platzhalter besteht,
   *   geben wir den rohen Wert zurück (z. B. number, boolean, object).
   *
   * - Andernfalls bauen wir einen String neu auf:
   *   - text-Chunks bleiben unverändert
   *   - placeholder-Chunks werden ersetzt; Nicht-Strings werden zu String() konvertiert
   */
  private renderStringWithTemplates(
    value: string,
    contextPath: string,
    now: Date,
    resolvedVariables: ResolvedVariableMap,
  ): unknown {
    const chunks = this.splitTemplateStringIntoChunks(value, contextPath);

    // Keine Platzhalter? Dann bleibt der String so wie er ist.
    const hasPlaceholder = chunks.some((c) => c.type === 'placeholder');
    if (!hasPlaceholder) {
      return value;
    }

    // Prüfen, ob der gesamte String nur aus einem einzigen Platzhalter besteht
    if (chunks.length === 1 && chunks[0].type === 'placeholder') {
      return this.resolveSingleTemplateKey(
        chunks[0].value,
        contextPath,
        now,
        resolvedVariables,
      );
    }

    // Gemischter String -> wir bauen den finalen String zusammen
    let rendered = '';
    for (const chunk of chunks) {
      if (chunk.type === 'text') {
        rendered += chunk.value;
        continue;
      }

      const resolvedValue = this.resolveSingleTemplateKey(
        chunk.value,
        contextPath,
        now,
        resolvedVariables,
      );

      // Falls der Placeholder kein string ist (z. B. number), stringifizieren
      rendered +=
        typeof resolvedValue === 'string'
          ? resolvedValue
          : String(resolvedValue);
    }

    return rendered;
  }

  /**
   * Zerlegt einen String in Template- und Text-Abschnitte,
   * ohne Regex zu verwenden.
   *
   * Beispiel:
   *   "Warp {{now}} core {{temp}}K"
   * -> [
   *      { type: 'text', value: 'Warp ' },
   *      { type: 'placeholder', value: 'now' },
   *      { type: 'text', value: ' core ' },
   *      { type: 'placeholder', value: 'temp' },
   *      { type: 'text', value: 'K' }
   *    ]
   *
   * Falls ein '{{' ohne schließendes '}}' vorkommt,
   * betrachten wir das als ungültiges Template
   * und werfen eine schemaViolation.
   */
  private splitTemplateStringIntoChunks(
    value: string,
    contextPath: string,
  ): TemplateChunk[] {
    const chunks: TemplateChunk[] = [];
    let cursor = 0;

    while (cursor < value.length) {
      const startIndex = value.indexOf('{{', cursor);

      // kein weiteres '{{' gefunden -> Rest ist Plain-Text
      if (startIndex === -1) {
        const tailText = value.slice(cursor);
        if (tailText !== '') {
          chunks.push({ type: 'text', value: tailText });
        }
        break;
      }

      // Text vor der nächsten "{{"
      if (startIndex > cursor) {
        chunks.push({
          type: 'text',
          value: value.slice(cursor, startIndex),
        });
      }

      const endIndex = value.indexOf('}}', startIndex + 2);
      if (endIndex === -1) {
        // Ungeschlossene Klammer -> invalides Template
        throw new HolodeckSceneLoadError({
          code: HolodeckSceneLoadErrorCode.SCHEMA_VIOLATION,
          message: 'Unterminated template expression',
          path: contextPath,
        });
      }

      const rawKey = value.slice(startIndex + 2, endIndex).trim();
      chunks.push({
        type: 'placeholder',
        value: rawKey,
      });

      cursor = endIndex + 2;
    }

    return chunks;
  }

  /**
   * Löst einen einzelnen Template-Key auf.
   *
   * Unterstützt:
   * - now         -> ISO-String
   * - nowEpochMs  -> number (epoch ms)
   * - Variablen aus resolvedVariables
   *
   * Wirft schemaViolation, wenn der Key unbekannt ist.
   */
  private resolveSingleTemplateKey(
    templateKey: string,
    contextPath: string,
    now: Date,
    resolvedVariables: ResolvedVariableMap,
  ): unknown {
    if (templateKey === 'now') {
      return now.toISOString();
    }

    if (templateKey === 'nowEpochMs') {
      return now.getTime();
    }

    if (Object.prototype.hasOwnProperty.call(resolvedVariables, templateKey)) {
      return resolvedVariables[templateKey];
    }

    throw new HolodeckSceneLoadError({
      code: HolodeckSceneLoadErrorCode.SCHEMA_VIOLATION,
      message: `Variable '${templateKey}' missing for template`,
      path: contextPath,
    });
  }

  /**
   * Rendert ein Array rekursiv. Jeder Eintrag wird wieder über renderTemplatesDeep behandelt.
   */
  private renderArrayWithTemplates(
    arr: unknown[],
    contextPath: string,
    now: Date,
    resolvedVariables: ResolvedVariableMap,
  ): unknown[] {
    return arr.map((child, index) =>
      this.renderTemplatesDeep(
        child,
        `${contextPath}[${index}]`,
        now,
        resolvedVariables,
      ),
    );
  }

  /**
   * Rendert ein Objekt rekursiv. Jeder Wert wird wieder über renderTemplatesDeep behandelt.
   */
  private renderObjectWithTemplates(
    obj: Record<string, unknown>,
    contextPath: string,
    now: Date,
    resolvedVariables: ResolvedVariableMap,
  ): Record<string, unknown> {
    const result: Record<string, unknown> = {};

    for (const [key, childValue] of Object.entries(obj)) {
      const childPath = contextPath === '' ? key : `${contextPath}.${key}`;
      result[key] = this.renderTemplatesDeep(
        childValue,
        childPath,
        now,
        resolvedVariables,
      );
    }

    return result;
  }
}
