const config = {
  import: ['src/**/*.ts'],
  format: [
    'json:functional-output/functional/cucumber-report.json',
    'html:functional-output/functional/report.html',
    'summary',
    'progress-bar',
    'junit:functional-output/functional/cucumber-result.xml',
  ],
  formatOptions: { snippetInterface: 'async-await' },
  tags: `(not @broken and not @obsolete and not @TODO and not @review) and ${process.env.INCLUDE_TAGS ? `(${process.env.INCLUDE_TAGS})` : '(@smoketest or @regression or @end2end)'}`,
  // retry features with @retry tag up to 2 times
  retry: 2,
  retryTagFilter: '@retry',
};

if (process.env.USE_ALLURE) {
  config.format.push('./src/support/reporters/allure-reporter.ts');
} else {
  config.format.push('@cucumber/pretty-formatter');
}
export default config;
