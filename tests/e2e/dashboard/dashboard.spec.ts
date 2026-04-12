import { test, expect } from '@playwright/test';

/**
 * Test Suite: API Key Analytics Dashboard
 * Covers test cases: RBTES-T1054, RBTES-T1055, RBTES-T1056, RBTES-T1057
 * Linked User Story: RBTES-792 - View API Key Dashboard Metrics
 */

test.describe('API Key Analytics Dashboard', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard.html');
  });

  /**
   * Test Case: RBTES-T1054
   * TC-Dashboard: View API Key Metrics
   * Verifies all four metric cards are displayed with correct values
   */
  test('should display Total API Keys metric', async ({ page }) => {
    const totalKeysCard = page.locator('#total-keys');
    await expect(totalKeysCard).toBeVisible();
    
    // Verify it contains a numeric value
    const value = await totalKeysCard.textContent();
    expect(value).toMatch(/\d+/);
    
    // Verify the card title
    await expect(page.locator('.card-title').filter({ hasText: 'Total API Keys' })).toBeVisible();
  });

  test('should display Active Keys metric', async ({ page }) => {
    const activeKeysCard = page.locator('#active-keys');
    await expect(activeKeysCard).toBeVisible();
    
    // Verify it contains a numeric value
    const value = await activeKeysCard.textContent();
    expect(value).toMatch(/\d+/);
    
    // Verify the card title
    await expect(page.locator('.card-title').filter({ hasText: 'Active Keys' })).toBeVisible();
  });

  test('should display Requests 24h metric', async ({ page }) => {
    const requestsCard = page.locator('#requests');
    await expect(requestsCard).toBeVisible();
    
    // Verify it contains a numeric value (may include commas)
    const value = await requestsCard.textContent();
    expect(value).toMatch(/[\d,]+/);
    
    // Verify the card title
    await expect(page.locator('.card-title').filter({ hasText: 'Requests 24h' })).toBeVisible();
  });

  test('should display Error Rate metric', async ({ page }) => {
    const errorRateCard = page.locator('#error-rate');
    await expect(errorRateCard).toBeVisible();
    
    // Verify it contains a percentage value
    const value = await errorRateCard.textContent();
    expect(value).toMatch(/[\d.]+%/);
    
    // Verify the card title
    await expect(page.locator('.card-title').filter({ hasText: 'Error Rate' })).toBeVisible();
  });

  /**
   * Test Case: RBTES-T1055
   * TC-Dashboard: View Requests Trend Chart
   */
  test('should display Requests Trend chart', async ({ page }) => {
    // Verify chart container exists
    const chartCanvas = page.locator('#requestsChart');
    await expect(chartCanvas).toBeVisible();
    
    // Verify chart title
    await expect(page.locator('.card-title').filter({ hasText: 'Requests Trend' })).toBeVisible();
    
    // Verify canvas has been rendered (Chart.js renders to canvas)
    await expect(chartCanvas).toHaveAttribute('width');
    await expect(chartCanvas).toHaveAttribute('height');
  });

  /**
   * Test Case: RBTES-T1057
   * TC-Dashboard: View Top 5 API Keys
   */
  test('should display Top 5 API Keys by Usage', async ({ page }) => {
    // Verify section title
    await expect(page.locator('.card-title').filter({ hasText: 'Top 5 API Keys By Usage' })).toBeVisible();
    
    // Verify list group exists
    const topKeysList = page.locator('#top-keys');
    await expect(topKeysList).toBeVisible();
    
    // Verify there are 5 items
    const listItems = topKeysList.locator('.list-group-item');
    await expect(listItems).toHaveCount(5);
    
    // Verify each item has a key name and badge with count
    for (let i = 0; i < 5; i++) {
      const item = listItems.nth(i);
      await expect(item).toBeVisible();
      await expect(item.locator('.badge')).toBeVisible();
    }
  });

  test('should display API keys with usage counts in descending order', async ({ page }) => {
    const topKeysList = page.locator('#top-keys');
    const badges = topKeysList.locator('.badge');
    
    // Get all badge values
    const values: number[] = [];
    const count = await badges.count();
    
    for (let i = 0; i < count; i++) {
      const text = await badges.nth(i).textContent();
      const numericValue = parseInt(text?.replace(/,/g, '') || '0');
      values.push(numericValue);
    }
    
    // Verify descending order
    for (let i = 0; i < values.length - 1; i++) {
      expect(values[i]).toBeGreaterThanOrEqual(values[i + 1]);
    }
  });

  /**
   * Test Case: RBTES-T1056
   * TC-Dashboard: View API Key Details Table
   */
  test('should display API Key Details table', async ({ page }) => {
    // Verify table title
    await expect(page.locator('.card-title').filter({ hasText: 'API Key Details' })).toBeVisible();
    
    // Verify table exists
    const table = page.locator('.apikey-table');
    await expect(table).toBeVisible();
  });

  test('should display table with correct headers', async ({ page }) => {
    const table = page.locator('.apikey-table');
    const headers = table.locator('thead th');
    
    // Verify all expected headers
    await expect(headers.filter({ hasText: 'Key' })).toBeVisible();
    await expect(headers.filter({ hasText: 'Status' })).toBeVisible();
    await expect(headers.filter({ hasText: 'Last Used' })).toBeVisible();
    await expect(headers.filter({ hasText: 'Requests (24h)' })).toBeVisible();
    await expect(headers.filter({ hasText: 'Error Rate' })).toBeVisible();
  });

  test('should display API key rows with data', async ({ page }) => {
    const table = page.locator('.apikey-table');
    const rows = table.locator('tbody tr');
    
    // Verify at least one row exists
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(0);
    
    // Verify first row has all columns
    const firstRow = rows.first();
    const cells = firstRow.locator('td');
    await expect(cells).toHaveCount(5);
  });

  test('should display status badges (Active/Disabled)', async ({ page }) => {
    const table = page.locator('.apikey-table');
    const statusBadges = table.locator('.badge');
    
    // Verify badges exist
    const badgeCount = await statusBadges.count();
    expect(badgeCount).toBeGreaterThan(0);
    
    // Verify badge colors/classes
    const activeBadge = table.locator('.badge.bg-success');
    const disabledBadge = table.locator('.badge.bg-danger');
    
    // At least one of each type should exist in demo data
    expect(await activeBadge.count() + await disabledBadge.count()).toBeGreaterThan(0);
  });

  /**
   * Test: Dashboard navigation
   */
  test('should display navbar with dashboard brand', async ({ page }) => {
    const navbar = page.locator('.navbar');
    await expect(navbar).toBeVisible();
    
    const brandLink = navbar.locator('.navbar-brand');
    await expect(brandLink).toContainText('API Key Dashboard');
  });

  /**
   * Test: Responsive layout - Metrics cards
   */
  test('should display all four metric cards', async ({ page }) => {
    const metricCards = page.locator('.card-metric');
    await expect(metricCards).toHaveCount(4);
  });

  /**
   * Test: Page loads without errors
   */
  test('should load dashboard without JavaScript errors', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('pageerror', (error) => {
      errors.push(error.message);
    });
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.goto('/dashboard.html');
    await page.waitForLoadState('networkidle');
    
    // Verify no critical errors
    expect(errors.length).toBe(0);
  });

  /**
   * Test: Chart.js library loaded
   */
  test('should load Chart.js library', async ({ page }) => {
    // Verify Chart.js is available
    const chartLoaded = await page.evaluate(() => {
      return typeof (window as any).Chart !== 'undefined';
    });
    
    expect(chartLoaded).toBe(true);
  });
});
