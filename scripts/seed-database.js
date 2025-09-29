#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// Load environment variables
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
dotenv.config({ path: join(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables')
  console.log('Please check .env.local file contains:')
  console.log('- NEXT_PUBLIC_SUPABASE_URL')
  console.log('- SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

console.log('🎯 Starting database seeding...')

// Sample data untuk bakery UMKM Indonesia
const SAMPLE_DATA = {
  // Bahan Baku (Ingredients)
  ingredients: [
    { name: 'Tepung Terigu Protein Tinggi', price_per_unit: 12000, unit: 'kg', current_stock: 50, min_stock: 10, category: 'tepung' },
    { name: 'Tepung Terigu Protein Sedang', price_per_unit: 10000, unit: 'kg', current_stock: 25, min_stock: 10, category: 'tepung' },
    { name: 'Gula Pasir', price_per_unit: 15000, unit: 'kg', current_stock: 30, min_stock: 15, category: 'pemanis' },
    { name: 'Gula Halus', price_per_unit: 18000, unit: 'kg', current_stock: 8, min_stock: 5, category: 'pemanis' },
    { name: 'Mentega Unsalted', price_per_unit: 45000, unit: 'kg', current_stock: 12, min_stock: 8, category: 'lemak' },
    { name: 'Margarin', price_per_unit: 25000, unit: 'kg', current_stock: 15, min_stock: 10, category: 'lemak' },
    { name: 'Telur Ayam', price_per_unit: 2500, unit: 'butir', current_stock: 120, min_stock: 50, category: 'protein' },
    { name: 'Susu Cair Full Cream', price_per_unit: 18000, unit: 'liter', current_stock: 20, min_stock: 10, category: 'protein' },
    { name: 'Coklat Bubuk Premium', price_per_unit: 85000, unit: 'kg', current_stock: 5, min_stock: 3, category: 'perasa' },
    { name: 'Vanilla Extract', price_per_unit: 120000, unit: 'liter', current_stock: 2, min_stock: 1, category: 'perasa' },
    { name: 'Baking Powder', price_per_unit: 35000, unit: 'kg', current_stock: 3, min_stock: 2, category: 'pengembang' },
    { name: 'Ragi Instan', price_per_unit: 75000, unit: 'kg', current_stock: 2, min_stock: 1, category: 'pengembang' },
    { name: 'Garam Halus', price_per_unit: 8000, unit: 'kg', current_stock: 5, min_stock: 2, category: 'bumbu' },
    { name: 'Minyak Goreng', price_per_unit: 16000, unit: 'liter', current_stock: 10, min_stock: 5, category: 'lemak' },
    { name: 'Keju Parut', price_per_unit: 95000, unit: 'kg', current_stock: 3, min_stock: 2, category: 'topping' },
    { name: 'Selai Strawberry', price_per_unit: 45000, unit: 'kg', current_stock: 4, min_stock: 2, category: 'topping' },
    { name: 'Kacang Almond Slice', price_per_unit: 150000, unit: 'kg', current_stock: 2, min_stock: 1, category: 'topping' },
    { name: 'Madu Asli', price_per_unit: 75000, unit: 'kg', current_stock: 3, min_stock: 1, category: 'pemanis' },
    { name: 'Cream Cheese', price_per_unit: 125000, unit: 'kg', current_stock: 4, min_stock: 2, category: 'lemak' },
    { name: 'Food Coloring', price_per_unit: 25000, unit: 'set', current_stock: 2, min_stock: 1, category: 'pewarna' }
  ],

  // Customers
  customers: [
    { name: 'Budi Santoso', email: 'budi.santoso@gmail.com', phone: '081234567890', address: 'Jl. Merdeka No. 123, Jakarta Selatan', loyalty_points: 150 },
    { name: 'Sari Dewi', email: 'sari.dewi@yahoo.com', phone: '081234567891', address: 'Jl. Sudirman No. 45, Jakarta Pusat', loyalty_points: 89 },
    { name: 'Ahmad Rahman', email: 'ahmad.rahman@gmail.com', phone: '081234567892', address: 'Jl. Gatot Subroto No. 67, Jakarta Selatan', loyalty_points: 234 },
    { name: 'Lisa Putri', email: 'lisa.putri@gmail.com', phone: '081234567893', address: 'Jl. Thamrin No. 89, Jakarta Pusat', loyalty_points: 45 },
    { name: 'Rudi Hermawan', email: 'rudi.hermawan@gmail.com', phone: '081234567894', address: 'Jl. Casablanca No. 12, Jakarta Selatan', loyalty_points: 178 },
    { name: 'Maya Sari', email: 'maya.sari@gmail.com', phone: '081234567895', address: 'Jl. Kemang No. 34, Jakarta Selatan', loyalty_points: 67 },
    { name: 'Dedi Kurniawan', email: 'dedi.kurniawan@gmail.com', phone: '081234567896', address: 'Jl. Cipete No. 56, Jakarta Selatan', loyalty_points: 112 },
    { name: 'Rina Wati', email: 'rina.wati@gmail.com', phone: '081234567897', address: 'Jl. Radio Dalam No. 78, Jakarta Selatan', loyalty_points: 203 }
  ],

  // Categories for recipes
  categories: [
    { name: 'Roti', description: 'Berbagai jenis roti dan bakery items' },
    { name: 'Kue', description: 'Cake dan kue-kue manis' },
    { name: 'Pastry', description: 'Pastry dan croissant' },
    { name: 'Cookies', description: 'Biskuit dan cookies' },
    { name: 'Donat', description: 'Donat dan fried items' }
  ]
}

// Recipe templates with ingredients
const RECIPE_TEMPLATES = [
  {
    name: 'Roti Tawar Putih',
    description: 'Roti tawar lembut untuk sarapan sehari-hari',
    category: 'Roti',
    servings: 1,
    instructions: 'Campur semua bahan kering, tambahkan bahan basah, uleni hingga kalis, fermentasi, bentuk, panggang 180°C selama 35 menit',
    ingredients: [
      { ingredient_name: 'Tepung Terigu Protein Tinggi', quantity: 500, unit: 'gram' },
      { ingredient_name: 'Gula Pasir', quantity: 50, unit: 'gram' },
      { ingredient_name: 'Garam Halus', quantity: 8, unit: 'gram' },
      { ingredient_name: 'Ragi Instan', quantity: 7, unit: 'gram' },
      { ingredient_name: 'Mentega Unsalted', quantity: 50, unit: 'gram' },
      { ingredient_name: 'Susu Cair Full Cream', quantity: 300, unit: 'ml' },
      { ingredient_name: 'Telur Ayam', quantity: 1, unit: 'butir' }
    ]
  },
  {
    name: 'Brownies Coklat',
    description: 'Brownies coklat fudgy dengan tekstur lembut',
    category: 'Kue',
    servings: 16,
    instructions: 'Lelehkan mentega dan coklat, campur dengan gula dan telur, masukkan tepung, panggang 160°C selama 45 menit',
    ingredients: [
      { ingredient_name: 'Tepung Terigu Protein Sedang', quantity: 200, unit: 'gram' },
      { ingredient_name: 'Coklat Bubuk Premium', quantity: 100, unit: 'gram' },
      { ingredient_name: 'Gula Pasir', quantity: 250, unit: 'gram' },
      { ingredient_name: 'Mentega Unsalted', quantity: 200, unit: 'gram' },
      { ingredient_name: 'Telur Ayam', quantity: 4, unit: 'butir' },
      { ingredient_name: 'Vanilla Extract', quantity: 5, unit: 'ml' }
    ]
  },
  {
    name: 'Croissant Butter',
    description: 'Croissant berlapis dengan mentega premium',
    category: 'Pastry',
    servings: 12,
    instructions: 'Buat dough, laminasi dengan mentega, lipat 3x, bentuk, fermentasi, panggang 200°C selama 20 menit',
    ingredients: [
      { ingredient_name: 'Tepung Terigu Protein Tinggi', quantity: 400, unit: 'gram' },
      { ingredient_name: 'Mentega Unsalted', quantity: 250, unit: 'gram' },
      { ingredient_name: 'Gula Pasir', quantity: 40, unit: 'gram' },
      { ingredient_name: 'Garam Halus', quantity: 8, unit: 'gram' },
      { ingredient_name: 'Ragi Instan', quantity: 6, unit: 'gram' },
      { ingredient_name: 'Susu Cair Full Cream', quantity: 200, unit: 'ml' },
      { ingredient_name: 'Telur Ayam', quantity: 1, unit: 'butir' }
    ]
  },
  {
    name: 'Donat Glazed',
    description: 'Donat empuk dengan glasir manis',
    category: 'Donat',
    servings: 20,
    instructions: 'Buat adonan, fermentasi, bentuk donat, goreng dalam minyak 170°C, beri glasir',
    ingredients: [
      { ingredient_name: 'Tepung Terigu Protein Tinggi', quantity: 500, unit: 'gram' },
      { ingredient_name: 'Gula Pasir', quantity: 80, unit: 'gram' },
      { ingredient_name: 'Garam Halus', quantity: 6, unit: 'gram' },
      { ingredient_name: 'Ragi Instan', quantity: 8, unit: 'gram' },
      { ingredient_name: 'Mentega Unsalted', quantity: 60, unit: 'gram' },
      { ingredient_name: 'Telur Ayam', quantity: 2, unit: 'butir' },
      { ingredient_name: 'Susu Cair Full Cream', quantity: 250, unit: 'ml' },
      { ingredient_name: 'Minyak Goreng', quantity: 2, unit: 'liter' },
      { ingredient_name: 'Gula Halus', quantity: 200, unit: 'gram' }
    ]
  },
  {
    name: 'Cookies Chocolate Chip',
    description: 'Cookies renyah dengan chocolate chip',
    category: 'Cookies',
    servings: 24,
    instructions: 'Kocok mentega dan gula, masukkan telur, campurkan tepung, tambah chocolate chip, panggang 180°C selama 12 menit',
    ingredients: [
      { ingredient_name: 'Tepung Terigu Protein Sedang', quantity: 300, unit: 'gram' },
      { ingredient_name: 'Mentega Unsalted', quantity: 200, unit: 'gram' },
      { ingredient_name: 'Gula Pasir', quantity: 150, unit: 'gram' },
      { ingredient_name: 'Gula Halus', quantity: 100, unit: 'gram' },
      { ingredient_name: 'Telur Ayam', quantity: 2, unit: 'butir' },
      { ingredient_name: 'Vanilla Extract', quantity: 5, unit: 'ml' },
      { ingredient_name: 'Baking Powder', quantity: 3, unit: 'gram' }
    ]
  }
]

async function clearExistingData() {
  console.log('🧹 Clearing existing data...')
  
  const tables = ['order_items', 'orders', 'recipe_ingredients', 'recipes', 'customers', 'ingredients', 'categories', 'stock_transactions', 'financial_records']
  
  for (const table of tables) {
    try {
      const { error } = await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000')
      if (error && !error.message.includes('does not exist')) {
        console.log(`⚠️  Error clearing ${table}:`, error.message)
      }
    } catch (err) {
      console.log(`⚠️  Table ${table} might not exist, skipping...`)
    }
  }
}

async function seedIngredients() {
  console.log('🥖 Seeding ingredients...')
  
  const { data, error } = await supabase
    .from('ingredients')
    .insert(SAMPLE_DATA.ingredients.map(ingredient => ({
      ...ingredient,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })))
    .select()
  
  if (error) {
    console.error('❌ Error seeding ingredients:', error)
    return null
  }
  
  console.log(`✅ Successfully seeded ${data.length} ingredients`)
  return data
}

async function seedCustomers() {
  console.log('👥 Seeding customers...')
  
  const { data, error } = await supabase
    .from('customers')
    .insert(SAMPLE_DATA.customers.map(customer => ({
      ...customer,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })))
    .select()
  
  if (error) {
    console.error('❌ Error seeding customers:', error)
    return null
  }
  
  console.log(`✅ Successfully seeded ${data.length} customers`)
  return data
}

async function seedRecipes(ingredients) {
  console.log('📝 Seeding recipes...')
  
  const ingredientMap = {}
  ingredients.forEach(ing => {
    ingredientMap[ing.name] = ing.id
  })
  
  for (const template of RECIPE_TEMPLATES) {
    // Insert recipe
    const { data: recipe, error: recipeError } = await supabase
      .from('recipes')
      .insert({
        name: template.name,
        description: template.description,
        category: template.category,
        servings: template.servings,
        instructions: template.instructions,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (recipeError) {
      console.error(`❌ Error creating recipe ${template.name}:`, recipeError)
      continue
    }
    
    // Insert recipe ingredients
    const recipeIngredients = template.ingredients.map(ing => ({
      recipe_id: recipe.id,
      ingredient_id: ingredientMap[ing.ingredient_name],
      quantity: ing.quantity,
      unit: ing.unit
    })).filter(ing => ing.ingredient_id) // Only include ingredients that exist
    
    if (recipeIngredients.length > 0) {
      const { error: ingredientError } = await supabase
        .from('recipe_ingredients')
        .insert(recipeIngredients)
      
      if (ingredientError) {
        console.error(`❌ Error adding ingredients to ${template.name}:`, ingredientError)
      }
    }
    
    console.log(`✅ Created recipe: ${template.name}`)
  }
}

async function seedOrders(customers, recipes) {
  console.log('🛒 Seeding orders...')
  
  const orderTemplates = [
    { customer_id: customers[0].id, items: [{ recipe_id: recipes[0].id, quantity: 2, unit_price: 22500, total_price: 45000, product_name: 'Roti Tawar Putih' }], status: 'DELIVERED' },
    { customer_id: customers[1].id, items: [{ recipe_id: recipes[1].id, quantity: 1, unit_price: 120000, total_price: 120000, product_name: 'Brownies Coklat' }], status: 'IN_PROGRESS' },
    { customer_id: customers[2].id, items: [{ recipe_id: recipes[2].id, quantity: 6, unit_price: 30000, total_price: 180000, product_name: 'Croissant Butter' }], status: 'PENDING' },
    { customer_id: customers[3].id, items: [{ recipe_id: recipes[3].id, quantity: 12, unit_price: 8000, total_price: 96000, product_name: 'Donat Glazed' }], status: 'DELIVERED' },
    { customer_id: customers[4].id, items: [{ recipe_id: recipes[4].id, quantity: 24, unit_price: 6000, total_price: 144000, product_name: 'Cookies Chocolate Chip' }], status: 'DELIVERED' },
  ]
  
  for (const orderTemplate of orderTemplates) {
    const totalAmount = orderTemplate.items.reduce((sum, item) => sum + item.total_price, 0)
    
    // Generate order number
    const orderNo = `ORD-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`
    
    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_no: orderNo,
        customer_id: orderTemplate.customer_id,
        total_amount: totalAmount,
        status: orderTemplate.status,
        order_date: new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (orderError) {
      console.error('❌ Error creating order:', orderError)
      continue
    }
    
    // Create order items
    const orderItems = orderTemplate.items.map(item => ({
      order_id: order.id,
      recipe_id: item.recipe_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.total_price,
      product_name: item.product_name
    }))
    
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)
    
    if (itemsError) {
      console.error('❌ Error creating order items:', itemsError)
    } else {
      console.log(`✅ Created order for customer ${orderTemplate.customer_id}`)
    }
  }
}

async function seedFinancialRecords() {
  console.log('💰 Seeding financial records...')
  
  const financialData = [
    { type: 'INCOME', category: 'sales', amount: 2500000, description: 'Penjualan minggu ini', date: new Date().toISOString() },
    { type: 'EXPENSE', category: 'materials', amount: 800000, description: 'Pembelian bahan baku', date: new Date().toISOString() },
    { type: 'EXPENSE', category: 'utilities', amount: 200000, description: 'Listrik dan gas', date: new Date().toISOString() },
    { type: 'INCOME', category: 'sales', amount: 1800000, description: 'Penjualan kemarin', date: new Date(Date.now() - 24*60*60*1000).toISOString() },
  ]
  
  const { data, error } = await supabase
    .from('financial_records')
    .insert(financialData)
  
  if (error) {
    console.error('❌ Error seeding financial records:', error)
  } else {
    console.log(`✅ Successfully seeded ${financialData.length} financial records`)
  }
}

async function main() {
  try {
    // Clear existing data
    await clearExistingData()
    
    // Seed data in order
    const ingredients = await seedIngredients()
    if (!ingredients) return
    
    const customers = await seedCustomers()
    if (!customers) return
    
    await seedRecipes(ingredients)
    
    // Get recipes for orders
    const { data: recipes } = await supabase.from('recipes').select('*')
    if (recipes) {
      await seedOrders(customers, recipes)
    }
    
    await seedFinancialRecords()
    
    console.log('\n🎉 Database seeding completed successfully!')
    console.log('\n📊 Summary:')
    console.log(`- ${SAMPLE_DATA.ingredients.length} Ingredients`)
    console.log(`- ${SAMPLE_DATA.customers.length} Customers`)
    console.log(`- ${RECIPE_TEMPLATES.length} Recipes`)
    console.log('- 5 Sample Orders')
    console.log('- 4 Financial Records')
    console.log('\n✅ Your bakery management app is ready for testing with real data!')
    
  } catch (error) {
    console.error('❌ Seeding failed:', error)
    process.exit(1)
  }
}

// Run the seeder
main()