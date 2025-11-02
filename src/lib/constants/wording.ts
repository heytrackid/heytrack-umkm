

/**
 * Standardized Wording & Copy
 * 
 * Consistent, user-friendly Indonesian terms throughout the app
 * Avoid technical jargon, use simple language
 */

export const WORDING = {
  // ============================================================================
  // FEATURES & PAGES
  // ============================================================================
  
  // HPP / Costing
  COST_CALCULATOR: 'Kalkulator Biaya Produksi',
  COST_REPORTS: 'Laporan Biaya',
  COST_HISTORY: 'Riwayat Biaya Harian',
  COST_ALERTS: 'Peringatan Biaya',
  COST_COMPARISON: 'Perbandingan Biaya Produk',
  PRICE_ASSISTANT: 'Asisten Penentuan Harga',
  PRICE_RECOMMENDATIONS: 'Rekomendasi Harga Jual',
  
  // Main Features
  DASHBOARD: 'Dashboard',
  INGREDIENTS: 'Bahan Baku',
  PRODUCTS: 'Produk',
  RECIPES: 'Resep', // Only for actual cooking recipes
  ORDERS: 'Pesanan',
  CUSTOMERS: 'Pelanggan',
  REPORTS: 'Laporan',
  SETTINGS: 'Pengaturan',
  
  // ============================================================================
  // COMMON TERMS
  // ============================================================================
  
  // Business Terms
  PRODUCT: 'Produk',
  COST: 'Biaya',
  PRICE: 'Harga Jual',
  PROFIT: 'Keuntungan',
  MARGIN: 'Margin Keuntungan',
  REVENUE: 'Pendapatan',
  EXPENSE: 'Pengeluaran',
  
  // Cost Components
  MATERIAL_COST: 'Biaya Bahan',
  OPERATIONAL_COST: 'Biaya Operasional',
  LABOR_COST: 'Biaya Tenaga Kerja',
  TOTAL_COST: 'Total Biaya',
  PRODUCTION_COST: 'Biaya Produksi',
  
  // Pricing
  SELLING_PRICE: 'Harga Jual',
  SUGGESTED_PRICE: 'Harga yang Disarankan',
  TARGET_PROFIT: 'Keuntungan yang Diinginkan',
  PROFIT_MARGIN: 'Margin Keuntungan',
  
  // ============================================================================
  // ACTIONS
  // ============================================================================
  
  // CRUD
  ADD: 'Tambah',
  EDIT: 'Ubah',
  DELETE: 'Hapus',
  SAVE: 'Simpan',
  CANCEL: 'Batal',
  VIEW: 'Lihat',
  SEARCH: 'Cari',
  FILTER: 'Filter',
  
  // Calculations
  CALCULATE: 'Hitung',
  RECALCULATE: 'Hitung Ulang',
  CALCULATE_ALL: 'Hitung Semua',
  
  // Data Operations
  EXPORT: 'Export',
  DOWNLOAD: 'Download',
  IMPORT: 'Import',
  REFRESH: 'Refresh',
  PRINT: 'Cetak',
  
  // Form Actions
  SUBMIT: 'Kirim',
  RESET: 'Reset',
  CLEAR: 'Bersihkan',
  APPLY: 'Terapkan',
  
  // ============================================================================
  // STATUS & STATES
  // ============================================================================
  
  // Calculation Status
  CALCULATED: 'Sudah Dihitung',
  NOT_CALCULATED: 'Belum Dihitung',
  CALCULATING: 'Sedang Menghitung',
  
  // General Status
  ACTIVE: 'Aktif',
  INACTIVE: 'Tidak Aktif',
  PENDING: 'Menunggu',
  PROCESSING: 'Diproses',
  COMPLETE: 'Selesai',
  CANCELLED: 'Dibatalkan',
  
  // Stock Status
  IN_STOCK: 'Tersedia',
  LOW_STOCK: 'Stok Rendah',
  OUT_OF_STOCK: 'Habis',
  
  // ============================================================================
  // MESSAGES
  // ============================================================================
  
  // Success Messages
  SUCCESS_SAVE: 'Data berhasil disimpan',
  SUCCESS_DELETE: 'Data berhasil dihapus',
  SUCCESS_UPDATE: 'Data berhasil diperbarui',
  SUCCESS_CALCULATE: 'Perhitungan berhasil',
  SUCCESS_EXPORT: 'Data berhasil diexport',
  
  // Error Messages
  ERROR_SAVE: 'Gagal menyimpan data',
  ERROR_DELETE: 'Gagal menghapus data',
  ERROR_UPDATE: 'Gagal memperbarui data',
  ERROR_CALCULATE: 'Gagal menghitung',
  ERROR_LOAD: 'Gagal memuat data',
  ERROR_NETWORK: 'Koneksi internet bermasalah',
  
  // Confirmation Messages
  CONFIRM_DELETE: 'Yakin ingin menghapus data ini?',
  CONFIRM_CANCEL: 'Yakin ingin membatalkan? Perubahan tidak akan disimpan.',
  CONFIRM_RESET: 'Yakin ingin mereset? Data akan kembali ke awal.',
  
  // Warning Messages
  WARNING_NO_PRICE: 'Ada bahan yang belum ada harganya',
  WARNING_LOW_STOCK: 'Stok hampir habis',
  WARNING_NO_DATA: 'Belum ada data',
  WARNING_INCOMPLETE: 'Data belum lengkap',
  
  // Info Messages
  INFO_LOADING: 'Memuat data...',
  INFO_SAVING: 'Menyimpan...',
  INFO_CALCULATING: 'Menghitung...',
  INFO_PROCESSING: 'Memproses...',
  
  // ============================================================================
  // LABELS & PLACEHOLDERS
  // ============================================================================
  
  // Form Labels
  NAME: 'Nama',
  DESCRIPTION: 'Deskripsi',
  CATEGORY: 'Kategori',
  QUANTITY: 'Jumlah',
  UNIT: 'Satuan',
  PRICE_PER_UNIT: 'Harga per Satuan',
  TOTAL: 'Total',
  DATE: 'Tanggal',
  TIME: 'Waktu',
  NOTES: 'Catatan',
  
  // Placeholders
  PLACEHOLDER_SEARCH: 'Cari...',
  PLACEHOLDER_SELECT: 'Pilih...',
  PLACEHOLDER_SELECT_PRODUCT: 'Pilih produk...',
  PLACEHOLDER_SELECT_INGREDIENT: 'Pilih bahan...',
  PLACEHOLDER_SELECT_CUSTOMER: 'Pilih pelanggan...',
  PLACEHOLDER_ENTER_NAME: 'Masukkan nama...',
  PLACEHOLDER_ENTER_PRICE: 'Masukkan harga...',
  
  // ============================================================================
  // DESCRIPTIONS & HELP TEXT
  // ============================================================================
  
  // Feature Descriptions
  DESC_COST_CALCULATOR: 'Hitung biaya produksi untuk setiap produk dengan mudah',
  DESC_PRICE_ASSISTANT: 'Dapatkan rekomendasi harga jual yang menguntungkan',
  DESC_COST_COMPARISON: 'Bandingkan biaya dan keuntungan semua produk',
  DESC_COST_HISTORY: 'Lihat perubahan biaya produksi dari waktu ke waktu',
  
  // Tooltips
  TOOLTIP_PRODUCTION_COST: 'Total biaya untuk membuat 1 porsi produk (bahan + operasional)',
  TOOLTIP_OPERATIONAL_COST: 'Biaya tambahan seperti gas, listrik, kemasan (otomatis 15% dari biaya bahan)',
  TOOLTIP_TARGET_PROFIT: 'Berapa persen keuntungan yang Anda inginkan dari setiap produk',
  TOOLTIP_SUGGESTED_PRICE: 'Harga jual yang disarankan berdasarkan biaya produksi dan target keuntungan',
  
  // Examples
  EXAMPLE_PROFIT: 'Contoh: Biaya Rp 25.000 + Untung 60% = Harga Jual Rp 40.000',
  EXAMPLE_MARGIN: 'Contoh: Harga Jual Rp 40.000 - Biaya Rp 25.000 = Untung Rp 15.000 (60%)',
  
  // ============================================================================
  // STATS & METRICS
  // ============================================================================
  
  TOTAL_PRODUCTS: 'Total Produk',
  PRODUCTS_CALCULATED: 'Produk Sudah Dihitung',
  AVERAGE_COST: 'Biaya Rata-rata',
  NEW_ALERTS: 'Peringatan Baru',
  CALCULATION_PROGRESS: 'Progress Perhitungan',
  
  // ============================================================================
  // BUTTONS & ACTIONS (Detailed)
  // ============================================================================
  
  BTN_ADD_PRODUCT: 'Tambah Produk',
  BTN_ADD_INGREDIENT: 'Tambah Bahan',
  BTN_ADD_ORDER: 'Tambah Pesanan',
  BTN_CALCULATE_COST: 'Hitung Biaya',
  BTN_CALCULATE_ALL: 'Hitung Semua Biaya',
  BTN_SET_PRICE: 'Tentukan Harga',
  BTN_USE_THIS_PRICE: 'Gunakan Harga Ini',
  BTN_ENTER_MANUALLY: 'Masukkan Harga Manual',
  BTN_VIEW_DETAILS: 'Lihat Detail Lengkap',
  BTN_DOWNLOAD_REPORT: 'Download Laporan Excel',
  BTN_MARK_ALL_READ: 'Tandai Semua Sudah Dibaca',
  BTN_UPDATE_PRICE: 'Update Harga Bahan',
  BTN_BACK: 'Kembali',
  BTN_CLOSE: 'Tutup',
  BTN_CONTINUE: 'Lanjutkan',
  
  // ============================================================================
  // STEPS & GUIDES
  // ============================================================================
  
  STEP_1: 'Langkah 1',
  STEP_2: 'Langkah 2',
  STEP_3: 'Langkah 3',
  STEP_4: 'Langkah 4',
  
  STEP_SELECT_PRODUCT: 'Pilih Produk',
  STEP_CALCULATE_COST: 'Hitung Biaya Produksi',
  STEP_SET_PRICE: 'Tentukan Harga Jual',
  STEP_VIEW_COMPARISON: 'Lihat Perbandingan',
  
  // ============================================================================
  // EMPTY STATES
  // ============================================================================
  
  EMPTY_NO_DATA: 'Belum ada data',
  EMPTY_NO_PRODUCTS: 'Belum ada produk',
  EMPTY_NO_INGREDIENTS: 'Belum ada bahan',
  EMPTY_NO_ORDERS: 'Belum ada pesanan',
  EMPTY_NO_ALERTS: 'Tidak ada peringatan baru',
  EMPTY_SELECT_PRODUCT: 'Pilih produk untuk mulai',
  
  EMPTY_DESC_PRODUCTS: 'Mulai dengan menambahkan produk pertama Anda',
  EMPTY_DESC_INGREDIENTS: 'Tambahkan bahan baku untuk mulai produksi',
  EMPTY_DESC_ORDERS: 'Belum ada pesanan masuk',
  
} as const

// Type for autocomplete
export type WordingKey = keyof typeof WORDING
