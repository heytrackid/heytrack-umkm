/**
 * Data Synchronization Types
 * Legacy types for synchronization system with Indonesian naming
 * 
 * NOTE: These are transformation types for sync operations.
 * For database operations, use types from @/types instead.
 */

import type {
  Ingredient as DbIngredient,
  Recipe as DbRecipe,
  RecipeIngredient as DbRecipeIngredient,
  Order as DbOrder,
  Customer as DbCustomer,
} from '@/types'

/**
 * Ingredient sync format (Indonesian naming for legacy compatibility)
 * Maps to database Ingredient type
 */
export interface Ingredient {
  id: string
  nama: string // maps to name
  stok: number // maps to current_stock
  satuan: string // maps to unit
  harga: number // maps to price_per_unit
  stokMinimal: number // maps to minimum_stock
  total: number // calculated field
  statusStok: 'aman' | 'rendah' | 'habis' // calculated from stock levels
  lastUpdated: Date // maps to updated_at
}

/**
 * Recipe sync format (Indonesian naming for legacy compatibility)
 * Maps to database Recipe type
 */
export interface Recipe {
  id: string
  nama: string // maps to name
  kategori: string // maps to category
  porsi: number // maps to servings
  waktuMasak: number // maps to preparation_time
  tingkatKesulitan: 'mudah' | 'sedang' | 'sulit' // maps to difficulty_level
  bahan: RecipeIngredient[] // maps to recipe_ingredients
  langkah: string[] // maps to instructions (parsed)
  hargaJual: number // maps to selling_price
  hpp: number // calculated
  margin: number // calculated
  catatan: string // maps to notes
  rating: number // custom field
  favorite: boolean // custom field
  lastUpdated: Date // maps to updated_at
}

/**
 * Recipe ingredient sync format
 * Maps to database RecipeIngredient type
 */
export interface RecipeIngredient {
  ingredientId: string // maps to ingredient_id
  nama: string // from ingredient.name
  quantity: number // maps to quantity
  satuan: string // from ingredient.unit
  harga: number // from ingredient.price_per_unit
  available: boolean // calculated from stock
}

/**
 * Order sync format (Indonesian naming for legacy compatibility)
 * Maps to database Order type
 */
export interface Order {
  id: string
  tanggal: Date // maps to order_date
  namaPelanggan: string // from customer.name
  nomorTelepon: string // from customer.phone
  items: OrderItem[] // maps to order_items
  totalHarga: number // maps to total_amount
  status: 'pending' | 'proses' | 'selesai' | 'batal' // maps to status
  tanggalAmbil: Date // maps to delivery_date
  catatan: string // maps to notes
  metodeBayar: 'tunai' | 'transfer' | 'kartu' // maps to payment_method
  statusBayar: 'belum' | 'dp' | 'lunas' // maps to payment_status
  lastUpdated: Date // maps to updated_at
}

/**
 * Order item sync format
 * Maps to database OrderItem type
 */
export interface OrderItem {
  recipeId?: string // maps to recipe_id
  nama: string // maps to product_name
  jumlah: number // maps to quantity
  hargaSatuan: number // maps to unit_price
  subtotal: number // maps to total_price
  ingredientsUsed?: Array<{ ingredientId: string; quantityUsed: number }> // custom tracking
}

/**
 * Customer sync format (Indonesian naming for legacy compatibility)
 * Maps to database Customer type
 */
export interface Customer {
  id: string
  nama: string // maps to name
  nomorTelepon: string // maps to phone
  alamat?: string // maps to address
  email?: string // maps to email
  totalPembelian: number // maps to total_purchases
  jumlahPesanan: number // maps to total_orders
  lastOrder: Date // maps to last_order_date
  customerType: 'regular' | 'vip' | 'new' // maps to customer_type
  lastUpdated: Date // maps to updated_at
}

/**
 * Expense sync format (Indonesian naming for legacy compatibility)
 * Maps to database Expense type
 */
export interface Expense {
  id: string
  tanggal: Date // maps to expense_date
  kategori: string // maps to category
  deskripsi: string // maps to description
  jumlah: number // maps to amount
  metodeBayar: 'tunai' | 'transfer' | 'kartu' // maps to payment_method
  bukti?: string // maps to receipt_number
  lastUpdated: Date // maps to updated_at
}

/**
 * Report sync format
 * Aggregated data for reporting
 */
export interface Report {
  periode: string
  totalPendapatan: number
  totalPengeluaran: number
  keuntungan: number
  totalPesanan: number
  produkTerlaris: Array<{ nama: string; terjual: number }>
  bahanKritis: string[]
  pelangganAktif: number
  marginRataRata: number
  lastGenerated: Date
}

/**
 * Sync event for tracking data changes
 */
export interface SyncEvent {
  type:
    | 'ingredient_updated'
    | 'recipe_updated'
    | 'order_created'
    | 'order_updated'
    | 'customer_updated'
    | 'expense_added'
    | 'stock_consumed'
    | 'price_updated'
  payload: unknown
  timestamp: Date
  source: string
}

/**
 * Type mappers for converting between sync format and database format
 */
export interface SyncToDbMapper {
  ingredient: (sync: Ingredient) => Partial<DbIngredient>
  recipe: (sync: Recipe) => Partial<DbRecipe>
  order: (sync: Order) => Partial<DbOrder>
  customer: (sync: Customer) => Partial<DbCustomer>
}

export interface DbToSyncMapper {
  ingredient: (db: DbIngredient) => Ingredient
  recipe: (db: DbRecipe) => Recipe
  order: (db: DbOrder) => Order
  customer: (db: DbCustomer) => Customer
}
