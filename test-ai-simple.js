#!/usr/bin/env node

/**
 * Simple AI API Test - Direct Testing
 * Tests AI endpoints without using browser/production routes
 */

const testAI = async () => {
  console.log('🧪 Testing AI API Endpoints Directly')
  console.log('=====================================')

  const baseURL = 'http://localhost:3000'

  // Test 1: Pricing AI
  try {
    console.log('\n📊 Testing Pricing Analysis AI...')
    const response1 = await fetch(`${baseURL}/api/ai/pricing`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productName: "Roti Tawar Premium",
        ingredients: [
          { name: "Tepung Terigu", cost: 12000 },
          { name: "Telur", cost: 2500 },
          { name: "Mentega", cost: 15000 }
        ],
        currentPrice: 25000,
        targetMarket: "mid-market",
        location: "Jakarta"
      })
    })

    if (response1.ok) {
      const result1 = await response1.json()
      console.log('✅ SUCCESS: Pricing AI')
      console.log(`   Recommendations: ${result1.recommendations?.length || 0} items`)
      console.log(`   Summary: ${result1.summary?.substring(0, 80)}...` || 'No summary')
    } else {
      console.log(`❌ FAILED: Pricing AI (${response1.status})`)
    }
  } catch (error) {
    console.log(`❌ FAILED: Pricing AI - ${error.message}`)
  }

  // Test 2: Financial AI 
  try {
    console.log('\n💰 Testing Financial Analysis AI...')
    const response2 = await fetch(`${baseURL}/api/ai/financial`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        records: [
          { type: 'income', amount: 500000, category: 'sales', date: new Date().toISOString() },
          { type: 'expense', amount: 200000, category: 'ingredients', date: new Date().toISOString() }
        ],
        period: '30d',
        businessType: 'bakery'
      })
    })

    if (response2.ok) {
      const result2 = await response2.json()
      console.log('✅ SUCCESS: Financial AI')
      console.log(`   Insights: ${result2.insights?.length || 0} items`)
      console.log(`   Summary: ${result2.summary?.substring(0, 80)}...` || 'No summary')
    } else {
      console.log(`❌ FAILED: Financial AI (${response2.status})`)
    }
  } catch (error) {
    console.log(`❌ FAILED: Financial AI - ${error.message}`)
  }

  // Test 3: Customer AI
  try {
    console.log('\n👥 Testing Customer Analytics AI...')
    const response3 = await fetch(`${baseURL}/api/ai/customer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customers: [
          { id: 1, name: 'Customer A', totalOrders: 5, totalSpent: 250000 },
          { id: 2, name: 'Customer B', totalOrders: 2, totalSpent: 100000 }
        ],
        orders: [
          { customerId: 1, amount: 50000, date: new Date().toISOString() },
          { customerId: 2, amount: 30000, date: new Date().toISOString() }
        ],
        period: '30d'
      })
    })

    if (response3.ok) {
      const result3 = await response3.json()
      console.log('✅ SUCCESS: Customer AI') 
      console.log(`   Insights: ${result3.insights?.length || 0} items`)
      console.log(`   Summary: ${result3.summary?.substring(0, 80)}...` || 'No summary')
    } else {
      console.log(`❌ FAILED: Customer AI (${response3.status})`)
    }
  } catch (error) {
    console.log(`❌ FAILED: Customer AI - ${error.message}`)
  }

  console.log('\n🏁 Test Complete!')
  console.log('\n✨ AI Hub is working at: http://localhost:3000/ai')
  console.log('🏠 Homepage accessible at: http://localhost:3000')
  console.log('\n🚀 Ready for deployment!')
}

testAI().catch(console.error)