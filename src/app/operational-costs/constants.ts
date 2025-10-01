// Operational Costs Constants
export interface OperationalCost {
  id: string
  name: string
  category: string
  amount: number
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
  description?: string
  isFixed: boolean
  icon: string
}

export interface CostCategory {
  id: string
  name: string
  icon: string
  description: string
}

export interface Frequency {
  value: 'daily' | 'weekly' | 'monthly' | 'yearly'
  label: string
}

export const LOADING_KEYS = {
  LOAD_COSTS: 'loadCosts',
  SAVE_COST: 'saveCost'
} as const

export const costCategories: CostCategory[] = [
  { id: 'utilities', name: 'Utilitas', icon: '⚡', description: 'Listrik, air, gas' },
  { id: 'rent', name: 'Sewa & Properti', icon: '🏢', description: 'Sewa tempat, PBB' },
  { id: 'staff', name: 'Gaji Karyawan', icon: '👥', description: 'Gaji, tunjangan' },
  { id: 'transport', name: 'Transport & Logistik', icon: '🚚', description: 'BBM, ongkir' },
  { id: 'communication', name: 'Komunikasi', icon: '📞', description: 'Telepon, internet' },
  { id: 'insurance', name: 'Asuransi & Keamanan', icon: '🛡️', description: 'Asuransi, keamanan' },
  { id: 'maintenance', name: 'Perawatan', icon: '🔧', description: 'Service peralatan' },
  { id: 'other', name: 'Lainnya', icon: '📦', description: 'Biaya lainnya' }
]

export const frequencies: Frequency[] = [
  { value: 'daily', label: 'Harian' },
  { value: 'weekly', label: 'Mingguan' },
  { value: 'monthly', label: 'Bulanan' },
  { value: 'yearly', label: 'Tahunan' }
]
