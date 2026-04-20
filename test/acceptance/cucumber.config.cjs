const defaultConfig = {
  paths: ['test/acceptance/feature/**/*.feature'],
  requireModule: ['tsx/cjs', 'tsconfig-paths/register'],
  require: [
    'test/acceptance/setup.ts',
    'src/step/**/*.ts',
    'test/acceptance/step/**/*.ts',
  ],
  formatOptions: {
    snippetInterface: 'async-await',
  },
  language: 'de',
  publishQuiet: true,
  format: [
    'progress-bar',
    'html:test/reports/cucumber/index.html',
    'summary',
    'snippets:test/reports/cucumber/snippets.txt',
  ],
};

const ciConfig = {
  ...defaultConfig,
  tags: 'not @SkipOnPipeline',
};

/** @type {import('@cucumber/cucumber').IConfiguration} */
module.exports = {
  default: defaultConfig,
  ci: ciConfig,
};
