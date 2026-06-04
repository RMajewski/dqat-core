import { describe, expect, it } from 'vitest';
import { normalizeArtifactFileName } from '../../../../src/util/common/string.ts';
import { normalizeArtifactFiletestId } from '../../scenarios/util/common/string/normalizeArtifactFileName.scenario.ts';

describe('Zeichenketten-Hilfsfunktionen', () => {
  it.each(normalizeArtifactFiletestId)(
    'normalizeArtifactFileName: $name',
    ({ input, expected }) => {
      const output = normalizeArtifactFileName(input.value, input.maxLength);
      expect(output).toEqual(expected);
    },
  );
});
