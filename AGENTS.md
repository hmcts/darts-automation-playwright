You are an expert in TypeScript, Playwright, Cucumber, and reliable browser/API automation. You write readable, debuggable, low-flake tests that fit HMCTS delivery workflows.

## Repo Context
- DARTS Automation Playwright is a TypeScript automation framework using Playwright and Cucumber
- Local development uses Node.js 20 or 22 and Yarn; follow the checked-in package manager metadata when it differs from the README
- Tests run against staging environments and typically require HMCTS VPN access
- Some scenarios rely on Azure CLI, `jq`, and sourced secrets from `bin/secrets-stg.sh`
- Failed scenarios generate Playwright traces, and Jenkins stores traces/videos as build artifacts

## TypeScript And Test Design
- Keep step definitions, helpers, and page/support code strongly typed
- Avoid `any`; prefer explicit types or `unknown` when the shape is uncertain
- Prefer small reusable helpers over duplicated locator or request logic
- Optimise for low flakiness: use robust Playwright locators and avoid brittle timing assumptions

## Local Tooling
- Use the repo package manager and scripts rather than ad hoc commands
- Install dependencies with `yarn install`
- Run package scripts through Yarn, even though the underlying `package.json` script bodies call `npm run`
- Prefer these entry points when running tests locally:
  - `yarn test <options>`
  - `yarn browser <options>`
  - `yarn debug <options>`
  - `yarn video <options>`
- Useful quality commands include:
  - `yarn build`
  - `yarn lint`
  - `yarn format`

## Cucumber And Tagging
- Feature execution can target specific files, globs, or tag expressions
- Respect the default tag exclusions for `@broken`, `@obsolete`, `@TODO`, and `@review`
- Keep tag usage intentional because Jenkins jobs depend on tags such as `@smoketest`, `@regression`, and `@end2end`
- If you change tag semantics, update the README and any affected Jenkins usage

## Debugging And Diagnostics
- Preserve trace generation and debugging workflows
- When investigating failures, prefer trace evidence first for portal/admin scenarios
- For API or SOAP failures, inspect console output and related environment behaviour before changing assertions
- Keep `DEBUG_DATABASE` support working for scenarios that query the staging database

## Safety And Secrets
- Never commit sourced secrets, tokens, or environment-specific values
- Assume tests may run in shared staging environments; avoid creating unnecessary flakiness, data collisions, or destructive cleanup
- If you add new prerequisites or environment variables, document them in `README.md`

## Review Guidelines
- Prioritise findings that would break CI entry points, Yarn scripts, tag-based Jenkins runs, secret loading, or trace/debug workflows
- Treat flaky waits, fragile selectors, and hidden environment assumptions as important issues
- Prefer changes that improve determinism, diagnosability, and readability over clever abstractions
