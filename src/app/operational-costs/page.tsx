'use client'

import React, { useState, useEffect, lazy, Suspense } from 'react'
import AppLayout from '@/components/layout/app-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useSettings } from '@/contexts/settings-context'
import { useLoading } from '@/hooks/useLoading'
import { StatsCardSkeleton } from '@/components/ui/skeletons/dashboard-skeletons'
import { DataGridSkeleton, SearchFormSkeleton } from '@/components/ui/skeletons/table-skeletons'
import { FormFieldSkeleton } from '@/components/ui/skeletons/form-skeletons'
import { useI18n } from '@/providers/I18nProvider'

// Lazy load extracted components for better performance
const CostForm = lazy(() => import('./components/CostForm'))
const CostTable = lazy(() => import('./components/CostTable'))

import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useResponsive } from '@/hooks/use-mobile'
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Save, 
  X,
  Receipt,
  ArrowLeft,
  ChevronRight,
  Home,
  Zap,
  Fuel,
  Building,
  Users,
  Truck,
  Wifi,
  Phone,
  ShieldCheck,
  Wrench,
  RefreshCw,
  MoreHorizontal,
  Search,
  Eye
} from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface OperationalCost {
  id: string
  name: string
  category: string
  amount: number
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
  description?: string
  isFixed: boolean
  icon: string
}

const costCategories = [
  { id: 'utilities', name: 'Utilitas', icon: '⚡', description: 'Listrik, air, gas' },
  { id: 'rent', name: 'Sewa & Properti', icon: '🏢', description: 'Sewa tempat, PBB' },
  { id: 'staff', name: 'Gaji Karyawan', icon: '👥', description: 'Gaji, tunjangan' },
  { id: 'transport', name: 'Transport & Logistik', icon: '🚚', description: 'BBM, ongkir' },
  { id: 'communication', name: 'Komunikasi', icon: '📞', description: 'Telepon, internet' },
  { id: 'insurance', name: 'Asuransi & Keamanan', icon: '🛡️', description: 'Asuransi, keamanan' },
  { id: 'maintenance', name: 'Perawatan', icon: '🔧', description: 'Service peralatan' },
  { id: 'other', name: 'Lainnya', icon: '📦', description: 'Biaya lainnya' }
]

const frequencies = [
  { value: 'daily', label: 'Harian' },
  { value: 'weekly', label: 'Mingguan' },
  { value: 'monthly', label: 'Bulanan' },
  { value: 'yearly', label: 'Tahunan' }
]

const LOADING_KEYS = {
  LOAD_COSTS: 'loadCosts',
  SAVE_COST: 'saveCost'
} as const

export default function OperationalCostsPage() {
  const { isMobile } = useResponsive()
  const { formatCurrency } = useSettings()
  const { startLoading, stopLoading, isLoading: isSkeletonLoading } = useLoading()
  const { t } = useI18n()
  const [costs, setCosts] = useState<OperationalCost[]>([])
  
  const [currentView, setCurrentView] = useState('list') // 'list', 'add', 'edit'
  
  // Quick Setup: template biaya operasional umum
  const getQuickSetupTemplate = (): OperationalCost[] => {
    const now = Date.now()
    const tmpl: Array<Pick<OperationalCost, 'name' | 'category' | 'amount' | 'frequency' | 'description' | 'isFixed'>> = [
      { name: 'Listrik', category: 'utilities', amount: 500000, frequency: 'monthly', description: 'Biaya listrik bulanan', isFixed: false },
      { name: 'Air & Gas', category: 'utilities', amount: 200000, frequency: 'monthly', description: 'Air PDAM & gas', isFixed: false },
      { name: 'Sewa Toko', category: 'rent', amount: 1500000, frequency: 'monthly', description: 'Sewa tempat usaha', isFixed: true },
      { name: 'Gaji Karyawan', category: 'staff', amount: 3000000, frequency: 'monthly', description: 'Total gaji per bulan', isFixed: true },
      { name: 'Internet & Telepon', category: 'communication', amount: 250000, frequency: 'monthly', description: 'Paket data & telepon', isFixed: true },
      { name: 'Transportasi', category: 'transport', amount: 300000, frequency: 'monthly', description: 'BBM/ongkir', isFixed: false },
      { name: 'Keamanan/Asuransi', category: 'insurance', amount: 100000, frequency: 'monthly', description: 'Satpam/asuransi', isFixed: true },
      { name: 'Perawatan Peralatan', category: 'maintenance', amount: 150000, frequency: 'monthly', description: 'Service & perawatan', isFixed: false },
    ]

    return tmpl.map((item, idx) => {
      const categoryData = costCategories.find(c => c.id === item.category)
      return {
        id: (now + idx).toString(),
        icon: categoryData?.icon || '📦',
        ...item,
      } as OperationalCost
    })
  }

  const handleQuickSetup = () => {
    const existingNames = new Set(costs.map(c => c.name.toLowerCase()))
    const template = getQuickSetupTemplate().filter(t => !existingNames.has(t.name.toLowerCase()))
    if (template.length === 0) {
      alert('Semua item template sudah ada. Anda bisa menambah/ubah secara manual.')
      return
    }
    const confirmed = window.confirm('Tambah template biaya operasional standar? Anda bisa mengubah nilainya setelah ditambahkan.')
    if (!confirmed) return
    setCosts(prev => [...prev, ...template])
  }
  const [editingCost, setEditingCost] = useState<OperationalCost | null>(null)
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [newCost, setNewCost] = useState<OperationalCost>({
    id: '',
    name: '',
    category: 'utilities',
    amount: 0,
    frequency: 'monthly',
    description: '',
    isFixed: false,
    icon: '⚡'
  })

  // Simulate loading on component mount
  useEffect(() => {
    startLoading(LOADING_KEYS.LOAD_COSTS)
    // Simulate loading delay
    const timer = setTimeout(() => {
      stopLoading(LOADING_KEYS.LOAD_COSTS)
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

  const resetForm = () => {
    setNewCost({
      id: '',
      name: '',
      category: 'utilities',
      amount: 0,
      frequency: 'monthly',
      description: '',
      isFixed: false,
      icon: '⚡'
    })
    setEditingCost(null)
  }

  const handleSaveCost = () => {
    if (currentView === 'add') {
      const id = Date.now().toString()
      const categoryData = costCategories.find(cat => cat.id === newCost.category)
      const costToAdd = { 
        ...newCost, 
        id,
        icon: categoryData?.icon || '📦'
      }
      setCosts([...costs, costToAdd])
    } else if (currentView === 'edit' && editingCost) {
      setCosts(costs.map(cost => 
        cost.id === editingCost.id ? { ...newCost, id: editingCost.id } : cost
      ))
    }
    resetForm()
    setCurrentView('list')
  }

  const handleEditCost = (cost: OperationalCost) => {
    setEditingCost(cost)
    setNewCost({ ...cost })
    setCurrentView('edit')
  }

  const handleDeleteCost = (costId: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus biaya ini?')) {
      setCosts(costs.filter(cost => cost.id !== costId))
    }
  }

  const calculateMonthlyCost = (cost: OperationalCost): number => {
    switch (cost.frequency) {
      case 'daily': return cost.amount * 30
      case 'weekly': return cost.amount * 4.33
      case 'monthly': return cost.amount
      case 'yearly': return cost.amount / 12
      default: return cost.amount
    }
  }

  const getTotalMonthlyCosts = (): number => {
    return costs.reduce((total, cost) => total + calculateMonthlyCost(cost), 0)
  }

  // Filter costs based on search term
  const filteredCosts = costs.filter(cost =>
    cost.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cost.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (cost.description && cost.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  // Bulk action handlers
  const handleSelectAll = () => {
    if (selectedItems.length === filteredCosts.length) {
      setSelectedItems([])
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

  const handleBulkDelete = () => {
    if (selectedItems.length === 0) return
    
    const selectedCosts = filteredCosts.filter(cost => selectedItems.includes(cost.id))
    const costNames = selectedCosts.map(cost => cost.name).join(', ')
    
    const confirmed = window.confirm(
      `⚠️ Yakin ingin menghapus ${selectedItems.length} biaya operasional berikut?\n\n${costNames}\n\n❗ Tindakan ini tidak bisa dibatalkan!`
    )
    
    if (confirmed) {
      setCosts(costs.filter(cost => !selectedItems.includes(cost.id)))
      setSelectedItems([])
      alert(`✅ ${selectedItems.length} biaya operasional berhasil dihapus!`)
    }
  }

  const handleBulkEdit = () => {
    if (selectedItems.length === 0) return
    
    const selectedCosts = filteredCosts.filter(cost => selectedItems.includes(cost.id))
    const costNames = selectedCosts.map(cost => cost.name).join(', ')
    
    // TODO: Open bulk edit modal
    console.log('Bulk editing costs:', selectedItems)
    
    alert(`📝 Fitur bulk edit untuk ${selectedItems.length} biaya operasional akan segera tersedia!\n\nBiaya yang dipilih:\n${costNames}`)
  }

  // Individual action handlers
  const handleViewCost = (cost: OperationalCost) => {
    console.log('View cost details:', cost)
    alert(`👁️ Detail biaya"${cost.name}" akan segera tersedia!`)
  }

  const getCategoryInfo = (categoryId: string) => {
    return costCategories.find(cat => cat.id === categoryId) || costCategories[0]
  }

  // Breadcrumb component
  const getBreadcrumbItems = () => {
    const items = [
      { label: 'Dashboard', href: '/' },
      { label: 'Biaya Operasional', href: currentView === 'list' ? undefined : '/operational-costs' }
    ]
    
    if (currentView !== 'list') {
      items.push({ 
        label: currentView === 'add' ? 'Tambah Biaya' : 'Edit Biaya' 
      })
    }
    
    return items
  }

  // Form Component
  const CostForm = () => {
    if (isSkeletonLoading(LOADING_KEYS.LOAD_COSTS)) {
      return (
        <div className="space-y-6">
          {/* Header Skeleton */}
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-gray-200 rounded-md animate-pulse"></div>
            <div className="space-y-2">
              <div className="h-6 w-48 bg-gray-200 rounded-md animate-pulse"></div>
              <div className="h-4 w-64 bg-gray-200 rounded-md animate-pulse"></div>
            </div>
          </div>

          {/* Form Skeleton */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 4 }, (_, i) => (
                  <FormFieldSkeleton key={i} />
                ))}
              </div>
              <div className="space-y-2">
                <div className="h-4 w-32 bg-gray-200 rounded-md animate-pulse"></div>
                <div className="h-20 w-full bg-gray-200 rounded-md animate-pulse"></div>
              </div>
              <div className="flex gap-3 pt-4">
                <div className="h-10 flex-1 bg-gray-200 rounded-md animate-pulse"></div>
                <div className="h-10 w-20 bg-gray-200 rounded-md animate-pulse"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            resetForm()
            setCurrentView('list')
          }}
          className="p-2"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className={`font-bold ${isMobile ? 'text-xl' : 'text-2xl'}`}>
            {currentView === 'add' ? 'Tambah' : 'Edit'} Biaya Operasional
          </h2>
          <p className="text-muted-foreground">
            {currentView === 'add' ? 'Tambahkan biaya operasional baru' : 'Edit biaya operasional'}
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('operationalCosts.form.name')}</Label>
              <Input
                value={newCost.name}
                onChange={(e) => setNewCost(prev => ({ ...prev, name: e.target.value }))}
                placeholder={t('forms.placeholders.enterName')}
              />
            </div>
            
            <div className="space-y-2">
              <Label>{t('operationalCosts.form.category')}</Label>
              <Select 
                value={newCost.category} 
                onValueChange={(value) => setNewCost(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {costCategories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.icon} {category.name} - {category.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('operationalCosts.form.amount')}</Label>
              <Input
                type="number"
                value={newCost.amount}
                onChange={(e) => setNewCost(prev => ({ ...prev, amount: Number(e.target.value) }))}
                placeholder={t('forms.placeholders.enterAmount')}
              />
            </div>
            
            <div className="space-y-2">
              <Label>{t('operationalCosts.form.frequency')}</Label>
              <Select 
                value={newCost.frequency} 
                onValueChange={(value: any) => setNewCost(prev => ({ ...prev, frequency: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {frequencies.map(freq => (
                    <SelectItem key={freq.value} value={freq.value}>
                      {freq.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Deskripsi (Opsional)</Label>
            <Textarea
              value={newCost.description}
              onChange={(e) => setNewCost(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Deskripsi tambahan..."
              rows={2}
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isFixed"
              checked={newCost.isFixed}
              onChange={(e) => setNewCost(prev => ({ ...prev, isFixed: e.target.checked }))}
              className="rounded border-gray-300"
            />
            <Label htmlFor="isFixed" className="text-sm">
              Biaya tetap (tidak berubah setiap periode)
            </Label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button onClick={handleSaveCost} className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              {t('buttons.primary.saveChanges')}
            </Button>
            <Button variant="outline" onClick={() => {
              resetForm()
              setCurrentView('list')
            }}>
              {t('common.actions.cancel')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
    )
  }

  // List Component
  const CostList = () => {
    if (isSkeletonLoading(LOADING_KEYS.LOAD_COSTS)) {
      return (
        <div className="space-y-6">
          {/* Header Skeleton */}
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <div className="h-8 w-48 bg-gray-200 rounded-md animate-pulse"></div>
              <div className="h-4 w-96 bg-gray-200 rounded-md animate-pulse"></div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-10 w-32 bg-gray-200 rounded-md animate-pulse"></div>
              <div className="h-10 w-32 bg-gray-200 rounded-md animate-pulse"></div>
            </div>
          </div>

          {/* Summary Cards Skeleton */}
          <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'md:grid-cols-3'}`}>
            {Array.from({ length: 3 }, (_, i) => (
              <StatsCardSkeleton key={i} />
            ))}
          </div>

          {/* Info Card Skeleton */}
          <div className="h-24 bg-gray-200 rounded-lg animate-pulse"></div>

          {/* Search Form Skeleton */}
          <SearchFormSkeleton />

          {/* Table Skeleton */}
          <div className="bg-white border rounded-lg">
            <div className="p-6">
              <div className="h-6 w-48 bg-gray-200 rounded-md animate-pulse mb-4"></div>
              <DataGridSkeleton rows={6} />
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-6">
      {/* Header */}
      <div className={`flex gap-4 ${isMobile ? 'flex-col items-center text-center' : 'justify-between items-center'}`}>
        <div className={isMobile ? 'text-center' : ''}>
          <h1 className={`font-bold text-foreground ${isMobile ? 'text-2xl' : 'text-3xl'}`}>
            {t('operationalCosts.title')}
          </h1>
          <p className="text-muted-foreground">
            {t('operationalCosts.subtitle')}
          </p>
        </div>
        <div className={`flex ${isMobile ? 'w-full flex-col gap-2' : 'items-center gap-2'}`}>
          <Button className={isMobile ? 'w-full' : ''} onClick={() => setCurrentView('add')}>
            <Plus className="h-4 w-4 mr-2" />
            {t('operationalCosts.addCost')}
          </Button>
          <Button 
            variant="outline" 
            className={isMobile ? 'w-full' : ''}
            onClick={handleQuickSetup}
            title={t('operationalCosts.quickSetup')}
          >
            <Zap className="h-4 w-4 mr-2" />
            {t('operationalCosts.quickSetup')}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'md:grid-cols-3'}`}>
        <Card>
          <CardContent className="p-4 text-center">
            <Receipt className="h-8 w-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold">{costs.length}</div>
            <p className="text-sm text-muted-foreground">Total Biaya</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Zap className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">{costs.filter(c => c.isFixed).length}</div>
            <p className="text-sm text-muted-foreground">Biaya Tetap</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <RefreshCw className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">{formatCurrency(getTotalMonthlyCosts())}</div>
            <p className="text-sm text-muted-foreground">Total/Bulan</p>
          </CardContent>
        </Card>
      </div>

      {/* Info Card */}
      <Card className="bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="bg-orange-100 dark:bg-orange-800/50 p-2 rounded-lg">
              <Receipt className="h-5 w-5 text-orange-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-orange-900 dark:text-orange-100 mb-1">
                💡 Mengapa Biaya Operasional Penting?
              </h3>
              <p className="text-sm text-orange-800 dark:text-orange-200">
                Biaya operasional digunakan untuk menghitung HPP yang akurat. 
                Semakin lengkap data biaya, semakin tepat perhitungan harga jual produk Anda.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Cari biaya berdasarkan nama, kategori, atau deskripsi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedItems.length > 0 && (
          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-900">
                {selectedItems.length} biaya operasional dipilih
              </span>
              <span className="text-xs text-gray-500">
                ({filteredCosts.filter(cost => selectedItems.includes(cost.id)).map(cost => cost.name).slice(0, 2).join(', ')}
                {selectedItems.length > 2 ? ` +${selectedItems.length - 2} lainnya` : ''})
              </span>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedItems([])}
                className="text-gray-500 hover:text-gray-700"
              >
                Batal
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkEdit}
              >
                <Edit2 className="h-4 w-4 mr-2" />
                Edit Semua
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkDelete}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Hapus Semua
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Operational Costs Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Daftar Biaya Operasional
          </CardTitle>
          <p className="text-sm text-gray-600">
            Kelola biaya operasional dengan mudah
          </p>
        </CardHeader>
        <CardContent>
          {filteredCosts.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedItems.length === filteredCosts.length && filteredCosts.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Nama & Kategori</TableHead>
                    <TableHead>Jumlah & Frekuensi</TableHead>
                    <TableHead>Biaya/Bulan</TableHead>
                    <TableHead>Tipe</TableHead>
                    <TableHead className="w-32">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCosts.map((cost) => {
                    const categoryInfo = getCategoryInfo(cost.category)
                    const frequencyLabel = frequencies.find(f => f.value === cost.frequency)?.label || 'Bulanan'
                    
                    return (
                      <TableRow key={cost.id} className="hover:bg-gray-50">
                        <TableCell>
                          <Checkbox
                            checked={selectedItems.includes(cost.id)}
                            onCheckedChange={() => handleSelectItem(cost.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-semibold">{cost.name}</span>
                            <div className="flex items-center gap-1 mt-1">
                              <span className="text-sm">{categoryInfo.icon}</span>
                              <span className="text-xs text-gray-500">{categoryInfo.name}</span>
                            </div>
                            {cost.description && (
                              <span className="text-xs text-gray-400 mt-1">{cost.description}</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{formatCurrency(cost.amount)}</span>
                            <span className="text-xs text-gray-500">per {frequencyLabel}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium text-green-600">
                            {formatCurrency(calculateMonthlyCost(cost))}
                          </span>
                        </TableCell>
                        <TableCell>
                          {cost.isFixed ? (
                            <Badge variant="default" className="text-xs">
                              TETAP
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">
                              VARIABEL
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewCost(cost)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => handleEditCost(cost)}>
                                  <Edit2 className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="text-red-600"
                                  onClick={() => handleDeleteCost(cost.id)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Hapus
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="py-12 text-center">
              <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className={`font-medium mb-2 ${isMobile ? 'text-base' : 'text-lg'}`}>
                {searchTerm ? 'Tidak ada hasil pencarian' : t('operationalCosts.title')}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm 
                  ? 'Coba kata kunci lain untuk menemukan biaya operasional'
                  : 'Mulai dengan menambahkan biaya operasional seperti listrik, sewa, gaji karyawan, dll'
                }
              </p>
              {!searchTerm && (
                <Button onClick={() => setCurrentView('add')}>
                  <Plus className="h-4 w-4 mr-2" />
                  {t('operationalCosts.addCost')}
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumb>
          <BreadcrumbList>
            {getBreadcrumbItems().map((item, index) => (
              <React.Fragment key={index}>
                <BreadcrumbItem>
                  {item.href ? (
                    <BreadcrumbLink href={item.href}>
                      {item.label}
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage>{item.label}</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
                {index < getBreadcrumbItems().length - 1 && <BreadcrumbSeparator />}
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
        
        {/* Using extracted lazy-loaded components */}
        {currentView === 'list' ? (
          <Suspense fallback={<DataGridSkeleton />}>
            <CostList />
          </Suspense>
        ) : (
          <Suspense fallback={<FormFieldSkeleton />}>
            <CostForm />
          </Suspense>
        )}
      </div>
    </AppLayout>
  )
}