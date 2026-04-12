# SimpleWebApp - Playwright E2E Tests

This folder contains end-to-end (E2E) automated tests for the SimpleWebApp project using [Playwright](https://playwright.dev/).

## Test Coverage

The tests cover the following features:

### Authentication Tests (`e2e/auth/`)
| Test Case | Zephyr ID | Description |
|-----------|-----------|-------------|
| Successful Registration | RBTES-T1038 | Verify user can register with valid credentials |
| Duplicate Email Validation | RBTES-T1041 | Verify error for already registered email |
| Duplicate Username Validation | RBTES-T1043 | Verify error for already taken username |
| Password Length Validation | RBTES-T1037 | Verify minimum 8 character password requirement |
| Password Mismatch | RBTES-T1042 | Verify error when passwords don't match |
| Successful Login | RBTES-T1044 | Verify confirmed user can login |
| Block Unconfirmed User | RBTES-T1045 | Verify unconfirmed users cannot login |
| Invalid Credentials | RBTES-T1046 | Verify error for wrong credentials |

### Tasklet Tests (`e2e/tasklet/`)
| Test Case | Zephyr ID | Description |
|-----------|-----------|-------------|
| Add New Task | RBTES-T1047 | Verify adding tasks to the list |
| Mark Task as Done | RBTES-T1048 | Verify marking tasks as complete |
| Filter by Status | RBTES-T1053 | Verify All/Open/Done filters |
| Search Tasks | RBTES-T1051 | Verify keyword search functionality |
| Export Tasks | RBTES-T1050 | Verify JSON export download |
| Clear All Tasks | RBTES-T1049 | Verify clearing all tasks |
| Task Persistence | RBTES-T1052 | Verify localStorage persistence |

### Dashboard Tests (`e2e/dashboard/`)
| Test Case | Zephyr ID | Description |
|-----------|-----------|-------------|
| View API Metrics | RBTES-T1054 | Verify all metric cards display |
| View Trend Chart | RBTES-T1055 | Verify Chart.js chart renders |
| View Top 5 Keys | RBTES-T1057 | Verify top API keys list |
| View Details Table | RBTES-T1056 | Verify API key details table |

## Prerequisites

- Node.js 18 or higher
- Python 3.x (for running the Flask backend)

## Installation

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests with UI
npm run test:ui

# Run tests in headed mode (see browser)
npm run test:headed

# Run specific test suite
npm run test:auth      # Authentication tests
npm run test:tasklet   # Tasklet tests  
npm run test:dashboard # Dashboard tests

# Run tests in debug mode
npm run test:debug

# Generate and view HTML report
npm run test:report
```

## Configuration

The `playwright.config.ts` file contains the test configuration:

- **Base URL**: `http://localhost:5000` (configurable via `BASE_URL` env var)
- **Browsers**: Chromium, Firefox, WebKit
- **Web Server**: Automatically starts Flask app before tests

## Environment Variables

| Variable | Description | Default |
|----------|-------------|--------|
| `BASE_URL` | Base URL for tests | `http://localhost:5000` |
| `CI` | Running in CI environment | - |

## Project Structure

```
tests/
├── playwright.config.ts    # Playwright configuration
├── package.json            # Node.js dependencies
├── README.md              # This file
└── e2e/
    ├── auth/
    │   ├── registration.spec.ts
    │   └── login.spec.ts
    ├── tasklet/
    │   └── tasklet.spec.ts
    └── dashboard/
        └── dashboard.spec.ts
```

## Writing New Tests

1. Create a new spec file in the appropriate folder
2. Use the `test.describe` block for grouping related tests
3. Add test case IDs in comments for traceability
4. Follow the existing patterns for consistency

Example:
```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  /**
   * Test Case: RBTES-T1XXX
   * Description of the test
   */
  test('should do something', async ({ page }) => {
    // Test implementation
  });
});
```

## CI/CD Integration

The tests are configured to run in CI environments with:
- Single worker for stability
- Retries on failure
- Screenshot capture on failure
- Trace collection on first retry

## Linked Jira Stories

| Jira Key | Story |
|----------|-------|
| RBTES-781 | User Registration with Email Validation |
| RBTES-782 | User Login with Email Confirmation Check |
| RBTES-783 | Email Confirmation via Activation Link |
| RBTES-784 | Resend Confirmation Email |
| RBTES-785 | Add New Task to Tasklet |
| RBTES-786 | Mark Task as Done in Tasklet |
| RBTES-787 | Filter Tasks by Status in Tasklet |
| RBTES-788 | Search Tasks in Tasklet |
| RBTES-789 | Export Tasks as JSON in Tasklet |
| RBTES-790 | Import Tasks from JSON in Tasklet |
| RBTES-791 | Delete All Tasks in Tasklet |
| RBTES-792 | View API Key Dashboard Metrics |

## License

MIT
