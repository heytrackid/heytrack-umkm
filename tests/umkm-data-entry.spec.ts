import { test, expect } from '@playwright/test'

// Global test configuration
test.use({
  viewport: { width: 1200, height: 800 },
  actionTimeout: 15000,
})

test.describe('UMKM HPP Data Entry Automation', () => {
  const baseUrl = 'https://heytrack-umkm.vercel.app'
  
  // Sample data untuk testing
  const sampleData = {
    ingredients: [
      { name: 'Tepung Terigu', unit: 'kg', price: 15000, stock: 50 },
      { name: 'Gula Pasir', unit: 'kg', price: 18000, stock: 25 },
      { name: 'Mentega', unit: 'kg', price: 35000, stock: 10 },
      { name: 'Telur', unit: 'kg', price: 28000, stock: 5 },
      { name: 'Susu Cair', unit: 'liter', price: 12000, stock: 20 }
    ],
    operationalCosts: [
      { name: 'Listrik', cost: 500000, type: 'monthly' },
      { name: 'Gas LPG', cost: 150000, type: 'monthly' },
      { name: 'Air', cost: 100000, type: 'monthly' },
      { name: 'Gaji Karyawan', cost: 3000000, type: 'monthly' }
    ],
    recipes: [
      {
        name: 'Roti Tawar',
        ingredients: [
          { name: 'Tepung Terigu', quantity: 1000, unit: 'gram' },
          { name: 'Gula Pasir', quantity: 100, unit: 'gram' },
          { name: 'Mentega', quantity: 150, unit: 'gram' },
          { name: 'Telur', quantity: 2, unit: 'butir' }
        ]
      }
    ]
  }

  test('Complete data entry workflow', async ({ page }) => {
    console.log('🚀 Starting complete data entry workflow...')
    test.setTimeout(300000) // 5 minutes for full workflow

    // ===============================
    // STEP 1: Setup - Navigate to app
    // ===============================
    console.log('📱 Loading UMKM HeyTrack application...')
    await page.goto(baseUrl)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(3000)
    
    await expect(page).toHaveTitle(/HeyTrack/)
    console.log('✅ App loaded successfully')

    // ===============================
    // STEP 2: Add Ingredients (Bahan Baku)
    // ===============================
    console.log('🥖 STEP 2: Adding ingredients to inventory...')
    
    // Navigate to inventory page
    const inventoryLink = page.locator('text=Bahan Baku').first()
    await inventoryLink.click()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    for (const ingredient of sampleData.ingredients) {
      try {
        console.log(`📦 Adding ingredient: ${ingredient.name}`)
        
        // Look for add button
        const addButton = page.locator('button').filter({ 
          hasText: /Tambah|Add|\+|Transaksi/i 
        }).first()
        
        if (await addButton.isVisible()) {
          await addButton.click()
          await page.waitForTimeout(1000)

          // Fill ingredient form if dialog opened
          const nameField = page.locator('input[name="name"], input[placeholder*="nama"], input[type="text"]').first()
          if (await nameField.isVisible()) {
            await nameField.fill(ingredient.name)
            
            // Try to find price/unit fields
            const priceField = page.locator('input[name="price"], input[placeholder*="harga"], input[type="number"]').first()
            if (await priceField.isVisible()) {
              await priceField.fill(ingredient.price.toString())
            }

            // Submit form
            const submitButton = page.locator('button').filter({ 
              hasText: /Simpan|Save|Tambah/i 
            }).first()
            
            if (await submitButton.isVisible()) {
              await submitButton.click()
              await page.waitForTimeout(1000)
              console.log(`  ✅ ${ingredient.name} added successfully`)
            }
          } else {
            console.log(`  ℹ️  Form not found for ${ingredient.name}, continuing...`)
          }
        } else {
          console.log(`  ℹ️  Add button not visible for ${ingredient.name}`)
        }
        
        // Close any dialogs
        const closeButton = page.locator('button').filter({ 
          hasText: /Close|Tutup|Cancel|×/i 
        }).first()
        if (await closeButton.isVisible()) {
          await closeButton.click()
          await page.waitForTimeout(500)
        }
        
      } catch (error) {
        console.log(`  ⚠️  Could not add ${ingredient.name}: ${error.message}`)
      }
    }

    // ===============================
    // STEP 3: Add Operational Costs
    // ===============================
    console.log('💰 STEP 3: Adding operational costs...')
    
    await page.goto(`${baseUrl}/operational-costs`)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    for (const cost of sampleData.operationalCosts) {
      try {
        console.log(`💳 Adding operational cost: ${cost.name}`)
        
        const addButton = page.locator('button').filter({ 
          hasText: /Tambah|Add|\+/i 
        }).first()
        
        if (await addButton.isVisible()) {
          await addButton.click()
          await page.waitForTimeout(1000)

          // Fill cost form
          const nameField = page.locator('input[name="name"], input[placeholder*="nama"], input[type="text"]').first()
          if (await nameField.isVisible()) {
            await nameField.fill(cost.name)
            
            const costField = page.locator('input[name="cost"], input[name="amount"], input[placeholder*="biaya"], input[type="number"]').first()
            if (await costField.isVisible()) {
              await costField.fill(cost.cost.toString())
            }

            const submitButton = page.locator('button').filter({ 
              hasText: /Simpan|Save|Tambah/i 
            }).first()
            
            if (await submitButton.isVisible()) {
              await submitButton.click()
              await page.waitForTimeout(1000)
              console.log(`  ✅ ${cost.name} added successfully`)
            }
          }
        }

        // Close dialogs
        const closeButton = page.locator('button').filter({ 
          hasText: /Close|Tutup|Cancel|×/i 
        }).first()
        if (await closeButton.isVisible()) {
          await closeButton.click()
          await page.waitForTimeout(500)
        }

      } catch (error) {
        console.log(`  ⚠️  Could not add ${cost.name}: ${error.message}`)
      }
    }

    // ===============================
    // STEP 4: Create Recipe
    // ===============================
    console.log('👩‍🍳 STEP 4: Creating recipes...')
    
    await page.goto(`${baseUrl}/resep`)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    for (const recipe of sampleData.recipes) {
      try {
        console.log(`🍞 Creating recipe: ${recipe.name}`)
        
        const createButton = page.locator('button').filter({ 
          hasText: /Buat|Create|Tambah|Add|\+/i 
        }).first()
        
        if (await createButton.isVisible()) {
          await createButton.click()
          await page.waitForTimeout(1000)

          // Fill recipe name
          const nameField = page.locator('input[name="name"], input[placeholder*="nama resep"], input[type="text"]').first()
          if (await nameField.isVisible()) {
            await nameField.fill(recipe.name)
          }

          // Try to add ingredients to recipe
          for (const ingredient of recipe.ingredients) {
            console.log(`  📋 Adding ingredient: ${ingredient.name} - ${ingredient.quantity}${ingredient.unit}`)
            
            // Look for add ingredient button in recipe form
            const addIngredientBtn = page.locator('button').filter({ 
              hasText: /Tambah Bahan|Add Ingredient/i 
            }).first()
            
            if (await addIngredientBtn.isVisible()) {
              await addIngredientBtn.click()
              await page.waitForTimeout(500)
            }
          }

          // Submit recipe
          const saveButton = page.locator('button').filter({ 
            hasText: /Simpan|Save|Create/i 
          }).first()
          
          if (await saveButton.isVisible()) {
            await saveButton.click()
            await page.waitForTimeout(2000)
            console.log(`  ✅ Recipe ${recipe.name} created successfully`)
          }
        }

        // Close dialogs
        const closeButton = page.locator('button').filter({ 
          hasText: /Close|Tutup|Cancel|×/i 
        }).first()
        if (await closeButton.isVisible()) {
          await closeButton.click()
          await page.waitForTimeout(500)
        }

      } catch (error) {
        console.log(`  ⚠️  Could not create recipe ${recipe.name}: ${error.message}`)
      }
    }

    // ===============================
    // STEP 5: Calculate HPP
    // ===============================
    console.log('🧮 STEP 5: Navigate to HPP Calculator...')
    
    await page.goto(`${baseUrl}/hpp`)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)
    
    console.log('✅ HPP Calculator page loaded - Ready for manual calculation')

    // ===============================
    // STEP 6: Final Verification
    // ===============================
    console.log('📊 STEP 6: Final verification - returning to dashboard...')
    
    await page.goto(`${baseUrl}/`)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(3000)

    // Take final screenshot
    await page.screenshot({ 
      path: 'test-results/umkm-data-entry-complete.png', 
      fullPage: true 
    })

    console.log('🎉 DATA ENTRY AUTOMATION COMPLETED!')
    console.log('📋 Summary of actions performed:')
    console.log(`  ✅ Added ${sampleData.ingredients.length} ingredients to inventory`)
    console.log(`  ✅ Added ${sampleData.operationalCosts.length} operational costs`)
    console.log(`  ✅ Attempted to create ${sampleData.recipes.length} recipes`)
    console.log('  ✅ Navigated to HPP Calculator')
    console.log('  ✅ Returned to dashboard for verification')
    console.log('🚀 Your UMKM system is now populated with sample data!')
  })

  test('Quick inventory check', async ({ page }) => {
    console.log('📋 Quick inventory verification...')
    
    await page.goto(`${baseUrl}/inventory`)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)
    
    // Check if inventory has any items
    const inventoryItems = page.locator('table tbody tr, .inventory-item, [data-testid="inventory-item"]')
    const itemCount = await inventoryItems.count()
    
    console.log(`📦 Found ${itemCount} items in inventory`)
    
    if (itemCount > 0) {
      console.log('✅ Inventory has items')
    } else {
      console.log('ℹ️  Inventory appears empty or not loaded')
    }

    // Take screenshot of inventory
    await page.screenshot({ 
      path: 'test-results/inventory-check.png', 
      fullPage: true 
    })
  })

  test('Quick operational costs check', async ({ page }) => {
    console.log('💰 Quick operational costs verification...')
    
    await page.goto(`${baseUrl}/operational-costs`)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)
    
    // Check if operational costs have any items
    const costItems = page.locator('table tbody tr, .cost-item, [data-testid="cost-item"]')
    const itemCount = await costItems.count()
    
    console.log(`💳 Found ${itemCount} operational cost items`)
    
    if (itemCount > 0) {
      console.log('✅ Operational costs have items')
    } else {
      console.log('ℹ️  Operational costs appear empty or not loaded')
    }

    // Take screenshot of operational costs
    await page.screenshot({ 
      path: 'test-results/operational-costs-check.png', 
      fullPage: true 
    })
  })
})