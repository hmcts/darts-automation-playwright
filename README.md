# DARTS Automation Playwright

DARTS automation written using Playwright

## To run your tests

`yarn test` or `npx cucumber-js` runs all tests
`yarn test <feature name>` or `npx cucumber-js <feature name>` run the single feature

## Browser selection

By default we will use chromium. You can define an envrionment variable called BROWSER and
set the name of the browser. Available options: chromium, firefox, webkit

On Linux and Mac you can write:

`BROWSER=firefox yarn test` or `BROWSER=firefox npx cucumber-js` runs all tests using Firefox

One Windows you need to write

```
set BROWSER=firefox
yarn test
```

## Debugging Features

### From CLI

- `yarn debug` - headful mode with APIs enables both APIs and debug options
- `yarn api` - headless mode with debug apis
- `yarn video` - headless mode vith video

## In Visual Studio Code

- Open the feature
- Select the debug options in the VSCode debugger
- Set breakpoints in the code

To stop the feature, you can add the `Then debug` step inside your feature. It will stop your debugger.

## To choose a reporter

The last reporter/formatter found on the cucumber-js command-line wins:

```text
--format summary --format @cucumber/pretty-formatter --format cucumber-console-formatter
```

In [cucumber.mjs](cucumber.mjs) file, modify the options.

To use Allure reporting, you can run with env param: `USE_ALLURE=1`, and then use the `yarn allure` to show the report.

## To ignore a scenario

- tag the scenario with `@ignore`

## To check for typescript, linting and gherkin errors

- run the command `yarn build`.

## To view the steps usage

- run the command `yarn steps-usage`.

## To view the html report of the last run

- run the command `yarn report`.

### At least in Lubuntu 20.04 to open the html report

- Modify the `package.json` in `"report": "xdg-open reports/report.html"`

## To view allure report

- run the command `yarn allure`.
