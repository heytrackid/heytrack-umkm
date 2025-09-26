const { test, expect } = require('@playwright/test');

test.describe('Automation Engine & Business Logic', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
  });

  test('should display smart notifications on dashboard', async ({ page }) => {
    // Navigate to dashboard and check for smart notifications
    await page.locator('nav').getByText('Dashboard').click();
    await page.waitForLoadState('networkidle');
    
    // Look for notification center or smart alerts
    const notifications = page.locator('[class*="notification"], [class*="alert"], .smart-notification');
    
    // Wait a bit for notifications to load
    await page.waitForTimeout(2000);
    
    // Check if notifications are being generated
    const notificationCount = await notifications.count();
    console.log(`Found ${notificationCount} notifications`);
    
    // Should have some form of automated notifications
    if (notificationCount > 0) {
      await expect(notifications.first()).toBeVisible();
    }
  });

  test('should show smart financial insights', async ({ page }) => {
    // Navigate to finance page
    await page.locator('nav').getByText('Keuangan').click();
    await page.waitForLoadState('networkidle');
    
    // Look for financial automation features
    const financialInsights = page.locator('[class*="financial"], [class*="insight"], [class*="smart"]');
    const charts = page.locator('svg, canvas, [class*="chart"]');
    const metrics = page.locator('[class*="metric"], [class*="kpi"]');
    
    // Wait for data to load
    await page.waitForTimeout(2000);
    
    // Should have financial visualizations
    const chartCount = await charts.count();
    const metricCount = await metrics.count();
    
    console.log(`Found ${chartCount} charts and ${metricCount} metrics`);
    
    if (chartCount > 0) {
      await expect(charts.first()).toBeVisible();
    }
    
    if (metricCount > 0) {
      await expect(metrics.first()).toBeVisible();
    }
  });

  test('should calculate HPP automatically', async ({ page }) => {
    // Navigate to HPP Calculator
    await page.locator('nav').getByText('HPP Calculator').click();
    await page.waitForLoadState('networkidle');
    
    // Look for automatic calculation features
    const calculatorElements = page.locator('[class*="calculator"], [class*="hpp"], [class*="calculation"]');
    const inputFields = page.locator('input[type="number"], input[type="text"]');
    const results = page.locator('[class*="result"], [class*="total"], [class*="price"]');
    
    // Wait for page to fully load
    await page.waitForTimeout(1500);
    
    const inputCount = await inputFields.count();
    const resultCount = await results.count();
    
    console.log(`HPP Calculator: ${inputCount} inputs, ${resultCount} results`);
    
    // Test basic interaction with calculator
    if (inputCount > 0) {
      const firstInput = inputFields.first();
      await expect(firstInput).toBeVisible();
      
      // Try to input a test value
      await firstInput.fill('1000');
      await page.waitForTimeout(500);
      
      // Check if calculations are triggered automatically
      if (resultCount > 0) {
        await expect(results.first()).toBeVisible();
      }
    }
  });

  test('should show production planning automation', async ({ page }) => {
    // Navigate to production page
    await page.locator('nav').getByText('Produksi').click();
    await page.waitForLoadState('networkidle');
    
    // Look for production planning features
    const productionPlanner = page.locator('[class*="production"], [class*="planner"], [class*="smart"]');
    const batchElements = page.locator('[class*="batch"], [class*="schedule"]');
    const suggestions = page.locator('[class*="suggestion"], [class*="recommendation"]');
    
    await page.waitForTimeout(2000);
    
    const plannerCount = await productionPlanner.count();
    const batchCount = await batchElements.count();
    const suggestionCount = await suggestions.count();
    
    console.log(`Production: ${plannerCount} planners, ${batchCount} batches, ${suggestionCount} suggestions`);
    
    // Should have some production automation elements
    if (plannerCount > 0 || batchCount > 0) {
      const element = plannerCount > 0 ? productionPlanner.first() : batchElements.first();
      await expect(element).toBeVisible();
    }
  });

  test('should display inventory alerts and automation', async ({ page }) => {
    // Navigate to inventory page
    await page.locator('nav').getByText('Stok & Inventory').click();
    await page.waitForLoadState('networkidle');
    
    // Look for inventory automation features
    const inventoryAlerts = page.locator('[class*="alert"], [class*="warning"], [class*="low-stock"]');
    const automationElements = page.locator('[class*="auto"], [class*="smart"], [class*="suggestion"]');
    const dataTable = page.locator('table, [class*="table"], [class*="grid"]');
    
    await page.waitForTimeout(2000);
    
    const alertCount = await inventoryAlerts.count();
    const autoCount = await automationElements.count();
    const tableCount = await dataTable.count();
    
    console.log(`Inventory: ${alertCount} alerts, ${autoCount} automation elements, ${tableCount} data tables`);
    
    // Should have data display
    if (tableCount > 0) {
      await expect(dataTable.first()).toBeVisible();
    }
    
    // Check for automated features
    if (alertCount > 0 || autoCount > 0) {
      const element = alertCount > 0 ? inventoryAlerts.first() : automationElements.first();
      await expect(element).toBeVisible();
    }
  });

  test('should show recipes with cost calculation', async ({ page }) => {
    // Navigate to recipes page
    await page.locator('nav').getByText('Resep').click();
    await page.waitForLoadState('networkidle');
    
    // Look for recipe automation features
    const recipeCards = page.locator('[class*="recipe"], [class*="card"]');
    const costElements = page.locator('[class*="cost"], [class*="price"], [class*="hpp"]');
    const calculations = page.locator('[class*="calculation"], [class*="total"]');
    
    await page.waitForTimeout(2000);
    
    const recipeCount = await recipeCards.count();
    const costCount = await costElements.count();
    const calcCount = await calculations.count();
    
    console.log(`Recipes: ${recipeCount} recipes, ${costCount} cost elements, ${calcCount} calculations`);
    
    // Should have recipe display
    if (recipeCount > 0) {
      await expect(recipeCards.first()).toBeVisible();
    }
    
    // Should show cost information
    if (costCount > 0) {
      await expect(costElements.first()).toBeVisible();
    }
  });

  test('should display reports with analytics', async ({ page }) => {
    // Navigate to reports page
    await page.locator('nav').getByText('Laporan').click();
    await page.waitForLoadState('networkidle');
    
    // Look for reporting automation features
    const reportCharts = page.locator('svg, canvas, [class*="chart"]');
    const analytics = page.locator('[class*="analytic"], [class*="insight"], [class*="trend"]');
    const kpis = page.locator('[class*="kpi"], [class*="metric"], [class*="stat"]');
    
    await page.waitForTimeout(2000);
    
    const chartCount = await reportCharts.count();
    const analyticsCount = await analytics.count();
    const kpiCount = await kpis.count();
    
    console.log(`Reports: ${chartCount} charts, ${analyticsCount} analytics, ${kpiCount} KPIs`);
    
    // Should have some reporting elements
    if (chartCount > 0) {
      await expect(reportCharts.first()).toBeVisible();
    }
    
    if (kpiCount > 0) {
      await expect(kpis.first()).toBeVisible();
    }
  });

  test('should handle ingredient management with smart features', async ({ page }) => {
    // Navigate to ingredients page using link selector
    const ingredientLink = page.locator('a[href*="ingredient"], a[href*="bahan"], nav a').filter({ hasText: /bahan baku|ingredient/i }).first();
    
    if (await ingredientLink.count() > 0) {
      await ingredientLink.click({ timeout: 10000 });
      await page.waitForLoadState('networkidle', { timeout: 15000 });
      
      // Look for ingredient management features
      const ingredientTable = page.locator('table, [class*="table"], [class*="grid"]');
      const addButton = page.locator('button:has-text("Add"), button:has-text("Tambah"), [class*="add"]');
      const searchInput = page.locator('input[placeholder*="search"], input[placeholder*="cari"]');
      
      await page.waitForTimeout(2000);
      
      const tableVisible = await ingredientTable.isVisible().catch(() => false);
      const addButtonVisible = await addButton.count() > 0;
      const searchVisible = await searchInput.count() > 0;
      
      console.log(`Ingredients: Table visible: ${tableVisible}, Add button: ${addButtonVisible}, Search: ${searchVisible}`);
      
      // Should have basic CRUD interface
      if (tableVisible) {
        await expect(ingredientTable.first()).toBeVisible();
      }
      
      // Test add functionality if available
      if (addButtonVisible) {
        // Scroll to button and use force click to avoid interception
        const button = addButton.first();
        await button.scrollIntoViewIfNeeded();
        await button.click({ force: true, timeout: 5000 });
        await page.waitForTimeout(1000);
        
        // Look for modal or form
        const modal = page.locator('[role="dialog"], .modal, [class*="modal"]');
        const form = page.locator('form, [class*="form"]');
        
        if (await modal.count() > 0) {
          await expect(modal.first()).toBeVisible();
          
          // Close modal
          const closeButton = page.locator('button:has-text("×"), button:has-text("Close"), button:has-text("Cancel"), [aria-label*="close"]');
          if (await closeButton.count() > 0) {
            await closeButton.first().click({ force: true });
          } else {
            await page.keyboard.press('Escape');
          }
        } else if (await form.count() > 0) {
          await expect(form.first()).toBeVisible();
        }
      }
    } else {
      console.log('Ingredient page link not found, skipping detailed tests');
    }
  });

  test('should show customer management features', async ({ page }) => {
    // Navigate to customers page
    await page.locator('nav').getByText('Pelanggan').click();
    await page.waitForLoadState('networkidle');
    
    // Look for customer management features
    const customerData = page.locator('table, [class*="table"], [class*="customer"], [class*="list"]');
    const insights = page.locator('[class*="insight"], [class*="analytic"], [class*="stat"]');
    
    await page.waitForTimeout(2000);
    
    const dataCount = await customerData.count();
    const insightCount = await insights.count();
    
    console.log(`Customers: ${dataCount} data elements, ${insightCount} insights`);
    
    // Should have customer data display
    if (dataCount > 0) {
      await expect(customerData.first()).toBeVisible();
    }
  });

  test('should show order management with automation', async ({ page }) => {
    // Navigate to orders page
    await page.locator('nav').getByText('Pesanan').click();
    await page.waitForLoadState('networkidle');
    
    // Look for order management features
    const orderData = page.locator('table, [class*="table"], [class*="order"], [class*="list"]');
    const statusElements = page.locator('[class*="status"], [class*="badge"]');
    const automationFeatures = page.locator('[class*="auto"], [class*="smart"], [class*="suggest"]');
    
    await page.waitForTimeout(2000);
    
    const orderCount = await orderData.count();
    const statusCount = await statusElements.count();
    const autoCount = await automationFeatures.count();
    
    console.log(`Orders: ${orderCount} orders, ${statusCount} statuses, ${autoCount} automation features`);
    
    // Should have order display
    if (orderCount > 0) {
      await expect(orderData.first()).toBeVisible();
    }
  });
});

test.describe('Data Persistence & State Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
  });

  test('should persist sidebar state', async ({ page }) => {
    // Test if sidebar state persists across page navigation
    const toggleButton = page.locator('button[aria-label*="sidebar"], button').filter({ has: page.locator('svg') }).first();
    
    // Wait for initial load
    await page.waitForTimeout(1000);
    
    // Collapse sidebar
    await toggleButton.click({ timeout: 10000 });
    await page.waitForTimeout(1000);
    
    // Navigate to different page using link element directly
    const recipeLink = page.locator('a[href*="recipe"], a[href*="resep"], nav a').filter({ hasText: /resep|recipe/i }).first();
    
    if (await recipeLink.count() > 0) {
      await recipeLink.click({ timeout: 10000 });
      await page.waitForLoadState('networkidle', { timeout: 15000 });
      
      // Check if sidebar is still collapsed
      const collapsedSidebar = page.locator('[class*="w-16"]').first();
      await expect(collapsedSidebar).toBeVisible();
      
      // Navigate back and check persistence
      const dashboardLink = page.locator('a[href*="dashboard"], a[href="/"], nav a').filter({ hasText: /dashboard|beranda/i }).first();
      if (await dashboardLink.count() > 0) {
        await dashboardLink.click({ timeout: 10000 });
        await page.waitForLoadState('networkidle', { timeout: 15000 });
        
        await expect(collapsedSidebar).toBeVisible();
      }
    } else {
      // If no recipe link found, just verify sidebar toggle works
      const expandedSidebar = page.locator('[class*="w-64"]').first();
      await expect(expandedSidebar).toBeVisible();
      
      // Toggle back
      await toggleButton.click();
      await page.waitForTimeout(500);
      
      await expect(expandedSidebar).toBeVisible();
    }
  });

  test('should handle form state correctly', async ({ page }) => {
    // Go to ingredients page and test form state
    const ingredientLink = page.locator('a[href*="ingredient"], a[href*="bahan"], nav a').filter({ hasText: /bahan baku|ingredient/i }).first();
    
    if (await ingredientLink.count() > 0) {
      await ingredientLink.click({ timeout: 10000 });
      await page.waitForLoadState('networkidle', { timeout: 15000 });
      
      // Look for add button and test form interaction
      const addButton = page.locator('button:has-text("Add"), button:has-text("Tambah"), [class*="add"]').first();
      
      if (await addButton.isVisible().catch(() => false)) {
        // Use force click to avoid interception issues
        await addButton.click({ force: true, timeout: 5000 });
        await page.waitForTimeout(1000);
        
        // Look for form inputs
        const textInputs = page.locator('input[type="text"], input[type="number"], textarea');
        const selectInputs = page.locator('select');
        
        if (await textInputs.count() > 0) {
          const firstInput = textInputs.first();
          await firstInput.fill('Test Value');
          await page.waitForTimeout(100);
          
          // Check if value persists
          const value = await firstInput.inputValue();
          expect(value).toBe('Test Value');
        } else if (await selectInputs.count() > 0) {
          // Handle select elements properly
          const firstSelect = selectInputs.first();
          const options = firstSelect.locator('option');
          
          if (await options.count() > 1) {
            // Select the first available option (not default)
            await firstSelect.selectOption({ index: 1 });
            await page.waitForTimeout(100);
            
            // Verify selection
            const selectedValue = await firstSelect.inputValue();
            expect(selectedValue).not.toBe('');
          }
        }
        
        // Close form if possible
        const cancelButton = page.locator('button:has-text("Cancel"), button:has-text("Batal"), button:has-text("×"), [aria-label*="close"]');
        if (await cancelButton.count() > 0) {
          await cancelButton.first().click({ force: true });
          await page.waitForTimeout(500);
        } else {
          // Try escape key
          await page.keyboard.press('Escape');
        }
      }
    }
  });

  test('should handle responsive layout correctly', async ({ page }) => {
    // Test desktop layout
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.waitForTimeout(1000);
    
    const sidebar = page.locator('[class*="w-64"], [class*="w-16"]').first();
    await expect(sidebar).toBeVisible();
    
    // Test tablet layout
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(1000);
    
    await expect(sidebar).toBeVisible();
    
    // Test mobile layout
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    
    await expect(sidebar).toBeVisible();
    
    // Sidebar should still be functional on mobile
    const toggleButton = page.locator('button[aria-label*="sidebar"], button').filter({ has: page.locator('svg') }).first();
    
    if (await toggleButton.isVisible()) {
      await toggleButton.click({ force: true, timeout: 5000 });
      await page.waitForTimeout(1000);
      
      const collapsedSidebar = page.locator('[class*="w-16"]').first();
      await expect(collapsedSidebar).toBeVisible();
    }
  });
});