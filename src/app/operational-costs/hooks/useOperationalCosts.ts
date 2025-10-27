import { useLoading } from '@/hooks/loading'
import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'

import { apiLogger } from '@/lib/logger'
import type { OperationalCostsTable } from '@/types'

// Types and constants embedded in hook file for now
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

const LOADING_KEYS = {
  LOAD_COSTS: 'loadCosts',
  SAVE_COST: 'saveCost'
} as const

const costCategories: CostCategory[] = [
  { id: 'utilities', name: 'Utilitas', icon: '⚡', description: 'Listrik, air, gas' },
  { id: 'rent', name: 'Sewa & Properti', icon: '🏢', description: 'Sewa tempat, PBB' },
  { id: 'staff', name: 'Gaji Karyawan', icon: '👥', description: 'Gaji, tunjangan' },
  { id: 'transport', name: 'Transport & Logistik', icon: '🚚', description: 'BBM, ongkir' },
  { id: 'communication', name: 'Komunikasi', icon: '📞', description: 'Telepon, internet' },
  { id: 'insurance', name: 'Asuransi & Keamanan', icon: '🛡️', description: 'Asuransi, keamanan' },
  { id: 'maintenance', name: 'Perawatan', icon: '🔧', description: 'Service peralatan' },
  { id: 'other', name: 'Lainnya', icon: '📦', description: 'Biaya lainnya' }
]

const frequencies: Frequency[] = [
  { value: 'daily', label: 'Harian' },
  { value: 'weekly', label: 'Mingguan' },
  { value: 'monthly', label: 'Bulanan' },
  { value: 'yearly', label: 'Tahunan' }
]

// Utility functions embedded in hook file
function getQuickSetupTemplate(): OperationalCost[] {
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

function validateOperationalCost(cost: Partial<OperationalCost>): string[] {
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

function calculateMonthlyCost(cost: OperationalCost): number {
  switch (cost.frequency) {
    case 'daily': return cost.amount * 30
    case 'weekly': return cost.amount * 4.33
    case 'monthly': return cost.amount
    case 'yearly': return cost.amount / 12
    default: return cost.amount
  }
}

function getTotalMonthlyCosts(costs: OperationalCost[]): number {
  return costs.reduce((total, cost) => total + calculateMonthlyCost(cost), 0)
}

function getCategoryInfo(categoryId: string) {
  return costCategories.find(cat => cat.id === categoryId) || costCategories[0]
}

// Export constants and utility functions for use in components
export { calculateMonthlyCost, costCategories, frequencies, getCategoryInfo, getTotalMonthlyCosts }

interface UseOperationalCostsReturn {
  // State
  costs: OperationalCost[]
  currentView: 'list' | 'add' | 'edit'
  editingCost: OperationalCost | null
  selectedItems: string[]
  searchTerm: string
  isLoading: boolean

  // Form state
  newCost: OperationalCost
  setNewCost: (cost: OperationalCost) => void

  // Actions
  setCurrentView: (view: 'list' | 'add' | 'edit') => void
  setEditingCost: (cost: OperationalCost | null) => void
  setSelectedItems: (items: string[]) => void
  setSearchTerm: (term: string) => void

  // CRUD operations
  fetchCosts: () => Promise<void>
  handleSaveCost: () => Promise<void>
  handleEditCost: (cost: OperationalCost) => void
  handleDeleteCost: (costId: string) => Promise<void>
  handleBulkDelete: () => Promise<void>
  handleQuickSetup: () => Promise<void>

  // Utility functions
  resetForm: () => void
  handleSelectAll: () => void
  handleSelectItem: (itemId: string) => void

  // Computed values
  filteredCosts: OperationalCost[]
}

const initialCostState: OperationalCost = {
  id: '',
  name: '',
  category: 'utilities',
  amount: 0,
  frequency: 'monthly',
  description: '',
  isFixed: false,
  icon: '⚡'
}

export function useOperationalCosts(): UseOperationalCostsReturn {
  const { startLoading, stopLoading, isLoading: isSkeletonLoading } = useLoading()

  // State management
  const [costs, setCosts] = useState<OperationalCost[]>([])
  const [currentView, setCurrentView] = useState<'list' | 'add' | 'edit'>('list')
  const [editingCost, setEditingCost] = useState<OperationalCost | null>(null)
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [newCost, setNewCost] = useState<OperationalCost>(initialCostState)

  // Fetch costs from API
  const fetchCosts = async () => {
    void startLoading(LOADING_KEYS.LOAD_COSTS)
    try {
      const response = await fetch('/api/operational-costs')
      if (!response.ok) {throw new Error('Failed to fetch costs')}

      const data = await response.json()
      const transformedCosts = data.costs.map((cost: OperationalCostsTable['Row']) => ({
        id: cost.id,
        name: cost.name,
        category: cost.category,
        amount: cost.amount,
        frequency: cost.frequency,
        description: cost.description,
        isFixed: cost.isFixed,
        icon: cost.icon || '📦'
      }))
      void setCosts(transformedCosts)
    } catch (err) {
      apiLogger.error({ err }, 'Error fetching costs:')
      toast.error('Gagal memuat data biaya operasional')
    } finally {
      stopLoading(LOADING_KEYS.LOAD_COSTS)
    }
  }

  // Reset form to initial state
  const resetForm = () => {
    void setNewCost(initialCostState)
    void setEditingCost(null)
  }

  // Handle save (create/update)
  const handleSaveCost = async () => {
    // Validate form data
    const errors = validateOperationalCost(newCost)
    if (errors.length > 0) {
      toast.error(errors.join(', '))
      return
    }

    void setIsLoading(true)
    try {
      if (currentView === 'add') {
        // Create new cost
        const response = await fetch('/api/operational-costs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newCost)
        })

        if (!response.ok) {throw new Error('Failed to create cost')}

        toast.success('Biaya operasional berhasil ditambahkan!')
      } else if (currentView === 'edit' && editingCost) {
        // Update existing cost
        const response = await fetch('/api/operational-costs', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...newCost, id: editingCost.id })
        })

        if (!response.ok) {throw new Error('Failed to update cost')}

        toast.success('Biaya operasional berhasil diperbarui!')
      }

      // Refresh the list and reset form
      await fetchCosts()
      resetForm()
      void setCurrentView('list')
    } catch (err) {
      apiLogger.error({ err }, 'Error saving cost:')
      toast.error('Gagal menyimpan biaya operasional')
    } finally {
      void setIsLoading(false)
    }
  }

  // Handle edit
  const handleEditCost = (cost: OperationalCost) => {
    void setEditingCost(cost)
    void setNewCost({ ...cost })
    void setCurrentView('edit')
  }

  // Handle delete single cost
  const handleDeleteCost = async (costId: string) => {
    if (!confirm('Yakin ingin menghapus biaya operasional ini?')) {return}

    void setIsLoading(true)
    try {
      const response = await fetch('/api/operational-costs', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [costId] })
      })

      if (!response.ok) {throw new Error('Failed to delete cost')}

      // Refresh the list
      await fetchCosts()
      toast.success('Biaya operasional berhasil dihapus!')
    } catch (err) {
      apiLogger.error({ err }, 'Error deleting cost:')
      toast.error('Gagal menghapus biaya operasional')
    } finally {
      void setIsLoading(false)
    }
  }

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) {return}

    const confirmed = window.confirm(
      `⚠️ Yakin ingin menghapus ${selectedItems.length} biaya operasional?\n\n❗ Tindakan ini tidak bisa dibatalkan!`
    )

    if (!confirmed) {return}

    void setIsLoading(true)
    try {
      const response = await fetch('/api/operational-costs', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedItems })
      })

      if (!response.ok) {throw new Error('Failed to delete costs')}

      // Refresh the list and clear selection
      await fetchCosts()
      void setSelectedItems([])
      toast.success(`${selectedItems.length} biaya operasional berhasil dihapus!`)
    } catch (err) {
      apiLogger.error({ err }, 'Error deleting costs:')
      toast.error('Gagal menghapus biaya operasional')
    } finally {
      void setIsLoading(false)
    }
  }

  // Handle quick setup
  const handleQuickSetup = async () => {
    const existingNames = new Set(costs.map(c => c.name?.toLowerCase()).filter(Boolean))
    const template = getQuickSetupTemplate().filter(t => t.name && !existingNames.has(t.name.toLowerCase()))
    if (template.length === 0) {
      toast('Semua template sudah ditambahkan', { icon: 'ℹ️' })
      return
    }

    const confirmed = window.confirm("Tambahkan template biaya operasional?")
    if (!confirmed) {return}

    void setIsLoading(true)
    try {
      // Create all template costs in database
      const promises = template.map(cost =>
        fetch('/api/operational-costs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(cost)
        })
      )
      await Promise.all(promises)

      // Refresh the list
      await fetchCosts()
      toast.success('Template berhasil ditambahkan!')
    } catch (err) {
      apiLogger.error({ err }, 'Error adding template:')
      toast.error('Gagal menambahkan template')
    } finally {
      void setIsLoading(false)
    }
  }

  // Selection handlers
  const handleSelectAll = () => {
    if (selectedItems.length === filteredCosts.length) {
      void setSelectedItems([])
    } else {
      setSelectedItems(filteredCosts.map(cost => cost.id))
    }
  }

  const handleSelectItem = (itemId: string) => {
    setSelectedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  // Filter costs based on search term
  const filteredCosts = costs.filter(cost =>
    cost.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cost.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (cost.description?.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  // Load costs on mount
  useEffect(() => {
    void fetchCosts()
  }, [])

  return {
    // State
    costs,
    currentView,
    editingCost,
    selectedItems,
    searchTerm,
    isLoading,

    // Form state
    newCost,
    setNewCost,

    // Actions
    setCurrentView,
    setEditingCost,
    setSelectedItems,
    setSearchTerm,

    // CRUD operations
    fetchCosts,
    handleSaveCost,
    handleEditCost,
    handleDeleteCost,
    handleBulkDelete,
    handleQuickSetup,

    // Utility functions
    resetForm,
    handleSelectAll,
    handleSelectItem,

    // Computed values
    filteredCosts
  }
}
