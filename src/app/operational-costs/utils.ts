import { type OperationalCost, costCategories } from './constants'

/**
 * Generate quick setup template for operational costs
 * Provides common operational costs for Indonesian UMKM UMKM
 */
export function getQuickSetupTemplate(): OperationalCost[] {
  const now = Date.now()
  const template: Array<Pick<OperationalCost, 'name' | 'category' | 'amount' | 'frequency' | 'description' | 'isFixed'>> = [
    { name: 'Listrik', category: 'utilities', amount: 500000, frequency: 'monthly', description: 'Biaya listrik bulanan', isFixed: false },
    { name: 'Air & Gas', category: 'utilities', amount: 200000, frequency: 'monthly', description: 'Air PDAM & gas', isFixed: false },
    { name: 'Sewa Toko', category: 'rent', amount: 1500000, frequency: 'monthly', description: 'Sewa tempat usaha', isFixed: true },
    { name: 'Gaji Karyawan', category: 'staff', amount: 3000000, frequency: 'monthly', description: 'Total gaji per bulan', isFixed: true },
    { name: 'Internet & Telepon', category: 'communication', amount: 250000, frequency: 'monthly', description: 'Paket data & telepon', isFixed: true },
    { name: 'Transportasi', category: 'transport', amount: 300000, frequency: 'monthly', description: 'BBM/ongkir', isFixed: false },
    { name: 'Keamanan/Asuransi', category: 'insurance', amount: 100000, frequency: 'monthly', description: 'Satpam/asuransi', isFixed: true },
    { name: 'Perawatan Peralatan', category: 'maintenance', amount: 150000, frequency: 'monthly', description: 'Service & perawatan', isFixed: false },
  ]

  return template.map((item, idx) => {
    const categoryData = costCategories.find(c => c.id === item.category)
    return {
      id: (now + idx).toString(),
      icon: categoryData?.icon || '📦',
      ...item,
    } as OperationalCost
  })
}

/**
 * Calculate monthly cost based on frequency
 */
export function calculateMonthlyCost(cost: OperationalCost): number {
  switch (cost.frequency) {
    case 'daily': return cost.amount * 30
    case 'weekly': return cost.amount * 4.33
    case 'monthly': return cost.amount
    case 'yearly': return cost.amount / 12
    default: return cost.amount
  }
}

/**
 * Get total monthly costs from array of costs
 */
export function getTotalMonthlyCosts(costs: OperationalCost[]): number {
  return costs.reduce((total, cost) => total + calculateMonthlyCost(cost), 0)
}

/**
 * Get category info by category ID
 */
export function getCategoryInfo(categoryId: string) {
  return costCategories.find(cat => cat.id === categoryId) || costCategories[0]
}

/**
 * Validate operational cost data
 */
export function validateOperationalCost(cost: Partial<OperationalCost>): string[] {
  const errors: string[] = []

  if (!cost.name?.trim()) {
    errors.push('Nama biaya operasional wajib diisi')
  }

  if (!cost.category) {
    errors.push('Kategori wajib dipilih')
  }

  if (!cost.amount || cost.amount <= 0) {
    errors.push('Jumlah biaya harus lebih dari 0')
  }

  if (!cost.frequency) {
    errors.push('Frekuensi wajib dipilih')
  }

  return errors
}
