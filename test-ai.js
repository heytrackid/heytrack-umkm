// Simple test script for AI functionality
// Run with: node test-ai.js

const fetch = require('node-fetch');
require('dotenv').config({ path: '.env.local' });

async function testAI() {
  console.log('🤖 Testing AI Service with Grok 4 Fast Free...\n');

  const testData = {
    productName: "Roti Tawar Premium",
    ingredients: [
      { name: "Tepung Terigu", cost: 6000, quantity: 500 },
      { name: "Mentega", cost: 1750, quantity: 50 },
      { name: "Gula", cost: 1200, quantity: 100 },
      { name: "Ragi", cost: 500, quantity: 10 }
    ],
    currentPrice: 15000,
    location: "Jakarta",
    targetMarket: "mid-market"
  };

  try {
    console.log('📊 Testing Pricing Analysis API...');
    
    const response = await fetch('http://localhost:3000/api/ai/pricing', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Success! AI Analysis Result:');
      console.log('Model:', result.metadata?.model);
      console.log('Confidence:', result.metadata?.confidence);
      
      if (result.recommendedPrice) {
        console.log('\n💰 Pricing Recommendations:');
        console.log(`- Minimum: Rp ${result.recommendedPrice.min?.toLocaleString()}`);
        console.log(`- Optimal: Rp ${result.recommendedPrice.optimal?.toLocaleString()}`);
        console.log(`- Maximum: Rp ${result.recommendedPrice.max?.toLocaleString()}`);
      }
      
      if (result.actionItems && result.actionItems.length > 0) {
        console.log('\n🎯 Action Items:');
        result.actionItems.forEach((item, index) => {
          console.log(`${index + 1}. ${item}`);
        });
      }
      
    } else {
      console.log('❌ API Error:', result.error);
      console.log('Details:', result.details);
    }

  } catch (error) {
    console.log('❌ Connection Error:', error.message);
    console.log('\n🔧 Make sure:');
    console.log('1. Your Next.js dev server is running (npm run dev)');
    console.log('2. OPENROUTER_API_KEY is set in .env.local');
    console.log('3. Internet connection is working');
  }
}

// Health check test
async function testHealthCheck() {
  try {
    console.log('\n🏥 Testing AI Health Check...');
    
    const response = await fetch('http://localhost:3000/api/ai/health');
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ AI Service Health:', result.status);
      console.log('Model:', result.model);
    } else {
      console.log('⚠️ AI Service Issue:', result.message);
    }
    
  } catch (error) {
    console.log('❌ Health Check Failed:', error.message);
  }
}

// Run tests
async function runTests() {
  await testHealthCheck();
  await testAI();
  
  console.log('\n🎉 Test completed!');
  console.log('\nNext steps:');
  console.log('1. Open your app at http://localhost:3000');
  console.log('2. Go to the Dashboard');
  console.log('3. Scroll to "🤖 AI Business Intelligence" section');
  console.log('4. Click "Generate Insights" to see AI in action!');
}

runTests();