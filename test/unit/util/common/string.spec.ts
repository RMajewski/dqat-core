import { describe, expect, it } from 'vitest';
import {
  normalizeArtifactFileName,
  parseCommaSeparatedList,
} from '../../../../src/util/common/string.ts';
import { normalizeArtifactFiletestId } from '../../scenarios/util/common/string/normalizeArtifactFileName.scenario.ts';
import { parseCommaSeparatedListScenarios } from '../../scenarios/util/common/string/parseCommaSeparatedList.scenario.ts';

describe('Zeichenketten-Hilfsfunktionen', () => {
  it.each(normalizeArtifactFiletestId)(
    'normalizeArtifactFileName > $name',
    ({ input, expected }) => {
      const output = normalizeArtifactFileName(input.value, input.maxLength);
      expect(output).toEqual(expected);
    },
  );

  it.each(parseCommaSeparatedListScenarios)(
    'parseCommaSeparatedList> > $testId',
    ({ input, expected }) => {
      const output = parseCommaSeparatedList(input.value);

      expect(output).toEqual(expected);
    },
  );
});
