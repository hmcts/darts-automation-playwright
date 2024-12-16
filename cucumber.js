const config = {
  import: ['src/**/*.ts'],
  format: [
    'json:reports/cucumber-report.json',
    'html:reports/report.html',
    'summary',
    'progress-bar',
  ],
  formatOptions: { snippetInterface: 'async-await' },
  tags: `(not @broken and not @obsolete) and (${process.env.INCLUDE_TAGS ? process.env.INCLUDE_TAGS : '(@smoketest or @regression or @end2end'})`,
};

if (process.env.USE_ALLURE) {
  config.format.push('./src/support/reporters/allure-reporter.ts');
} else {
  config.format.push('@cucumber/pretty-formatter');
}
export default config;
