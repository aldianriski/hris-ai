# Testing Guide

This directory contains all tests for the HRIS application.

## Test Structure

```
tests/
├── unit/              # Unit tests for isolated functions
│   ├── lib/          # Library/utility tests
│   │   ├── api/      # API utilities
│   │   ├── queue/    # Job queue helpers
│   │   ├── email/    # Email functions
│   │   └── integrations/ # OAuth integrations
│   └── jobs/         # Job function tests
├── integration/       # Integration tests for API endpoints
│   ├── auth/         # Authentication tests
│   ├── leave/        # Leave management tests
│   └── payroll/      # Payroll tests
├── e2e/              # End-to-end tests (future)
└── setup.ts          # Test setup and configuration
```

## Running Tests

### All Tests
```bash
npm run test
```

### Watch Mode
```bash
npm run test:watch
```

### Coverage Report
```bash
npm run test:coverage
```

### Specific Test File
```bash
npm run test tests/unit/lib/api/response.test.ts
```

### Specific Test Suite
```bash
npm run test -- --grep="API Response Utilities"
```

## Writing Tests

### Unit Tests

Unit tests should test individual functions in isolation.

```typescript
import { describe, it, expect } from 'vitest';
import { myFunction } from '@/lib/myModule';

describe('My Module', () => {
  describe('myFunction', () => {
    it('should return expected result', () => {
      const result = myFunction('input');
      expect(result).toBe('expected');
    });

    it('should handle edge cases', () => {
      const result = myFunction('');
      expect(result).toBe('default');
    });
  });
});
```

### Integration Tests

Integration tests should test API endpoints with real requests.

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { createMocks } from 'node-mocks-http';

describe('POST /api/v1/auth/login', () => {
  it('should login user with valid credentials', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        email: 'user@example.com',
        password: 'password123',
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.success).toBe(true);
  });
});
```

### Mocking

Use Vitest mocking capabilities:

```typescript
import { vi } from 'vitest';

// Mock a module
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(),
      insert: vi.fn(),
    })),
  })),
}));

// Mock a function
const mockFn = vi.fn();
mockFn.mockReturnValue('mocked value');

// Spy on a function
const spy = vi.spyOn(obj, 'method');
expect(spy).toHaveBeenCalledWith('arg');
```

## Test Coverage Goals

- **Critical Path**: 80%+ coverage
  - Authentication
  - Authorization
  - Payment processing
  - Leave approvals
  - Payroll calculations

- **General**: 60%+ coverage
  - API utilities
  - Data validation
  - Helper functions

- **Nice to Have**: 40%+ coverage
  - UI components
  - Integration helpers

## Best Practices

1. **Descriptive Names**: Use clear, descriptive test names
   ```typescript
   it('should reject login with invalid password')
   ```

2. **One Assertion Per Test**: Each test should verify one behavior
   ```typescript
   // Good
   it('should return 400 for missing email', () => {
     expect(response.status).toBe(400);
   });

   it('should return error message for missing email', () => {
     expect(response.body.error.message).toContain('email');
   });

   // Avoid
   it('should handle missing email', () => {
     expect(response.status).toBe(400);
     expect(response.body.error.message).toContain('email');
     expect(response.body.success).toBe(false);
   });
   ```

3. **Arrange-Act-Assert**: Structure tests clearly
   ```typescript
   it('should calculate net salary correctly', () => {
     // Arrange
     const gross = 10000;
     const deductions = 2000;

     // Act
     const net = calculateNetSalary(gross, deductions);

     // Assert
     expect(net).toBe(8000);
   });
   ```

4. **Clean Up**: Reset mocks between tests
   ```typescript
   beforeEach(() => {
     vi.clearAllMocks();
   });
   ```

5. **Test Edge Cases**: Don't just test the happy path
   ```typescript
   it('should handle empty array');
   it('should handle null input');
   it('should handle very large numbers');
   ```

## Continuous Integration

Tests run automatically on every push and pull request via GitHub Actions.

```yaml
# .github/workflows/test.yml
- name: Run tests
  run: npm run test:coverage
```

## Debugging Tests

### VS Code Debug Configuration

Add to `.vscode/launch.json`:

```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Vitest Tests",
  "runtimeExecutable": "npm",
  "runtimeArgs": ["run", "test:debug"],
  "console": "integratedTerminal"
}
```

### Console Logging

Use `console.log()` in tests (will be suppressed unless test fails):

```typescript
it('should debug this', () => {
  console.log('Debugging value:', myValue);
  expect(myValue).toBe(expected);
});
```

## Common Issues

### Module Not Found

Ensure path aliases are configured in `vitest.config.ts`:

```typescript
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
  },
}
```

### Async Tests Timing Out

Increase timeout for slow tests:

```typescript
it('should complete slow operation', async () => {
  // ...
}, 10000); // 10 second timeout
```

### Mock Not Working

Ensure mock is defined before import:

```typescript
vi.mock('@/lib/module'); // Must be before import

import { function } from '@/lib/module';
```

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Mock Service Worker](https://mswjs.io/) - For API mocking
- [Playwright](https://playwright.dev/) - For E2E testing
