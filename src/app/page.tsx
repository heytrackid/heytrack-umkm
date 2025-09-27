'use client'

import { useState, useEffect, useCallback } from 'react'
import AppLayout from '@/components/layout/app-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { SmartNotificationCenter } from '@/components/automation/smart-notification-center'
import EnhancedSmartNotifications from '@/components/automation/enhanced-smart-notifications'
import AdvancedHPPCalculator from '@/components/automation/advanced-hpp-calculator'
import ProductionPlanningDashboard from '@/components/automation/production-planning-dashboard'
import InventoryAnalytics from '@/components/automation/inventory-analytics'
import { useSupabaseData } from '@/hooks/useSupabaseCRUD'
import { useResponsive } from '@/hooks/use-mobile'
import { 
  PullToRefresh,
  SwipeActions 
} from '@/components/ui/mobile-gestures'
import {
  MobileBarChart,
  MobilePieChart,
  MiniChart
} from '@/components/ui/mobile-charts'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Package, 
  ShoppingCart, 
  Users,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Plus,
  Edit,
  Trash2,
  Star
} from 'lucide-react'


const getStatusBadge = (status: string) => {
  const statusMap = {
    'PENDING': { label: 'Menunggu', variant: 'secondary' as const },
    'IN_PROGRESS': { label: 'Proses', variant: 'default' as const },
    'READY': { label: 'Siap', variant: 'default' as const },
    'DELIVERED': { label: 'Terkirim', variant: 'secondary' as const }
  }
  return statusMap[status as keyof typeof statusMap] || { label: status, variant: 'secondary' as const }
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']

export default function Dashboard() {
  const { isMobile, isTablet } = useResponsive()
  
  // Fetch real data from database
  const { data: ingredients, loading: ingredientsLoading, refetch: refetchIngredients } = useSupabaseData('ingredients')
  const { data: orders, loading: ordersLoading, refetch: refetchOrders } = useSupabaseData('orders', {
    orderBy: { column: 'created_at', ascending: false },
    limit: 5
  })
  const { data: customers, loading: customersLoading, refetch: refetchCustomers } = useSupabaseData('customers')
  const { data: recipes, loading: recipesLoading, refetch: refetchRecipes } = useSupabaseData('recipes')
  
  const [stats, setStats] = useState({
    totalSales: 0,
    activeOrders: 0,
    productsSold: 0,
    newCustomers: 0
  })

  // Calculate real stats from data
  useEffect(() => {
    if (!ordersLoading && orders) {
      const today = new Date().toDateString()
      const todaysOrders = orders.filter(order => 
        new Date(order.created_at).toDateString() === today
      )
      
      const totalSales = todaysOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0)
      const activeOrders = orders.filter(order => 
        ['PENDING', 'IN_PROGRESS'].includes(order.status)
      ).length
      
      setStats({
        totalSales,
        activeOrders,
        productsSold: todaysOrders.reduce((sum, order) => sum + 1, 0), // Simple count for now
        newCustomers: customers?.length || 0
      })
    }
  }, [orders, ordersLoading, customers])
  
  // Low stock items
  const lowStockItems = ingredients?.filter(ingredient => 
    ingredient.current_stock <= ingredient.min_stock
  ) || []
  
  // Chart data
  const inventoryChartData = ingredients?.slice(0, 5).map(ingredient => ({
    name: ingredient.name.substring(0, 10) + '...',
    stock: ingredient.current_stock,
    min: ingredient.min_stock
  })) || []
  
  const categoryData = ingredients?.reduce((acc, ingredient) => {
    const category = ingredient.category || 'Lainnya'
    acc[category] = (acc[category] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  const pieData = categoryData ? Object.entries(categoryData).map(([category, count]) => ({
    name: category,
    value: count
  })) : []

  // Mobile pull-to-refresh handler
  const handleRefresh = useCallback(async () => {
    try {
      await Promise.all([
        refetchIngredients(),
        refetchOrders(),
        refetchCustomers(),
        refetchRecipes()
      ])
    } catch (error) {
      console.error('Error refreshing data:', error)
    }
  }, [refetchIngredients, refetchOrders, refetchCustomers, refetchRecipes])

  // Chart data for mobile components
  const salesTrendData = [
    { name: 'Sen', sales: stats.totalSales * 0.7 },
    { name: 'Sel', sales: stats.totalSales * 0.8 },
    { name: 'Rab', sales: stats.totalSales * 0.9 },
    { name: 'Kam', sales: stats.totalSales * 0.95 },
    { name: 'Jum', sales: stats.totalSales * 1.1 },
    { name: 'Sab', sales: stats.totalSales },
    { name: 'Min', sales: stats.totalSales * 1.2 }
  ]

  // Swipe actions for order items
  const orderSwipeActions = [
    {
      id: 'view',
      label: 'Lihat',
      icon: <Star className="h-4 w-4" />,
      color: 'blue' as const,
      onClick: () => console.log('View order')
    },
    {
      id: 'edit',
      label: 'Edit',
      icon: <Edit className="h-4 w-4" />,
      color: 'green' as const,
      onClick: () => console.log('Edit order')
    }
  ]
  return (
    <AppLayout>
      <PullToRefresh onRefresh={handleRefresh}>
        <div className="space-y-6">
          <div>
            <h1 className={`font-bold text-foreground ${
              isMobile ? 'text-2xl' : 'text-3xl'
            }`}>Dashboard</h1>
            <p className="text-muted-foreground">Selamat datang di sistem manajemen toko roti</p>
          </div>

          {/* Stats Cards */}
          <div className={`grid gap-4 ${
            isMobile ? 'grid-cols-2' : isTablet ? 'grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-4'
          }`}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Penjualan Hari Ini</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`font-bold ${
                isMobile ? 'text-xl' : 'text-2xl'
              }`}>Rp {stats.totalSales.toLocaleString('id-ID')}</div>
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span className="text-green-500">+12.5%</span>
              </div>
              {/* Mini trend chart */}
              {stats.totalSales > 0 && (
                <MiniChart 
                  data={salesTrendData.slice(0, 4)}
                  type="area"
                  dataKey="sales"
                  color="#10b981"
                  className="mt-2"
                  height={40}
                />
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pesanan Aktif</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`font-bold ${
                isMobile ? 'text-xl' : 'text-2xl'
              }`}>{stats.activeOrders}</div>
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span className="text-green-500">+{stats.activeOrders > 0 ? '3' : '0'}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bahan Baku</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`font-bold ${
                isMobile ? 'text-xl' : 'text-2xl'
              }`}>{ingredients?.length || 0}</div>
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                <AlertTriangle className="h-3 w-3 text-orange-500" />
                <span className="text-orange-500">{lowStockItems.length} menipis</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Resep</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`font-bold ${
                isMobile ? 'text-xl' : 'text-2xl'
              }`}>{recipes?.length || 0}</div>
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span className="text-green-500">+2</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Smart Notifications */}
        <EnhancedSmartNotifications />

        <div className={`grid gap-6 ${
          isMobile ? 'grid-cols-1' : 'md:grid-cols-2'
        }`}>
          {/* Low Stock Alert */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                <span>Stok Menipis ({lowStockItems.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {lowStockItems.length > 0 ? (
                  lowStockItems.slice(0, 5).map((item) => (
                    <div key={item.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Stok: {item.current_stock} {item.unit} / Min: {item.min_stock} {item.unit}
                        </p>
                      </div>
                      <Badge variant={item.current_stock <= item.min_stock * 0.5 ? "destructive" : "secondary"}>
                        {item.current_stock <= item.min_stock * 0.5 ? 'Kritis' : 'Rendah'}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    <Package className="h-8 w-8 mx-auto mb-2" />
                    <p>Semua stok dalam kondisi baik</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ShoppingCart className="h-5 w-5 text-blue-500" />
                <span>Pesanan Terbaru</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orders && orders.length > 0 ? (
                  orders.slice(0, 5).map((order) => {
                    const status = getStatusBadge(order.status)
                    return (
                      <SwipeActions key={order.id} actions={orderSwipeActions}>
                        <div className={`flex items-center justify-between p-3 rounded-lg ${
                          isMobile ? 'bg-muted/50' : ''
                        }`}>
                          <div>
                            <p className="font-medium">{order.order_no}</p>
                            <p className="text-sm text-muted-foreground">{order.customer_name || 'Walk-in customer'}</p>
                          </div>
                          <div className="text-right">
                            <Badge variant={status.variant}>{status.label}</Badge>
                            <p className="text-sm font-medium mt-1">
                              Rp {(order.total_amount || 0).toLocaleString('id-ID')}
                            </p>
                          </div>
                        </div>
                      </SwipeActions>
                    )
                  })
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    <ShoppingCart className="h-8 w-8 mx-auto mb-2" />
                    <p>Belum ada pesanan</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className={`grid gap-6 ${
          isMobile ? 'grid-cols-1' : 'md:grid-cols-2'
        }`}>
          {/* Inventory Stock Chart - Mobile Optimized */}
          <MobileBarChart
            title="Stok Bahan Baku"
            description="Perbandingan stok saat ini dengan minimum"
            data={inventoryChartData}
            xKey="name"
            bars={[
              { key: 'stock', name: 'Stok Saat Ini', color: '#8884d8' },
              { key: 'min', name: 'Minimum', color: '#ff7300' }
            ]}
            height={isMobile ? 200 : 250}
            showGrid={!isMobile}
          />

          {/* Category Distribution - Mobile Optimized */}
          <MobilePieChart
            title="Kategori Bahan"
            description="Distribusi bahan baku berdasarkan kategori"
            data={pieData}
            valueKey="value"
            nameKey="name"
            colors={COLORS}
            height={isMobile ? 200 : 250}
            innerRadius={isMobile ? 40 : 60}
            showLabels={!isMobile}
          />
        </div>

        {/* Enhanced Automation Section */}
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Smart Automation Dashboard</h2>
            <p className="text-muted-foreground">Advanced analytics and intelligent business automation</p>
          </div>
          
          {/* Production Planning */}
          <ProductionPlanningDashboard />
          
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Inventory Analytics */}
            <InventoryAnalytics />
            
            {/* Advanced HPP Calculator */}
            {recipes && recipes.length > 0 && (
              <AdvancedHPPCalculator 
                recipeId={recipes[0].id}
                recipeName={recipes[0].name}
                onPriceUpdate={(price) => {
                  console.log('Price updated to:', price)
                  // Could add logic here to update recipe price in database
                }}
              />
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className={isMobile ? 'text-lg' : 'text-xl'}>Aksi Cepat</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`grid gap-4 ${
              isMobile ? 'grid-cols-2' : isTablet ? 'grid-cols-3' : 'md:grid-cols-4'
            }`}>
              <Button 
                variant="outline" 
                className={`flex flex-col items-center space-y-2 h-auto ${
                  isMobile ? 'p-4 min-h-[80px]' : 'p-4'
                }`}
                onClick={() => window.location.href = '/orders'}
              >
                <ShoppingCart className={`text-blue-500 ${
                  isMobile ? 'h-6 w-6' : 'h-8 w-8'
                }`} />
                <span className={`font-medium text-foreground ${
                  isMobile ? 'text-sm' : 'text-base'
                }`}>Pesanan Baru</span>
              </Button>
              <Button 
                variant="outline" 
                className={`flex flex-col items-center space-y-2 h-auto ${
                  isMobile ? 'p-4 min-h-[80px]' : 'p-4'
                }`}
                onClick={() => window.location.href = '/recipes'}
              >
                <Package className={`text-green-500 ${
                  isMobile ? 'h-6 w-6' : 'h-8 w-8'
                }`} />
                <span className={`font-medium text-foreground ${
                  isMobile ? 'text-sm' : 'text-base'
                }`}>Tambah Resep</span>
              </Button>
              <Button 
                variant="outline" 
                className={`flex flex-col items-center space-y-2 h-auto ${
                  isMobile ? 'p-4 min-h-[80px]' : 'p-4'
                }`}
                onClick={() => window.location.href = '/hpp'}
              >
                <TrendingUp className={`text-purple-500 ${
                  isMobile ? 'h-6 w-6' : 'h-8 w-8'
                }`} />
                <span className={`font-medium text-foreground ${
                  isMobile ? 'text-sm' : 'text-base'
                }`}>Hitung HPP</span>
              </Button>
              <Button 
                variant="outline" 
                className={`flex flex-col items-center space-y-2 h-auto ${
                  isMobile ? 'p-4 min-h-[80px]' : 'p-4'
                }`}
                onClick={() => window.location.href = '/inventory'}
              >
                <CheckCircle className={`text-orange-500 ${
                  isMobile ? 'h-6 w-6' : 'h-8 w-8'
                }`} />
                <span className={`font-medium text-foreground ${
                  isMobile ? 'text-sm' : 'text-base'
                }`}>Update Stok</span>
              </Button>
            </div>
          </CardContent>
        </Card>
        </div>
      </PullToRefresh>
    </AppLayout>
  )
}
