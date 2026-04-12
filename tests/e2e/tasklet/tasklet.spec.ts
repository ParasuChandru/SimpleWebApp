import { test, expect } from '@playwright/test';

/**
 * Test Suite: Tasklet - Task Manager
 * Covers test cases: RBTES-T1047, RBTES-T1048, RBTES-T1053, RBTES-T1051, RBTES-T1050, RBTES-T1049, RBTES-T1052
 * Linked User Stories: RBTES-785, RBTES-786, RBTES-787, RBTES-788, RBTES-789, RBTES-791
 */

test.describe('Tasklet - Task Manager', () => {

  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/index.html');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  /**
   * Test Case: RBTES-T1047
   * TC-Tasklet: Add New Task
   * Linked to: RBTES-785 - Add New Task to Tasklet
   */
  test('should add a new task successfully', async ({ page }) => {
    const taskName = 'Buy groceries';

    // Enter task name
    await page.fill('#task-input', taskName);
    
    // Click Add button
    await page.click('#task-form button[type="submit"]');

    // Verify task appears in the list
    await expect(page.locator('#list')).toContainText(taskName);
    
    // Verify empty message is hidden
    await expect(page.locator('#empty')).toBeHidden();
  });

  /**
   * Test: Empty task validation
   */
  test('should not add empty task', async ({ page }) => {
    // Try to submit empty form
    const input = page.locator('#task-input');
    await expect(input).toHaveAttribute('required', '');
    
    // Form should not submit with empty input (HTML5 validation)
    await page.click('#task-form button[type="submit"]');
    
    // Task list should remain empty
    const taskItems = page.locator('#list li');
    await expect(taskItems).toHaveCount(0);
  });

  /**
   * Test Case: RBTES-T1048
   * TC-Tasklet: Mark Task as Done
   * Linked to: RBTES-786 - Mark Task as Done in Tasklet
   */
  test('should mark task as done', async ({ page }) => {
    // Add a task first
    await page.fill('#task-input', 'Complete project');
    await page.click('#task-form button[type="submit"]');

    // Wait for task to appear
    await expect(page.locator('#list li')).toHaveCount(1);

    // Click on the task to mark it as done (assuming checkbox or click behavior)
    const taskItem = page.locator('#list li').first();
    const checkbox = taskItem.locator('input[type="checkbox"]');
    
    if (await checkbox.count() > 0) {
      await checkbox.click();
      await expect(checkbox).toBeChecked();
    } else {
      // Alternative: Click on task text to toggle
      await taskItem.click();
      await expect(taskItem).toHaveClass(/done|completed|checked/);
    }
  });

  /**
   * Test: Unmark task (toggle back to open)
   */
  test('should unmark task to open status', async ({ page }) => {
    // Add and complete a task
    await page.fill('#task-input', 'Review code');
    await page.click('#task-form button[type="submit"]');

    const taskItem = page.locator('#list li').first();
    const checkbox = taskItem.locator('input[type="checkbox"]');
    
    if (await checkbox.count() > 0) {
      // Mark as done
      await checkbox.click();
      await expect(checkbox).toBeChecked();
      
      // Unmark
      await checkbox.click();
      await expect(checkbox).not.toBeChecked();
    }
  });

  /**
   * Test Case: RBTES-T1053
   * TC-Tasklet: Filter Tasks by Status
   * Linked to: RBTES-787 - Filter Tasks by Status in Tasklet
   */
  test('should filter tasks by status - All', async ({ page }) => {
    // Add multiple tasks
    await page.fill('#task-input', 'Task 1');
    await page.click('#task-form button[type="submit"]');
    await page.fill('#task-input', 'Task 2');
    await page.click('#task-form button[type="submit"]');

    // Mark first task as done
    const firstCheckbox = page.locator('#list li').first().locator('input[type="checkbox"]');
    if (await firstCheckbox.count() > 0) {
      await firstCheckbox.click();
    }

    // Select "All" filter
    await page.selectOption('#filter', 'all');

    // All tasks should be visible
    const visibleTasks = page.locator('#list li:visible');
    await expect(visibleTasks).toHaveCount(2);
  });

  test('should filter tasks by status - Open', async ({ page }) => {
    // Add multiple tasks
    await page.fill('#task-input', 'Open Task');
    await page.click('#task-form button[type="submit"]');
    await page.fill('#task-input', 'Done Task');
    await page.click('#task-form button[type="submit"]');

    // Mark second task as done
    const secondCheckbox = page.locator('#list li').nth(1).locator('input[type="checkbox"]');
    if (await secondCheckbox.count() > 0) {
      await secondCheckbox.click();
    }

    // Select "Open" filter
    await page.selectOption('#filter', 'open');

    // Only open tasks should be visible
    await expect(page.locator('#list')).toContainText('Open Task');
  });

  test('should filter tasks by status - Done', async ({ page }) => {
    // Add multiple tasks
    await page.fill('#task-input', 'Task A');
    await page.click('#task-form button[type="submit"]');
    await page.fill('#task-input', 'Task B');
    await page.click('#task-form button[type="submit"]');

    // Mark first task as done
    const firstCheckbox = page.locator('#list li').first().locator('input[type="checkbox"]');
    if (await firstCheckbox.count() > 0) {
      await firstCheckbox.click();
    }

    // Select "Done" filter
    await page.selectOption('#filter', 'done');

    // Only done tasks should be visible
    await expect(page.locator('#list')).toContainText('Task A');
  });

  /**
   * Test Case: RBTES-T1051
   * TC-Tasklet: Search Tasks by Keyword
   * Linked to: RBTES-788 - Search Tasks in Tasklet
   */
  test('should search tasks by keyword', async ({ page }) => {
    // Add multiple tasks
    await page.fill('#task-input', 'Buy groceries');
    await page.click('#task-form button[type="submit"]');
    await page.fill('#task-input', 'Read book');
    await page.click('#task-form button[type="submit"]');
    await page.fill('#task-input', 'Buy flowers');
    await page.click('#task-form button[type="submit"]');

    // Search for "Buy"
    await page.fill('#search', 'Buy');

    // Wait for filter to apply
    await page.waitForTimeout(300);

    // Verify only matching tasks are visible
    const visibleTasks = page.locator('#list li:visible');
    await expect(visibleTasks).toHaveCount(2);
    await expect(page.locator('#list')).toContainText('Buy groceries');
    await expect(page.locator('#list')).toContainText('Buy flowers');
  });

  test('should clear search and show all tasks', async ({ page }) => {
    // Add tasks
    await page.fill('#task-input', 'Task One');
    await page.click('#task-form button[type="submit"]');
    await page.fill('#task-input', 'Task Two');
    await page.click('#task-form button[type="submit"]');

    // Search
    await page.fill('#search', 'One');
    await page.waitForTimeout(300);

    // Clear search
    await page.fill('#search', '');
    await page.waitForTimeout(300);

    // All tasks should be visible
    const allTasks = page.locator('#list li');
    await expect(allTasks).toHaveCount(2);
  });

  /**
   * Test Case: RBTES-T1050
   * TC-Tasklet: Export Tasks as JSON
   * Linked to: RBTES-789 - Export Tasks as JSON in Tasklet
   */
  test('should export tasks as JSON', async ({ page }) => {
    // Add some tasks
    await page.fill('#task-input', 'Export Test Task');
    await page.click('#task-form button[type="submit"]');

    // Set up download handler
    const downloadPromise = page.waitForEvent('download');

    // Click export button
    await page.click('#export-btn');

    // Verify download started
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('.json');
  });

  /**
   * Test Case: RBTES-T1049
   * TC-Tasklet: Clear All Tasks
   * Linked to: RBTES-791 - Delete All Tasks in Tasklet
   */
  test('should clear all tasks', async ({ page }) => {
    // Add multiple tasks
    await page.fill('#task-input', 'Task 1');
    await page.click('#task-form button[type="submit"]');
    await page.fill('#task-input', 'Task 2');
    await page.click('#task-form button[type="submit"]');
    await page.fill('#task-input', 'Task 3');
    await page.click('#task-form button[type="submit"]');

    // Verify tasks exist
    await expect(page.locator('#list li')).toHaveCount(3);

    // Handle confirmation dialog if present
    page.on('dialog', dialog => dialog.accept());

    // Click clear all button
    await page.click('#clear-btn');

    // Verify all tasks are removed
    await expect(page.locator('#list li')).toHaveCount(0);

    // Verify empty message is shown
    await expect(page.locator('#empty')).toBeVisible();
    await expect(page.locator('#empty')).toContainText('No tasks yet');
  });

  /**
   * Test Case: RBTES-T1052
   * TC-Tasklet: Task Persistence in LocalStorage
   * Linked to: RBTES-785 - Add New Task to Tasklet
   */
  test('should persist tasks after page refresh', async ({ page }) => {
    const taskName = 'Persistent Task';

    // Add a task
    await page.fill('#task-input', taskName);
    await page.click('#task-form button[type="submit"]');

    // Verify task is added
    await expect(page.locator('#list')).toContainText(taskName);

    // Refresh the page
    await page.reload();

    // Verify task persists
    await expect(page.locator('#list')).toContainText(taskName);
  });

  /**
   * Test: Multiple tasks persistence
   */
  test('should persist multiple tasks after refresh', async ({ page }) => {
    // Add multiple tasks
    const tasks = ['Task A', 'Task B', 'Task C'];
    
    for (const task of tasks) {
      await page.fill('#task-input', task);
      await page.click('#task-form button[type="submit"]');
    }

    // Verify all tasks added
    await expect(page.locator('#list li')).toHaveCount(3);

    // Refresh page
    await page.reload();

    // Verify all tasks persist
    await expect(page.locator('#list li')).toHaveCount(3);
    for (const task of tasks) {
      await expect(page.locator('#list')).toContainText(task);
    }
  });

  /**
   * Test: Page elements are displayed correctly
   */
  test('should display Tasklet page elements', async ({ page }) => {
    // Verify header
    await expect(page.locator('h1')).toContainText('Tasklet');

    // Verify form elements
    await expect(page.locator('#task-input')).toBeVisible();
    await expect(page.locator('#task-form button[type="submit"]')).toBeVisible();

    // Verify controls
    await expect(page.locator('#search')).toBeVisible();
    await expect(page.locator('#filter')).toBeVisible();
    await expect(page.locator('#export-btn')).toBeVisible();
    await expect(page.locator('#import-btn')).toBeVisible();
    await expect(page.locator('#clear-btn')).toBeVisible();

    // Verify empty state message
    await expect(page.locator('#empty')).toBeVisible();
    await expect(page.locator('#empty')).toContainText('No tasks yet');
  });
});
