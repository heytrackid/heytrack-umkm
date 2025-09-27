'use client'

import { useState } from 'react'
import AppLayout from '@/components/layout/app-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Lazy loading imports
import { SmartProductionPlannerWithLoading } from '@/components/lazy/automation-features'
import { MiniChartWithLoading } from '@/components/lazy/chart-features'
import { ProgressiveLoader } from '@/components/lazy/progressive-loading'

// Mobile UX imports
import { useResponsive } from '@/hooks/use-mobile'
import { PullToRefresh, SwipeActions } from '@/components/ui/mobile-gestures'
import { MobileInput, MobileSelect, MobileTextarea } from '@/components/ui/mobile-forms'
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Factory, 
  Clock,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Package,
  Calendar,
  TrendingUp,
  Play,
  Pause,
  Square,
  Eye,
  Users,
  Timer,
  Target,
  BarChart3
} from 'lucide-react'

// Sample data - untuk SmartProductionPlanner
const sampleOrders = [
  {
    id: '1',
    recipe_id: 'RCP-001',
    quantity: 50,
    delivery_date: '2024-01-26',
    customer_name: 'Toko Roti Mawar',
    priority: 'normal' as const,
    status: 'pending' as const
  },
  {
    id: '2', 
    recipe_id: 'RCP-002',
    quantity: 100,
    delivery_date: '2024-01-27',
    customer_name: 'Cafe Melati',
    priority: 'high' as const,
    status: 'scheduled' as const
  },
  {
    id: '3',
    recipe_id: 'RCP-001', 
    quantity: 30,
    delivery_date: '2024-01-28',
    customer_name: 'Warung Pak Budi',
    priority: 'low' as const,
    status: 'pending' as const
  }
]

const sampleRecipes = [
  {
    id: 'RCP-001',
    name: 'Roti Tawar Premium',
    description: 'Roti tawar premium dengan tekstur lembut',
    category: 'bread',
    servings: 1,
    prep_time: 30,
    cook_time: 45,
    difficulty: 'medium',
    instructions: 'Campurkan bahan kering, tambahkan bahan basah, panggang 45 menit',
    notes: null,
    cost_per_unit: 5000,
    selling_price: 15000,
    margin_percentage: 200,
    rating: null,
    times_made: null,
    image_url: null,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    recipe_ingredients: [
      {
        id: 'RI-001-1',
        recipe_id: 'RCP-001',
        ingredient_id: '1',
        quantity: 500,
        unit: 'g',
        cost: null,
        notes: null,
        created_at: new Date().toISOString(),
        ingredient: {
          id: '1',
          name: 'Tepung Terigu',
          current_stock: 25,
          min_stock: 10,
          unit: 'kg',
          price_per_unit: 12000,
          category: 'flour',
          supplier: null,
          description: null,
          is_active: true,
          storage_requirements: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      },
      {
        id: 'RI-001-2',
        recipe_id: 'RCP-001',
        ingredient_id: '2',
        quantity: 50,
        unit: 'g',
        cost: null,
        notes: null,
        created_at: new Date().toISOString(),
        ingredient: {
          id: '2',
          name: 'Mentega',
          current_stock: 8,
          min_stock: 5,
          unit: 'kg',
          price_per_unit: 35000,
          category: 'dairy',
          supplier: null,
          description: null,
          is_active: true,
          storage_requirements: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      }
    ]
  },
  {
    id: 'RCP-002',
    name: 'Croissant Butter',
    description: 'Croissant mentega dengan teknik laminating',
    category: 'pastry',
    servings: 1,
    prep_time: 180,
    cook_time: 25,
    difficulty: 'hard',
    instructions: 'Buat adonan dasar, proses laminating, bentuk dan panggang',
    notes: null,
    cost_per_unit: 8000,
    selling_price: 25000,
    margin_percentage: 212.5,
    rating: null,
    times_made: null,
    image_url: null,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    recipe_ingredients: [
      {
        id: 'RI-002-1',
        recipe_id: 'RCP-002',
        ingredient_id: '1',
        quantity: 400,
        unit: 'g',
        cost: null,
        notes: null,
        created_at: new Date().toISOString(),
        ingredient: {
          id: '1',
          name: 'Tepung Terigu',
          current_stock: 25,
          min_stock: 10,
          unit: 'kg',
          price_per_unit: 12000,
          category: 'flour',
          supplier: null,
          description: null,
          is_active: true,
          storage_requirements: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      },
      {
        id: 'RI-002-2',
        recipe_id: 'RCP-002',
        ingredient_id: '2',
        quantity: 200,
        unit: 'g',
        cost: null,
        notes: null,
        created_at: new Date().toISOString(),
        ingredient: {
          id: '2',
          name: 'Mentega Premium',
          current_stock: 8,
          min_stock: 5,
          unit: 'kg',
          price_per_unit: 35000,
          category: 'dairy',
          supplier: null,
          description: null,
          is_active: true,
          storage_requirements: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      }
    ]
  }
]

const sampleProductions = [
  {
    id: '1',
    batchNo: 'BATCH-20240125-001',
    recipeName: 'Roti Tawar Premium',
    recipeId: 'RCP-001',
    plannedQuantity: 50,
    actualQuantity: 48,
    status: 'COMPLETED',
    priority: 'normal',
    plannedStartTime: '2024-01-25 06:00',
    actualStartTime: '2024-01-25 06:15',
    plannedEndTime: '2024-01-25 09:00',
    actualEndTime: '2024-01-25 09:30',
    estimatedDuration: 180,
    actualDuration: 195,
    assignedStaff: ['Ahmad', 'Budi'],
    materialCost: 400000,
    laborCost: 120000,
    overheadCost: 50000,
    totalCost: 570000,
    costPerUnit: 11875,
    expectedRevenue: 750000,
    profitMargin: 31.6,
    qualityRating: 4.8,
    notes: 'Produksi berjalan lancar, sedikit delay karena menunggu oven',
    ingredients: [
      { name: 'Tepung Terigu', planned: 25, used: 25.2, unit: 'kg' },
      { name: 'Ragi', planned: 0.35, used: 0.35, unit: 'kg' },
      { name: 'Mentega', planned: 2.5, used: 2.4, unit: 'kg' }
    ]
  },
  {
    id: '2',
    batchNo: 'BATCH-20240125-002',
    recipeName: 'Croissant Butter',
    recipeId: 'RCP-002',
    plannedQuantity: 100,
    actualQuantity: 0,
    status: 'IN_PROGRESS',
    priority: 'high',
    plannedStartTime: '2024-01-25 08:00',
    actualStartTime: '2024-01-25 08:00',
    plannedEndTime: '2024-01-25 12:00',
    actualEndTime: null,
    estimatedDuration: 240,
    actualDuration: 0,
    assignedStaff: ['Sari', 'Dewi'],
    materialCost: 800000,
    laborCost: 200000,
    overheadCost: 80000,
    totalCost: 1080000,
    costPerUnit: 10800,
    expectedRevenue: 2500000,
    profitMargin: 131.5,
    qualityRating: 0,
    notes: 'Proses laminating sedang berlangsung',
    ingredients: [
      { name: 'Tepung Terigu', planned: 40, used: 40, unit: 'kg' },
      { name: 'Mentega Premium', planned: 20, used: 20, unit: 'kg' },
      { name: 'Telur', planned: 5, used: 5, unit: 'kg' }
    ]
  },
  {
    id: '3',
    batchNo: 'BATCH-20240125-003',
    recipeName: 'Donat Glaze',
    recipeId: 'RCP-003',
    plannedQuantity: 200,
    actualQuantity: 0,
    status: 'PLANNED',
    priority: 'normal',
    plannedStartTime: '2024-01-25 14:00',
    actualStartTime: null,
    plannedEndTime: '2024-01-25 17:00',
    actualEndTime: null,
    estimatedDuration: 180,
    actualDuration: 0,
    assignedStaff: ['Ahmad', 'Rian'],
    materialCost: 600000,
    laborCost: 150000,
    overheadCost: 60000,
    totalCost: 810000,
    costPerUnit: 4050,
    expectedRevenue: 1600000,
    profitMargin: 97.5,
    qualityRating: 0,
    notes: 'Menunggu selesai batch sebelumnya',
    ingredients: [
      { name: 'Tepung Terigu', planned: 35, used: 0, unit: 'kg' },
      { name: 'Gula', planned: 6, used: 0, unit: 'kg' },
      { name: 'Telur', planned: 3, used: 0, unit: 'kg' }
    ]
  },
  {
    id: '4',
    batchNo: 'BATCH-20240124-004',
    recipeName: 'Roti Tawar Premium',
    recipeId: 'RCP-001',
    plannedQuantity: 40,
    actualQuantity: 39,
    status: 'COMPLETED',
    priority: 'normal',
    plannedStartTime: '2024-01-24 06:00',
    actualStartTime: '2024-01-24 06:00',
    plannedEndTime: '2024-01-24 09:00',
    actualEndTime: '2024-01-24 08:45',
    estimatedDuration: 180,
    actualDuration: 165,
    assignedStaff: ['Budi', 'Sari'],
    materialCost: 320000,
    laborCost: 100000,
    overheadCost: 40000,
    totalCost: 460000,
    costPerUnit: 11795,
    expectedRevenue: 585000,
    profitMargin: 27.2,
    qualityRating: 4.5,
    notes: 'Produksi lebih cepat dari jadwal',
    ingredients: [
      { name: 'Tepung Terigu', planned: 20, used: 19.8, unit: 'kg' },
      { name: 'Ragi', planned: 0.28, used: 0.28, unit: 'kg' },
      { name: 'Mentega', planned: 2, used: 1.9, unit: 'kg' }
    ]
  }
]

const productionStatuses = [
  { value: 'PLANNED', label: 'Direncanakan', color: 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100' },
  { value: 'IN_PROGRESS', label: 'Sedang Berjalan', color: 'bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-100' },
  { value: 'COMPLETED', label: 'Selesai', color: 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' },
  { value: 'PAUSED', label: 'Dihentikan', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100' },
  { value: 'CANCELLED', label: 'Dibatalkan', color: 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100' }
]

const priorities = [
  { value: 'low', label: 'Rendah', color: 'bg-gray-100 text-gray-800' },
  { value: 'normal', label: 'Normal', color: 'bg-blue-100 text-blue-800' },
  { value: 'high', label: 'Tinggi', color: 'bg-red-100 text-red-800' }
]

export default function ProductionPage() {
  const [productions, setProductions] = useState(sampleProductions)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('Semua')
  const [priorityFilter, setPriorityFilter] = useState('Semua')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedProduction, setSelectedProduction] = useState<any>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  
  // Mobile responsive hooks
  const { isMobile, isTablet } = useResponsive()
  
  // Pull-to-refresh handler
  const handleRefresh = async () => {
    await new Promise(resolve => setTimeout(resolve, 1000))
    // In real app, refetch production data
    setProductions([...sampleProductions])
  }

  // Filter productions
  const filteredProductions = productions.filter(production => {
    const matchesSearch = production.batchNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         production.recipeName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'Semua' || production.status === statusFilter
    const matchesPriority = priorityFilter === 'Semua' || production.priority === priorityFilter
    return matchesSearch && matchesStatus && matchesPriority
  })

  const getStatusInfo = (status: string) => {
    return productionStatuses.find(s => s.value === status) || productionStatuses[0]
  }

  const getPriorityInfo = (priority: string) => {
    return priorities.find(p => p.value === priority) || priorities[1]
  }

  const handleViewProduction = (production: any) => {
    setSelectedProduction(production)
    setIsViewDialogOpen(true)
  }

  const updateProductionStatus = (productionId: string, newStatus: string) => {
    setProductions(prev => prev.map(production => 
      production.id === productionId ? { ...production, status: newStatus } : production
    ))
  }

  // Calculate stats
  const stats = {
    totalBatches: productions.length,
    activeBatches: productions.filter(p => p.status === 'IN_PROGRESS' || p.status === 'PLANNED').length,
    completedToday: productions.filter(p => p.status === 'COMPLETED' && p.actualEndTime?.startsWith('2024-01-25')).length,
    totalProduced: productions.filter(p => p.status === 'COMPLETED').reduce((sum, p) => sum + p.actualQuantity, 0),
    avgEfficiency: productions.filter(p => p.status === 'COMPLETED').length > 0 ? 
      productions.filter(p => p.status === 'COMPLETED').reduce((sum, p) => sum + (p.actualQuantity / p.plannedQuantity * 100), 0) / 
      productions.filter(p => p.status === 'COMPLETED').length : 0
  }

  return (
    <AppLayout>
      <PullToRefresh onRefresh={handleRefresh}>
        <div className="space-y-6">
          {/* Header */}
          <div className={`flex gap-4 ${
            isMobile ? 'flex-col items-center text-center' : 'justify-between items-center'
          }`}>
            <div className={isMobile ? 'text-center' : ''}>
              <h1 className={`font-bold text-foreground ${
                isMobile ? 'text-2xl' : 'text-3xl'
              }`}>Produksi</h1>
              <p className="text-muted-foreground">Kelola perencanaan dan tracking produksi</p>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className={isMobile ? 'w-full' : ''}>
                  <Plus className="h-4 w-4 mr-2" />
                  Batch Baru
                </Button>
              </DialogTrigger>
              <DialogContent className={`max-w-3xl max-h-[90vh] overflow-y-auto ${
                isMobile ? 'w-full mx-4 rounded-lg' : ''
              }`}>
                <DialogHeader>
                  <DialogTitle className={isMobile ? 'text-lg' : ''}>
                    Buat Batch Produksi Baru
                  </DialogTitle>
                </DialogHeader>
                <ProductionForm onClose={() => setIsAddDialogOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats Cards */}
          <div className={`grid gap-4 ${
            isMobile ? 'grid-cols-2' : isTablet ? 'grid-cols-3' : 'md:grid-cols-5'
          }`}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className={`font-medium ${
                  isMobile ? 'text-xs' : 'text-sm'
                }`}>Total Batch</CardTitle>
                <Factory className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`font-bold ${
                  isMobile ? 'text-xl' : 'text-2xl'
                }`}>{stats.totalBatches}</div>
                <p className="text-xs text-muted-foreground">semua batch</p>
                <MiniChartWithLoading 
                  data={productions.slice(0, 7).map((prod, index) => ({
                    day: index + 1,
                    count: prod.status === 'COMPLETED' ? 1 : 0
                  }))}
                  type="bar"
                  dataKey="count"
                  color="#3b82f6"
                  className="mt-2"
                  height={30}
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className={`font-medium ${
                  isMobile ? 'text-xs' : 'text-sm'
                }`}>Batch Aktif</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`font-bold text-orange-600 ${
                  isMobile ? 'text-xl' : 'text-2xl'
                }`}>{stats.activeBatches}</div>
                <p className="text-xs text-muted-foreground">sedang berjalan</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className={`font-medium ${
                  isMobile ? 'text-xs' : 'text-sm'
                }`}>Selesai Hari Ini</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`font-bold text-green-600 ${
                  isMobile ? 'text-xl' : 'text-2xl'
                }`}>{stats.completedToday}</div>
                <p className="text-xs text-muted-foreground">batch completed</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className={`font-medium ${
                  isMobile ? 'text-xs' : 'text-sm'
                }`}>Total Produksi</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`font-bold ${
                  isMobile ? 'text-xl' : 'text-2xl'
                }`}>{stats.totalProduced}</div>
                <p className="text-xs text-muted-foreground">unit diproduksi</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className={`font-medium ${
                  isMobile ? 'text-xs' : 'text-sm'
                }`}>Rata-rata Efisiensi</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`font-bold ${
                  isMobile ? 'text-xl' : 'text-2xl'
                }`}>{stats.avgEfficiency.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">target vs actual</p>
                {productions.filter(p => p.status === 'COMPLETED').length > 0 && (
                  <MiniChartWithLoading 
                    data={productions.filter(p => p.status === 'COMPLETED').slice(0, 7).map((prod, index) => ({
                      day: index + 1,
                      efficiency: (prod.actualQuantity / prod.plannedQuantity * 100)
                    }))}
                    type="line"
                    dataKey="efficiency"
                    color="#10b981"
                    className="mt-2"
                    height={30}
                  />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Smart Production Planner */}
          <ProgressiveLoader 
            loadingMessage="Loading production planner..."
            fallback={
              <div className={isMobile ? 'overflow-x-auto' : ''}>
                <div className="h-96 bg-muted animate-pulse rounded-lg"></div>
              </div>
            }
          >
            <div className={isMobile ? 'overflow-x-auto' : ''}>
              <SmartProductionPlannerWithLoading 
                orders={sampleOrders}
                recipes={sampleRecipes}
                inventory={[
                  { id: '1', name: 'Tepung Terigu', current_stock: 25, min_stock: 10, unit: 'kg', price_per_unit: 12000, category: 'flour', supplier: null, description: null, is_active: true, storage_requirements: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
                  { id: '2', name: 'Mentega', current_stock: 8, min_stock: 5, unit: 'kg', price_per_unit: 35000, category: 'dairy', supplier: null, description: null, is_active: true, storage_requirements: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
                  { id: '3', name: 'Telur Ayam', current_stock: 3, min_stock: 12, unit: 'kg', price_per_unit: 28000, category: 'protein', supplier: null, description: null, is_active: true, storage_requirements: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
                ]}
              />
            </div>
          </ProgressiveLoader>

          {/* Filters and Search */}
          <Card>
            <CardContent className={`pt-6 ${isMobile ? 'px-4' : ''}`}>
              <div className={`flex gap-4 ${
                isMobile ? 'flex-col space-y-4' : 'flex-col md:flex-row'
              }`}>
                <div className="flex-1">
                  <div className="relative">
                    <Search className={`absolute text-muted-foreground ${
                      isMobile ? 'left-3 top-3 h-4 w-4' : 'left-2.5 top-2.5 h-4 w-4'
                    }`} />
                    {isMobile ? (
                      <MobileInput
                        placeholder="Cari batch atau resep..."
                        value={searchTerm}
                        onChange={setSearchTerm}
                        className="pl-10"
                      />
                    ) : (
                      <Input
                        placeholder="Cari batch atau resep..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8"
                      />
                    )}
                  </div>
                </div>
                <div className={`flex gap-2 ${
                  isMobile ? 'flex-col space-y-2' : 'flex-wrap'
                }`}>
                  {isMobile ? (
                    <>
                      <MobileSelect
                        value={statusFilter}
                        onChange={setStatusFilter}
                        placeholder="Semua Status"
                        options={[
                          { value: "Semua", label: "Semua Status" },
                          ...productionStatuses.map(status => ({
                            value: status.value,
                            label: status.label
                          }))
                        ]}
                      />
                      <MobileSelect
                        value={priorityFilter}
                        onChange={setPriorityFilter}
                        placeholder="Semua Prioritas"
                        options={[
                          { value: "Semua", label: "Semua Prioritas" },
                          ...priorities.map(priority => ({
                            value: priority.value,
                            label: priority.label
                          }))
                        ]}
                      />
                    </>
                  ) : (
                    <>
                      <select
                        className="px-3 py-1.5 border border-input rounded-md bg-background text-sm"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                      >
                        <option value="Semua">Semua Status</option>
                        {productionStatuses.map(status => (
                          <option key={status.value} value={status.value}>{status.label}</option>
                        ))}
                      </select>
                      <select
                        className="px-3 py-1.5 border border-input rounded-md bg-background text-sm"
                        value={priorityFilter}
                        onChange={(e) => setPriorityFilter(e.target.value)}
                      >
                        <option value="Semua">Semua Prioritas</option>
                        {priorities.map(priority => (
                          <option key={priority.value} value={priority.value}>{priority.label}</option>
                        ))}
                      </select>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Production List */}
          <div className="space-y-4">
            {filteredProductions.map((production) => {
              const statusInfo = getStatusInfo(production.status)
              const priorityInfo = getPriorityInfo(production.priority)
              const efficiency = production.status === 'COMPLETED' ? (production.actualQuantity / production.plannedQuantity * 100) : 0
              
              // Get swipe actions based on status
              const getSwipeActions = () => {
                type SwipeActionType = {
                  id: string
                  label: string
                  icon: React.ReactNode
                  color: 'red' | 'green' | 'blue' | 'yellow' | 'gray'
                  onClick: () => void
                }
                
                const actions: SwipeActionType[] = [
                  {
                    id: 'view',
                    label: 'Detail',
                    icon: <Eye className="h-4 w-4" />,
                    color: 'blue',
                    onClick: () => handleViewProduction(production)
                  }
                ]
                
                if (production.status === 'PLANNED') {
                  actions.push({
                    id: 'start',
                    label: 'Mulai',
                    icon: <Play className="h-4 w-4" />,
                    color: 'green',
                    onClick: () => updateProductionStatus(production.id, 'IN_PROGRESS')
                  })
                } else if (production.status === 'IN_PROGRESS') {
                  actions.push(
                    {
                      id: 'pause',
                      label: 'Pause',
                      icon: <Pause className="h-4 w-4" />,
                      color: 'yellow',
                      onClick: () => updateProductionStatus(production.id, 'PAUSED')
                    },
                    {
                      id: 'complete',
                      label: 'Selesai',
                      icon: <CheckCircle className="h-4 w-4" />,
                      color: 'green',
                      onClick: () => updateProductionStatus(production.id, 'COMPLETED')
                    }
                  )
                } else if (production.status === 'PAUSED') {
                  actions.push({
                    id: 'resume',
                    label: 'Lanjutkan',
                    icon: <Play className="h-4 w-4" />,
                    color: 'green',
                    onClick: () => updateProductionStatus(production.id, 'IN_PROGRESS')
                  })
                }
                
                return actions
              }
              
              return isMobile ? (
                <SwipeActions
                  key={production.id}
                  actions={getSwipeActions()}
                >
                  <Card className="transition-shadow cursor-pointer">
                    <CardContent className="p-4" onClick={() => handleViewProduction(production)}>
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-base truncate">{production.batchNo}</h3>
                            <p className="text-sm text-muted-foreground truncate mt-1">
                              {production.recipeName}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-1 ml-2">
                            <Badge className={`${statusInfo.color} text-xs`}>
                              {statusInfo.label}
                            </Badge>
                            {production.priority !== 'normal' && (
                              <Badge variant="outline" className={`${priorityInfo.color} text-xs`}>
                                {priorityInfo.label}
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-xs text-muted-foreground">Target</p>
                            <p className="font-medium">{production.plannedQuantity} unit</p>
                          </div>
                          {production.actualQuantity > 0 && (
                            <div>
                              <p className="text-xs text-muted-foreground">Actual</p>
                              <p className="font-medium">{production.actualQuantity} unit</p>
                            </div>
                          )}
                          <div>
                            <p className="text-xs text-muted-foreground">Cost/Unit</p>
                            <p className="font-medium">Rp {production.costPerUnit.toLocaleString()}</p>
                          </div>
                          {production.status === 'COMPLETED' && (
                            <div>
                              <p className="text-xs text-muted-foreground">Efisiensi</p>
                              <p className={`font-medium text-sm ${
                                efficiency >= 90 ? 'text-green-600' : efficiency >= 75 ? 'text-yellow-600' : 'text-red-600'
                              }`}>
                                {efficiency.toFixed(1)}%
                              </p>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{production.plannedStartTime.split(' ')[0]}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Timer className="h-3 w-3" />
                            <span>{production.estimatedDuration}m</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            <span>{production.assignedStaff.length} staff</span>
                          </div>
                        </div>
                        
                        {production.notes && (
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {production.notes}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </SwipeActions>
              ) : (
                <Card key={production.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{production.batchNo}</h3>
                          <Badge className={statusInfo.color}>
                            {statusInfo.label}
                          </Badge>
                          {production.priority !== 'normal' && (
                            <Badge variant="outline" className={priorityInfo.color}>
                              {priorityInfo.label}
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <Package className="h-4 w-4" />
                              <span>{production.recipeName}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Target className="h-4 w-4" />
                              <span>Target: {production.plannedQuantity} unit</span>
                            </div>
                            {production.actualQuantity > 0 && (
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4" />
                                <span>Actual: {production.actualQuantity} unit</span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              <span>Mulai: {production.plannedStartTime}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Timer className="h-4 w-4" />
                              <span>Durasi: {production.estimatedDuration} menit</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              <span>Staff: {production.assignedStaff.join(', ')}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">
                          Rp {production.costPerUnit.toLocaleString()}/unit
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Total: Rp {production.totalCost.toLocaleString()}
                        </div>
                        {production.status === 'COMPLETED' && (
                          <div className="text-sm">
                            <span className={`font-medium ${efficiency >= 90 ? 'text-green-600' : efficiency >= 75 ? 'text-yellow-600' : 'text-red-600'}`}>
                              Efisiensi: {efficiency.toFixed(1)}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-4 text-sm">
                        <div className="text-muted-foreground">
                          Profit Margin: {production.profitMargin.toFixed(1)}%
                        </div>
                        {production.qualityRating > 0 && (
                          <div className="text-muted-foreground">
                            Kualitas: ⭐ {production.qualityRating}
                          </div>
                        )}
                        {production.notes && (
                          <div className="text-muted-foreground truncate max-w-xs">
                            Note: {production.notes}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewProduction(production)}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Detail
                        </Button>
                        {production.status === 'PLANNED' && (
                          <Button 
                            size="sm"
                            onClick={() => updateProductionStatus(production.id, 'IN_PROGRESS')}
                          >
                            <Play className="h-3 w-3 mr-1" />
                            Mulai
                          </Button>
                        )}
                        {production.status === 'IN_PROGRESS' && (
                          <>
                            <Button 
                              variant="outline"
                              size="sm"
                              onClick={() => updateProductionStatus(production.id, 'PAUSED')}
                            >
                              <Pause className="h-3 w-3 mr-1" />
                              Pause
                            </Button>
                            <Button 
                              size="sm"
                              onClick={() => updateProductionStatus(production.id, 'COMPLETED')}
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Selesai
                            </Button>
                          </>
                        )}
                        {production.status === 'PAUSED' && (
                          <Button 
                            size="sm"
                            onClick={() => updateProductionStatus(production.id, 'IN_PROGRESS')}
                          >
                            <Play className="h-3 w-3 mr-1" />
                            Lanjutkan
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {filteredProductions.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <Factory className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className={`font-medium mb-2 ${
                  isMobile ? 'text-base' : 'text-lg'
                }`}>Tidak ada batch produksi ditemukan</h3>
                <p className="text-muted-foreground mb-4">
                  Coba ubah kata kunci pencarian atau filter
                </p>
                <Button onClick={() => setIsAddDialogOpen(true)} className={isMobile ? 'w-full' : ''}>
                  <Plus className="h-4 w-4 mr-2" />
                  Buat Batch Pertama
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Production Detail Dialog */}
          <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
            <DialogContent className={`max-w-5xl max-h-[90vh] overflow-y-auto ${
              isMobile ? 'w-full mx-4 rounded-lg' : ''
            }`}>
              <DialogHeader>
                <DialogTitle className={isMobile ? 'text-lg' : ''}>
                  Detail Batch {selectedProduction?.batchNo}
                </DialogTitle>
              </DialogHeader>
              {selectedProduction && <ProductionDetailView production={selectedProduction} />}
            </DialogContent>
          </Dialog>
        </div>
      </PullToRefresh>
    </AppLayout>
  )
}

// Production Form Component
function ProductionForm({ onClose }: { onClose: () => void }) {
  return (
    <Tabs defaultValue="basic" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="basic">Info Dasar</TabsTrigger>
        <TabsTrigger value="schedule">Jadwal</TabsTrigger>
        <TabsTrigger value="resources">Sumber Daya</TabsTrigger>
        <TabsTrigger value="costing">Costing</TabsTrigger>
      </TabsList>
      
      <TabsContent value="basic" className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="recipe">Resep</Label>
            <select className="w-full p-2 border border-input rounded-md bg-background">
              <option value="">Pilih resep</option>
              <option value="RCP-001">Roti Tawar Premium</option>
              <option value="RCP-002">Croissant Butter</option>
              <option value="RCP-003">Donat Glaze</option>
            </select>
          </div>
          <div>
            <Label htmlFor="plannedQuantity">Jumlah Target</Label>
            <Input id="plannedQuantity" type="number" placeholder="50" />
          </div>
          <div>
            <Label htmlFor="priority">Prioritas</Label>
            <select className="w-full p-2 border border-input rounded-md bg-background">
              <option value="normal">Normal</option>
              <option value="high">Tinggi</option>
              <option value="low">Rendah</option>
            </select>
          </div>
          <div>
            <Label htmlFor="batchNo">Nomor Batch</Label>
            <Input id="batchNo" placeholder="Auto-generate" disabled />
          </div>
        </div>
        <div>
          <Label htmlFor="notes">Catatan</Label>
          <Textarea id="notes" placeholder="Catatan untuk batch ini..." />
        </div>
      </TabsContent>
      
      <TabsContent value="schedule" className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="startDate">Tanggal Mulai</Label>
            <Input id="startDate" type="date" />
          </div>
          <div>
            <Label htmlFor="startTime">Waktu Mulai</Label>
            <Input id="startTime" type="time" />
          </div>
          <div>
            <Label htmlFor="estimatedDuration">Estimasi Durasi (menit)</Label>
            <Input id="estimatedDuration" type="number" placeholder="180" />
          </div>
          <div>
            <Label htmlFor="endTime">Estimasi Selesai</Label>
            <Input id="endTime" type="time" disabled />
          </div>
        </div>
      </TabsContent>
      
      <TabsContent value="resources" className="space-y-4">
        <div>
          <Label>Staff yang Ditugaskan</Label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {['Ahmad', 'Budi', 'Sari', 'Dewi', 'Rian'].map(staff => (
              <label key={staff} className="flex items-center gap-2">
                <input type="checkbox" className="rounded" />
                <span className="text-sm">{staff}</span>
              </label>
            ))}
          </div>
        </div>
        <div>
          <Label>Equipment yang Dibutuhkan</Label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {['Mixer Besar', 'Oven A', 'Oven B', 'Proofer', 'Work Station 1'].map(equipment => (
              <label key={equipment} className="flex items-center gap-2">
                <input type="checkbox" className="rounded" />
                <span className="text-sm">{equipment}</span>
              </label>
            ))}
          </div>
        </div>
      </TabsContent>
      
      <TabsContent value="costing" className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="materialCost">Biaya Bahan</Label>
            <Input id="materialCost" type="number" placeholder="400000" />
          </div>
          <div>
            <Label htmlFor="laborCost">Biaya Tenaga Kerja</Label>
            <Input id="laborCost" type="number" placeholder="120000" />
          </div>
          <div>
            <Label htmlFor="overheadCost">Biaya Overhead</Label>
            <Input id="overheadCost" type="number" placeholder="50000" />
          </div>
          <div>
            <Label htmlFor="expectedRevenue">Target Revenue</Label>
            <Input id="expectedRevenue" type="number" placeholder="750000" />
          </div>
        </div>
        <div className="bg-muted p-4 rounded-lg">
          <h4 className="font-medium mb-2">Estimasi Profitabilitas</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Total Cost:</span>
              <span>Rp 0</span>
            </div>
            <div className="flex justify-between">
              <span>Cost per Unit:</span>
              <span>Rp 0</span>
            </div>
            <div className="flex justify-between">
              <span>Expected Revenue:</span>
              <span>Rp 0</span>
            </div>
            <div className="flex justify-between font-medium">
              <span>Profit Margin:</span>
              <span>0%</span>
            </div>
          </div>
        </div>
      </TabsContent>
      
      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button variant="outline" onClick={onClose}>Batal</Button>
        <Button>Buat Batch</Button>
      </div>
    </Tabs>
  )
}

// Production Detail View Component
function ProductionDetailView({ production }: { production: any }) {
  const statusInfo = getStatusInfo(production.status)
  const efficiency = production.status === 'COMPLETED' ? (production.actualQuantity / production.plannedQuantity * 100) : 0

  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="materials">Bahan</TabsTrigger>
        <TabsTrigger value="timeline">Timeline</TabsTrigger>
        <TabsTrigger value="costing">Costing</TabsTrigger>
        <TabsTrigger value="quality">Kualitas</TabsTrigger>
      </TabsList>
      
      <TabsContent value="overview" className="space-y-4">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">Informasi Batch</h3>
              <div className="mt-2 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Batch No:</span>
                  <span className="font-mono">{production.batchNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Resep:</span>
                  <span>{production.recipeName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Target Produksi:</span>
                  <span>{production.plannedQuantity} unit</span>
                </div>
                {production.actualQuantity > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Actual Produksi:</span>
                    <span>{production.actualQuantity} unit</span>
                  </div>
                )}
                {production.status === 'COMPLETED' && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Efisiensi:</span>
                    <span className={efficiency >= 90 ? 'text-green-600 font-medium' : efficiency >= 75 ? 'text-yellow-600 font-medium' : 'text-red-600 font-medium'}>
                      {efficiency.toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">Tim & Sumber Daya</h3>
              <div className="mt-2 space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Staff Ditugaskan:</span>
                  <div className="mt-1">
                    {production.assignedStaff.map((staff: string, index: number) => (
                      <Badge key={index} variant="outline" className="mr-1 mb-1">{staff}</Badge>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Durasi Estimasi:</span>
                  <span>{production.estimatedDuration} menit</span>
                </div>
                {production.actualDuration > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Durasi Actual:</span>
                    <span className={production.actualDuration <= production.estimatedDuration ? 'text-green-600' : 'text-red-600'}>
                      {production.actualDuration} menit
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        {production.notes && (
          <div>
            <h3 className="font-medium">Catatan</h3>
            <p className="mt-2 text-sm text-muted-foreground p-3 bg-muted rounded-lg">{production.notes}</p>
          </div>
        )}
      </TabsContent>
      
      <TabsContent value="materials" className="space-y-4">
        <h3 className="font-medium">Penggunaan Bahan ({production.ingredients.length})</h3>
        <div className="space-y-2">
          {production.ingredients.map((ingredient: any, index: number) => (
            <div key={index} className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <div>
                <p className="font-medium">{ingredient.name}</p>
                <p className="text-sm text-muted-foreground">
                  Planned: {ingredient.planned} {ingredient.unit}
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium">Used: {ingredient.used} {ingredient.unit}</p>
                <p className={`text-xs ${ingredient.used <= ingredient.planned ? 'text-green-600' : 'text-red-600'}`}>
                  {ingredient.used <= ingredient.planned ? 'Efisien' : 'Over'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </TabsContent>
      
      <TabsContent value="timeline" className="space-y-4">
        <h3 className="font-medium">Timeline Produksi</h3>
        <div className="space-y-4">
          <div className="border-l-2 border-muted pl-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <div>
                  <p className="font-medium">Planned Start</p>
                  <p className="text-sm text-muted-foreground">{production.plannedStartTime}</p>
                </div>
              </div>
              {production.actualStartTime && (
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="font-medium">Actual Start</p>
                    <p className="text-sm text-muted-foreground">{production.actualStartTime}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <div>
                  <p className="font-medium">Planned End</p>
                  <p className="text-sm text-muted-foreground">{production.plannedEndTime}</p>
                </div>
              </div>
              {production.actualEndTime && (
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="font-medium">Actual End</p>
                    <p className="text-sm text-muted-foreground">{production.actualEndTime}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </TabsContent>
      
      <TabsContent value="costing" className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Biaya Bahan</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold">Rp {production.materialCost.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Biaya Tenaga Kerja</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold">Rp {production.laborCost.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Biaya Overhead</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold">Rp {production.overheadCost.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Total Biaya</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold">Rp {production.totalCost.toLocaleString()}</p>
            </CardContent>
          </Card>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Cost per Unit:</span>
            <span className="font-medium">Rp {production.costPerUnit.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Expected Revenue:</span>
            <span className="font-medium">Rp {production.expectedRevenue.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Profit Margin:</span>
            <span className="font-medium text-green-600">{production.profitMargin.toFixed(1)}%</span>
          </div>
        </div>
      </TabsContent>
      
      <TabsContent value="quality" className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Quality Rating</CardTitle>
            </CardHeader>
            <CardContent>
              {production.qualityRating > 0 ? (
                <div className="flex items-center gap-2">
                  <span className="text-2xl">⭐</span>
                  <span className="text-xl font-bold">{production.qualityRating}</span>
                </div>
              ) : (
                <span className="text-muted-foreground">Belum dinilai</span>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Defect Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold">
                {production.status === 'COMPLETED' ? 
                  ((production.plannedQuantity - production.actualQuantity) / production.plannedQuantity * 100).toFixed(1) + '%' 
                  : 'N/A'}
              </p>
            </CardContent>
          </Card>
        </div>
        <div>
          <Label htmlFor="qualityNotes">Catatan Kualitas</Label>
          <Textarea id="qualityNotes" placeholder="Tambahkan catatan kualitas..." />
          <Button className="mt-2" size="sm">Simpan Catatan</Button>
        </div>
      </TabsContent>
    </Tabs>
  )
}

function getStatusInfo(status: string) {
  return productionStatuses.find(s => s.value === status) || productionStatuses[0]
}