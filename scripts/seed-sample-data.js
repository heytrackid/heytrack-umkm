// Sample Data Seeder for AI Testing
// Run with: node scripts/seed-sample-data.js

// Load environment variables
const fs = require('fs');
const path = require('path');

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

// Try to load .env.local first, then .env
loadEnvFile(path.join(process.cwd(), '.env.local'));
loadEnvFile(path.join(process.cwd(), '.env'));

// Sample data
const sampleIngredients = [
  {
    name: 'Tepung Terigu Protein Tinggi',
    description: 'Tepung terigu untuk roti dan pastry',
    unit: 'kg',
    price_per_unit: 15000,
    current_stock: 50,
    min_stock: 10,
    max_stock: 100,
    reorder_point: 15,
    category: 'Tepung',
    supplier: 'PT Boga Sari Flour Mills',
    supplier_contact: '021-5551234',
    lead_time: 3,
    usage_rate: 5.5,
    cost_per_batch: 12000
  },
  {
    name: 'Butter Unsalted Premium',
    description: 'Mentega tawar untuk kue dan roti',
    unit: 'kg',
    price_per_unit: 85000,
    current_stock: 20,
    min_stock: 5,
    max_stock: 50,
    reorder_point: 8,
    category: 'Dairy',
    supplier: 'PT Cimory Milk Industries',
    supplier_contact: '021-5559876',
    lead_time: 2,
    usage_rate: 3.2,
    cost_per_batch: 80000
  },
  {
    name: 'Gula Pasir Halus',
    description: 'Gula pasir halus untuk kue dan minuman',
    unit: 'kg',
    price_per_unit: 18000,
    current_stock: 75,
    min_stock: 20,
    max_stock: 150,
    reorder_point: 30,
    category: 'Pemanis',
    supplier: 'PT Sugar Group Companies',
    supplier_contact: '021-5552468',
    lead_time: 5,
    usage_rate: 8.3,
    cost_per_batch: 16000
  },
  {
    name: 'Telur Ayam Grade A',
    description: 'Telur ayam segar grade A',
    unit: 'butir',
    price_per_unit: 2500,
    current_stock: 200,
    min_stock: 50,
    max_stock: 500,
    reorder_point: 80,
    category: 'Protein',
    supplier: 'Toko Telur Segar Jaya',
    supplier_contact: '021-5553697',
    lead_time: 1,
    usage_rate: 45,
    cost_per_batch: 2200
  },
  {
    name: 'Cokelat Bubuk Premium',
    description: 'Cokelat bubuk kualitas premium untuk kue',
    unit: 'kg',
    price_per_unit: 125000,
    current_stock: 8,
    min_stock: 3,
    max_stock: 25,
    reorder_point: 5,
    category: 'Perasa',
    supplier: 'PT Delfi Cocoa Indonesia',
    supplier_contact: '021-5554789',
    lead_time: 7,
    usage_rate: 1.8,
    cost_per_batch: 115000
  },
  {
    name: 'Susu Cair Full Cream',
    description: 'Susu segar full cream untuk pastry',
    unit: 'liter',
    price_per_unit: 25000,
    current_stock: 30,
    min_stock: 8,
    max_stock: 60,
    reorder_point: 12,
    category: 'Dairy',
    supplier: 'PT Greenfields Indonesia',
    supplier_contact: '021-5555123',
    lead_time: 2,
    usage_rate: 4.5,
    cost_per_batch: 22000
  }
];

const sampleRecipes = [
  {
    name: 'Croissant Butter Classic',
    description: 'Croissant butter lembut dengan lapisan berlapis',
    category: 'Pastry',
    servings: 12,
    prep_time: 120,
    cook_time: 25,
    difficulty: 'Hard',
    instructions: `1. Buat adonan dasar dengan tepung, gula, garam, ragi, dan susu\n2. Istirahatkan adonan 30 menit\n3. Lakukan laminating dengan butter selama 3 lipatan\n4. Bentuk croissant dan proof 2 jam\n5. Panggang 200°C selama 20-25 menit`,
    notes: 'Pastikan butter dan adonan suhu sama saat laminating',
    selling_price: 18000,
    cost_per_unit: 7200,
    margin_percentage: 60,
    batch_size: 12,
    rating: 4.8,
    times_made: 45,
    total_revenue: 810000
  },
  {
    name: 'Chocolate Chip Cookies',
    description: 'Cookies cokelat chip renyah dan manis',
    category: 'Kue Kering',
    servings: 24,
    prep_time: 30,
    cook_time: 15,
    difficulty: 'Easy',
    instructions: `1. Kocok butter dan gula hingga pucat\n2. Tambahkan telur dan vanilla\n3. Masukkan tepung dan cokelat chip\n4. Bentuk bulatan dan panggang 180°C 12-15 menit`,
    notes: 'Jangan overmix adonan agar cookies tetap tender',
    selling_price: 8500,
    cost_per_unit: 3400,
    margin_percentage: 60,
    batch_size: 24,
    rating: 4.6,
    times_made: 78,
    total_revenue: 663000
  },
  {
    name: 'Red Velvet Cupcake',
    description: 'Cupcake red velvet dengan cream cheese frosting',
    category: 'Cupcake',
    servings: 12,
    prep_time: 45,
    cook_time: 20,
    difficulty: 'Medium',
    instructions: `1. Mix dry ingredients\n2. Kocok butter, gula, dan telur\n3. Tambahkan pewarna merah dan vanilla\n4. Masukkan tepung dan buttermilk bergantian\n5. Panggang 175°C 18-20 menit\n6. Hias dengan cream cheese frosting`,
    notes: 'Gunakan pewarna makanan gel untuk warna optimal',
    selling_price: 15000,
    cost_per_unit: 6000,
    margin_percentage: 60,
    batch_size: 12,
    rating: 4.9,
    times_made: 62,
    total_revenue: 930000
  }
];

const sampleFinancialRecords = [
  // Income Records
  { type: 'INCOME', category: 'Penjualan Retail', amount: 2500000, description: 'Penjualan harian - roti dan pastry', date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
  { type: 'INCOME', category: 'Penjualan Kue Ulang Tahun', amount: 850000, description: 'Custom cake order', date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
  { type: 'INCOME', category: 'Penjualan Catering', amount: 3200000, description: 'Catering event kantor', date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
  { type: 'INCOME', category: 'Penjualan Online', amount: 1750000, description: 'Penjualan melalui platform online', date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() },
  
  // Expense Records  
  { type: 'EXPENSE', category: 'Bahan Baku', amount: 1200000, description: 'Pembelian tepung, butter, dan bahan lainnya', date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
  { type: 'EXPENSE', category: 'Gaji Karyawan', amount: 4500000, description: 'Gaji bulanan 3 karyawan', date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
  { type: 'EXPENSE', category: 'Listrik & Gas', amount: 650000, description: 'Tagihan utilitas bulanan', date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString() },
  { type: 'EXPENSE', category: 'Sewa Toko', amount: 2800000, description: 'Sewa toko bulanan', date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() },
  { type: 'EXPENSE', category: 'Marketing', amount: 450000, description: 'Iklan media sosial dan promosi', date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString() },
  { type: 'EXPENSE', category: 'Perlengkapan', amount: 350000, description: 'Kemasan, label, dan supplies', date: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString() }
];

// Supabase API helper
async function supabaseAPI(table, method = 'POST', data = null, params = '') {
  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/${table}${params}`;
  const headers = {
    'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': method === 'POST' ? 'return=representation' : undefined
  };

  const options = {
    method,
    headers
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(url, options);
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Supabase API Error (${response.status}): ${error}`);
  }

  if (method === 'GET' || method === 'POST') {
    return await response.json();
  }

  return true;
}

async function seedData() {
  console.log('🌱 Starting sample data seeding for AI testing...\n');

  try {
    // 1. Seed Ingredients
    console.log('📦 Seeding ingredients...');
    const insertedIngredients = [];
    for (const ingredient of sampleIngredients) {
      try {
        const result = await supabaseAPI('ingredients', 'POST', ingredient);
        if (Array.isArray(result) && result.length > 0) {
          insertedIngredients.push(result[0]);
          console.log(`  ✅ Added: ${ingredient.name}`);
        }
      } catch (error) {
        console.log(`  ⚠️ Skipped ${ingredient.name}: ${error.message}`);
      }
    }

    // 2. Seed Recipes
    console.log('\n🍰 Seeding recipes...');
    const insertedRecipes = [];
    for (const recipe of sampleRecipes) {
      try {
        const result = await supabaseAPI('recipes', 'POST', recipe);
        if (Array.isArray(result) && result.length > 0) {
          insertedRecipes.push(result[0]);
          console.log(`  ✅ Added: ${recipe.name}`);
        }
      } catch (error) {
        console.log(`  ⚠️ Skipped ${recipe.name}: ${error.message}`);
      }
    }

    // 3. Create Recipe Ingredients relationships
    console.log('\n🔗 Creating recipe-ingredient relationships...');
    const recipeIngredients = [];

    // Croissant ingredients
    if (insertedRecipes[0] && insertedIngredients.length >= 4) {
      recipeIngredients.push(
        { recipe_id: insertedRecipes[0].id, ingredient_id: insertedIngredients[0].id, quantity: 0.5, unit: 'kg' }, // Tepung
        { recipe_id: insertedRecipes[0].id, ingredient_id: insertedIngredients[1].id, quantity: 0.3, unit: 'kg' }, // Butter
        { recipe_id: insertedRecipes[0].id, ingredient_id: insertedIngredients[2].id, quantity: 0.05, unit: 'kg' }, // Gula
        { recipe_id: insertedRecipes[0].id, ingredient_id: insertedIngredients[3].id, quantity: 2, unit: 'butir' }, // Telur
        { recipe_id: insertedRecipes[0].id, ingredient_id: insertedIngredients[5].id, quantity: 0.2, unit: 'liter' } // Susu
      );
    }

    // Cookies ingredients
    if (insertedRecipes[1] && insertedIngredients.length >= 5) {
      recipeIngredients.push(
        { recipe_id: insertedRecipes[1].id, ingredient_id: insertedIngredients[0].id, quantity: 0.3, unit: 'kg' }, // Tepung
        { recipe_id: insertedRecipes[1].id, ingredient_id: insertedIngredients[1].id, quantity: 0.15, unit: 'kg' }, // Butter
        { recipe_id: insertedRecipes[1].id, ingredient_id: insertedIngredients[2].id, quantity: 0.2, unit: 'kg' }, // Gula
        { recipe_id: insertedRecipes[1].id, ingredient_id: insertedIngredients[3].id, quantity: 3, unit: 'butir' }, // Telur
        { recipe_id: insertedRecipes[1].id, ingredient_id: insertedIngredients[4].id, quantity: 0.1, unit: 'kg' } // Cokelat
      );
    }

    // Red Velvet ingredients
    if (insertedRecipes[2] && insertedIngredients.length >= 4) {
      recipeIngredients.push(
        { recipe_id: insertedRecipes[2].id, ingredient_id: insertedIngredients[0].id, quantity: 0.25, unit: 'kg' }, // Tepung
        { recipe_id: insertedRecipes[2].id, ingredient_id: insertedIngredients[1].id, quantity: 0.1, unit: 'kg' }, // Butter
        { recipe_id: insertedRecipes[2].id, ingredient_id: insertedIngredients[2].id, quantity: 0.3, unit: 'kg' }, // Gula
        { recipe_id: insertedRecipes[2].id, ingredient_id: insertedIngredients[3].id, quantity: 4, unit: 'butir' }, // Telur
        { recipe_id: insertedRecipes[2].id, ingredient_id: insertedIngredients[4].id, quantity: 0.02, unit: 'kg' } // Cokelat
      );
    }

    for (const relation of recipeIngredients) {
      try {
        await supabaseAPI('recipe_ingredients', 'POST', relation);
        console.log(`  ✅ Linked ingredient to recipe`);
      } catch (error) {
        console.log(`  ⚠️ Failed to link: ${error.message}`);
      }
    }

    // 4. Seed Financial Records
    console.log('\n💰 Seeding financial records...');
    for (const record of sampleFinancialRecords) {
      try {
        await supabaseAPI('financial_records', 'POST', record);
        console.log(`  ✅ Added ${record.type}: ${record.category} - Rp${record.amount.toLocaleString('id-ID')}`);
      } catch (error) {
        console.log(`  ⚠️ Skipped financial record: ${error.message}`);
      }
    }

    // 5. Create some stock transactions
    console.log('\n📊 Creating stock transactions...');
    const transactions = [];
    
    insertedIngredients.forEach((ingredient, index) => {
      // Purchase transaction
      transactions.push({
        ingredient_id: ingredient.id,
        type: 'PURCHASE',
        quantity: ingredient.current_stock,
        unit_price: ingredient.price_per_unit,
        total_price: ingredient.current_stock * ingredient.price_per_unit,
        reference: `PO-2024-${String(index + 1).padStart(3, '0')}`,
        notes: 'Initial stock purchase'
      });

      // Usage transaction
      const usageAmount = Math.floor(ingredient.current_stock * 0.3);
      transactions.push({
        ingredient_id: ingredient.id,
        type: 'USAGE',
        quantity: -usageAmount,
        unit_price: ingredient.price_per_unit,
        total_price: usageAmount * ingredient.price_per_unit,
        reference: `PROD-2024-${String(index + 1).padStart(3, '0')}`,
        notes: 'Production usage'
      });
    });

    for (const transaction of transactions) {
      try {
        await supabaseAPI('stock_transactions', 'POST', transaction);
        console.log(`  ✅ Added ${transaction.type} transaction`);
      } catch (error) {
        console.log(`  ⚠️ Failed transaction: ${error.message}`);
      }
    }

    console.log('\n✨ Sample data seeding completed successfully!');
    console.log('\n📈 Summary:');
    console.log(`  - ${insertedIngredients.length} ingredients added`);
    console.log(`  - ${insertedRecipes.length} recipes added`);
    console.log(`  - ${recipeIngredients.length} recipe-ingredient relationships created`);
    console.log(`  - ${sampleFinancialRecords.length} financial records added`);
    console.log(`  - ${transactions.length} stock transactions created`);
    console.log('\n🚀 Your bakery management system is now ready for AI analysis!');
    console.log('   Visit http://localhost:3000/ai to see AI insights in action.');

  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
}

// Run the seeder
if (require.main === module) {
  seedData();
}

module.exports = { seedData };