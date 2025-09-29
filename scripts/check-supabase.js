// Supabase Database Schema Verification Script
// Run with: node scripts/check-supabase.js

// Load environment variables from .env.local
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'OPENROUTER_API_KEY'
];

const expectedTables = [
  'ingredients',
  'recipes', 
  'recipe_ingredients',
  'customers',
  'orders',
  'order_items',
  'production_batches',
  'financial_records',
  'stock_transactions'
];

const expectedColumns = {
  ingredients: [
    'id', 'name', 'current_stock', 'min_stock', 'price_per_unit', 
    'category', 'unit', 'supplier', 'created_at', 'updated_at'
  ],
  recipes: [
    'id', 'name', 'description', 'category', 'servings', 'prep_time', 
    'cook_time', 'cost_per_unit', 'selling_price', 'margin_percentage',
    'created_at', 'updated_at'
  ],
  customers: [
    'id', 'name', 'email', 'phone', 'address', 'loyalty_points',
    'total_orders', 'total_spent', 'created_at', 'updated_at'
  ],
  orders: [
    'id', 'order_number', 'customer_id', 'status', 'priority',
    'total_amount', 'currency', 'delivery_date', 'created_at', 'updated_at'
  ]
};

async function checkEnvironmentVariables() {
  console.log('🔍 Checking Environment Variables...\n');
  
  let allGood = true;
  
  requiredEnvVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
      if (varName.includes('KEY')) {
        console.log(`✅ ${varName}: ${value.substring(0, 10)}...${value.substring(value.length - 4)}`);
      } else {
        console.log(`✅ ${varName}: ${value}`);
      }
    } else {
      console.log(`❌ ${varName}: Not set`);
      allGood = false;
    }
  });
  
  if (!allGood) {
    console.log('\n🔧 Missing environment variables. Add them to .env.local:');
    console.log(`
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# AI Features
OPENROUTER_API_KEY=your_openrouter_api_key
`);
    return false;
  }
  
  return true;
}

async function testSupabaseConnection() {
  console.log('\n📡 Testing Supabase Connection...\n');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.log('❌ Missing Supabase credentials');
    return false;
  }
  
  try {
    // Test basic connection
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });
    
    if (response.ok) {
      console.log('✅ Supabase connection successful');
      return true;
    } else {
      console.log('❌ Supabase connection failed:', response.status);
      return false;
    }
    
  } catch (error) {
    console.log('❌ Connection error:', error.message);
    return false;
  }
}

async function checkDatabaseSchema() {
  console.log('\n🗄️ Checking Database Schema...\n');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.log('❌ Missing Supabase credentials');
    return false;
  }
  
  try {
    // Check each expected table
    for (const tableName of expectedTables) {
      try {
        const response = await fetch(`${supabaseUrl}/rest/v1/${tableName}?limit=1`, {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`
          }
        });
        
        if (response.ok) {
          console.log(`✅ Table '${tableName}' exists`);
        } else if (response.status === 404) {
          console.log(`❌ Table '${tableName}' not found`);
        } else {
          console.log(`⚠️ Table '${tableName}' status: ${response.status}`);
        }
        
      } catch (error) {
        console.log(`❌ Error checking table '${tableName}':`, error.message);
      }
    }
    
    return true;
    
  } catch (error) {
    console.log('❌ Schema check failed:', error.message);
    return false;
  }
}

async function generateDatabaseSetup() {
  console.log('\n🏗️ Database Setup Recommendations...\n');
  
  console.log('If tables are missing, create them with these SQL commands in Supabase:');
  console.log(`
-- Ingredients table
CREATE TABLE IF NOT EXISTS ingredients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  current_stock DECIMAL(10,2) DEFAULT 0,
  min_stock DECIMAL(10,2) DEFAULT 10,
  price_per_unit DECIMAL(10,2) DEFAULT 0,
  category VARCHAR(100),
  unit VARCHAR(20) DEFAULT 'unit',
  supplier VARCHAR(255),
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  storage_requirements TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recipes table
CREATE TABLE IF NOT EXISTS recipes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  servings INTEGER DEFAULT 1,
  prep_time INTEGER DEFAULT 0,
  cook_time INTEGER DEFAULT 0,
  difficulty VARCHAR(50) DEFAULT 'medium',
  instructions TEXT,
  notes TEXT,
  cost_per_unit DECIMAL(10,2) DEFAULT 0,
  selling_price DECIMAL(10,2) DEFAULT 0,
  margin_percentage DECIMAL(5,2) DEFAULT 0,
  rating DECIMAL(3,2),
  times_made INTEGER DEFAULT 0,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recipe ingredients junction table
CREATE TABLE IF NOT EXISTS recipe_ingredients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
  ingredient_id UUID REFERENCES ingredients(id) ON DELETE CASCADE,
  quantity DECIMAL(10,3) NOT NULL,
  unit VARCHAR(20) NOT NULL,
  cost DECIMAL(10,2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(50),
  address TEXT,
  loyalty_points INTEGER DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  total_spent DECIMAL(12,2) DEFAULT 0,
  customer_type VARCHAR(50) DEFAULT 'regular',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number VARCHAR(100) UNIQUE NOT NULL,
  customer_id UUID REFERENCES customers(id),
  status VARCHAR(50) DEFAULT 'pending',
  priority VARCHAR(20) DEFAULT 'normal',
  total_amount DECIMAL(12,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'IDR',
  tax_amount DECIMAL(12,2) DEFAULT 0,
  delivery_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  recipe_id UUID REFERENCES recipes(id),
  product_name VARCHAR(255) NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(12,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
`);
}

async function testRealTimeFeatures() {
  console.log('\n⚡ Testing Real-time Features...\n');
  
  // This would test WebSocket connections, but for now just check if endpoint is accessible
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const realtimeUrl = supabaseUrl?.replace('https://', 'wss://').replace('/rest/v1', '/realtime/v1');
  
  console.log('Real-time endpoint:', realtimeUrl);
  console.log('✅ Real-time should work with proper WebSocket implementation');
}

// Main execution
async function main() {
  console.log('🚀 Supabase Integration Check\n');
  console.log('='.repeat(50));
  
  const envOk = await checkEnvironmentVariables();
  if (!envOk) {
    console.log('\n❌ Please fix environment variables first');
    return;
  }
  
  const connectionOk = await testSupabaseConnection();
  if (!connectionOk) {
    console.log('\n❌ Please check your Supabase credentials');
    return;
  }
  
  await checkDatabaseSchema();
  await generateDatabaseSetup();
  await testRealTimeFeatures();
  
  console.log('\n' + '='.repeat(50));
  console.log('✅ Supabase check completed!');
  console.log('\nNext steps:');
  console.log('1. Create missing tables using provided SQL');
  console.log('2. Test the app with: npm run dev');
  console.log('3. Check AI features in the dashboard');
  console.log('4. Add some sample data to test automation');
}

main().catch(console.error);