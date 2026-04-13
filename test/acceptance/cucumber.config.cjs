/** @type {import('@cucumber/cucumber').IConfiguration} */
module.exports = {
  default: {
    paths: ['test/acceptance/feature/**/*.feature'],
    import: [
      'tsx/register',
      'tsconfig-paths/register',
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
    // dryRun: true,
  },
};
