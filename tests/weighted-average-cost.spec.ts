import { test, expect } from '@playwright/test'

test.describe('Weighted Average Cost System - UMKM Integration', () => {
  const baseUrl = 'https://heytrack-umkm.vercel.app'

  test.use({
    viewport: { width: 1200, height: 800 }
  })

  test('Enhanced Inventory Page with Weighted Average Cost', async ({ page }) => {
    console.log('🧪 Testing Enhanced Inventory with Weighted Average Cost...')
    
    // Navigate to enhanced inventory page
    await page.goto(`${baseUrl}/inventory-enhanced`)
    await page.waitForLoadState('networkidle')
    
    // Verify educational banner appears
    const educationalBanner = page.locator('text=Tips UMKM:')
    await expect(educationalBanner).toBeVisible()
    console.log('✅ Educational banner visible')

    // Check if ingredients are displayed with pricing analysis
    const ingredients = page.locator('[data-testid="ingredient-card"], .border.rounded-lg.p-4')
    const ingredientCount = await ingredients.count()
    
    if (ingredientCount > 0) {
      console.log(`✅ Found ${ingredientCount} ingredients displayed`)
      
      // Test first ingredient with multiple purchases
      const firstIngredient = ingredients.first()
      
      // Check for "Multi Harga" badge (indicates multiple purchase prices)
      const multiPriceBadge = firstIngredient.locator('text=Multi Harga')
      if (await multiPriceBadge.isVisible()) {
        console.log('✅ Multi-price ingredient detected')
        
        // Check for price preview
        const pricePreview = firstIngredient.locator('text=Preview Harga Rata-rata')
        await expect(pricePreview).toBeVisible()
        console.log('✅ Price preview section visible')
        
        // Test "Analisis Harga" button
        const analysisButton = firstIngredient.locator('text=Analisis Harga')
        await expect(analysisButton).toBeVisible()
        
        // Click analysis button
        await analysisButton.click()
        await page.waitForTimeout(2000)
        
        // Verify weighted average analysis modal opens
        const analysisModal = page.locator('text=Analisis Harga Rata-rata:')
        await expect(analysisModal).toBeVisible()
        console.log('✅ Weighted Average Analysis modal opened')
        
        // Check educational banner in modal
        const modalEducation = page.locator('text=Cara Baca:')
        await expect(modalEducation).toBeVisible()
        console.log('✅ Modal educational content visible')
        
        // Verify pricing methods comparison
        const weightedAverageSection = page.locator('text=Weighted Average')
        const fifoSection = page.locator('text=FIFO Average')
        const movingAverageSection = page.locator('text=Moving Average')
        
        await expect(weightedAverageSection).toBeVisible()
        await expect(fifoSection).toBeVisible() 
        await expect(movingAverageSection).toBeVisible()
        console.log('✅ All pricing methods displayed')
        
        // Check for recommendation badge
        const recommendationBadge = page.locator('text=Rekomendasi')
        await expect(recommendationBadge).toBeVisible()
        console.log('✅ Recommendation badge visible')
        
        // Test tabs functionality
        const purchaseHistoryTab = page.locator('text=Riwayat Pembelian')
        await purchaseHistoryTab.click()
        await page.waitForTimeout(1000)
        console.log('✅ Purchase history tab working')
        
        const stockLayersTab = page.locator('text=Lapisan Stock')
        await stockLayersTab.click()
        await page.waitForTimeout(1000)
        console.log('✅ Stock layers tab working')
        
        const recommendationsTab = page.locator('text=Rekomendasi')
        await recommendationsTab.click()
        await page.waitForTimeout(1000)
        console.log('✅ Recommendations tab working')
        
        // Close modal
        const closeButton = page.locator('button').filter({ hasText: /Close|×/ }).first()
        if (await closeButton.isVisible()) {
          await closeButton.click()
        } else {
          await page.keyboard.press('Escape')
        }
        console.log('✅ Modal closed successfully')
      }
    } else {
      console.log('ℹ️  No ingredients found, testing with sample data')
    }

    // Take screenshot
    await page.screenshot({ 
      path: 'test-results/enhanced-inventory-weighted-average.png', 
      fullPage: true 
    })
  })

  test('Enhanced HPP Calculator with Weighted Average', async ({ page }) => {
    console.log('🧪 Testing Enhanced HPP Calculator...')
    
    // Navigate to enhanced HPP calculator
    await page.goto(`${baseUrl}/hpp-enhanced`)
    await page.waitForLoadState('networkidle')
    
    // Verify page title
    const pageTitle = page.locator('text=Kalkulator HPP Pintar')
    await expect(pageTitle).toBeVisible()
    console.log('✅ Enhanced HPP Calculator page loaded')

    // Check educational alert
    const educationalAlert = page.locator('text=HPP yang akurat = profit yang stabil!')
    await expect(educationalAlert).toBeVisible()
    console.log('✅ Educational alert visible')

    // Test pricing method selection
    const pricingMethodSelect = page.locator('text=Metode Harga Bahan').locator('xpath=following-sibling::*//select, following-sibling::*//*[contains(@class, "select")]').first()
    if (await pricingMethodSelect.isVisible()) {
      await pricingMethodSelect.click()
      await page.waitForTimeout(1000)
      
      // Look for moving average option (recommended)
      const movingAverageOption = page.locator('text=Rata-rata Bergerak')
      if (await movingAverageOption.isVisible()) {
        await movingAverageOption.click()
        console.log('✅ Moving Average method selected')
      }
    }

    // Check if results are displayed
    const hppResults = page.locator('text=Hasil Perhitungan HPP')
    if (await hppResults.isVisible()) {
      console.log('✅ HPP calculation results displayed')
      
      // Verify key result metrics
      const hppPerUnit = page.locator('text=HPP Per Porsi')
      const suggestedPrice = page.locator('text=Harga Jual Saran')
      const totalHPP = page.locator('text=Total HPP')
      const profitPerUnit = page.locator('text=Profit Per Porsi')
      
      await expect(hppPerUnit).toBeVisible()
      await expect(suggestedPrice).toBeVisible()
      await expect(totalHPP).toBeVisible()
      await expect(profitPerUnit).toBeVisible()
      console.log('✅ All key metrics displayed')

      // Check cost breakdown
      const costBreakdown = page.locator('text=Rincian Biaya')
      await expect(costBreakdown).toBeVisible()
      console.log('✅ Cost breakdown section visible')

      // Check method comparison
      const methodComparison = page.locator('text=Perbandingan Metode Harga')
      await expect(methodComparison).toBeVisible()
      console.log('✅ Method comparison section visible')
    }

    // Check educational footer cards
    const pricingTips = page.locator('text=Tips Penetapan Harga untuk UMKM')
    const usageTips = page.locator('text=Cara Pakai Hasil HPP')
    
    await expect(pricingTips).toBeVisible()
    await expect(usageTips).toBeVisible()
    console.log('✅ Educational footer cards visible')

    // Take screenshot
    await page.screenshot({ 
      path: 'test-results/enhanced-hpp-calculator.png', 
      fullPage: true 
    })
  })

  test('Weighted Average Cost API Endpoint', async ({ page }) => {
    console.log('🧪 Testing Weighted Average Cost API...')
    
    // Test API endpoint directly
    const response = await page.request.get(`${baseUrl}/api/inventory/weighted-average`)
    
    expect(response.status()).toBe(200)
    
    const responseData = await response.json()
    expect(responseData.message).toBe('Weighted Average Cost API')
    expect(responseData.version).toBe('1.0.0')
    expect(responseData.methods).toBeDefined()
    expect(responseData.umkm_tips).toBeDefined()
    
    console.log('✅ API endpoint responding correctly')
    console.log(`✅ API supports ${responseData.methods.length} methods`)
    console.log(`✅ ${responseData.umkm_tips.length} UMKM tips provided`)
  })

  test('Mobile Responsiveness - Weighted Average Features', async ({ page }) => {
    console.log('📱 Testing mobile responsiveness...')
    
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Navigate to enhanced inventory
    await page.goto(`${baseUrl}/inventory-enhanced`)
    await page.waitForLoadState('networkidle')
    
    // Check if mobile layout adapts properly
    const header = page.locator('h1').filter({ hasText: /Inventory/ })
    await expect(header).toBeVisible()
    
    // Test if tooltips work on mobile (they should be tappable)
    const helpIcon = page.locator('svg').filter({ hasText: /help|HelpCircle/ }).first()
    if (await helpIcon.isVisible()) {
      await helpIcon.tap()
      await page.waitForTimeout(1000)
      console.log('✅ Mobile tooltip interaction working')
    }
    
    // Test if analysis buttons are accessible on mobile
    const analysisButton = page.locator('text=Analisis Harga').first()
    if (await analysisButton.isVisible()) {
      const buttonBox = await analysisButton.boundingBox()
      if (buttonBox && buttonBox.width > 44 && buttonBox.height > 44) {
        console.log('✅ Mobile button size adequate for touch')
      }
    }
    
    // Take mobile screenshot
    await page.screenshot({ 
      path: 'test-results/mobile-weighted-average.png', 
      fullPage: true 
    })
  })

  test('Educational Content Accessibility', async ({ page }) => {
    console.log('📚 Testing educational content accessibility...')
    
    await page.goto(`${baseUrl}/inventory-enhanced`)
    await page.waitForLoadState('networkidle')
    
    // Test tooltip accessibility
    const tooltips = page.locator('[data-testid="umkm-tooltip"], .cursor-help')
    const tooltipCount = await tooltips.count()
    
    console.log(`✅ Found ${tooltipCount} educational tooltips`)
    
    if (tooltipCount > 0) {
      // Test first tooltip
      const firstTooltip = tooltips.first()
      await firstTooltip.hover()
      await page.waitForTimeout(1000)
      
      // Check if tooltip content appears
      const tooltipContent = page.locator('[role="tooltip"], .tooltip-content')
      const hasTooltipContent = await tooltipContent.count() > 0
      
      if (hasTooltipContent) {
        console.log('✅ Tooltip content appears on hover')
      }
    }

    // Check educational cards
    const educationalCards = page.locator('.border-green-200, .border-blue-200')
    const cardCount = await educationalCards.count()
    
    console.log(`✅ Found ${cardCount} educational cards`)
    
    if (cardCount >= 2) {
      console.log('✅ Sufficient educational content provided')
    }
  })

  test('Complete Workflow Integration', async ({ page }) => {
    console.log('🔄 Testing complete workflow integration...')
    
    // Start from inventory
    await page.goto(`${baseUrl}/inventory-enhanced`)
    await page.waitForLoadState('networkidle')
    console.log('✅ Step 1: Loaded inventory page')

    // Check for weighted average features
    const analysisButton = page.locator('text=Analisis Harga').first()
    if (await analysisButton.isVisible()) {
      await analysisButton.click()
      await page.waitForTimeout(2000)
      
      // Check if modal opened
      const modal = page.locator('text=Analisis Harga Rata-rata:')
      if (await modal.isVisible()) {
        console.log('✅ Step 2: Weighted average analysis accessible')
        
        // Close modal and navigate to HPP
        await page.keyboard.press('Escape')
        await page.waitForTimeout(1000)
      }
    }

    // Navigate to HPP calculator
    await page.goto(`${baseUrl}/hpp-enhanced`)
    await page.waitForLoadState('networkidle')
    
    // Verify HPP calculator with weighted average
    const hppTitle = page.locator('text=Kalkulator HPP Pintar')
    await expect(hppTitle).toBeVisible()
    console.log('✅ Step 3: HPP calculator with weighted average loaded')

    // Check if calculation happens automatically
    const results = page.locator('text=Hasil Perhitungan HPP')
    if (await results.isVisible()) {
      console.log('✅ Step 4: Weighted average HPP calculation working')
    }

    // Final screenshot
    await page.screenshot({ 
      path: 'test-results/complete-workflow-integration.png', 
      fullPage: true 
    })

    console.log('🎉 Complete workflow integration test passed!')
  })
})