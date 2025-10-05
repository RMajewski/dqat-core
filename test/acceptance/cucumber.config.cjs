/** @type {import('@cucumber/cucumber').IConfiguration} */
module.exports = {
  default: {
    paths: ['test/acceptance/feature/**/*.feature'],
    import: [
      'tsx/register',
      'test/acceptance/setup.ts',
      'test/acceptance/steps/**/*.ts',
    ],
    language: 'de',
    publishQuiet: true,
    format: [
      'progress-bar',
      'html:test/reports/cucumber/index.html',
      'summary',
    ],
    // dryRun: true,
  },
};
