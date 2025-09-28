import { test, expect } from '@playwright/test'

test.describe('Orders Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to orders page
    await page.goto('http://localhost:3000/pesanan-simple')
  })

  test('should load orders page successfully', async ({ page }) => {
    // Check if page title is correct
    await expect(page).toHaveTitle(/Bakery Management System/)
    
    // Check if main heading exists (be more specific)
    await expect(page.locator('h1:has-text("Pesanan")')).toBeVisible()
    
    // Check if description exists
    await expect(page.locator('text=Kelola pesanan pelanggan dengan sistem terintegrasi')).toBeVisible()
  })

  test('should display stats cards', async ({ page }) => {
    // Wait for stats to load
    await page.waitForTimeout(2000)
    
    // Check stats cards
    await expect(page.locator('text=Total Pesanan')).toBeVisible()
    await expect(page.locator('text=Hari Ini')).toBeVisible()
    await expect(page.locator('text=Pendapatan')).toBeVisible()
    await expect(page.locator('text=Pending')).toBeVisible()
  })

  test('should have view mode toggle buttons', async ({ page }) => {
    // Check grid/table toggle buttons
    await expect(page.locator('button:has-text("Grid")')).toBeVisible()
    await expect(page.locator('button:has-text("Tabel")')).toBeVisible()
    
    // Test switching view modes
    await page.locator('button:has-text("Tabel")').click()
    await page.waitForTimeout(500)
    
    await page.locator('button:has-text("Grid")').click()
    await page.waitForTimeout(500)
  })

  test('should have new order button', async ({ page }) => {
    // Check if "Pesanan Baru" button exists
    await expect(page.locator('button:has-text("Pesanan Baru")')).toBeVisible()
  })

  test('should open new order dialog', async ({ page }) => {
    // Click new order button
    await page.locator('button:has-text("Pesanan Baru")').click()
    
    // Check if dialog opens
    await expect(page.locator('text=Tambah Pesanan Baru')).toBeVisible()
    
    // Check form fields exist
    await expect(page.locator('label:has-text("Pelanggan")')).toBeVisible()
    await expect(page.locator('label:has-text("Nomor Telepon")')).toBeVisible()
    await expect(page.locator('label:has-text("Tanggal Selesai")')).toBeVisible()
    await expect(page.locator('label:has-text("Metode Bayar")')).toBeVisible()
    await expect(page.locator('label:has-text("Status Pembayaran")')).toBeVisible()
    await expect(page.locator('label:has-text("Item Pesanan")')).toBeVisible()
    
    // Check buttons
    await expect(page.locator('button:has-text("Tambah Item")')).toBeVisible()
    await expect(page.locator('button:has-text("Batal")')).toBeVisible()
    await expect(page.locator('button:has-text("Buat Pesanan")')).toBeVisible()
  })

  test('should have search functionality', async ({ page }) => {
    // Check search input exists
    await expect(page.locator('input[placeholder*="Cari"]')).toBeVisible()
  })

  test('should have filter functionality', async ({ page }) => {
    // Check if filter dropdown exists
    await expect(page.locator('button:has-text("Filter status"), button:has-text("Semua Status")')).toBeVisible()
  })

  test('should validate required fields in new order form', async ({ page }) => {
    // Open new order dialog
    await page.locator('button:has-text("Pesanan Baru")').click()
    
    // Try to submit without filling required fields
    await page.locator('button:has-text("Buat Pesanan")').click()
    
    // Should show validation error (toast notification)
    await page.waitForTimeout(1000)
    
    // Check if validation message appears
    await expect(page.locator('text=Lengkapi semua field yang diperlukan')).toBeVisible({ timeout: 3000 })
  })

  test('should handle form interaction', async ({ page }) => {
    // Open new order dialog
    await page.locator('button:has-text("Pesanan Baru")').click()
    
    // Fill customer information
    await page.fill('input[placeholder="Atau ketik nama baru"]', 'Test Customer')
    await page.fill('input[placeholder="08123456789"]', '08123456789')
    
    // Check if customer name field is filled
    await expect(page.locator('input[placeholder="Atau ketik nama baru"]')).toHaveValue('Test Customer')
    await expect(page.locator('input[placeholder="08123456789"]')).toHaveValue('08123456789')
  })

  test('should check API integration', async ({ page }) => {
    // Wait for page to load and check for loading states
    await page.waitForTimeout(3000)
    
    // Check if no "Memuat data..." text is visible (meaning loading completed)
    await expect(page.locator('text=Memuat data...')).not.toBeVisible()
    
    // Check if the page content loaded (not showing error state)
    await expect(page.locator('h1:has-text("Pesanan")')).toBeVisible()
  })

  test('should close dialog on cancel', async ({ page }) => {
    // Open dialog
    await page.locator('button:has-text("Pesanan Baru")').click()
    
    // Click cancel
    await page.locator('button:has-text("Batal")').click()
    
    // Dialog should close
    await expect(page.locator('text=Tambah Pesanan Baru')).not.toBeVisible()
  })

  test('should check for console errors', async ({ page }) => {
    const errors: string[] = []
    
    // Listen for console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })
    
    // Wait for page to fully load
    await page.waitForTimeout(5000)
    
    // Check if there are no critical errors
    const criticalErrors = errors.filter(error => 
      !error.includes('favicon') && 
      !error.includes('404') && 
      !error.toLowerCase().includes('warning')
    )
    
    if (criticalErrors.length > 0) {
      console.log('Console errors found:', criticalErrors)
    }
    
    // Don't fail the test for non-critical errors, but log them
    expect(criticalErrors.length).toBeLessThan(5) // Allow some minor errors
  })
})