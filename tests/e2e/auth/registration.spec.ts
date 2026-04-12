import { test, expect } from '@playwright/test';

/**
 * Test Suite: User Registration
 * Covers test cases: RBTES-T1038, RBTES-T1041, RBTES-T1043, RBTES-T1037, RBTES-T1042
 * Linked User Story: RBTES-781 - User Registration with Email Validation
 */

test.describe('User Registration', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/register');
  });

  /**
   * Test Case: RBTES-T1038
   * TC-Registration: Successful User Registration
   */
  test('should successfully register with valid credentials', async ({ page }) => {
    // Generate unique user data to avoid duplicate conflicts
    const timestamp = Date.now();
    const username = `testuser_${timestamp}`;
    const email = `testuser_${timestamp}@example.com`;
    const password = 'SecurePass123';

    // Fill registration form
    await page.fill('input[name="username"]', username);
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.fill('input[name="confirm_password"]', password);

    // Submit form
    await page.click('button[type="submit"], input[type="submit"]');

    // Verify success message
    await expect(page.locator('.alert-success')).toContainText(
      'Registration successful! Please confirm your email before logging in.'
    );

    // Verify redirect to login page
    await expect(page).toHaveURL(/.*login/);
  });

  /**
   * Test Case: RBTES-T1041
   * TC-Registration: Duplicate Email Validation
   */
  test('should show error for duplicate email', async ({ page }) => {
    // First, register a user
    const timestamp = Date.now();
    const email = `duplicate_${timestamp}@example.com`;

    await page.fill('input[name="username"]', `user1_${timestamp}`);
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', 'SecurePass123');
    await page.fill('input[name="confirm_password"]', 'SecurePass123');
    await page.click('button[type="submit"], input[type="submit"]');

    // Wait for redirect
    await page.waitForURL(/.*login/);

    // Try to register again with same email
    await page.goto('/register');
    await page.fill('input[name="username"]', `user2_${timestamp}`);
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', 'SecurePass123');
    await page.fill('input[name="confirm_password"]', 'SecurePass123');
    await page.click('button[type="submit"], input[type="submit"]');

    // Verify error message
    await expect(page.locator('.text-danger')).toContainText('Email is already registered');
  });

  /**
   * Test Case: RBTES-T1043
   * TC-Registration: Duplicate Username Validation
   */
  test('should show error for duplicate username', async ({ page }) => {
    // First, register a user
    const timestamp = Date.now();
    const username = `duplicateuser_${timestamp}`;

    await page.fill('input[name="username"]', username);
    await page.fill('input[name="email"]', `email1_${timestamp}@example.com`);
    await page.fill('input[name="password"]', 'SecurePass123');
    await page.fill('input[name="confirm_password"]', 'SecurePass123');
    await page.click('button[type="submit"], input[type="submit"]');

    // Wait for redirect
    await page.waitForURL(/.*login/);

    // Try to register again with same username
    await page.goto('/register');
    await page.fill('input[name="username"]', username);
    await page.fill('input[name="email"]', `email2_${timestamp}@example.com`);
    await page.fill('input[name="password"]', 'SecurePass123');
    await page.fill('input[name="confirm_password"]', 'SecurePass123');
    await page.click('button[type="submit"], input[type="submit"]');

    // Verify error message
    await expect(page.locator('.text-danger')).toContainText('Username is already taken');
  });

  /**
   * Test Case: RBTES-T1037
   * TC-Registration: Password Length Validation
   */
  test('should show error for password less than 8 characters', async ({ page }) => {
    const timestamp = Date.now();

    await page.fill('input[name="username"]', `user_${timestamp}`);
    await page.fill('input[name="email"]', `user_${timestamp}@example.com`);
    await page.fill('input[name="password"]', 'short'); // Less than 8 chars
    await page.fill('input[name="confirm_password"]', 'short');
    await page.click('button[type="submit"], input[type="submit"]');

    // Verify error message about password length
    await expect(page.locator('.text-danger')).toBeVisible();
    // The actual message may vary, but it should indicate minimum length requirement
  });

  /**
   * Test Case: RBTES-T1042
   * TC-Registration: Password Confirmation Mismatch
   */
  test('should show error for password mismatch', async ({ page }) => {
    const timestamp = Date.now();

    await page.fill('input[name="username"]', `user_${timestamp}`);
    await page.fill('input[name="email"]', `user_${timestamp}@example.com`);
    await page.fill('input[name="password"]', 'SecurePass123');
    await page.fill('input[name="confirm_password"]', 'DifferentPass456');
    await page.click('button[type="submit"], input[type="submit"]');

    // Verify error message about password mismatch
    await expect(page.locator('.text-danger')).toBeVisible();
  });

  /**
   * Test: Email format validation
   */
  test('should validate email format', async ({ page }) => {
    const timestamp = Date.now();

    await page.fill('input[name="username"]', `user_${timestamp}`);
    await page.fill('input[name="email"]', 'invalid-email');
    await page.fill('input[name="password"]', 'SecurePass123');
    await page.fill('input[name="confirm_password"]', 'SecurePass123');
    await page.click('button[type="submit"], input[type="submit"]');

    // Verify error message about invalid email
    await expect(page.locator('.text-danger')).toBeVisible();
  });
});
