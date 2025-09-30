'use client'

import React, { useState, useEffect, lazy, Suspense } from 'react'
import AppLayout from '@/components/layout/app-layout'
import { Card, CardContent } from '@/components/ui/card'
import { useSettings } from '@/contexts/settings-context'
import { useLoading } from '@/hooks/useLoading'
import { StatsCardSkeleton } from '@/components/ui/skeletons/dashboard-skeletons'
import { DataGridSkeleton, SearchFormSkeleton } from '@/components/ui/skeletons/table-skeletons'

// Lazy load extracted components for better performance and code splitting
const CostFormView = lazy(() => import('./components/CostFormView'))
const CostStats = lazy(() => import('./components/CostStats'))
const BulkActions = lazy(() => import('./components/BulkActions'))
const CostListTable = lazy(() => import('./components/CostListTable'))

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
import { useResponsive } from '@/hooks/use-mobile'
import { 
  Plus, 
  Zap,
  Receipt,
  Search
} from 'lucide-react'

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
  
  // State management
  const [costs, setCosts] = useState<OperationalCost[]>([])
  const [currentView, setCurrentView] = useState('list') // 'list', 'add', 'edit'
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
    const timer = setTimeou"" => {
      stopLoading(LOADING_KEYS.LOAD_COSTS)
    }, 1500)
    return () => clearTimeou""
  }, [])

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
    const existingNames = new Se""))
    const template = getQuickSetupTemplate().filter(t => !existingNames.has(t.name.toLowerCase()))
    if (template.length === 0) {
      aler""
      return
    }
    const confirmed = window.confirm("Placeholder")
    if (!confirmed) return
    setCosts(prev => [...prev, ...template])
  }

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
    setEditingCos""
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
    setEditingCos""
    setNewCos""
    setCurrentView('edit')
  }

  const handleDeleteCost = (costId: string) => {
    if (confirm("Placeholder")) {
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
    return costs.reduce((total, cost) => total + calculateMonthlyCos"", 0)
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
      aler""
    }
  }

  const handleBulkEdit = () => {
    if (selectedItems.length === 0) return
    
    const selectedCosts = filteredCosts.filter(cost => selectedItems.includes(cost.id))
    const costNames = selectedCosts.map(cost => cost.name).join(', ')
    
    aler""
  }

  const handleViewCost = (cost: OperationalCost) => {
    aler""
  }

  const getCategoryInfo = (categoryId: string) => {
    return costCategories.find(cat => cat.id === categoryId) || costCategories[0]
  }

  // Breadcrumb items
  const getBreadcrumbItems = () => {
    const items: Array<{ label: string; href?: string }> = [
      { label: 'Dashboard', href: '/' },
      { label: 'Biaya Operasional', href: currentView === 'list' ? undefined : '/operational-costs' }
    ]
    
    if (currentView !== 'list') {
      items.push({ 
        label: currentView === 'add' ? 'Tambah Biaya' : 'Edit Biaya',
        href: undefined
      })
    }
    
    return items
  }

  // Render loading skeleton for list view
  if (currentView === 'list' && isSkeletonLoading(LOADING_KEYS.LOAD_COSTS)) {
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
          
          <div className="space-y-6">
            {/* Header Skeleton */}
            <div className="flex justify-between items-center">
              <div className="space-y-2">
                <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
                <div className="h-4 w-96 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
                <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
              </div>
            </div>

            {/* Summary Cards Skeleton */}
            <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'md:grid-cols-3'}`}>
              {Array.from({ length: 3 }, (_, i) => (
                <StatsCardSkeleton key={i} />
              ))}
            </div>

            {/* Info Card Skeleton */}
            <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>

            {/* Search Form Skeleton */}
            <SearchFormSkeleton />

            {/* Table Skeleton */}
            <div className="bg-white dark:bg-gray-800 border rounded-lg">
              <div className="p-6">
                <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse mb-4"></div>
                <DataGridSkeleton rows={6} />
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
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
        
        {/* Form View */}
        {currentView !== 'list' ? (
          <Suspense fallback={<div className="h-96 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />}>
            <CostFormView
              currentView={currentView as 'add' | 'edit'}
              newCost={newCost}
              setNewCost={setNewCost}
              onSave={handleSaveCost}
              onCancel={() => {
                resetForm()
                setCurrentView('list')
              }}
              isLoading={false}
              costCategories={costCategories}
              frequencies={frequencies}
            />
          </Suspense>
        ) : (
          /* List View */
          <div className="space-y-6">
            {/* Header */}
            <div className={`flex gap-4 ${isMobile ? 'flex-col items-center text-center' : 'justify-between items-center'}`}>
              <div className={isMobile ? 'text-center' : ''}>
                <h1 className={`font-bold text-foreground ${isMobile ? 'text-2xl' : 'text-3xl'}`}>
                  {"Placeholder"}
                </h1>
                <p className="text-muted-foreground">
                  {"Placeholder"}
                </p>
              </div>
              <div className={`flex ${isMobile ? 'w-full flex-col gap-2' : 'items-center gap-2'}`}>
                <Button className={isMobile ? 'w-full' : ''} onClick={() => setCurrentView('add')}>
                  <Plus className="h-4 w-4 mr-2" />
                  {"Placeholder"}
                </Button>
                <Button 
                  variant="outline" 
                  className={isMobile ? 'w-full' : ''}
                  onClick={handleQuickSetup}
                  title={"Placeholder"}
                >
                  <Zap className="h-4 w-4 mr-2" />
                  {"Placeholder"}
                </Button>
              </div>
            </div>

            {/* Summary Cards */}
            <Suspense fallback={
              <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'md:grid-cols-3'}`}>
                {Array.from({ length: 3 }, (_, i) => (<StatsCardSkeleton key={i} />))}
              </div>
            }>
              <CostStats
                totalCosts={costs.length}
                fixedCosts={costs.filter(c => c.isFixed).length}
                totalMonthly={getTotalMonthlyCosts()}
                formatCurrency={formatCurrency}
                isMobile={isMobile}
              />
            </Suspense>

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
              <Suspense fallback={null}>
                <BulkActions
                  selectedItems={selectedItems}
                  costs={filteredCosts}
                  onClearSelection={() => setSelectedItems([])}
                  onBulkEdit={handleBulkEdit}
                  onBulkDelete={handleBulkDelete}
                />
              </Suspense>
            </div>

            {/* Operational Costs Table */}
            <Suspense fallback={<DataGridSkeleton rows={10} />}>
              <CostListTable
                costs={filteredCosts}
                selectedItems={selectedItems}
                onSelectAll={handleSelectAll}
                onSelectItem={handleSelectItem}
                onEdit={handleEditCost}
                onDelete={handleDeleteCost}
                onView={handleViewCost}
                onAdd={() => setCurrentView('add')}
                formatCurrency={formatCurrency}
                calculateMonthlyCost={calculateMonthlyCost}
                getCategoryInfo={getCategoryInfo}
                frequencies={frequencies}
                searchTerm={searchTerm}
                isMobile={isMobile}
              />
            </Suspense>
          </div>
        )}
      </div>
    </AppLayout>
  )
}