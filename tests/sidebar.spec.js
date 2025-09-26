const { test, expect } = require('@playwright/test');

test.describe('Collapsible Sidebar', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:3000');
    
    // Wait for the page to load completely
    await page.waitForLoadState('networkidle');
  });

  test('should render sidebar in expanded state by default', async ({ page }) => {
    // Check if sidebar is expanded (width should be w-64 = 256px)
    const sidebar = page.locator('[class*="w-64"]').first();
    await expect(sidebar).toBeVisible();
    
    // Check if the logo text is visible
    await expect(page.locator('text=Bakery MS')).toBeVisible();
    
    // Check if menu items with text are visible in sidebar specifically
    await expect(page.locator('nav').getByText('Dashboard')).toBeVisible();
    await expect(page.locator('nav').getByText('Resep')).toBeVisible();
    await expect(page.locator('nav').getByText('Bahan Baku')).toBeVisible();
  });

  test('should collapse sidebar when toggle button is clicked', async ({ page }) => {
    // Find and click the collapse toggle button (X icon)
    const toggleButton = page.locator('button').filter({ has: page.locator('svg') }).first();
    await toggleButton.click();
    
    // Wait for animation to complete
    await page.waitForTimeout(500);
    
    // Check if sidebar is collapsed (width should be w-16 = 64px)
    const collapsedSidebar = page.locator('[class*="w-16"]').first();
    await expect(collapsedSidebar).toBeVisible();
    
    // Check if the logo text is hidden
    await expect(page.locator('text=Bakery MS')).not.toBeVisible();
    
    // Check if menu text is hidden but icons are still visible (specifically in navigation)
    await expect(page.locator('nav').getByText('Dashboard')).not.toBeVisible();
    
    // Check if the toggle button now shows Menu icon
    const menuIcon = page.locator('button svg').first();
    await expect(menuIcon).toBeVisible();
  });

  test('should expand sidebar when toggle button is clicked again', async ({ page }) => {
    // First collapse the sidebar
    const toggleButton = page.locator('button').filter({ has: page.locator('svg') }).first();
    await toggleButton.click();
    await page.waitForTimeout(500);
    
    // Then expand it again
    await toggleButton.click();
    await page.waitForTimeout(500);
    
    // Check if sidebar is expanded again
    const expandedSidebar = page.locator('[class*="w-64"]').first();
    await expect(expandedSidebar).toBeVisible();
    
    // Check if the logo text is visible again
    await expect(page.locator('text=Bakery MS')).toBeVisible();
    
    // Check if menu items with text are visible again
    await expect(page.locator('nav').getByText('Dashboard')).toBeVisible();
    await expect(page.locator('nav').getByText('Resep')).toBeVisible();
  });

  test('should show tooltips for collapsed menu items', async ({ page }) => {
    // Collapse the sidebar first
    const toggleButton = page.locator('button').filter({ has: page.locator('svg') }).first();
    await toggleButton.click();
    await page.waitForTimeout(500);
    
    // Find a menu item button in collapsed state
    const menuItems = page.locator('nav button').filter({ hasText: '' });
    const firstMenuItem = menuItems.first();
    
    // Hover over the menu item to see tooltip
    await firstMenuItem.hover();
    
    // Check if tooltip appears (title attribute should be set)
    const titleAttribute = await firstMenuItem.getAttribute('title');
    expect(titleAttribute).toBeTruthy();
    expect(titleAttribute).toContain('Dashboard');
  });

  test('should maintain active state when collapsed', async ({ page }) => {
    // Navigate to a specific page
    await page.click('text=Resep');
    await page.waitForLoadState('networkidle');
    
    // Collapse the sidebar
    const toggleButton = page.locator('button').filter({ has: page.locator('svg') }).first();
    await toggleButton.click();
    await page.waitForTimeout(500);
    
    // Check if the active menu item still has the active styling
    const activeItem = page.locator('nav button[class*="bg-orange-600"]');
    await expect(activeItem).toBeVisible();
  });

  test('should have smooth animation transitions', async ({ page }) => {
    const sidebar = page.locator('div[class*="transition-all"]').first();
    await expect(sidebar).toHaveCSS('transition-duration', '0.3s');
    
    // Test the animation by measuring width before and after
    const initialWidth = await sidebar.evaluate(el => el.offsetWidth);
    
    const toggleButton = page.locator('button').filter({ has: page.locator('svg') }).first();
    await toggleButton.click();
    
    // Wait a bit for animation to start but not complete
    await page.waitForTimeout(150);
    
    const midWidth = await sidebar.evaluate(el => el.offsetWidth);
    expect(midWidth).not.toBe(initialWidth); // Width should be changing
    
    // Wait for animation to complete
    await page.waitForTimeout(200);
    
    const finalWidth = await sidebar.evaluate(el => el.offsetWidth);
    expect(finalWidth).toBeLessThan(initialWidth); // Should be collapsed (smaller)
  });

  test('should show collapse indicator when collapsed', async ({ page }) => {
    // Collapse the sidebar
    const toggleButton = page.locator('button').filter({ has: page.locator('svg') }).first();
    await toggleButton.click();
    await page.waitForTimeout(500);
    
    // Check if the animated indicator dot is visible
    const indicator = page.locator('div[class*="animate-pulse"]');
    await expect(indicator).toBeVisible();
    // Color might be in different formats (rgb, lab, etc) across browsers, so just check visibility
  });

  test('should be responsive on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Sidebar should still be functional
    const sidebar = page.locator('div[class*="flex h-full"]').first();
    await expect(sidebar).toBeVisible();
    
    // Toggle should still work
    const toggleButton = page.locator('button').filter({ has: page.locator('svg') }).first();
    await toggleButton.click();
    await page.waitForTimeout(500);
    
    const collapsedSidebar = page.locator('[class*="w-16"]').first();
    await expect(collapsedSidebar).toBeVisible();
  });
});

test.describe('Sidebar Basic Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
  });

  test('should have clickable menu items', async ({ page }) => {
    // Test that navigation links are present and clickable
    const dashboardLink = page.locator('nav').getByRole('button', { name: /dashboard/i });
    const recipesLink = page.locator('nav').getByRole('button', { name: /resep/i });
    
    await expect(dashboardLink).toBeVisible();
    await expect(recipesLink).toBeVisible();
    
    // Test clicking doesn't throw errors
    await dashboardLink.click();
    await page.waitForTimeout(100);
    
    await recipesLink.click();
    await page.waitForTimeout(100);
  });

  test('should have working toggle button interaction', async ({ page }) => {
    // Test that toggle button responds to clicks
    const toggleButton = page.locator('button').filter({ has: page.locator('svg') }).first();
    
    // Initial state - should be expanded
    await expect(page.locator('text=Bakery MS')).toBeVisible();
    
    // Click to collapse
    await toggleButton.click();
    await page.waitForTimeout(500);
    
    // Should be collapsed
    await expect(page.locator('text=Bakery MS')).not.toBeVisible();
    
    // Click to expand again
    await toggleButton.click();
    await page.waitForTimeout(500);
    
    // Should be expanded again
    await expect(page.locator('text=Bakery MS')).toBeVisible();
  });
});
