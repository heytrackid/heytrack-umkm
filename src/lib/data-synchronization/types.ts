// Data Synchronization Types
// Core data interfaces for the synchronization system

export interface Ingredient {
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

export interface Recipe {
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

export interface RecipeIngredient {
  ingredientId: string
  nama: string
  quantity: number
  satuan: string
  harga: number
  available: boolean
}

export interface Order {
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

export interface OrderItem {
  recipeId?: string
  nama: string
  jumlah: number
  hargaSatuan: number
  subtotal: number
  ingredientsUsed?: { ingredientId: string; quantityUsed: number }[]
}

export interface Customer {
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

export interface Expense {
  id: string
  tanggal: Date
  kategori: string
  deskripsi: string
  jumlah: number
  metodeBayar: 'tunai' | 'transfer' | 'kartu'
  bukti?: string
  lastUpdated: Date
}

export interface Report {
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

export interface SyncEvent {
  type: 'ingredient_updated' | 'recipe_updated' | 'order_created' | 'order_updated' |
        'customer_updated' | 'expense_added' | 'stock_consumed' | 'price_updated'
  payload: unknown
  timestamp: Date
  source: string
}
