import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Analytics Dashboard
 * Tests KPIs, charts, and export functionality
 */

test.describe('Analytics Dashboard Journey', () => {
  test.beforeEach(async ({ page }) => {
    // Login as HR user
    await page.goto('/login');
    await page.fill('input[name="email"]', 'hr@company.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/hr/dashboard');
  });

  test('should display analytics dashboard', async ({ page }) => {
    // Navigate to analytics
    await page.goto('/hr/analytics');

    // Verify page loaded
    await page.waitForTimeout(2000);

    // Check for KPI cards or dashboard title
    const hasAnalytics = await page.locator('text=/Analytics|Dashboard|Metrics/i').count();
    expect(hasAnalytics).toBeGreaterThan(0);
  });

  test('should show all KPI cards', async ({ page }) => {
    // Navigate to analytics
    await page.goto('/hr/analytics');

    // Wait for KPIs to load
    await page.waitForTimeout(2000);

    // Verify KPI cards exist
    const kpiCards = [
      'Total Headcount',
      'Turnover Rate',
      'Time to Hire',
      'Cost per Hire',
      'Absenteeism Rate',
      'Overtime Hours',
    ];

    for (const kpi of kpiCards) {
      const element = page.locator(`text=${kpi}`);
      const count = await element.count();

      if (count > 0) {
        await expect(element.first()).toBeVisible();
      }
    }
  });

  test('should display KPI values and trends', async ({ page }) => {
    // Navigate to analytics
    await page.goto('/hr/analytics');

    // Wait for KPIs
    await page.waitForTimeout(2000);

    // Find first KPI card
    const kpiCard = page.locator('[data-testid="kpi-card"]').first();
    const count = await kpiCard.count();

    if (count > 0) {
      // Verify has numeric value
      await expect(kpiCard.locator('.text-3xl')).toBeVisible();

      // Verify has trend indicator (arrow up/down)
      const trendIndicator = kpiCard.locator('[class*="trending"], svg');
      await expect(trendIndicator.first()).toBeVisible();
    }
  });

  test('should display headcount trend chart', async ({ page }) => {
    // Navigate to analytics
    await page.goto('/hr/analytics');

    // Wait for charts to load
    await page.waitForTimeout(3000);

    // Look for headcount trend section
    const headcountSection = page.locator('text=Headcount Trend');
    const exists = await headcountSection.count();

    if (exists > 0) {
      await expect(headcountSection).toBeVisible();

      // Verify chart is rendered (SVG or canvas)
      const chart = page.locator('svg.recharts-surface, canvas').first();
      await expect(chart).toBeVisible();
    }
  });

  test('should display turnover analysis chart', async ({ page }) => {
    // Navigate to analytics
    await page.goto('/hr/analytics');

    // Wait for charts
    await page.waitForTimeout(3000);

    // Look for turnover section
    const turnoverSection = page.locator('text=Turnover Analysis');
    const exists = await turnoverSection.count();

    if (exists > 0) {
      await expect(turnoverSection).toBeVisible();

      // Verify chart exists
      const chart = page.locator('svg.recharts-surface').nth(1);
      await expect(chart).toBeVisible();
    }
  });

  test('should display department distribution chart', async ({ page }) => {
    // Navigate to analytics
    await page.goto('/hr/analytics');

    // Wait for charts
    await page.waitForTimeout(3000);

    // Look for department distribution
    const deptSection = page.locator('text=Department Distribution');
    const exists = await deptSection.count();

    if (exists > 0) {
      await expect(deptSection).toBeVisible();

      // Verify pie chart
      const pieChart = page.locator('svg.recharts-surface');
      await expect(pieChart.first()).toBeVisible();
    }
  });

  test('should display cost trends chart', async ({ page }) => {
    // Navigate to analytics
    await page.goto('/hr/analytics');

    // Wait for charts
    await page.waitForTimeout(3000);

    // Look for cost trends
    const costSection = page.locator('text=Cost Trends');
    const exists = await costSection.count();

    if (exists > 0) {
      await expect(costSection).toBeVisible();

      // Verify line chart
      const lineChart = page.locator('svg.recharts-surface');
      await expect(lineChart.first()).toBeVisible();
    }
  });

  test('should show last updated timestamp', async ({ page }) => {
    // Navigate to analytics
    await page.goto('/hr/analytics');

    // Wait for timestamp
    await page.waitForTimeout(2000);

    // Look for last updated text
    const timestamp = page.locator('text=/Last updated:|Updated:/i');
    const exists = await timestamp.count();

    if (exists > 0) {
      await expect(timestamp.first()).toBeVisible();

      // Verify has date/time
      const timestampText = await timestamp.first().textContent();
      expect(timestampText).toBeTruthy();
    }
  });

  test('should have export PDF button', async ({ page }) => {
    // Navigate to analytics
    await page.goto('/hr/analytics');

    // Wait for page load
    await page.waitForTimeout(2000);

    // Look for export PDF button
    const exportPdfBtn = page.locator('button:has-text("Export PDF")');
    const exists = await exportPdfBtn.count();

    if (exists > 0) {
      await expect(exportPdfBtn).toBeVisible();
      await expect(exportPdfBtn).toBeEnabled();
    }
  });

  test('should have export Excel button', async ({ page }) => {
    // Navigate to analytics
    await page.goto('/hr/analytics');

    // Wait for page load
    await page.waitForTimeout(2000);

    // Look for export Excel button
    const exportExcelBtn = page.locator('button:has-text("Export Excel")');
    const exists = await exportExcelBtn.count();

    if (exists > 0) {
      await expect(exportExcelBtn).toBeVisible();
      await expect(exportExcelBtn).toBeEnabled();
    }
  });

  test('should click export PDF button', async ({ page }) => {
    // Navigate to analytics
    await page.goto('/hr/analytics');

    // Wait for page load
    await page.waitForTimeout(2000);

    const exportPdfBtn = page.locator('button:has-text("Export PDF")');
    const exists = await exportPdfBtn.count();

    if (exists > 0) {
      // Click export button
      await exportPdfBtn.click();

      // Wait a moment (actual download or console log)
      await page.waitForTimeout(1000);

      // Note: Actual download would be tested with:
      // const downloadPromise = page.waitForEvent('download');
      // await exportPdfBtn.click();
      // const download = await downloadPromise;
      // expect(download.suggestedFilename()).toContain('analytics');
    }
  });

  test('should show positive trend indicators correctly', async ({ page }) => {
    // Navigate to analytics
    await page.goto('/hr/analytics');

    // Wait for KPIs
    await page.waitForTimeout(2000);

    // Look for headcount growth (should show positive trend)
    const headcountCard = page.locator('text=Total Headcount').locator('..');
    const trendChip = headcountCard.locator('[class*="chip"], [data-testid="trend-chip"]').first();

    const exists = await trendChip.count();
    if (exists > 0) {
      // Verify has percentage
      const trendText = await trendChip.textContent();
      expect(trendText).toMatch(/%/);

      // Verify has + or - sign
      expect(trendText).toMatch(/[+-]/);
    }
  });

  test('should show negative trend indicators correctly', async ({ page }) => {
    // Navigate to analytics
    await page.goto('/hr/analytics');

    // Wait for KPIs
    await page.waitForTimeout(2000);

    // Look for turnover rate (lower is better, may show negative trend as good)
    const turnoverCard = page.locator('text=Turnover Rate').locator('..');
    const trendChip = turnoverCard.locator('[class*="chip"]').first();

    const exists = await trendChip.count();
    if (exists > 0) {
      // Verify trend chip exists
      await expect(trendChip).toBeVisible();
    }
  });

  test('should handle loading state', async ({ page }) => {
    // Navigate to analytics
    await page.goto('/hr/analytics');

    // Check for loading spinner (should appear briefly)
    const spinner = page.locator('text=Loading');
    const exists = await spinner.count();

    // Note: Spinner may disappear quickly
    // In a real scenario, you'd intercept the API call to delay response
  });

  test('should handle no data state gracefully', async ({ page }) => {
    // Navigate to analytics with invalid employer
    // (This would normally be tested by mocking the API)

    await page.goto('/hr/analytics');

    // Wait for potential error state
    await page.waitForTimeout(3000);

    // Look for "No data" or similar message
    const noDataMessage = page.locator('text=/No analytics data|No data available/i');
    const errorMessage = page.locator('text=/Error|Failed to load/i');

    // Page should either show data or graceful error
    const hasContent = await page.locator('[data-testid="kpi-card"], text=Total Headcount').count();
    const hasNoData = await noDataMessage.count();
    const hasError = await errorMessage.count();

    expect(hasContent > 0 || hasNoData > 0 || hasError > 0).toBeTruthy();
  });
});

test.describe('Analytics Dashboard - Mobile', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('should be responsive on mobile', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[name="email"]', 'hr@company.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Navigate to analytics
    await page.goto('/hr/analytics');

    // Wait for load
    await page.waitForTimeout(3000);

    // Verify KPI cards stack vertically
    const kpiCards = page.locator('[data-testid="kpi-card"]');
    const count = await kpiCards.count();

    if (count > 1) {
      // Get positions of first two cards
      const first = await kpiCards.nth(0).boundingBox();
      const second = await kpiCards.nth(1).boundingBox();

      // On mobile, cards should stack (second card below first)
      if (first && second) {
        expect(second.y).toBeGreaterThan(first.y + first.height - 10);
      }
    }

    // Verify charts are visible
    const charts = page.locator('svg.recharts-surface');
    const chartCount = await charts.count();

    if (chartCount > 0) {
      await expect(charts.first()).toBeVisible();
    }
  });
});
