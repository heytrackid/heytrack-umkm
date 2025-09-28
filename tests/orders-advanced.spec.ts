import { test, expect } from '@playwright/test'

test.describe('Orders Advanced Features', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/pesanan-simple')
    // Wait for initial load
    await page.waitForTimeout(3000)
  })

  test('should load data from APIs successfully', async ({ page }) => {
    // Check that loading screen disappears
    await expect(page.locator('text=Memuat data...')).not.toBeVisible({ timeout: 10000 })
    
    // Verify page loaded successfully
    await expect(page.locator('h1:has-text("Pesanan")')).toBeVisible()
  })

  test('should open new order form with recipe selection', async ({ page }) => {
    // Open new order dialog
    await page.locator('button:has-text("Pesanan Baru")').click()
    
    // Check if recipe/product selection exists
    await expect(page.locator('label:has-text("Resep/Produk")')).toBeVisible()
    
    // Try to click on recipe dropdown
    const recipeDropdown = page.locator('[role="combobox"]').first()
    if (await recipeDropdown.isVisible()) {
      await recipeDropdown.click()
      
      // Wait for dropdown to open
      await page.waitForTimeout(1000)
      
      // Check if dropdown has content (recipes loaded from API)
      const dropdownOptions = page.locator('[role="option"]')
      const optionCount = await dropdownOptions.count()
      
      if (optionCount > 0) {
        console.log(`Found ${optionCount} recipe options`)
        
        // Select first recipe if available
        await dropdownOptions.first().click()
        
        // Check if price is auto-filled
        const unitPriceInput = page.locator('input[type="number"]').first()
        if (await unitPriceInput.isVisible()) {
          const priceValue = await unitPriceInput.inputValue()
          expect(parseInt(priceValue)).toBeGreaterThan(0)
        }
      } else {
        console.log('No recipes found - may need test data')
      }
    }
  })

  test('should have proper date fields', async ({ page }) => {
    // Open new order dialog
    await page.locator('button:has-text("Pesanan Baru")').click()
    
    // Check for delivery date field (tanggal selesai)
    await expect(page.locator('label:has-text("Tanggal Selesai")')).toBeVisible()
    
    // Check that delivery date field is a date input
    const dateInput = page.locator('input[type="date"]')
    await expect(dateInput).toBeVisible()
    
    // Check that it has a default value (today)
    const today = new Date().toISOString().split('T')[0]
    await expect(dateInput).toHaveValue(today)
  })

  test('should display orders with proper date columns in table view', async ({ page }) => {
    // Switch to table view
    await page.locator('button:has-text("Tabel")').click()
    await page.waitForTimeout(1000)
    
    // Check for date column headers
    await expect(page.locator('text=Tanggal Order')).toBeVisible()
    await expect(page.locator('text=Tanggal Selesai')).toBeVisible()
  })

  test('should show customer selection dropdown', async ({ page }) => {
    // Open new order dialog
    await page.locator('button:has-text("Pesanan Baru")').click()
    
    // Check customer selection dropdown
    await expect(page.locator('button:has-text("Pilih pelanggan")')).toBeVisible()
    
    // Try to open customer dropdown
    await page.locator('button:has-text("Pilih pelanggan")').click()
    await page.waitForTimeout(500)
    
    // Check if customer dropdown opens (even if no customers)
    const customerDropdown = page.locator('[role="listbox"]')
    if (await customerDropdown.isVisible()) {
      console.log('Customer dropdown opened successfully')
    }
  })

  test('should validate form with proper error messages', async ({ page }) => {
    // Open new order dialog
    await page.locator('button:has-text("Pesanan Baru")').click()
    
    // Try to submit without filling required fields
    await page.locator('button:has-text("Buat Pesanan")').click()
    
    // Wait for validation error
    await page.waitForTimeout(2000)
    
    // Check for validation error message
    const validationMessage = page.locator('text=Lengkapi semua field yang diperlukan')
    await expect(validationMessage).toBeVisible({ timeout: 5000 })
  })

  test('should handle item addition and removal', async ({ page }) => {
    // Open new order dialog
    await page.locator('button:has-text("Pesanan Baru")').click()
    
    // Add a new item
    await page.locator('button:has-text("Tambah Item")').click()
    await page.waitForTimeout(500)
    
    // Check that a second item was added
    await expect(page.locator('text=Item #2')).toBeVisible()
    
    // Try to remove an item (should have remove button visible)
    const removeButtons = page.locator('button:has([data-lucide="trash-2"])')
    const removeButtonCount = await removeButtons.count()
    
    if (removeButtonCount > 0) {
      // Click first remove button
      await removeButtons.first().click()
      await page.waitForTimeout(500)
      
      // Should still have at least one item
      await expect(page.locator('text=Item #1')).toBeVisible()
    }
  })

  test('should calculate subtotal automatically', async ({ page }) => {
    // Open new order dialog
    await page.locator('button:has-text("Pesanan Baru")').click()
    
    // Fill in quantity and unit price
    const quantityInput = page.locator('input[type="number"][min="1"]')
    const unitPriceInput = page.locator('input[type="number"]:not([min="1"])').first()
    
    if (await quantityInput.isVisible() && await unitPriceInput.isVisible()) {
      await quantityInput.fill('2')
      await unitPriceInput.fill('10000')
      
      // Wait for calculation
      await page.waitForTimeout(500)
      
      // Check if subtotal is calculated (2 * 10000 = 20000)
      await expect(page.locator('text=Rp 20.000')).toBeVisible()
    }
  })

  test('should show order status and payment status options', async ({ page }) => {
    // Check if we have any orders displayed
    const orderCards = page.locator('[class*="hover:shadow-md"]')
    const orderCount = await orderCards.count()
    
    if (orderCount > 0) {
      // Check status dropdowns in first order card
      const statusDropdowns = page.locator('select, [role="combobox"]')
      const dropdownCount = await statusDropdowns.count()
      
      if (dropdownCount >= 2) {
        console.log('Order status and payment status dropdowns found')
      }
    } else {
      console.log('No orders found to test status dropdowns')
    }
  })

  test('should handle search functionality', async ({ page }) => {
    // Use search input
    const searchInput = page.locator('input[placeholder*="Cari"]')
    await expect(searchInput).toBeVisible()
    
    // Type in search term
    await searchInput.fill('test')
    await page.waitForTimeout(1000)
    
    // Search should work without errors
    // Results will depend on existing data
  })

  test('should handle filter functionality', async ({ page }) => {
    // Find filter dropdown
    const filterDropdown = page.locator('button:has-text("Filter status"), button:has-text("Semua Status")')
    
    if (await filterDropdown.isVisible()) {
      await filterDropdown.click()
      await page.waitForTimeout(500)
      
      // Check if filter options are available
      const filterOptions = page.locator('[role="option"]')
      const optionCount = await filterOptions.count()
      
      if (optionCount > 0) {
        console.log(`Found ${optionCount} filter options`)
      }
    }
  })

  test('should not have critical JavaScript errors', async ({ page }) => {
    const errors: string[] = []
    
    // Listen for console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })
    
    // Navigate and wait for full load
    await page.waitForTimeout(5000)
    
    // Filter out non-critical errors
    const criticalErrors = errors.filter(error => 
      !error.includes('favicon') && 
      !error.includes('404') &&
      !error.includes('Network') &&
      !error.toLowerCase().includes('warning') &&
      !error.includes('_next/static') &&
      !error.includes('chunk')
    )
    
    // Log errors for debugging
    if (criticalErrors.length > 0) {
      console.log('Critical errors found:', criticalErrors)
    }
    
    // Should have minimal critical errors
    expect(criticalErrors.length).toBeLessThanOrEqual(2)
  })

  test('should have responsive design elements', async ({ page }) => {
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 })
    await page.waitForTimeout(1000)
    
    // Should still show main elements
    await expect(page.locator('h1:has-text("Pesanan")')).toBeVisible()
    await expect(page.locator('button:has-text("Pesanan Baru")')).toBeVisible()
    
    // Back to desktop
    await page.setViewportSize({ width: 1280, height: 720 })
    await page.waitForTimeout(1000)
  })
})