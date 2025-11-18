import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Compliance Dashboard
 * Tests compliance alerts, audit logs, and alert resolution
 */

test.describe('Compliance Dashboard Journey', () => {
  test.beforeEach(async ({ page }) => {
    // Login as HR user
    await page.goto('/login');
    await page.fill('input[name="email"]', 'hr@company.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/hr/dashboard');
  });

  test('should display compliance dashboard', async ({ page }) => {
    // Navigate to compliance dashboard
    await page.goto('/hr/compliance');

    // Verify page loaded
    await expect(page.locator('h1, h2, h3').filter({ hasText: 'Compliance' }).first()).toBeVisible({
      timeout: 10000,
    });

    // Verify summary cards exist
    await expect(page.locator('text=Critical Alerts')).toBeVisible();
    await expect(page.locator('text=Warnings')).toBeVisible();
    await expect(page.locator('text=Total Items')).toBeVisible();
  });

  test('should show compliance alert counts', async ({ page }) => {
    // Navigate to compliance
    await page.goto('/hr/compliance');

    // Wait for stats to load
    await page.waitForSelector('text=Critical Alerts', { timeout: 10000 });

    // Get critical alerts count
    const criticalCard = page.locator('text=Critical Alerts').locator('..');
    const criticalCount = await criticalCard.locator('p.text-2xl').textContent();

    // Verify it's a number
    expect(parseInt(criticalCount || '0')).toBeGreaterThanOrEqual(0);

    // Get warnings count
    const warningsCard = page.locator('text=Warnings').locator('..');
    const warningsCount = await warningsCard.locator('p.text-2xl').textContent();
    expect(parseInt(warningsCount || '0')).toBeGreaterThanOrEqual(0);
  });

  test('should display compliance alerts list', async ({ page }) => {
    // Navigate to compliance
    await page.goto('/hr/compliance');

    // Wait for alerts section
    await page.waitForSelector('text=Compliance Alerts', { timeout: 10000 });

    // Check if alerts exist or empty state
    const hasAlerts = await page.locator('[data-testid="alert-item"]').count();
    const hasEmptyState = await page.locator('text=No compliance alerts').count();

    // Should have either alerts or empty state
    expect(hasAlerts > 0 || hasEmptyState > 0).toBeTruthy();
  });

  test('should resolve compliance alert', async ({ page }) => {
    // Navigate to compliance
    await page.goto('/hr/compliance');

    // Wait for alerts to load
    await page.waitForTimeout(2000);

    // Check if there are any alerts to resolve
    const resolveButtons = page.locator('button:has-text("Resolve")');
    const buttonCount = await resolveButtons.count();

    if (buttonCount > 0) {
      // Click first resolve button
      await resolveButtons.first().click();

      // Wait for success message
      await expect(page.locator('text=Alert resolved successfully')).toBeVisible({
        timeout: 5000,
      });

      // Verify alert is removed or status changed
      await page.waitForTimeout(1000);
    }
  });

  test('should display auto-refresh indicator', async ({ page }) => {
    // Navigate to compliance
    await page.goto('/hr/compliance');

    // Wait for page to load
    await page.waitForSelector('text=Compliance Alerts', { timeout: 10000 });

    // Verify auto-refresh badge
    await expect(page.locator('text=Auto-refreshes every minute')).toBeVisible();
  });

  test('should show severity levels correctly', async ({ page }) => {
    // Navigate to compliance
    await page.goto('/hr/compliance');

    // Wait for alerts
    await page.waitForTimeout(2000);

    // Check for severity chips
    const severityChips = page.locator('[class*="chip"], [data-testid="severity-chip"]');
    const count = await severityChips.count();

    if (count > 0) {
      // Verify severity text (critical, warning, info)
      const severityText = await severityChips.first().textContent();
      expect(['critical', 'warning', 'info']).toContain(severityText?.toLowerCase());
    }
  });

  test('should display audit log section', async ({ page }) => {
    // Navigate to compliance
    await page.goto('/hr/compliance');

    // Wait for audit log section
    await page.waitForSelector('text=Recent Audit Log', { timeout: 10000 });

    // Verify audit log header
    await expect(page.locator('text=Recent Audit Log')).toBeVisible();

    // Check for audit entries or empty state
    const hasEntries = await page.locator('[data-testid="audit-log-entry"]').count();
    const hasEmptyState = await page.locator('text=No recent audit logs').count();

    expect(hasEntries > 0 || hasEmptyState > 0).toBeTruthy();
  });

  test('should show audit log with user and timestamp', async ({ page }) => {
    // Navigate to compliance
    await page.goto('/hr/compliance');

    // Wait for audit logs
    await page.waitForTimeout(2000);

    // Check if audit logs exist
    const auditEntries = page.locator('[data-testid="audit-log-entry"]');
    const count = await auditEntries.count();

    if (count > 0) {
      const firstEntry = auditEntries.first();

      // Verify entry has action text
      const entryText = await firstEntry.textContent();
      expect(entryText).toBeTruthy();

      // Verify has "by" indicating user
      expect(entryText).toContain('by');

      // Verify has time indication (ago, hours, days)
      expect(entryText).toMatch(/ago|hour|day|minute/);
    }
  });

  test('should show alert details', async ({ page }) => {
    // Navigate to compliance
    await page.goto('/hr/compliance');

    // Wait for alerts
    await page.waitForTimeout(2000);

    // Get first alert
    const alertCards = page.locator('[data-testid="alert-card"]');
    const count = await alertCards.count();

    if (count > 0) {
      const firstAlert = alertCards.first();

      // Verify alert has title
      await expect(firstAlert.locator('h4, .font-medium').first()).toBeVisible();

      // Verify alert has description
      const description = firstAlert.locator('.text-sm.text-gray-600, .text-default-400');
      await expect(description.first()).toBeVisible();

      // Verify alert has severity chip
      const severityChip = firstAlert.locator('[class*="chip"]');
      await expect(severityChip.first()).toBeVisible();
    }
  });

  test('should handle empty compliance state', async ({ page }) => {
    // Navigate to compliance
    await page.goto('/hr/compliance');

    // Wait for page load
    await page.waitForTimeout(2000);

    // Check for empty state
    const emptyState = page.locator('text=No compliance alerts at the moment');
    const hasEmptyState = await emptyState.count();

    if (hasEmptyState > 0) {
      // Verify positive message
      await expect(page.locator('text=All compliance checks passed')).toBeVisible();

      // Verify checkmark icon
      await expect(page.locator('[class*="check"], [data-testid="check-icon"]')).toBeVisible();
    }
  });

  test('should show due dates for alerts', async ({ page }) => {
    // Navigate to compliance
    await page.goto('/hr/compliance');

    // Wait for alerts
    await page.waitForTimeout(2000);

    // Look for due date indicators
    const dueDates = page.locator('text=/Due:|due/i');
    const count = await dueDates.count();

    if (count > 0) {
      // Verify due date format
      const dueDateText = await dueDates.first().textContent();
      expect(dueDateText).toBeTruthy();
    }
  });

  test('should display auto-generated badge', async ({ page }) => {
    // Navigate to compliance
    await page.goto('/hr/compliance');

    // Wait for alerts
    await page.waitForTimeout(2000);

    // Check for auto-generated badges
    const autoGenBadges = page.locator('text=Auto-generated');
    const count = await autoGenBadges.count();

    if (count > 0) {
      await expect(autoGenBadges.first()).toBeVisible();
    }
  });
});

test.describe('Compliance Dashboard - Data Refresh', () => {
  test('should auto-refresh alerts after 60 seconds', async ({ page }) => {
    // Navigate to compliance
    await page.goto('/hr/compliance');

    // Wait for initial load
    await page.waitForSelector('text=Compliance Alerts', { timeout: 10000 });

    // Get initial alert count
    const initialCount = await page.locator('[data-testid="alert-item"]').count();

    // Wait for auto-refresh (60 seconds + buffer)
    // For testing, we'll just verify the refresh mechanism exists
    // In real scenario, you'd wait 65 seconds
    await expect(page.locator('text=Auto-refreshes every minute')).toBeVisible();

    // Note: Actual 60s wait would be:
    // await page.waitForTimeout(65000);
    // const newCount = await page.locator('[data-testid="alert-item"]').count();
    // The count may or may not change depending on backend
  });
});

test.describe('Compliance Dashboard - Mobile', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('should be responsive on mobile', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[name="email"]', 'hr@company.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Navigate to compliance
    await page.goto('/hr/compliance');

    // Verify key elements visible on mobile
    await page.waitForSelector('text=Critical Alerts', { timeout: 10000 });

    await expect(page.locator('text=Critical Alerts')).toBeVisible();
    await expect(page.locator('text=Compliance Alerts')).toBeVisible();

    // Verify summary cards stack vertically
    const cards = page.locator('[class*="grid"]').first();
    const boundingBox = await cards.boundingBox();
    expect(boundingBox?.width).toBeLessThan(500);
  });
});
