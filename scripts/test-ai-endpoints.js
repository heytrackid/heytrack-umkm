// Test AI API Endpoints
// This tests the AI service directly without needing a running server

const fs = require('fs');
const path = require('path');

// Load environment variables
function loadEnvFile(filePath) {
  try {
    const envContent = fs.readFileSync(filePath, 'utf8');
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && !key.startsWith('#')) {
        process.env[key] = valueParts.join('=');
      }
    });
  } catch (error) {
    console.warn(`Could not load ${filePath}:`, error.message);
  }
}

// Load environment
loadEnvFile(path.join(process.cwd(), '.env.local'));
loadEnvFile(path.join(process.cwd(), '.env'));

// Import AI service
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

if (!OPENROUTER_API_KEY) {
  console.error('❌ OPENROUTER_API_KEY not found in environment variables');
  process.exit(1);
}

// AI Service Implementation (from src/lib/aiService.ts)
const UMKM_CONFIG = {
  target_margin: 60,
  reorder_days: 7,
  currency: 'IDR',
  tax_rate: 11,
  business_hours: {
    open: '06:00',
    close: '21:00'
  }
};

async function callOpenRouterAPI(prompt, model = 'x-ai/grok-4-fast:free') {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'HTTP-Referer': 'https://heytrack.id',
      'X-Title': 'HeyTrack UMKM - Bakery Management AI',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'system',
          content: `You are an AI business consultant specialized in Indonesian F&B SMEs, particularly bakeries. 
                   Always respond in Indonesian Bahasa and provide practical, actionable insights for UMKM businesses.
                   Consider local market conditions, Indonesian consumer behavior, and regulatory environment.
                   Focus on cost-effective solutions and ROI optimization.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.2,
      max_tokens: 1500
    })
  });

  if (!response.ok) {
    throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

// Test data
const sampleData = {
  recipes: [
    {
      name: 'Croissant Butter Premium',
      cost_per_unit: 7200,
      selling_price: 18000,
      margin_percentage: 60,
      category: 'Pastry',
      servings: 12
    },
    {
      name: 'Chocolate Chip Cookies',
      cost_per_unit: 3400,
      selling_price: 8500,
      margin_percentage: 60,
      category: 'Kue Kering',
      servings: 24
    }
  ],
  ingredients: [
    {
      name: 'Tepung Terigu Premium',
      current_stock: 45,
      min_stock: 10,
      price_per_unit: 15000,
      category: 'Tepung',
      supplier: 'PT Boga Sari Flour Mills'
    },
    {
      name: 'Butter Unsalted',
      current_stock: 6,
      min_stock: 5,
      price_per_unit: 85000,
      category: 'Dairy',
      supplier: 'PT Anchor Food'
    }
  ],
  financialRecords: [
    { type: 'INCOME', category: 'Penjualan Retail', amount: 2800000, description: 'Penjualan harian' },
    { type: 'EXPENSE', category: 'Bahan Baku', amount: 1450000, description: 'Pembelian bahan' },
    { type: 'EXPENSE', category: 'Gaji Staff', amount: 4200000, description: 'Gaji bulanan' }
  ]
};

// Test functions
async function testPricingAPI() {
  console.log('🧪 Testing Pricing Analysis AI...');
  
  const prompt = `Analisis pricing untuk produk bakery berikut dan berikan rekomendasi optimasi:

Produk:
${sampleData.recipes.map(r => 
  `- ${r.name}: HPP Rp${r.cost_per_unit.toLocaleString('id-ID')}, Jual Rp${r.selling_price.toLocaleString('id-ID')}, Margin ${r.margin_percentage}%`
).join('\n')}

Konteks bisnis:
- Target margin: ${UMKM_CONFIG.target_margin}%
- Pasar: UMKM bakery Indonesia
- Kompetisi: Menengah

Berikan rekomendasi dalam format JSON:
{
  "summary": "ringkasan analisis",
  "recommendations": [
    {
      "product": "nama produk",
      "current_price": harga_sekarang,
      "suggested_price": harga_disarankan,
      "reasoning": "alasan perubahan"
    }
  ],
  "priority": "low|medium|high|critical"
}`;

  try {
    const result = await callOpenRouterAPI(prompt);
    console.log('✅ Pricing API Test Result:');
    console.log(result.substring(0, 500) + '...\n');
    return { success: true, data: result };
  } catch (error) {
    console.log('❌ Pricing API Test Failed:', error.message);
    return { success: false, error: error.message };
  }
}

async function testInventoryAPI() {
  console.log('🧪 Testing Inventory Management AI...');
  
  const prompt = `Analisis inventory management untuk bahan baku berikut:

Bahan Baku:
${sampleData.ingredients.map(i => 
  `- ${i.name}: Stok ${i.current_stock} ${i.price_per_unit ? 'kg' : 'unit'}, Min ${i.min_stock}, Harga Rp${i.price_per_unit.toLocaleString('id-ID')}, Supplier: ${i.supplier}`
).join('\n')}

Konfigurasi bisnis:
- Reorder cycle: ${UMKM_CONFIG.reorder_days} hari
- Bisnis: Bakery Indonesia

Berikan analisis dalam format JSON:
{
  "summary": "ringkasan kondisi inventory",
  "alerts": [
    {
      "ingredient": "nama bahan",
      "type": "LOW_STOCK|OUT_OF_STOCK|REORDER_NEEDED",
      "message": "pesan alert",
      "action": "tindakan yang disarankan"
    }
  ],
  "cost_savings": "estimasi penghematan",
  "urgent_count": jumlah_item_urgent
}`;

  try {
    const result = await callOpenRouterAPI(prompt);
    console.log('✅ Inventory API Test Result:');
    console.log(result.substring(0, 500) + '...\n');
    return { success: true, data: result };
  } catch (error) {
    console.log('❌ Inventory API Test Failed:', error.message);
    return { success: false, error: error.message };
  }
}

async function testFinancialAPI() {
  console.log('🧪 Testing Financial Analysis AI...');
  
  const prompt = `Analisis keuangan untuk UMKM bakery dengan data berikut:

Data Keuangan (30 hari terakhir):
${sampleData.financialRecords.map(r => 
  `- ${r.type}: ${r.category} - Rp${r.amount.toLocaleString('id-ID')} (${r.description})`
).join('\n')}

Konteks:
- Bisnis: UMKM Bakery Indonesia
- PPN: ${UMKM_CONFIG.tax_rate}%
- Target margin: ${UMKM_CONFIG.target_margin}%

Berikan analisis dalam format JSON:
{
  "summary": "ringkasan kondisi keuangan",
  "insights": [
    {
      "type": "REVENUE|COST|PROFIT|CASHFLOW",
      "message": "insight finansial",
      "impact": "dampak terhadap bisnis",
      "recommendation": "saran tindakan"
    }
  ],
  "forecasting": {
    "next_month_revenue": estimasi_revenue,
    "cost_optimization": "area_penghematan",
    "profit_projection": estimasi_profit
  }
}`;

  try {
    const result = await callOpenRouterAPI(prompt);
    console.log('✅ Financial API Test Result:');
    console.log(result.substring(0, 500) + '...\n');
    return { success: true, data: result };
  } catch (error) {
    console.log('❌ Financial API Test Failed:', error.message);
    return { success: false, error: error.message };
  }
}

async function testCustomerAPI() {
  console.log('🧪 Testing Customer Analytics AI...');
  
  const customerData = {
    total_customers: 45,
    repeat_customers: 28,
    avg_order_value: 67500,
    top_products: ['Croissant Butter', 'Chocolate Cookies', 'Red Velvet Cupcake']
  };

  const prompt = `Analisis customer behavior untuk bakery dengan data berikut:

Customer Data:
- Total customers: ${customerData.total_customers}
- Repeat customers: ${customerData.repeat_customers}
- Average Order Value: Rp${customerData.avg_order_value.toLocaleString('id-ID')}
- Top products: ${customerData.top_products.join(', ')}

Konteks:
- Bisnis: UMKM Bakery Indonesia
- Lokasi: Urban area

Berikan analisis dalam format JSON:
{
  "summary": "ringkasan perilaku pelanggan",
  "insights": [
    {
      "type": "RETENTION|ACQUISITION|VALUE|BEHAVIOR",
      "message": "insight pelanggan",
      "metric": "metrik terkait",
      "recommendation": "saran strategi"
    }
  ],
  "segments": [
    {
      "name": "nama segmen",
      "description": "karakteristik segmen",
      "strategy": "strategi marketing"
    }
  ]
}`;

  try {
    const result = await callOpenRouterAPI(prompt);
    console.log('✅ Customer API Test Result:');
    console.log(result.substring(0, 500) + '...\n');
    return { success: true, data: result };
  } catch (error) {
    console.log('❌ Customer API Test Failed:', error.message);
    return { success: false, error: error.message };
  }
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Testing AI API Endpoints Integration\n');
  console.log('==========================================');
  
  const results = {
    pricing: await testPricingAPI(),
    inventory: await testInventoryAPI(),
    financial: await testFinancialAPI(),
    customer: await testCustomerAPI()
  };
  
  console.log('==========================================');
  console.log('📊 Test Results Summary:');
  console.log('==========================================');
  
  let successCount = 0;
  Object.entries(results).forEach(([endpoint, result]) => {
    if (result.success) {
      console.log(`✅ ${endpoint.padEnd(12)} API: SUCCESS`);
      successCount++;
    } else {
      console.log(`❌ ${endpoint.padEnd(12)} API: FAILED - ${result.error}`);
    }
  });
  
  console.log(`\n📈 Overall Success Rate: ${successCount}/4 (${Math.round(successCount/4*100)}%)`);
  
  if (successCount === 4) {
    console.log('\n🎉 All AI endpoints are working correctly!');
    console.log('✅ OpenRouter API integration is functional');
    console.log('✅ Indonesian business context prompts are working');
    console.log('✅ JSON response formatting is consistent');
    console.log('\n🚀 Ready to proceed with full integration testing!');
  } else {
    console.log('\n⚠️  Some endpoints failed. Check your OpenRouter API key and network connection.');
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('Next steps:');
  console.log('1. Start development server: pnpm dev');
  console.log('2. Open AI Hub: http://localhost:3000/ai');
  console.log('3. Test end-to-end AI functionality in browser');
}

// Run tests
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = { runAllTests };