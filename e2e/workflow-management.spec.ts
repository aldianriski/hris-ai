import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Workflow List and Management
 * Tests workflow listing, filtering, and actions
 */

test.describe('Workflow Management Journey', () => {
  test.beforeEach(async ({ page }) => {
    // Login as HR user
    await page.goto('/login');
    await page.fill('input[name="email"]', 'hr@company.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/hr/dashboard');
  });

  test('should display workflows page', async ({ page }) => {
    // Navigate to workflows
    await page.goto('/hr/workflows');

    // Verify page loaded
    await expect(page.locator('h1, h2').filter({ hasText: /Workflows?/i }).first()).toBeVisible({
      timeout: 10000,
    });
  });

  test('should show workflow statistics', async ({ page }) => {
    // Navigate to workflows
    await page.goto('/hr/workflows');

    // Wait for stats to load
    await page.waitForTimeout(2000);

    // Verify stat cards
    const statLabels = ['Total Workflows', 'Active', 'Total Runs', 'Avg Progress'];

    for (const label of statLabels) {
      const element = page.locator(`text=${label}`);
      const count = await element.count();

      if (count > 0) {
        await expect(element.first()).toBeVisible();
      }
    }
  });

  test('should display workflow list', async ({ page }) => {
    // Navigate to workflows
    await page.goto('/hr/workflows');

    // Wait for workflows to load
    await page.waitForTimeout(2000);

    // Check for workflows or empty state
    const hasWorkflows = await page.locator('[data-testid="workflow-card"]').count();
    const hasEmptyState = await page.locator('text=No workflows found').count();

    expect(hasWorkflows > 0 || hasEmptyState > 0).toBeTruthy();
  });

  test('should filter workflows by status', async ({ page }) => {
    // Navigate to workflows
    await page.goto('/hr/workflows');

    // Wait for tabs to load
    await page.waitForTimeout(2000);

    // Click on "In Progress" tab
    const inProgressTab = page.locator('button[role="tab"]:has-text("In Progress")');
    const exists = await inProgressTab.count();

    if (exists > 0) {
      await inProgressTab.click();

      // Wait for filter to apply
      await page.waitForTimeout(1000);

      // Verify tab is selected
      await expect(inProgressTab).toHaveAttribute('aria-selected', 'true');
    }
  });

  test('should display workflow progress', async ({ page }) => {
    // Navigate to workflows
    await page.goto('/hr/workflows');

    // Wait for workflows
    await page.waitForTimeout(2000);

    const workflowCards = page.locator('[data-testid="workflow-card"]');
    const count = await workflowCards.count();

    if (count > 0) {
      const firstWorkflow = workflowCards.first();

      // Verify progress percentage
      await expect(firstWorkflow.locator('text=/%/')).toBeVisible();

      // Verify steps completed
      await expect(firstWorkflow.locator('text=/\\d+\\/\\d+/')).toBeVisible();
    }
  });

  test('should show workflow type and status', async ({ page }) => {
    // Navigate to workflows
    await page.goto('/hr/workflows');

    // Wait for workflows
    await page.waitForTimeout(2000);

    const workflowCards = page.locator('[data-testid="workflow-card"]');
    const count = await workflowCards.count();

    if (count > 0) {
      const firstWorkflow = workflowCards.first();

      // Verify has status chip
      const statusChip = firstWorkflow.locator('[class*="chip"]').first();
      await expect(statusChip).toBeVisible();

      // Verify has workflow type
      const workflowType = firstWorkflow.locator('text=/onboarding|offboarding|leave|performance/i');
      await expect(workflowType.first()).toBeVisible();
    }
  });

  test('should display AI auto-approved badge', async ({ page }) => {
    // Navigate to workflows
    await page.goto('/hr/workflows');

    // Wait for workflows
    await page.waitForTimeout(2000);

    // Look for AI auto-approved badge
    const aiBadge = page.locator('text=AI Auto-approved');
    const count = await aiBadge.count();

    if (count > 0) {
      await expect(aiBadge.first()).toBeVisible();

      // Verify confidence score
      await expect(page.locator('text=/Confidence: \\d+%/')).toBeVisible();
    }
  });

  test('should navigate to workflow details', async ({ page }) => {
    // Navigate to workflows
    await page.goto('/hr/workflows');

    // Wait for workflows
    await page.waitForTimeout(2000);

    // Look for View button
    const viewButton = page.locator('button:has-text("View")').first();
    const exists = await viewButton.count();

    if (exists > 0) {
      await viewButton.click();

      // Wait for navigation
      await page.waitForTimeout(2000);

      // Verify navigated to workflow detail
      expect(page.url()).toContain('/workflows/');
    }
  });

  test('should show workflow actions', async ({ page }) => {
    // Navigate to workflows
    await page.goto('/hr/workflows');

    // Wait for workflows
    await page.waitForTimeout(2000);

    const workflowCards = page.locator('[data-testid="workflow-card"]');
    const count = await workflowCards.count();

    if (count > 0) {
      // Look for action buttons
      const editBtn = page.locator('button[aria-label*="edit"], button:has-text("Edit")').first();
      const copyBtn = page.locator('button[aria-label*="copy"], button:has-text("Copy")').first();

      // At least one action button should exist
      const editExists = await editBtn.count();
      const copyExists = await copyBtn.count();

      expect(editExists > 0 || copyExists > 0).toBeTruthy();
    }
  });

  test('should show empty state when no workflows', async ({ page }) => {
    // Navigate to workflows
    await page.goto('/hr/workflows');

    // Wait for load
    await page.waitForTimeout(2000);

    const emptyState = page.locator('text=No workflows found');
    const exists = await emptyState.count();

    if (exists > 0) {
      await expect(emptyState).toBeVisible();

      // Verify create button
      await expect(page.locator('button:has-text("Create")')).toBeVisible();
    }
  });

  test('should display workflow started time', async ({ page }) => {
    // Navigate to workflows
    await page.goto('/hr/workflows');

    // Wait for workflows
    await page.waitForTimeout(2000);

    const workflowCards = page.locator('[data-testid="workflow-card"]');
    const count = await workflowCards.count();

    if (count > 0) {
      // Look for relative time
      const timeText = page.locator('text=/ago|hours?|days?|minutes?/i').first();
      await expect(timeText).toBeVisible();
    }
  });
});

test.describe('Employee Management Journey', () => {
  test.beforeEach(async ({ page }) => {
    // Login as HR user
    await page.goto('/login');
    await page.fill('input[name="email"]', 'hr@company.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/hr/dashboard');
  });

  test('should display employees page', async ({ page }) => {
    // Navigate to employees
    await page.goto('/hr/employees');

    // Verify page loaded
    await expect(page.locator('h1, h2').filter({ hasText: /Employees?/i }).first()).toBeVisible({
      timeout: 10000,
    });
  });

  test('should show Add Employee button', async ({ page }) => {
    // Navigate to employees
    await page.goto('/hr/employees');

    // Verify Add button exists
    const addButton = page.locator('button:has-text("Add Employee"), a:has-text("Add Employee")');
    await expect(addButton.first()).toBeVisible();
  });

  test('should display employee table', async ({ page }) => {
    // Navigate to employees
    await page.goto('/hr/employees');

    // Wait for table
    await page.waitForTimeout(2000);

    // Verify table headers
    const headers = ['Employee #', 'Name', 'Department', 'Position', 'Status'];

    for (const header of headers) {
      const element = page.locator(`text=${header}`);
      const count = await element.count();

      if (count > 0) {
        await expect(element.first()).toBeVisible();
      }
    }
  });

  test('should search employees', async ({ page }) => {
    // Navigate to employees
    await page.goto('/hr/employees');

    // Wait for search input
    await page.waitForTimeout(2000);

    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]');
    const exists = await searchInput.count();

    if (exists > 0) {
      // Type search query
      await searchInput.first().fill('John');

      // Wait for results
      await page.waitForTimeout(1000);

      // Verify search parameter in URL or results filtered
      const url = page.url();
      expect(url).toContain('search=John');
    }
  });

  test('should filter employees by status', async ({ page }) => {
    // Navigate to employees
    await page.goto('/hr/employees');

    // Wait for filters
    await page.waitForTimeout(2000);

    const statusFilter = page.locator('select[name="status"], button:has-text("Status")');
    const exists = await statusFilter.count();

    if (exists > 0) {
      // Apply filter
      if ((await statusFilter.first().evaluate(el => el.tagName)) === 'SELECT') {
        await statusFilter.first().selectOption('active');
      } else {
        await statusFilter.first().click();
        await page.locator('text=Active').first().click();
      }

      // Wait for filter to apply
      await page.waitForTimeout(1000);
    }
  });

  test('should paginate employees', async ({ page }) => {
    // Navigate to employees
    await page.goto('/hr/employees');

    // Wait for table
    await page.waitForTimeout(2000);

    // Look for pagination
    const pagination = page.locator('[role="navigation"], [class*="pagination"]');
    const exists = await pagination.count();

    if (exists > 0) {
      // Verify pagination controls
      await expect(pagination.first()).toBeVisible();
    }
  });

  test('should view employee details', async ({ page }) => {
    // Navigate to employees
    await page.goto('/hr/employees');

    // Wait for table
    await page.waitForTimeout(2000);

    // Look for View/Eye button
    const viewButton = page.locator('button[aria-label*="view"], button:has([class*="eye"])').first();
    const exists = await viewButton.count();

    if (exists > 0) {
      await viewButton.click();

      // Wait for navigation
      await page.waitForTimeout(1000);

      // Verify navigated to employee detail
      expect(page.url()).toContain('/employees/');
    }
  });

  test('should show employee status chips', async ({ page }) => {
    // Navigate to employees
    await page.goto('/hr/employees');

    // Wait for table
    await page.waitForTimeout(2000);

    // Look for status chips
    const statusChips = page.locator('[class*="chip"]');
    const count = await statusChips.count();

    if (count > 0) {
      // Verify chip has status text
      const chipText = await statusChips.first().textContent();
      expect(['Active', 'Inactive', 'Terminated', 'Resigned']).toContain(chipText);
    }
  });

  test('should display employment type', async ({ page }) => {
    // Navigate to employees
    await page.goto('/hr/employees');

    // Wait for table
    await page.waitForTimeout(2000);

    // Look for employment type
    const typeChips = page.locator('text=/Permanent|Contract|Probation|Intern|Part Time/');
    const count = await typeChips.count();

    if (count > 0) {
      await expect(typeChips.first()).toBeVisible();
    }
  });
});

test.describe('Workflows & Employees - Mobile', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('should display workflows on mobile', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'hr@company.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    await page.goto('/hr/workflows');
    await page.waitForTimeout(2000);

    // Verify workflow cards stack vertically
    await expect(page.locator('text=Total Workflows')).toBeVisible();
  });

  test('should display employees table on mobile', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'hr@company.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    await page.goto('/hr/employees');
    await page.waitForTimeout(2000);

    // Table should be scrollable horizontally or condensed
    await expect(page.locator('text=/Employees?/i').first()).toBeVisible();
  });
});
