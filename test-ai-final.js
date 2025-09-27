#!/usr/bin/env node

/**
 * Final AI Test Script for Bakery Management System
 * Tests all AI endpoints with production-ready setup
 */

const fs = require('fs')
const path = require('path')

// Load environment variables
const envLocal = path.join(__dirname, '.env.local')
const envFile = path.join(__dirname, '.env')

if (fs.existsSync(envLocal)) {
  const content = fs.readFileSync(envLocal, 'utf8')
  content.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=')
    if (key && valueParts.length) {
      process.env[key] = valueParts.join('=')
    }
  })
}

if (fs.existsSync(envFile)) {
  const content = fs.readFileSync(envFile, 'utf8')
  content.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=')
    if (key && valueParts.length && !process.env[key]) {
      process.env[key] = valueParts.join('=')
    }
  })
}

console.log('🧪 Testing AI Endpoints - Final Production Test')
console.log('============================================')

const testAIEndpoint = async (url, data, description) => {
  try {
    console.log(`\n📡 Testing ${description}...`)
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    })

    const responseText = await response.text()
    let result
    
    try {
      result = JSON.parse(responseText)
    } catch (e) {
      console.log('Raw response:', responseText)
      throw new Error('Invalid JSON response')
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${result.error || responseText}`)
    }

    console.log('✅ SUCCESS:', description)
    console.log('📊 Response Summary:')
    
    if (result.recommendations) {
      console.log(`   - Recommendations: ${result.recommendations.length} items`)
    }
    if (result.alerts) {
      console.log(`   - Alerts: ${result.alerts.length} items`)
    }
    if (result.insights) {
      console.log(`   - Insights: ${result.insights.length} items`)
    }
    if (result.summary) {
      console.log(`   - Summary: ${result.summary.substring(0, 100)}...`)
    }
    
    return result
  } catch (error) {
    console.log(`❌ FAILED: ${description}`)
    console.log(`   Error: ${error.message}`)
    return null
  }
}

const main = async () => {
  const baseURL = 'http://localhost:3000'
  
  // Sample data for testing
  const sampleRecipes = [
    {
      id: 1,
      name: 'Roti Tawar',
      hpp: 15000,
      selling_price: 25000,
      servings: 1,
      recipe_ingredients: [
        { quantity: 500, ingredient: { name: 'Tepung Terigu', price_per_unit: 12000 } },
        { quantity: 300, ingredient: { name: 'Telur', price_per_unit: 2500 } }
      ]
    }
  ]

  const sampleIngredients = [
    {
      id: 1,
      name: 'Tepung Terigu',
      current_stock: 10,
      min_stock: 5,
      max_stock: 50,
      price_per_unit: 12000,
      unit: 'kg'
    },
    {
      id: 2,
      name: 'Telur',
      current_stock: 2,
      min_stock: 10,
      max_stock: 100,
      price_per_unit: 2500,
      unit: 'kg'
    }
  ]

  const sampleFinancials = [
    {
      type: 'INCOME',
      amount: 500000,
      date: new Date().toISOString(),
      description: 'Penjualan roti'
    },
    {
      type: 'EXPENSE',
      amount: 200000,
      date: new Date().toISOString(),
      description: 'Pembelian bahan'
    }
  ]

  // Test all endpoints
  const tests = [
    {
      url: `${baseURL}/api/ai/pricing`,
      data: {
        recipes: sampleRecipes,
        ingredients: sampleIngredients,
        market_conditions: 'stable',
        target_margin: 60
      },
      description: 'Pricing Analysis AI'
    },
    {
      url: `${baseURL}/api/ai/inventory`,
      data: {
        ingredients: sampleIngredients,
        usage_history: 30,
        supplier_lead_times: true,
        seasonal_patterns: true
      },
      description: 'Inventory Management AI'
    },
    {
      url: `${baseURL}/api/ai/financial`,
      data: {
        records: sampleFinancials,
        period: '30d',
        include_forecasting: true,
        business_metrics: true
      },
      description: 'Financial Analysis AI'
    },
    {
      url: `${baseURL}/api/ai/customer`,
      data: {
        orders: [],
        customers: [],
        period: '30d',
        analysis_type: 'comprehensive'
      },
      description: 'Customer Analytics AI'
    }
  ]

  const results = []
  
  for (const test of tests) {
    const result = await testAIEndpoint(test.url, test.data, test.description)
    results.push({ test: test.description, success: !!result, result })
  }

  // Summary
  console.log('\n' + '='.repeat(50))
  console.log('🏆 FINAL RESULTS')
  console.log('='.repeat(50))
  
  const successful = results.filter(r => r.success).length
  const total = results.length
  
  console.log(`✅ Successful tests: ${successful}/${total}`)
  console.log(`❌ Failed tests: ${total - successful}/${total}`)
  
  if (successful === total) {
    console.log('\n🎉 ALL AI ENDPOINTS ARE WORKING PERFECTLY!')
    console.log('🚀 Ready for production deployment!')
    
    console.log('\n📋 Next Steps:')
    console.log('1. Run: pnpm build')
    console.log('2. Deploy to Vercel: vercel --prod')
    console.log('3. Test production deployment')
    console.log('4. Configure monitoring')
  } else {
    console.log('\n⚠️  Some tests failed. Please check the errors above.')
  }
  
  // Environment check
  console.log('\n🔧 Environment Status:')
  console.log(`   OPENROUTER_API_KEY: ${process.env.OPENROUTER_API_KEY ? '✅ Set' : '❌ Missing'}`)
  console.log(`   AI_MODEL: ${process.env.AI_MODEL || 'x-ai/grok-4-fast:free'}`)
  console.log(`   SUPABASE_URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing'}`)
  
  return successful === total
}

// Run tests
main()
  .then(success => {
    process.exit(success ? 0 : 1)
  })
  .catch(error => {
    console.error('💥 Test runner error:', error)
    process.exit(1)
  })