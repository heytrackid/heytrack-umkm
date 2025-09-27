export const STOCK_TRANSACTION_TYPES = {
  PURCHASE: {
    value: 'PURCHASE',
    label: 'Pembelian',
    color: 'bg-green-100 text-green-800',
    icon: 'ArrowUp',
    multiplier: 1
  },
  USAGE: {
    value: 'USAGE',
    label: 'Pemakaian',
    color: 'bg-blue-100 text-blue-800',
    icon: 'Factory',
    multiplier: -1
  },
  ADJUSTMENT: {
    value: 'ADJUSTMENT',
    label: 'Penyesuaian',
    color: 'bg-yellow-100 text-yellow-800',
    icon: 'RotateCcw',
    multiplier: 0 // Bisa positif atau negatif
  },
  WASTE: {
    value: 'WASTE',
    label: 'Terbuang',
    color: 'bg-red-100 text-red-800',
    icon: 'Trash2',
    multiplier: -1
  },
  EXPIRED: {
    value: 'EXPIRED',
    label: 'Kadaluarsa',
    color: 'bg-red-100 text-red-800',
    icon: 'AlertTriangle',
    multiplier: -1
  }
} as const

export const INVENTORY_CATEGORIES = {
  FLOUR: {
    value: 'flour',
    label: 'Tepung',
    icon: 'Package',
    color: 'bg-amber-100 text-amber-800'
  },
  DAIRY: {
    value: 'dairy',
    label: 'Susu & Dairy',
    icon: 'Milk',
    color: 'bg-blue-100 text-blue-800'
  },
  SUGAR: {
    value: 'sugar',
    label: 'Gula & Pemanis',
    icon: 'Candy',
    color: 'bg-pink-100 text-pink-800'
  },
  FAT: {
    value: 'fat',
    label: 'Lemak & Minyak',
    icon: 'Droplets',
    color: 'bg-yellow-100 text-yellow-800'
  },
  PROTEIN: {
    value: 'protein',
    label: 'Protein',
    icon: 'Egg',
    color: 'bg-orange-100 text-orange-800'
  },
  FLAVORING: {
    value: 'flavoring',
    label: 'Perisa & Pewarna',
    icon: 'Palette',
    color: 'bg-purple-100 text-purple-800'
  },
  LEAVENING: {
    value: 'leavening',
    label: 'Pengembang',
    icon: 'Wind',
    color: 'bg-green-100 text-green-800'
  },
  SPICES: {
    value: 'spices',
    label: 'Rempah & Bumbu',
    icon: 'Leaf',
    color: 'bg-emerald-100 text-emerald-800'
  },
  DECORATION: {
    value: 'decoration',
    label: 'Dekorasi',
    icon: 'Star',
    color: 'bg-indigo-100 text-indigo-800'
  },
  PACKAGING: {
    value: 'packaging',
    label: 'Kemasan',
    icon: 'Box',
    color: 'bg-gray-100 text-gray-800'
  },
  OTHER: {
    value: 'other',
    label: 'Lainnya',
    icon: 'MoreHorizontal',
    color: 'bg-slate-100 text-slate-800'
  }
} as const

export const STOCK_ALERT_THRESHOLDS = {
  CRITICAL: 0.1, // 10% dari min_stock
  WARNING: 0.3, // 30% dari min_stock
  SAFE: 1.0 // 100% dari min_stock
} as const

export const REORDER_CALCULATIONS = {
  SAFETY_STOCK_MULTIPLIER: 1.5,
  LEAD_TIME_DEFAULT_DAYS: 7,
  USAGE_CALCULATION_PERIOD_DAYS: 30,
  MIN_ORDER_QUANTITY: 1
} as const

export const INVENTORY_DISPLAY_LIMITS = {
  TRANSACTIONS_PER_PAGE: 20,
  TOP_INGREDIENTS_COUNT: 10,
  RECENT_ACTIVITIES_COUNT: 15,
  CHART_DATA_POINTS: 30
} as const

export const STOCK_UNITS = [
  { value: 'kg', label: 'Kilogram (kg)' },
  { value: 'g', label: 'Gram (g)' },
  { value: 'l', label: 'Liter (l)' },
  { value: 'ml', label: 'Milliliter (ml)' },
  { value: 'pcs', label: 'Pieces (pcs)' },
  { value: 'pack', label: 'Pack' },
  { value: 'box', label: 'Box' },
  { value: 'bag', label: 'Bag/Sack' },
  { value: 'bottle', label: 'Bottle' },
  { value: 'can', label: 'Can' }
] as const