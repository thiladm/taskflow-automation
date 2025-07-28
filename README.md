# TaskFlow Automation

[![Tests](https://github.com/thiladm/taskflow-automation/actions/workflows/tests.yml/badge.svg?branch=main)](https://github.com/thiladm/taskflow-automation/actions/workflows/tests.yml)

## Overview

This project uses Playwright for end-to-end (E2E) testing, with tests and related utilities organized under the `tests/` directory.
Postman is used for API testing and the test collection can be found in `tests/api-test-collection.json`.

## Latest Test Reports

- [Playwright E2E Test Report](https://thiladm.github.io/taskflow-automation/playwright/index.html)
- [Postman API Test Report](https://thiladm.github.io/taskflow-automation/postman/postman-report.html)

## Playwright E2E Tests

To run locally:

1. **Install dependencies** (from the root or `tests/`):

  ```sh
  npm install
  ```

2. **Run all tests**:

  ```sh
  npx playwright test
  ```

3. **View HTML report**:

  ```sh
  npx playwright show-report
  ```

### Playwright Structure

- **playwright.config.js**: Playwright configuration file.
- **tests/**: Contains test specs, fixtures, snapshots, and API collections.
  - `Dashboard.spec.js`, `Login.spec.js`: Main Playwright test files for dashboard and login features.
  - `fixtures/`: Shared setup/teardown logic (e.g., `auth-fixture.js`).
  - `Login.spec.js-snapshots/`: Visual regression snapshots for login tests.
  - `api-test-collection.json`: Postman collection for API tests.
- **pageobjests/**: Page Object Model (POM) classes for reusable UI interactions.
  - `DashboardPage.js`, `LoginPage.js`: Encapsulate UI actions for dashboard and login.
- **utils/**: Helper utilities for tests (e.g., `authUtils.js`).
- **coverage/**: Code coverage reports generated after test runs.
- **playwright-report/**: HTML reports and traces for Playwright test runs.
- **test-results/**: Stores test artifacts (screenshots, traces) for each test suite.

### Playwright Artifacts

- **Screenshots**: Saved in `test-results/` per test.
- **Traces**: For debugging, found in `test-results/` and `playwright-report/trace/`.
- **Coverage**: HTML and JSON files in `coverage/`.

## Postman API Tests

To run locally:

1. **Install Newman and HTML reporter**:

  ```sh
  npm install -g newman newman-reporter-html
  ```

2. **Run the collection**:

  ```sh
  newman run tests/api-test-collection.json --reporters cli,html --reporter-html-export postman-report.html
  ```

### Postman Test Structure

- **tests/api-test-collection.json**: Main Postman collection file containing API test cases for registration, login, item CRUD, and negative scenarios.
- Uses environment variables for dynamic data and authentication.
- Generates an HTML report (`postman-report.html`) after each run.
