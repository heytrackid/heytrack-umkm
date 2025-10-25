// Data Store - Zustand Implementation
// Central data store with CRUD operations for all entities

import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

import { dbLogger } from '@/lib/logger'
import type {
  Ingredient,
  Recipe,
  Order,
  OrderItem,
  Customer,
  Expense,
  Report,
  SyncEvent
} from './types'
import { syncEmitter } from './sync-events'

// Initial data for demo purposes
const initialIngredients: Ingredient[] = [
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
]

const initialRecipes: Recipe[] = [
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
]

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

export const useDataStore = create<DataStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial data
    ingredients: initialIngredients,
    recipes: initialRecipes,
    orders: [],
    customers: [],
    expenses: [],
    reports: [],

    syncEvents: [],
    lastSyncTime: new Date(),
    isOnline: true,

    // Ingredient actions
    updateIngredient: (id, updates) => {
      set((state) => ({
        ingredients: state.ingredients.map(ing =>
          ing.id === id
            ? { ...ing, ...updates, lastUpdated: new Date() }
            : ing
        )
      }))

      // Emit sync event
      get().emitSyncEvent({
        type: 'ingredient_updated',
        payload: { id, updates },
        source: 'inventory'
      })

      // Update recipe availability
      get().updateRecipeAvailability()
    },

    addIngredient: (ingredient) => {
      const newIngredient = {
        ...ingredient,
        id: Date.now().toString(),
        lastUpdated: new Date()
      }

      set((state) => ({
        ingredients: [...state.ingredients, newIngredient]
      }))
    },

    removeIngredient: (id) => {
      set((state) => ({
        ingredients: state.ingredients.filter(ing => ing.id !== id)
      }))

      get().updateRecipeAvailability()
    },

    // Recipe actions
    updateRecipe: (id, updates) => {
      set((state) => ({
        recipes: state.recipes.map(recipe =>
          recipe.id === id
            ? { ...recipe, ...updates, lastUpdated: new Date() }
            : recipe
        )
      }))

      get().emitSyncEvent({
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

      set((state) => ({
        recipes: [...state.recipes, newRecipe]
      }))
    },

    removeRecipe: (id) => {
      set((state) => ({
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

      set((state) => ({
        orders: [...state.orders, newOrder]
      }))

      // Process stock consumption
      get().processStockConsumption(newOrder.items)

      // Update customer data
      const customer = get().customers.find(c => c.nomorTelepon === newOrder.nomorTelepon)
      if (customer) {
        get().updateCustomer(customer.id, {
          totalPembelian: customer.totalPembelian + newOrder.totalHarga,
          jumlahPesanan: customer.jumlahPesanan + 1,
          lastOrder: new Date()
        })
      } else {
        get().addCustomer({
          nama: newOrder.namaPelanggan,
          nomorTelepon: newOrder.nomorTelepon,
          totalPembelian: newOrder.totalHarga,
          jumlahPesanan: 1,
          lastOrder: new Date(),
          customerType: 'new'
        })
      }

      get().emitSyncEvent({
        type: 'order_created',
        payload: newOrder,
        source: 'orders'
      })

      get().generateRealTimeReports()
    },

    updateOrder: (id, updates) => {
      set((state) => ({
        orders: state.orders.map(order =>
          order.id === id
            ? { ...order, ...updates, lastUpdated: new Date() }
            : order
        )
      }))

      get().emitSyncEvent({
        type: 'order_updated',
        payload: { id, updates },
        source: 'orders'
      })

      get().generateRealTimeReports()
    },

    cancelOrder: (id) => {
      const order = get().orders.find(o => o.id === id)
      if (order) {
        // Restore stock if order was processed
        if (order.status === 'proses') {
          // Restore ingredients used
          order.items.forEach(item => {
            if (item.ingredientsUsed) {
              item.ingredientsUsed.forEach(ingredient => {
                const currentStock = get().ingredients.find(ing => ing.id === ingredient.ingredientId)
                if (currentStock) {
                  get().updateIngredient(ingredient.ingredientId, {
                    stok: currentStock.stok + ingredient.quantityUsed
                  })
                }
              })
            }
          })
        }

        get().updateOrder(id, { status: 'batal' })
      }
    },

    // Customer actions
    updateCustomer: (id, updates) => {
      set((state) => ({
        customers: state.customers.map(customer =>
          customer.id === id
            ? { ...customer, ...updates, lastUpdated: new Date() }
            : customer
        )
      }))

      get().emitSyncEvent({
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

      set((state) => ({
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

      set((state) => ({
        expenses: [...state.expenses, newExpense]
      }))

      get().emitSyncEvent({
        type: 'expense_added',
        payload: newExpense,
        source: 'expenses'
      })

      get().generateRealTimeReports()
    },

    // Sync functions
    emitSyncEvent: (event) => {
      const syncEvent: SyncEvent = {
        ...event,
        timestamp: new Date()
      }

      set((state) => ({
        syncEvents: [...state.syncEvents.slice(-99), syncEvent], // Keep last 100 events
        lastSyncTime: new Date()
      }))

      // Also emit through the event emitter
      syncEmitter.emit(event.type as any, event.payload, event.source)
    },

    processStockConsumption: (orderItems) => {
      const { ingredients, recipes } = get()

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
              get().updateIngredient(ingredient.ingredientId, {
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

      get().emitSyncEvent({
        type: 'stock_consumed',
        payload: { orderItems },
        source: 'auto-consumption'
      })
    },

    updateRecipeAvailability: () => {
      const { ingredients, recipes } = get()

      recipes.forEach(recipe => {
        const updatedBahan = recipe.bahan.map(ingredient => {
          const currentStock = ingredients.find(ing => ing.id === ingredient.ingredientId)
          return {
            ...ingredient,
            available: currentStock ? currentStock.stok >= ingredient.quantity : false
          }
        })

        get().updateRecipe(recipe.id, { bahan: updatedBahan })
      })
    },

    generateRealTimeReports: () => {
      const { orders, expenses, ingredients, customers } = get()
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
        .sort((a, b) => b.terjual - a.terjual)
        .slice(0, 5)

      // Critical ingredients
      const bahanKritis = ingredients
        .filter(ing => ing.statusStok === 'habis' || ing.statusStok === 'rendah')
        .map(ing => ing.nama)

      const report: Report = {
        periode: `${thisYear}-${(thisMonth + 1).toString().padStart(2, '0')}`,
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

      set((state) => ({
        reports: [report, ...state.reports.filter(r => r.periode !== report.periode)]
      }))
    },

    syncCrossPlatform: async () => {
      // Placeholder for cross-platform synchronization
      // In a real implementation, this would sync with external APIs, cloud storage, etc.
      dbLogger.info('Syncing data across platforms...', {
        ingredients: get().ingredients.length,
        recipes: get().recipes.length,
        orders: get().orders.length,
        events: get().syncEvents.length
      })

      return Promise.resolve()
    }
  }))
)
