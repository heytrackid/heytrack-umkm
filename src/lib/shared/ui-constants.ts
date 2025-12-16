/**
 * UI Constants - Single source of truth for UI elements
 */

// Icon names commonly used across the app
export const ICONS = {
  // Navigation
  HOME: 'Home',
  SETTINGS: 'Settings',
  LOGOUT: 'LogOut',
  USER: 'User',
  USERS: 'Users',
  
  // Actions
  ADD: 'Plus',
  EDIT: 'Edit',
  DELETE: 'Trash2',
  SAVE: 'Save',
  CANCEL: 'X',
  CLOSE: 'X',
  CHECK: 'Check',
  SEARCH: 'Search',
  FILTER: 'Filter',
  DOWNLOAD: 'Download',
  UPLOAD: 'Upload',
  REFRESH: 'RefreshCw',
  
  // Data
  MONEY: 'DollarSign',
  CHART: 'BarChart3',
  TREND_UP: 'TrendingUp',
  TREND_DOWN: 'TrendingDown',
  CLOCK: 'Clock',
  CALENDAR: 'Calendar',
  
  // Business
  BOX: 'Package',
  TRUCK: 'Truck',
  RECEIPT: 'Receipt',
  INVOICE: 'FileText',
  SHOPPING_CART: 'ShoppingCart',
  
  // Status
  SUCCESS: 'CheckCircle',
  WARNING: 'AlertTriangle',
  ERROR: 'XCircle',
  INFO: 'Info',
  
  // Communication
  EMAIL: 'Mail',
  PHONE: 'Phone',
  MESSAGE: 'MessageSquare',
  NOTIFICATION: 'Bell',
  
  // Food & Kitchen
  CHEF_HAT: 'ChefHat',
  UTENSILS: 'Utensils',
  PLATE: 'UtensilsCrossed',
  APPLE: 'Apple',
  
  // Others
  STAR: 'Star',
  HEART: 'Heart',
  BOOKMARK: 'Bookmark',
  SHARE: 'Share2',
  COPY: 'Copy',
  EYE: 'Eye',
  EYE_OFF: 'EyeOff',
  MORE: 'MoreVertical',
  CHEVRON_LEFT: 'ChevronLeft',
  CHEVRON_RIGHT: 'ChevronRight',
  CHEVRON_UP: 'ChevronUp',
  CHEVRON_DOWN: 'ChevronDown'
} as const

// Toast messages
export const TOAST_MESSAGES = {
  // Success messages
  SAVE_SUCCESS: 'Data berhasil disimpan',
  UPDATE_SUCCESS: 'Data berhasil diperbarui',
  DELETE_SUCCESS: 'Data berhasil dihapus',
  CREATE_SUCCESS: 'Data berhasil dibuat',
  UPLOAD_SUCCESS: 'File berhasil diunggah',
  DOWNLOAD_SUCCESS: 'File berhasil diunduh',
  
  // Error messages
  SAVE_ERROR: 'Gagal menyimpan data',
  UPDATE_ERROR: 'Gagal memperbarui data',
  DELETE_ERROR: 'Gagal menghapus data',
  CREATE_ERROR: 'Gagal membuat data',
  UPLOAD_ERROR: 'Gagal mengunggah file',
  DOWNLOAD_ERROR: 'Gagal mengunduh file',
  NETWORK_ERROR: 'Terjadi kesalahan jaringan',
  SERVER_ERROR: 'Terjadi kesalahan server',
  
  // Validation messages
  REQUIRED: 'Field ini wajib diisi',
  INVALID_EMAIL: 'Format email tidak valid',
  INVALID_PHONE: 'Format nomor telepon tidak valid',
  MIN_LENGTH: (min: number) => `Minimal ${min} karakter`,
  MAX_LENGTH: (max: number) => `Maksimal ${max} karakter`,
  
  // Status messages
  LOADING: 'Memuat data...',
  SAVING: 'Menyimpan...',
  UPDATING: 'Memperbarui...',
  DELETING: 'Menghapus...',
  PROCESSING: 'Memproses...',
  
  // Specific feature messages
  RECIPE_GENERATED: 'Resep berhasil dibuat!',
  RECIPE_SAVED: 'Resep berhasil disimpan!',
  ORDER_CREATED: 'Pesanan berhasil dibuat',
  ORDER_UPDATED: 'Status pesanan diperbarui',
  PAYMENT_SUCCESS: 'Pembayaran berhasil',
  INVENTORY_UPDATED: 'Stok berhasil diperbarui',
  
  // Generic
  SUCCESS: 'Berhasil',
  ERROR: 'Terjadi kesalahan',
  WARNING: 'Perhatian',
  INFO: 'Informasi'
} as const

// Form field labels
export const FORM_LABELS = {
  // Common
  NAME: 'Nama',
  EMAIL: 'Email',
  PHONE: 'Nomor Telepon',
  ADDRESS: 'Alamat',
  DESCRIPTION: 'Deskripsi',
  NOTES: 'Catatan',
  STATUS: 'Status',
  CATEGORY: 'Kategori',
  DATE: 'Tanggal',
  TIME: 'Waktu',
  
  // Business
  PRICE: 'Harga',
  QUANTITY: 'Jumlah',
  UNIT: 'Satuan',
  TOTAL: 'Total',
  DISCOUNT: 'Diskon',
  TAX: 'Pajak',
  
  // Customer
  CUSTOMER_NAME: 'Nama Pelanggan',
  CUSTOMER_TYPE: 'Tipe Pelanggan',
  
  // Product/Recipe
  PRODUCT_NAME: 'Nama Produk',
  RECIPE_NAME: 'Nama Resep',
  SERVINGS: 'Porsi',
  PREP_TIME: 'Waktu Persiapan',
  COOK_TIME: 'Waktu Masak',
  DIFFICULTY: 'Kesulitan',
  
  // Order
  ORDER_NUMBER: 'Nomor Pesanan',
  ORDER_DATE: 'Tanggal Pesanan',
  DELIVERY_DATE: 'Tanggal Pengiriman',
  PAYMENT_METHOD: 'Metode Pembayaran',
  PAYMENT_STATUS: 'Status Pembayaran',
  
  // Inventory
  INGREDIENT: 'Bahan Baku',
  STOCK: 'Stok',
  MIN_STOCK: 'Stok Minimum',
  SUPPLIER: 'Pemasok',
  
  // Authentication
  USERNAME: 'Username',
  PASSWORD: 'Password',
  CONFIRM_PASSWORD: 'Konfirmasi Password',
  ROLE: 'Role',
  
  // Placeholders
  SEARCH_PLACEHOLDER: 'Cari...',
  SELECT_PLACEHOLDER: 'Pilih...',
  TYPE_HERE: 'Ketik di sini...'
} as const

// Loading states text
export const LOADING_TEXTS = {
  // Generic
  LOADING: 'Memuat...',
  SAVING: 'Menyimpan...',
  UPDATING: 'Memperbarui...',
  DELETING: 'Menghapus...',
  PROCESSING: 'Memproses...',
  
  // Specific actions
  GENERATING: 'Membuat...',
  UPLOADING: 'Mengunggah...',
  DOWNLOADING: 'Mengunduh...',
  SYNCING: 'Sinkronisasi...',
  VALIDATING: 'Memvalidasi...',
  
  // With context
  LOADING_DATA: 'Memuat data...',
  SAVING_DATA: 'Menyimpan data...',
  UPDATING_DATA: 'Memperbarui data...',
  DELETING_DATA: 'Menghapus data...',
  
  // Features
  GENERATING_RECIPE: 'Membuat resep...',
  SAVING_RECIPE: 'Menyimpan resep...',
  CREATING_ORDER: 'Membuat pesanan...',
  UPDATING_ORDER: 'Memperbarui pesanan...',
  CALCULATING_PRICE: 'Menghitung harga...',
  CHECKING_STOCK: 'Memeriksa stok...',
  
  // Time-based
  PLEASE_WAIT: 'Mohon tunggu...',
  THIS_MAY_TAKE: 'Proses ini mungkin memakan waktu beberapa saat',
  ALMOST_DONE: 'Hampir selesai...',
  
  // Errors
  FAILED_TO_LOAD: 'Gagal memuat data',
  FAILED_TO_SAVE: 'Gagal menyimpan data',
  TIMEOUT: 'Waktu habis, coba lagi'
} as const

// Button variants with consistent text
export const BUTTON_TEXTS = {
  // Actions
  ADD: 'Tambah',
  EDIT: 'Edit',
  SAVE: 'Simpan',
  DELETE: 'Hapus',
  CANCEL: 'Batal',
  CLOSE: 'Tutup',
  CONFIRM: 'Konfirmasi',
  SUBMIT: 'Kirim',
  RESET: 'Reset',
  CLEAR: 'Hapus',
  
  // Navigation
  BACK: 'Kembali',
  NEXT: 'Lanjut',
  PREVIOUS: 'Sebelumnya',
  FINISH: 'Selesai',
  
  // States
  LOADING: 'Memuat...',
  SAVING: 'Menyimpan...',
  PROCESSING: 'Memproses...',
  
  // Specific
  GENERATE: 'Buat',
  DOWNLOAD: 'Unduh',
  UPLOAD: 'Unggah',
  SEARCH: 'Cari',
  FILTER: 'Filter',
  SORT: 'Urutkan',
  REFRESH: 'Refresh',
  VIEW: 'Lihat',
  SELECT: 'Pilih',
  
  // Modifiers
  ADD_NEW: 'Tambah Baru',
  CREATE_NEW: 'Buat Baru',
  SAVE_CHANGES: 'Simpan Perubahan',
  DELETE_SELECTED: 'Hapus yang Dipilih',
  SELECT_ALL: 'Pilih Semua',
  CLEAR_ALL: 'Hapus Semua'
} as const

// Helper functions for dynamic messages
export const getToastMessage = (key: keyof typeof TOAST_MESSAGES, ...args: unknown[]): string => {
  const message = TOAST_MESSAGES[key]
  if (typeof message === 'function') {
    return (message as (...args: unknown[]) => string)(...args)
  }
  return message as string
}

export const getLoadingText = (key: keyof typeof LOADING_TEXTS): string => {
  return LOADING_TEXTS[key]
}

export const getFormLabel = (key: keyof typeof FORM_LABELS): string => {
  return FORM_LABELS[key]
}

export const getButtonText = (key: keyof typeof BUTTON_TEXTS): string => {
  return BUTTON_TEXTS[key]
}

export const getIconName = (key: keyof typeof ICONS): string => {
  return ICONS[key]
}
