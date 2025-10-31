// @ts-nocheck
// Shared constants and configuration

/**
 * Unit options for ingredients
 */
export const INGREDIENT_UNITS = [
  { value: 'kg', label: 'Kilogram (kg)' },
  { value: 'g', label: 'Gram (g)' },
  { value: 'l', label: 'Liter (l)' },
  { value: 'ml', label: 'Mililiter (ml)' },
  { value: 'pcs', label: 'Pieces (pcs)' },
  { value: 'dozen', label: 'Lusin (dozen)' },
] as const

/**
 * Order status options
 */
export const ORDER_STATUSES = [
  { value: 'PENDING', label: 'Menunggu', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'CONFIRMED', label: 'Dikonfirmasi', color: 'bg-blue-100 text-blue-800' },
  { value: 'IN_PROGRESS', label: 'Sedang Diproses', color: 'bg-orange-100 text-orange-800' },
  { value: 'READY', label: 'Siap Antar', color: 'bg-green-100 text-green-800' },
  { value: 'DELIVERED', label: 'Sudah Diantar', color: 'bg-emerald-100 text-emerald-800' },
  { value: 'CANCELLED', label: 'Dibatalkan', color: 'bg-red-100 text-red-800' },
] as const

/**
 * Payment status options
 */
export const PAYMENT_STATUSES = [
  { value: 'PENDING', label: 'Belum Dibayar', color: 'bg-red-100 text-red-800' },
  { value: 'PAID', label: 'Sudah Dibayar', color: 'bg-green-100 text-green-800' },
  { value: 'PARTIAL', label: 'Dibayar Sebagian', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'REFUNDED', label: 'Dikembalikan', color: 'bg-gray-100 text-gray-800' },
] as const

/**
 * Payment method options
 */
export const PAYMENT_METHODS = [
  { value: 'CASH', label: 'Tunai' },
  { value: 'BANK_TRANSFER', label: 'Transfer Bank' },
  { value: 'CREDIT_CARD', label: 'Kartu Kredit' },
  { value: 'DIGITAL_WALLET', label: 'E-Wallet' },
  { value: 'OTHER', label: 'Lainnya' },
] as const

/**
 * Recipe difficulty levels
 */
export const RECIPE_DIFFICULTIES = [
  { value: 'EASY', label: 'Mudah' },
  { value: 'MEDIUM', label: 'Sedang' },
  { value: 'HARD', label: 'Sulit' },
] as const

/**
 * Customer types
 */
export const CUSTOMER_TYPES = [
  { value: 'REGULAR', label: 'Pelanggan Biasa' },
  { value: 'VIP', label: 'VIP' },
  { value: 'WHOLESALE', label: 'Grosir' },
] as const

/**
 * Business units
 */
export const BUSINESS_UNITS = [
  { value: 'kitchen', label: 'Dapur' },
  { value: 'sales', label: 'Penjualan' },
  { value: 'inventory', label: 'Inventori' },
  { value: 'finance', label: 'Keuangan' },
  { value: 'all', label: 'Semua' },
] as const

/**
 * User roles
 */
export const USER_ROLES = [
  { value: 'super_admin', label: 'Super Admin' },
  { value: 'admin', label: 'Admin' },
  { value: 'manager', label: 'Manager' },
  { value: 'staff', label: 'Staff' },
  { value: 'viewer', label: 'Viewer' },
] as const

/**
 * Stock status thresholds
 */
export const STOCK_THRESHOLDS = {
  CRITICAL: 0,
  LOW: 0.2, // 20% of min stock
  NORMAL: 1.0, // At min stock level
  HIGH: 2.0, // Double min stock
} as const

/**
 * Pagination defaults
 */
export const PAGINATION_DEFAULTS = {
  PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
  MAX_PAGE_SIZE: 1000,
} as const

/**
 * Form validation messages (Indonesian)
 */
export const VALIDATION_MESSAGES = {
  REQUIRED: 'Field ini wajib diisi',
  INVALID_EMAIL: 'Format email tidak valid',
  INVALID_PHONE: 'Format nomor telepon tidak valid',
  MIN_LENGTH: (min: number) => `Minimal ${min} karakter`,
  MAX_LENGTH: (max: number) => `Maksimal ${max} karakter`,
  MIN_VALUE: (min: number) => `Nilai minimal ${min}`,
  MAX_VALUE: (max: number) => `Nilai maksimal ${max}`,
  INVALID_FORMAT: 'Format tidak valid',
  PASSWORD_MISMATCH: 'Password tidak cocok',
  DUPLICATE_VALUE: 'Nilai sudah digunakan',
} as const

/**
 * API response status codes
 */
export const API_STATUS = {
  SUCCESS: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const

/**
 * Local storage keys
 */
export const STORAGE_KEYS = {
  USER_PREFERENCES: 'user_preferences',
  THEME: 'theme',
  LANGUAGE: 'language',
  LAST_LOGIN: 'last_login',
  DASHBOARD_LAYOUT: 'dashboard_layout',
  RECENT_ITEMS: 'recent_items',
} as const

/**
 * File upload configuration
 */
export const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'text/plain', 'application/msword'],
  IMAGE_MAX_WIDTH: 1920,
  IMAGE_MAX_HEIGHT: 1080,
} as const

/**
 * Date format patterns
 */
export const DATE_FORMATS = {
  DISPLAY: 'dd/MM/yyyy',
  INPUT: 'yyyy-MM-dd',
  DATETIME: 'dd/MM/yyyy HH:mm',
  TIME: 'HH:mm',
  MONTH_YEAR: 'MM/yyyy',
} as const

/**
 * Currency configuration
 */
export const CURRENCY_CONFIG = {
  CODE: 'IDR',
  LOCALE: 'id-ID',
  SYMBOL: 'Rp',
  DECIMALS: 0,
} as const

/**
 * Table column configurations
 */
export const TABLE_CONFIG = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  DEBOUNCE_DELAY: 300,
  SORT_DIRECTIONS: ['asc', 'desc'] as const,
} as const

/**
 * Toast notification durations
 */
export const TOAST_DURATION = {
  SHORT: 3000,
  MEDIUM: 5000,
  LONG: 8000,
  PERSISTENT: 0,
} as const

/**
 * Modal sizes
 */
export const MODAL_SIZES = {
  SM: 'sm',
  MD: 'md',
  LG: 'lg',
  XL: 'xl',
  FULL: 'full',
} as const

/**
 * Priority levels
 */
export const PRIORITY_LEVELS = [
  { value: 'LOW', label: 'Rendah', color: 'bg-blue-100 text-blue-800' },
  { value: 'MEDIUM', label: 'Sedang', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'HIGH', label: 'Tinggi', color: 'bg-orange-100 text-orange-800' },
  { value: 'URGENT', label: 'Mendesak', color: 'bg-red-100 text-red-800' },
] as const

/**
 * Export format options
 */
export const EXPORT_FORMATS = [
  { value: 'csv', label: 'CSV', extension: '.csv' },
  { value: 'excel', label: 'Excel', extension: '.xlsx' },
  { value: 'pdf', label: 'PDF', extension: '.pdf' },
  { value: 'json', label: 'JSON', extension: '.json' },
] as const

/**
 * Theme configuration
 */
export const THEME_CONFIG = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
} as const
