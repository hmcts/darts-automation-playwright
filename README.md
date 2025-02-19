# DARTS Automation Playwright

DARTS automation written using Playwright with TypeScript.

To use this repo you will need `node` v20 or v22 and `yarn` v3.

I recommend using a version manager such as [NVM](https://github.com/nvm-sh/nvm?tab=readme-ov-file#installing-and-updating) to manage node.js versions.

```
# using nvm
nvm install v20
nvm alias default v20
nvm use default
# check node version
node -v
```

To install `yarn`

```
# using corepack
corepack enable
yarn set version 3.8.7
yarn install
# check yarn version
yarn --version
```

## Developing and running tests locally

### Prereqs

To develop tests locally, first you need to ensure the following

- you are connected to [HMCTS VPN](https://portal.platform.hmcts.net/)
- you have the Azure CLI and `jq` installed
    - [install Azure CLI with homebrew](https://learn.microsoft.com/en-us/cli/azure/install-azure-cli-macos#install-with-homebrew)
    - `brew install jq`
- you have set the required secrets in your terminal by running `source ./bin/secrets-stg.sh`
- run `yarn install`

### Commands

After that there are various `yarn` commands and combinations that can be used to run the tests.

- `yarn test <options>` - headless browser, no debugging
- `yarn browser <options>` - same as yarn test, but shows the browser
- `yarn debug <options>` - runs playwright debugging, allowing you to step through the code
- `yarn video <options>` - same as yarn test with video recoding of the tests

You can set the `<options>` for the command depending on what you want to run.

- `features/portal/DARTS_Portal.feature` - specify single feature file
- `features/portal/*.feature` - specify multiple feature files using wildcards
- `-- --tags @smoketest` - specify a tag to run, uses [Cucumber Tag expressions](https://cucumber.io/docs/cucumber/api/#tag-expressions)

Note, that Cucumber is configured with the following tag expression by default, meaning that no features/scenarios with those tags will be run.

```
(not @broken and not @obsolete and not @TODO and not @review)
```

## Debugging Features

There are various way to debug features, firstly using the `yarn debug` command above which will enable you to step through the code and see what playwright is doing within the browser.

### Traces

Playwright can record and view traces and includes a [Trace viewer](https://playwright.dev/docs/trace-viewer) tool.

Traces are automatically recorded for all scenarios which failed and the generated ZIP files can be found in the `traces` directory.

You can view a trace (ZIP) in the Trace viewer using the following command, which shows every step through the tests and the locators/actions used.

```
yarn playwright show-trace traces/<trace_name>.zip
```

Note: the `traces` directory can safely be deleted and it will be re-created when the next trace is generated.

### Generating locators

[Locators](https://playwright.dev/docs/locators) represent a way to find an element on the page and are a Playwright fundamental.

If you would like to generate locators you can do so by [running Codegen](https://playwright.dev/docs/codegen#running-codegen), which brings up the playwright debugger and lets you browse any website and generate locators for use in tests.

### Database

Some steps run queries against the staging database, these can be debugged by setting the `DEBUG_DATABASE` environment variable to `true`, for example. This will output to the console showing the queries and inputs.

```
DEBUG_DATABASE=true yarn test -- --tags @tag-with-db-steps
```

### Jenkins

If tests fail on Jenkins runs then traces and videos will be recorded and saved as artifacts on the build. Generally, I would recommend the following when assessing a failing test.

1. Check the "Cucumber Test Report" for the build, filtering to failed.
1. See the step that failed and determine if it could have been related to a known issue.
1. If the failure is within a portal/admin portal feature:
   1. Download the trace ZIP and use the Trace viewer to assess the failure.
1. If the failure is a SOAP/JSON API step:
   1. View the console log to see the error.
   1. Crosscheck app insights for staging for any related errors.
1. Run the feature locally, if it passes then it could be some flakiness on Jenkins, this is expected to some degree.
   1. Assess if the flakiness could be improved.
1. If the feature fails locally, make any changes required to fix it and create a PR.
1. Once the PR is merged run the tests on Jenkins and cross your fingers.

## Which tests run when

[Nightly](https://sds-build.hmcts.net/job/HMCTS_Nightly/job/darts-automation-playwright/job/master/)

- configured by `Jenkinsfile_nightly`
- `@smoketest`, `@regression` and `@end2end` tags are run
- daily first thing in the morning
- tests against the staging environments
- can be triggered to run anytime within Jenkins

[PR / master branch](https://sds-build.hmcts.net/job/HMCTS/job/darts-automation-playwright/job/master/)

- configured by `Jenkinsfile_CNP`
- `@smoketest` tag is run
- tests against the staging environments
- can be triggered to run anytime within Jenkins

## Browser selection

By default we will use chromium. You can define an environment variable called BROWSER and
set the name of the browser. Available options: chromium, firefox, webkit

On Linux and Mac you can write:

`BROWSER=firefox yarn test` runs all tests using Firefox

On Windows you need to write (this is untested)

```
set BROWSER=firefox
yarn test
```
