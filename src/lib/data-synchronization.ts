/**
 * 🔄 Data Synchronization System
 * Real-time cross-module data integration for UMKM Bakery Management
 */

import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

// ===== CORE DATA INTERFACES =====

interface Ingredient {
  id: string
  nama: string
  stok: number
  satuan: string
  harga: number
  stokMinimal: number
  total: number
  statusStok: 'aman' | 'rendah' | 'habis'
  lastUpdated: Date
}

interface Recipe {
  id: string
  nama: string
  kategori: string
  porsi: number
  waktuMasak: number
  tingkatKesulitan: 'mudah' | 'sedang' | 'sulit'
  bahan: RecipeIngredient[]
  langkah: string[]
  hargaJual: number
  hpp: number
  margin: number
  catatan: string
  rating: number
  favorite: boolean
  lastUpdated: Date
}

interface RecipeIngredient {
  ingredientId: string
  nama: string
  quantity: number
  satuan: string
  harga: number
  available: boolean
}

interface Order {
  id: string
  tanggal: Date
  namaPelanggan: string
  nomorTelepon: string
  items: OrderItem[]
  totalHarga: number
  status: 'pending' | 'proses' | 'selesai' | 'batal'
  tanggalAmbil: Date
  catatan: string
  metodeBayar: 'tunai' | 'transfer' | 'kartu'
  statusBayar: 'belum' | 'dp' | 'lunas'
  lastUpdated: Date
}

interface OrderItem {
  recipeId?: string
  nama: string
  jumlah: number
  hargaSatuan: number
  subtotal: number
  ingredientsUsed?: { ingredientId: string; quantityUsed: number }[]
}

interface Customer {
  id: string
  nama: string
  nomorTelepon: string
  alamat?: string
  email?: string
  totalPembelian: number
  jumlahPesanan: number
  lastOrder: Date
  customerType: 'regular' | 'vip' | 'new'
  lastUpdated: Date
}

interface Expense {
  id: string
  tanggal: Date
  kategori: string
  deskripsi: string
  jumlah: number
  metodeBayar: 'tunai' | 'transfer' | 'kartu'
  bukti?: string
  lastUpdated: Date
}

interface Report {
  periode: string
  totalPendapatan: number
  totalPengeluaran: number
  keuntungan: number
  totalPesanan: number
  produkTerlaris: { nama: string; terjual: number }[]
  bahanKritis: string[]
  pelangganAktif: number
  marginRataRata: number
  lastGenerated: Date
}

// ===== SYNCHRONIZATION EVENTS =====

interface SyncEvent {
  type: 'ingredient_updated' | 'recipe_updated' | 'order_created' | 'order_updated' | 
        'customer_updated' | 'expense_added' | 'stock_consumed' | 'price_updated'
  payload: any
  timestamp: Date
  source: string
}

// ===== CENTRAL DATA STORE =====

interface DataStore {
  // Data
  ingredients: Ingredient[]
  recipes: Recipe[]
  orders: Order[]
  customers: Customer[]
  expenses: Expense[]
  reports: Report[]
  
  // Sync state
  syncEvents: SyncEvent[]
  lastSyncTime: Date
  isOnline: boolean
  
  // Actions
  updateIngredient: (id: string, updates: Partial<Ingredient>) => void
  addIngredient: (ingredient: Omit<Ingredient, 'id' | 'lastUpdated'>) => void
  removeIngredient: (id: string) => void
  
  updateRecipe: (id: string, updates: Partial<Recipe>) => void
  addRecipe: (recipe: Omit<Recipe, 'id' | 'lastUpdated'>) => void
  removeRecipe: (id: string) => void
  
  createOrder: (order: Omit<Order, 'id' | 'lastUpdated'>) => void
  updateOrder: (id: string, updates: Partial<Order>) => void
  cancelOrder: (id: string) => void
  
  updateCustomer: (id: string, updates: Partial<Customer>) => void
  addCustomer: (customer: Omit<Customer, 'id' | 'lastUpdated'>) => void
  
  addExpense: (expense: Omit<Expense, 'id' | 'lastUpdated'>) => void
  
  // Sync functions
  emitSyncEvent: (event: Omit<SyncEvent, 'timestamp'>) => void
  processStockConsumption: (orderItems: OrderItem[]) => void
  updateRecipeAvailability: () => void
  generateRealTimeReports: () => void
  syncCrossPlatform: () => Promise<void>
}

// ===== STORE IMPLEMENTATION =====

export const useDataStore = create<DataStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial data
    ingredients: [
      {
        id: '1',
        nama: 'Tepung Terigu',
        stok: 25,
        satuan: 'kg',
        harga: 12000,
        stokMinimal: 10,
        total: 300000,
        statusStok: 'aman',
        lastUpdated: new Date()
      },
      {
        id: '2',
        nama: 'Mentega',
        stok: 3,
        satuan: 'kg',
        harga: 45000,
        stokMinimal: 5,
        total: 135000,
        statusStok: 'rendah',
        lastUpdated: new Date()
      },
      {
        id: '3',
        nama: 'Telur',
        stok: 0,
        satuan: 'kg',
        harga: 28000,
        stokMinimal: 3,
        total: 0,
        statusStok: 'habis',
        lastUpdated: new Date()
      }
    ],
    
    recipes: [
      {
        id: '1',
        nama: 'Roti Sobek Coklat',
        kategori: 'Roti Manis',
        porsi: 8,
        waktuMasak: 45,
        tingkatKesulitan: 'mudah',
        bahan: [
          { ingredientId: '1', nama: 'Tepung Terigu', quantity: 0.5, satuan: 'kg', harga: 6000, available: true },
          { ingredientId: '2', nama: 'Mentega', quantity: 0.05, satuan: 'kg', harga: 2250, available: true }
        ],
        langkah: ['Mix ingredients', 'Knead', 'Rise', 'Bake'],
        hargaJual: 25000,
        hpp: 8250,
        margin: 67,
        catatan: 'Popular item',
        rating: 5,
        favorite: true,
        lastUpdated: new Date()
      }
    ],
    
    orders: [],
    customers: [],
    expenses: [],
    reports: [],
    
    syncEvents: [],
    lastSyncTime: new Date(),
    isOnline: true,
    
    // Ingredient actions
    updateIngredient: (id, updates) => {
      se"" => ({
        ingredients: state.ingredients.map(ing => 
          ing.id === id 
            ? { ...ing, ...updates, lastUpdated: new Date() }
            : ing
        )
      }))
      
      // Emit sync event
      ge"".emitSyncEvent({
        type: 'ingredient_updated',
        payload: { id, updates },
        source: 'inventory'
      })
      
      // Update recipe availability
      ge"".updateRecipeAvailability()
    },
    
    addIngredient: (ingredient) => {
      const newIngredient = {
        ...ingredient,
        id: Date.now().toString(),
        lastUpdated: new Date()
      }
      
      se"" => ({
        ingredients: [...state.ingredients, newIngredient]
      }))
    },
    
    removeIngredient: (id) => {
      se"" => ({
        ingredients: state.ingredients.filter(ing => ing.id !== id)
      }))
      
      ge"".updateRecipeAvailability()
    },
    
    // Recipe actions
    updateRecipe: (id, updates) => {
      se"" => ({
        recipes: state.recipes.map(recipe => 
          recipe.id === id 
            ? { ...recipe, ...updates, lastUpdated: new Date() }
            : recipe
        )
      }))
      
      ge"".emitSyncEvent({
        type: 'recipe_updated',
        payload: { id, updates },
        source: 'recipes'
      })
    },
    
    addRecipe: (recipe) => {
      const newRecipe = {
        ...recipe,
        id: Date.now().toString(),
        lastUpdated: new Date()
      }
      
      se"" => ({
        recipes: [...state.recipes, newRecipe]
      }))
    },
    
    removeRecipe: (id) => {
      se"" => ({
        recipes: state.recipes.filter(recipe => recipe.id !== id)
      }))
    },
    
    // Order actions
    createOrder: (order) => {
      const newOrder = {
        ...order,
        id: Date.now().toString(),
        lastUpdated: new Date()
      }
      
      se"" => ({
        orders: [...state.orders, newOrder]
      }))
      
      // Process stock consumption
      ge"".processStockConsumption(newOrder.items)
      
      // Update customer data
      const customer = ge"".customers.find(c => c.nomorTelepon === newOrder.nomorTelepon)
      if (customer) {
        ge"".updateCustomer(customer.id, {
          totalPembelian: customer.totalPembelian + newOrder.totalHarga,
          jumlahPesanan: customer.jumlahPesanan + 1,
          lastOrder: new Date()
        })
      } else {
        ge"".addCustomer({
          nama: newOrder.namaPelanggan,
          nomorTelepon: newOrder.nomorTelepon,
          totalPembelian: newOrder.totalHarga,
          jumlahPesanan: 1,
          lastOrder: new Date(),
          customerType: 'new'
        })
      }
      
      ge"".emitSyncEvent({
        type: 'order_created',
        payload: newOrder,
        source: 'orders'
      })
      
      ge"".generateRealTimeReports()
    },
    
    updateOrder: (id, updates) => {
      se"" => ({
        orders: state.orders.map(order => 
          order.id === id 
            ? { ...order, ...updates, lastUpdated: new Date() }
            : order
        )
      }))
      
      ge"".emitSyncEvent({
        type: 'order_updated',
        payload: { id, updates },
        source: 'orders'
      })
      
      ge"".generateRealTimeReports()
    },
    
    cancelOrder: (id) => {
      const order = ge"".orders.find(o => o.id === id)
      if (order) {
        // Restore stock if order was processed
        if (order.status === 'proses') {
          // Restore ingredients used
          order.items.forEach(item => {
            if (item.ingredientsUsed) {
              item.ingredientsUsed.forEach(ingredient => {
                const currentStock = ge"".ingredients.find(ing => ing.id === ingredient.ingredientId)
                if (currentStock) {
                  ge"".updateIngredient(ingredient.ingredientId, {
                    stok: currentStock.stok + ingredient.quantityUsed
                  })
                }
              })
            }
          })
        }
        
        ge"".updateOrder(id, { status: 'batal' })
      }
    },
    
    // Customer actions
    updateCustomer: (id, updates) => {
      se"" => ({
        customers: state.customers.map(customer => 
          customer.id === id 
            ? { ...customer, ...updates, lastUpdated: new Date() }
            : customer
        )
      }))
      
      ge"".emitSyncEvent({
        type: 'customer_updated',
        payload: { id, updates },
        source: 'customers'
      })
    },
    
    addCustomer: (customer) => {
      const newCustomer = {
        ...customer,
        id: Date.now().toString(),
        lastUpdated: new Date()
      }
      
      se"" => ({
        customers: [...state.customers, newCustomer]
      }))
    },
    
    // Expense actions
    addExpense: (expense) => {
      const newExpense = {
        ...expense,
        id: Date.now().toString(),
        lastUpdated: new Date()
      }
      
      se"" => ({
        expenses: [...state.expenses, newExpense]
      }))
      
      ge"".emitSyncEvent({
        type: 'expense_added',
        payload: newExpense,
        source: 'expenses'
      })
      
      ge"".generateRealTimeReports()
    },
    
    // Sync functions
    emitSyncEvent: (event) => {
      const syncEvent: SyncEvent = {
        ...event,
        timestamp: new Date()
      }
      
      se"" => ({
        syncEvents: [...state.syncEvents.slice(-99), syncEvent], // Keep last 100 events
        lastSyncTime: new Date()
      }))
    },
    
    processStockConsumption: (orderItems) => {
      const { ingredients, recipes } = ge""
      
      orderItems.forEach(item => {
        // Find matching recipe
        const recipe = recipes.find(r => r.nama === item.nama)
        if (recipe) {
          // Calculate ingredients used based on quantity ordered
          const multiplier = item.jumlah / recipe.porsi
          
          recipe.bahan.forEach(ingredient => {
            const quantityUsed = ingredient.quantity * multiplier
            const currentStock = ingredients.find(ing => ing.id === ingredient.ingredientId)
            
            if (currentStock && currentStock.stok >= quantityUsed) {
              ge"".updateIngredient(ingredient.ingredientId, {
                stok: Math.max(0, currentStock.stok - quantityUsed)
              })
              
              // Track ingredients used for potential order cancellation
              if (!item.ingredientsUsed) {
                item.ingredientsUsed = []
              }
              item.ingredientsUsed.push({
                ingredientId: ingredient.ingredientId,
                quantityUsed
              })
            }
          })
        }
      })
      
      ge"".emitSyncEvent({
        type: 'stock_consumed',
        payload: { orderItems },
        source: 'auto-consumption'
      })
    },
    
    updateRecipeAvailability: () => {
      const { ingredients, recipes } = ge""
      
      recipes.forEach(recipe => {
        const updatedBahan = recipe.bahan.map(ingredient => {
          const currentStock = ingredients.find(ing => ing.id === ingredient.ingredientId)
          return {
            ...ingredient,
            available: currentStock ? currentStock.stok >= ingredient.quantity : false
          }
        })
        
        ge"".updateRecipe(recipe.id, { bahan: updatedBahan })
      })
    },
    
    generateRealTimeReports: () => {
      const { orders, expenses, ingredients, customers } = ge""
      const now = new Date()
      const thisMonth = now.getMonth()
      const thisYear = now.getFullYear()
      
      // Filter this month's data
      const monthlyOrders = orders.filter(order => {
        const orderDate = new Date(order.tanggal)
        return orderDate.getMonth() === thisMonth && 
               orderDate.getFullYear() === thisYear &&
               order.status !== 'batal'
      })
      
      const monthlyExpenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.tanggal)
        return expenseDate.getMonth() === thisMonth && 
               expenseDate.getFullYear() === thisYear
      })
      
      // Calculate metrics
      const totalPendapatan = monthlyOrders.reduce((sum, order) => sum + order.totalHarga, 0)
      const totalPengeluaran = monthlyExpenses.reduce((sum, expense) => sum + expense.jumlah, 0)
      const keuntungan = totalPendapatan - totalPengeluaran
      
      // Product sales analysis
      const productSales: Record<string, number> = {}
      monthlyOrders.forEach(order => {
        order.items.forEach(item => {
          productSales[item.nama] = (productSales[item.nama] || 0) + item.jumlah
        })
      })
      
      const produkTerlaris = Object.entries(productSales)
        .map(([nama, terjual]) => ({ nama, terjual }))
        .sor"" => b.terjual - a.terjual)
        .slice(0, 5)
      
      // Critical ingredients
      const bahanKritis = ingredients
        .filter(ing => ing.statusStok === 'habis' || ing.statusStok === 'rendah')
        .map(ing => ing.nama)
      
      const report: Report = {
        periode: `${thisYear}-${(thisMonth + 1).toString().padStar""}`,
        totalPendapatan,
        totalPengeluaran,
        keuntungan,
        totalPesanan: monthlyOrders.length,
        produkTerlaris,
        bahanKritis,
        pelangganAktif: customers.filter(c => {
          const lastOrderDate = new Date(c.lastOrder)
          const daysSinceLastOrder = (now.getTime() - lastOrderDate.getTime()) / (1000 * 3600 * 24)
          return daysSinceLastOrder <= 30
        }).length,
        marginRataRata: totalPendapatan > 0 ? (keuntungan / totalPendapatan) * 100 : 0,
        lastGenerated: now
      }
      
      se"" => ({
        reports: [report, ...state.reports.filter(r => r.periode !== report.periode)]
      }))
    },
    
    syncCrossPlatform: async () => {
      // Placeholder for cross-platform synchronization
      // In a real implementation, this would sync with external APIs, cloud storage, etc.
      console.log('Syncing data across platforms...', {
        ingredients: ge"".ingredients.length,
        recipes: ge"".recipes.length,
        orders: ge"".orders.length,
        events: ge"".syncEvents.length
      })
      
      return Promise.resolve()
    }
  }))
)

// ===== REAL-TIME SYNC HOOKS =====

export const useRealTimeSync = () => {
  const store = useDataStore()
  
  // Subscribe to sync events for real-time updates
  useDataStore.subscribe(
    (state) => state.syncEvents,
    (events) => {
      if (events.length > 0) {
        const latestEvent = events[events.length - 1]
        console.log('Sync event:', latestEvent)
        
        // Trigger cross-platform sync for important events
        if (['order_created', 'ingredient_updated', 'stock_consumed'].includes(latestEvent.type)) {
          store.syncCrossPlatform()
        }
      }
    }
  )
  
  return {
    isOnline: store.isOnline,
    lastSyncTime: store.lastSyncTime,
    syncEvents: store.syncEvents,
    syncNow: store.syncCrossPlatform
  }
}

// ===== UTILITY FUNCTIONS =====

export const getIngredientStatus = (ingredient: Ingredient): {
  status: string
  color: string
  action: string
} => {
  if (ingredient.statusStok === 'habis') {
    return {
      status: 'Habis',
      color: 'text-gray-500 bg-gray-300 dark:text-gray-400 dark:bg-gray-600',
      action: 'Segera restock!'
    }
  }
  
  if (ingredient.statusStok === 'rendah') {
    return {
      status: 'Rendah',
      color: 'text-gray-600 bg-gray-200 dark:text-gray-300 dark:bg-gray-700',
      action: 'Perlu diisi ulang'
    }
  }
  
  return {
    status: 'Aman',
    color: 'text-gray-700 bg-gray-100 dark:text-gray-200 dark:bg-gray-800',
    action: 'Stock sufficient'
  }
}

export const getRecipeAvailability = (recipe: Recipe): {
  available: boolean
  missingIngredients: string[]
  canMake: number
} => {
  const missingIngredients: string[] = []
  let maxPortions = Infinity
  
  recipe.bahan.forEach(ingredient => {
    if (!ingredient.available) {
      missingIngredients.push(ingredient.nama)
      maxPortions = 0
    } else {
      // Calculate how many portions we can make with current stock
      const currentStock = useDataStore.getState().ingredients.find(ing => ing.id === ingredient.ingredientId)
      if (currentStock) {
        const possiblePortions = Math.floor(currentStock.stok / ingredient.quantity) * recipe.porsi
        maxPortions = Math.min(maxPortions, possiblePortions)
      }
    }
  })
  
  return {
    available: missingIngredients.length === 0,
    missingIngredients,
    canMake: maxPortions === Infinity ? 0 : Math.floor(maxPortions)
  }
}

export type {
  Ingredient,
  Recipe,
  RecipeIngredient,
  Order,
  OrderItem,
  Customer,
  Expense,
  Report,
  SyncEvent
}