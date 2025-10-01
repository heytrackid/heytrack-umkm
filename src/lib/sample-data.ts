/**
 * Sample Data Generator for Development Only
 * Data ini HANYA muncul di development environment
 */

export const isDevelopment = process.env.NODE_ENV === 'development'

// Helper to generate random date within range
const randomDate = (start: Date, end: Date) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

// Helper to generate random number in range
const randomNumber = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// Sample Customers
export const sampleCustomers = [
  {
    id: 'sample-cust-1',
    name: 'Ibu Siti Nurhaliza',
    email: 'siti@example.com',
    phone: '081234567890',
    address: 'Jl. Merdeka No. 123, Jakarta Pusat',
    total_orders: 26,
    total_spent: 15420000,
    last_order_date: new Date('2024-09-28'),
    created_at: new Date('2024-01-15')
  },
  {
    id: 'sample-cust-2',
    name: 'PT. Maju Jaya',
    email: 'procurement@majujaya.co.id',
    phone: '021-5551234',
    address: 'Gedung Plaza Indonesia Lt. 5, Jakarta',
    total_orders: 8,
    total_spent: 8750000,
    last_order_date: new Date('2024-09-29'),
    created_at: new Date('2024-02-20')
  },
  {
    id: 'sample-cust-3',
    name: 'Bapak Andi Wijaya',
    email: 'andi.w@gmail.com',
    phone: '081298765432',
    address: 'Jl. Sudirman No. 45, Jakarta Selatan',
    total_orders: 15,
    total_spent: 6200000,
    last_order_date: new Date('2024-09-27'),
    created_at: new Date('2024-03-10')
  },
  {
    id: 'sample-cust-4',
    name: 'Ibu Dewi Lestari',
    email: 'dewi.lestari@yahoo.com',
    phone: '081387654321',
    address: 'Jl. Gatot Subroto No. 88, Jakarta',
    total_orders: 12,
    total_spent: 4850000,
    last_order_date: new Date('2024-09-26'),
    created_at: new Date('2024-04-05')
  },
  {
    id: 'sample-cust-5',
    name: 'Cafe Aroma',
    email: 'order@cafearoma.com',
    phone: '021-7778899',
    address: 'Jl. Kemang Raya No. 12, Jakarta Selatan',
    total_orders: 32,
    total_spent: 12300000,
    last_order_date: new Date('2024-09-30'),
    created_at: new Date('2024-01-20')
  }
]

// Sample Ingredients
export const sampleIngredients = [
  {
    id: 'sample-ing-1',
    name: 'Tepung Terigu Protein Tinggi',
    unit: 'kg',
    price_per_unit: 15000,
    current_stock: 45,
    minimum_stock: 20,
    supplier: 'Toko Bahan Kue Sentosa',
    category: 'Bahan Dasar',
    last_restock: new Date('2024-09-25'),
    created_at: new Date('2024-01-01')
  },
  {
    id: 'sample-ing-2',
    name: 'Butter Anchor',
    unit: 'kg',
    price_per_unit: 85000,
    current_stock: 8,
    minimum_stock: 10,
    supplier: 'Toko Bahan Kue Sentosa',
    category: 'Bahan Dasar',
    last_restock: new Date('2024-09-20'),
    created_at: new Date('2024-01-01')
  },
  {
    id: 'sample-ing-3',
    name: 'Telur Ayam',
    unit: 'tray',
    price_per_unit: 28000,
    current_stock: 12,
    minimum_stock: 5,
    supplier: 'Pasar Segar',
    category: 'Bahan Segar',
    last_restock: new Date('2024-09-28'),
    created_at: new Date('2024-01-01')
  },
  {
    id: 'sample-ing-4',
    name: 'Gula Pasir',
    unit: 'kg',
    price_per_unit: 13000,
    current_stock: 35,
    minimum_stock: 15,
    supplier: 'Toko Sembako Berkah',
    category: 'Bahan Dasar',
    last_restock: new Date('2024-09-22'),
    created_at: new Date('2024-01-01')
  },
  {
    id: 'sample-ing-5',
    name: 'Susu Cair Full Cream',
    unit: 'liter',
    price_per_unit: 18000,
    current_stock: 22,
    minimum_stock: 10,
    supplier: 'Toko Bahan Kue Sentosa',
    category: 'Bahan Segar',
    last_restock: new Date('2024-09-27'),
    created_at: new Date('2024-01-01')
  },
  {
    id: 'sample-ing-6',
    name: 'Cokelat Blok',
    unit: 'kg',
    price_per_unit: 95000,
    current_stock: 6,
    minimum_stock: 8,
    supplier: 'Toko Cokelat Premium',
    category: 'Topping',
    last_restock: new Date('2024-09-23'),
    created_at: new Date('2024-01-01')
  },
  {
    id: 'sample-ing-7',
    name: 'Ragi Instan',
    unit: 'pcs',
    price_per_unit: 3500,
    current_stock: 45,
    minimum_stock: 20,
    supplier: 'Toko Bahan Kue Sentosa',
    category: 'Bahan Pengembang',
    last_restock: new Date('2024-09-26'),
    created_at: new Date('2024-01-01')
  },
  {
    id: 'sample-ing-8',
    name: 'Keju Cheddar',
    unit: 'kg',
    price_per_unit: 120000,
    current_stock: 4,
    minimum_stock: 5,
    supplier: 'Toko Keju Import',
    category: 'Topping',
    last_restock: new Date('2024-09-21'),
    created_at: new Date('2024-01-01')
  }
]

// Sample Recipes
export const sampleRecipes = [
  {
    id: 'sample-recipe-1',
    name: 'Croissant Original',
    category: 'Roti',
    serving_size: 10,
    unit: 'pcs',
    hpp: 35000,
    selling_price: 75000,
    profit_margin: 53.3,
    ingredients: [
      { ingredient_id: 'sample-ing-1', quantity: 0.5, unit: 'kg' },
      { ingredient_id: 'sample-ing-2', quantity: 0.3, unit: 'kg' },
      { ingredient_id: 'sample-ing-3', quantity: 0.2, unit: 'tray' },
      { ingredient_id: 'sample-ing-4', quantity: 0.1, unit: 'kg' },
      { ingredient_id: 'sample-ing-5', quantity: 0.2, unit: 'liter' }
    ],
    preparation_time: 180,
    created_at: new Date('2024-01-10')
  },
  {
    id: 'sample-recipe-2',
    name: 'Roti Tawar Gandum',
    category: 'Roti',
    serving_size: 1,
    unit: 'loaf',
    hpp: 18000,
    selling_price: 35000,
    profit_margin: 48.6,
    ingredients: [
      { ingredient_id: 'sample-ing-1', quantity: 0.6, unit: 'kg' },
      { ingredient_id: 'sample-ing-2', quantity: 0.05, unit: 'kg' },
      { ingredient_id: 'sample-ing-7', quantity: 2, unit: 'pcs' },
      { ingredient_id: 'sample-ing-4', quantity: 0.08, unit: 'kg' }
    ],
    preparation_time: 240,
    created_at: new Date('2024-01-10')
  },
  {
    id: 'sample-recipe-3',
    name: 'Cake Cokelat Custom',
    category: 'Kue',
    serving_size: 1,
    unit: 'cake',
    hpp: 85000,
    selling_price: 250000,
    profit_margin: 66,
    ingredients: [
      { ingredient_id: 'sample-ing-1', quantity: 0.4, unit: 'kg' },
      { ingredient_id: 'sample-ing-2', quantity: 0.2, unit: 'kg' },
      { ingredient_id: 'sample-ing-3', quantity: 0.5, unit: 'tray' },
      { ingredient_id: 'sample-ing-4', quantity: 0.3, unit: 'kg' },
      { ingredient_id: 'sample-ing-6', quantity: 0.3, unit: 'kg' }
    ],
    preparation_time: 120,
    created_at: new Date('2024-01-10')
  }
]

// Sample Orders
export const sampleOrders = [
  {
    id: 'sample-order-1',
    order_no: 'ORD-202409-001',
    customer_id: 'sample-cust-1',
    customer_name: 'Ibu Siti Nurhaliza',
    order_date: new Date('2024-09-28'),
    delivery_date: new Date('2024-09-29'),
    status: 'delivered',
    items: [
      { recipe_id: 'sample-recipe-1', quantity: 30, price: 75000 },
      { recipe_id: 'sample-recipe-2', quantity: 5, price: 35000 }
    ],
    subtotal: 2425000,
    tax: 0,
    total: 2425000,
    payment_status: 'paid',
    payment_method: 'transfer',
    notes: 'Untuk acara arisan',
    created_at: new Date('2024-09-27')
  },
  {
    id: 'sample-order-2',
    order_no: 'ORD-202409-002',
    customer_id: 'sample-cust-2',
    customer_name: 'PT. Maju Jaya',
    order_date: new Date('2024-09-29'),
    delivery_date: new Date('2024-09-30'),
    status: 'in_production',
    items: [
      { recipe_id: 'sample-recipe-1', quantity: 100, price: 75000 },
      { recipe_id: 'sample-recipe-3', quantity: 2, price: 250000 }
    ],
    subtotal: 8000000,
    tax: 0,
    total: 8000000,
    payment_status: 'paid',
    payment_method: 'transfer',
    notes: 'Untuk meeting kantor',
    created_at: new Date('2024-09-28')
  },
  {
    id: 'sample-order-3',
    order_no: 'ORD-202409-003',
    customer_id: 'sample-cust-3',
    customer_name: 'Bapak Andi Wijaya',
    order_date: new Date('2024-09-30'),
    delivery_date: new Date('2024-10-01'),
    status: 'confirmed',
    items: [
      { recipe_id: 'sample-recipe-3', quantity: 1, price: 250000 }
    ],
    subtotal: 250000,
    tax: 0,
    total: 250000,
    payment_status: 'pending',
    payment_method: 'cash',
    notes: 'Ulang tahun anak',
    created_at: new Date('2024-09-29')
  },
  {
    id: 'sample-order-4',
    order_no: 'ORD-202409-004',
    customer_id: 'sample-cust-5',
    customer_name: 'Cafe Aroma',
    order_date: new Date('2024-09-30'),
    delivery_date: new Date('2024-09-30'),
    status: 'delivered',
    items: [
      { recipe_id: 'sample-recipe-1', quantity: 50, price: 75000 },
      { recipe_id: 'sample-recipe-2', quantity: 10, price: 35000 }
    ],
    subtotal: 4100000,
    tax: 0,
    total: 4100000,
    payment_status: 'paid',
    payment_method: 'transfer',
    notes: 'Stok harian',
    created_at: new Date('2024-09-29')
  }
]

// Sample Operational Costs
export const sampleOperationalCosts = [
  {
    id: 'sample-cost-1',
    date: new Date('2024-09-01'),
    category: 'Utilitas',
    description: 'Listrik Bulan September',
    amount: 850000,
    payment_method: 'transfer',
    created_at: new Date('2024-09-01')
  },
  {
    id: 'sample-cost-2',
    date: new Date('2024-09-05'),
    category: 'Gaji',
    description: 'Gaji Karyawan - 3 orang',
    amount: 9000000,
    payment_method: 'cash',
    created_at: new Date('2024-09-05')
  },
  {
    id: 'sample-cost-3',
    date: new Date('2024-09-10'),
    category: 'Transportasi',
    description: 'Bensin motor delivery',
    amount: 300000,
    payment_method: 'cash',
    created_at: new Date('2024-09-10')
  },
  {
    id: 'sample-cost-4',
    date: new Date('2024-09-15'),
    category: 'Perawatan',
    description: 'Service oven',
    amount: 500000,
    payment_method: 'cash',
    created_at: new Date('2024-09-15')
  },
  {
    id: 'sample-cost-5',
    date: new Date('2024-09-20'),
    category: 'Marketing',
    description: 'Cetak brosur & flyer',
    amount: 350000,
    payment_method: 'transfer',
    created_at: new Date('2024-09-20')
  }
]

// Dashboard Stats (calculated from above data)
export const sampleDashboardStats = {
  totalSales: 15420000,
  totalOrders: 148,
  totalCustomers: 89,
  totalIngredients: 45,
  salesGrowth: 12.5,
  ordersGrowth: 8.3,
  customersGrowth: 15.2,
  ingredientsLow: 3,
  grossProfit: 6850000,
  netProfit: 5200000,
  profitMargin: 33.7
}

// Check if we should use sample data
export const useSampleData = () => {
  return isDevelopment && process.env.NEXT_PUBLIC_USE_SAMPLE_DATA !== 'false'
}

// Get sample data or real data
export const getSampleOrRealData = <T>(sampleData: T[], realData: T[]): T[] => {
  return useSampleData() ? sampleData : realData
}

// Sample data info banner component data
export const sampleDataBanner = {
  show: useSampleData(),
  message: '🎯 Mode Development: Menggunakan sample data',
  description: 'Data ini hanya untuk development. Production akan menggunakan data real dari database.'
}
