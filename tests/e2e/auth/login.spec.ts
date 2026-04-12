import { test, expect } from '@playwright/test';

/**
 * Test Suite: User Login
 * Covers test cases: RBTES-T1044, RBTES-T1045, RBTES-T1046
 * Linked User Story: RBTES-782 - User Login with Email Confirmation Check
 */

test.describe('User Login', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  /**
   * Test Case: RBTES-T1044
   * TC-Login: Successful Login with Confirmed Account
   * Note: This test requires a pre-confirmed user in the database
   */
  test('should successfully login with confirmed account', async ({ page }) => {
    // Use pre-existing confirmed user credentials
    // In a real scenario, this would be seeded test data
    const email = 'confirmed@example.com';
    const password = 'SecurePass123';

    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"], input[type="submit"]');

    // Verify success message
    await expect(page.locator('.alert-success')).toContainText('Login successful');
  });

  /**
   * Test Case: RBTES-T1045
   * TC-Login: Block Unconfirmed User
   */
  test('should block login for unconfirmed user', async ({ page }) => {
    // First, register a new user (who won't be confirmed)
    const timestamp = Date.now();
    const email = `unconfirmed_${timestamp}@example.com`;
    const password = 'SecurePass123';

    // Register the user
    await page.goto('/register');
    await page.fill('input[name="username"]', `unconfirmed_${timestamp}`);
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.fill('input[name="confirm_password"]', password);
    await page.click('button[type="submit"], input[type="submit"]');

    // Wait for redirect to login
    await page.waitForURL(/.*login/);

    // Try to login without confirming email
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"], input[type="submit"]');

    // Verify warning message about unconfirmed email
    await expect(page.locator('.alert-warning')).toContainText('Email address not confirmed');
  });

  /**
   * Test Case: RBTES-T1046
   * TC-Login: Invalid Credentials Error
   */
  test('should show error for invalid credentials', async ({ page }) => {
    await page.fill('input[name="email"]', 'nonexistent@example.com');
    await page.fill('input[name="password"]', 'WrongPassword123');
    await page.click('button[type="submit"], input[type="submit"]');

    // Verify error message
    await expect(page.locator('.alert-danger')).toContainText('Invalid credentials');
  });

  /**
   * Test: Invalid password for existing user
   */
  test('should show error for wrong password', async ({ page }) => {
    // Register a user first
    const timestamp = Date.now();
    const email = `testlogin_${timestamp}@example.com`;

    await page.goto('/register');
    await page.fill('input[name="username"]', `testlogin_${timestamp}`);
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', 'CorrectPass123');
    await page.fill('input[name="confirm_password"]', 'CorrectPass123');
    await page.click('button[type="submit"], input[type="submit"]');

    // Wait for redirect to login
    await page.waitForURL(/.*login/);

    // Try to login with wrong password
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', 'WrongPassword123');
    await page.click('button[type="submit"], input[type="submit"]');

    // Verify error message
    await expect(page.locator('.alert-danger')).toContainText('Invalid credentials');
  });

  /**
   * Test: Login page elements are present
   */
  test('should display login form with required fields', async ({ page }) => {
    // Verify form elements are present
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"], input[type="submit"]')).toBeVisible();
  });
});
