import { DqatWorld } from '@RMajewski/dqat-core/setup';

/**
 * Erweiterte World-Klasse für Akzeptanztests.
 * Ergänzt die Basis-World (`DqatWorld`) um test-spezifische Felder,
 * die in Feature-Schritten wie Clock, Zeitvergleiche, API-Checks usw. verwendet werden.
 */
export class DqatAcceptanceWorld extends DqatWorld {}
