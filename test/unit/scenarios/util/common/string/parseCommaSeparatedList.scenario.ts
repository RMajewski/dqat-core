import type { StandardScenario } from '../../../../type/StandardScenario.ts';

export const parseCommaSeparatedListScenarios: StandardScenario<
  { value: string },
  string[]
>[] = [
  {
    testId: 'single value',
    input: {
      value: 'image-alt',
    },
    expected: ['image-alt'],
  },
  {
    testId: 'multiple values',
    input: {
      value: 'image-alt, button-name',
    },
    expected: ['image-alt', 'button-name'],
  },
  {
    testId: 'missing spaces',
    input: {
      value: 'image-alt,button-name,color-contrast',
    },
    expected: ['image-alt', 'button-name', 'color-contrast'],
  },
  {
    testId: 'extra spaces',
    input: {
      value: ' image-alt , button-name , color-contrast ',
    },
    expected: ['image-alt', 'button-name', 'color-contrast'],
  },
  {
    testId: 'empty entries',
    input: {
      value: 'image-alt, , button-name,, color-contrast',
    },
    expected: ['image-alt', 'button-name', 'color-contrast'],
  },
  {
    testId: 'empty value',
    input: {
      value: '',
    },
    expected: [],
  },
];
