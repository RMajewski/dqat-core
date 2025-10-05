/** @type {import('@cucumber/cucumber').IConfiguration} */
module.exports = {
  default: {
    paths: ['test/acceptance/feature/**/*.feature'],
    import: [
      'tsx/register',
      'test/acceptance/setup.ts',
      'test/acceptance/step/**/*.ts',
      'src/step/**/*.ts',
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
