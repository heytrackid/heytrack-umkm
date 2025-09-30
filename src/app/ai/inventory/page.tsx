'use client'

import { Suspense, useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import AppLayout from '@/components/layout/app-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { useResponsive } from '@/hooks/use-mobile'
import { TrendingDown, Brain, Package, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react'
import { formatCurrency } from '@/shared/utils/currency'

// Skeleton components
const InventoryOptimizationSkeleton = () => (
  <div className="space-y-4">
    {Array(3).fill(0).map((_, i) => (
      <Card key={i}>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Skeleton className="h-5 w-5" />
              <Skeleton className="h-5 w-40" />
            </div>
            <div className="space-y-3">
              {Array(3).fill(0).map((_, j) => (
                <div key={j} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <div className="space-y-1 text-right">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
)

export default function AIInventoryPage() {
  const { isMobile } = useResponsive()
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [optimization, setOptimization] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  // Mock inventory data
  const sampleInventoryData = [
    {
      name: 'Tepung Terigu',
      currentStock: 15,
      minStock: 20,
      usagePerWeek: 25,
      price: 12000,
      supplier: 'Toko Bahan Kue Sentral',
      leadTime: 2
    },
    {
      name: 'Butter',
      currentStock: 5,
      minStock: 8,
      usagePerWeek: 10,
      price: 45000,
      supplier: 'Supplier Dairy Jakarta',
      leadTime: 1
    },
    {
      name: 'Gula Pasir',
      currentStock: 30,
      minStock: 15,
      usagePerWeek: 12,
      price: 8000,
      supplier: 'PT Gula Nusantara',
      leadTime: 3
    }
  ]

  const optimizeInventory = async () => {
    setIsOptimizing(true)
    setError(null)

    try {
      // Simulate AI optimization
      await new Promise(resolve => setTimeout(resolve, 2000))

      const mockOptimization = {
        reorderRecommendations: [
          {
            item: 'Tepung Terigu',
            currentStock: 15,
            recommendedOrder: 100,
            priority: 'high',
            reason: 'Stock akan habis dalam 4 hari',
            estimatedDelivery: '2024-01-15'
          },
          {
            item: 'Butter',
            currentStock: 5,
            recommendedOrder: 50,
            priority: 'urgent',
            reason: 'Stock kritis, segera reorder',
            estimatedDelivery: '2024-01-12'
          }
        ],
        stockPredictions: [
          {
            item: 'Tepung Terigu',
            predictedStockOut: '2024-01-18',
            recommendedAction: 'Reorder 100kg dalam 2 hari',
            confidenceLevel: 92
          },
          {
            item: 'Butter',
            predictedStockOut: '2024-01-14',
            recommendedAction: 'URGENT: Reorder sekarang juga!',
            confidenceLevel: 96
          }
        ],
        costOptimization: {
          totalSavings: 125000,
          recommendations: [
            'Bulk order tepung terigu untuk hemat 8%',
            'Negosiasi payment terms NET-30 dengan supplier',
            'Konsolidasi order mingguan untuk reduce delivery cost'
          ]
        },
        seasonalAdjustments: [
          {
            item: 'Tepung Terigu',
            adjustment: 'Stock +30% untuk persiapan Ramadan',
            reason: 'Demand kue kering meningkat drastis'
          },
          {
            item: 'Butter',
            adjustment: 'Stock +20% untuk musim hujan',
            reason: 'Croissant dan pastry lebih laku'
          }
        ]
      }

      setOptimization(mockOptimization)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengoptimasi inventory')
    } finally {
      setIsOptimizing(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'destructive'
      case 'high': return 'default'
      case 'medium': return 'secondary'
      default: return 'outline'
    }
  }

  const getPriorityIcon = (priority: string) => {
    return priority === 'urgent' ? AlertTriangle : Package
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Dashboard</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/ai">AI Assistant</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Inventory AI</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div className={`flex gap-4 ${isMobile ? 'flex-col items-center text-center' : 'justify-between items-center'}`}>
          <div className={isMobile ? 'text-center' : ''}>
            <h1 className={`font-bold text-gray-900 ${isMobile ? 'text-2xl' : 'text-3xl'} flex items-center justify-center gap-2`}>
              <TrendingDown className="h-8 w-8 text-orange-600" />
              Inventory AI
              <Badge variant="default" className="text-xs">AUTO</Badge>
            </h1>
            <p className="text-gray-600 mt-1">
              Prediksi stok dan rekomendasi reorder berbasis AI
            </p>
          </div>
          <Button 
            variant="outline" 
            className={isMobile ? 'w-full' : ''}
            onClick={optimizeInventory}
            disabled={isOptimizing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isOptimizing ? 'animate-spin' : ''}`} />
            {isOptimizing ? 'Mengoptimasi...' : 'Analisis AI'}
          </Button>
        </div>

        {/* Error State */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="h-4 w-4" />
                <p className="text-sm font-medium">AI Service Error:</p>
              </div>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Current Inventory Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-gray-600" />
              Current Inventory Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {sampleInventoryData.map((item, index) => {
                const isLowStock = item.currentStock <= item.minStock
                const weeksRemaining = item.currentStock / item.usagePerWeek
                
                return (
                  <div key={index} className={`border rounded-lg p-4 ${isLowStock ? 'border-red-200 bg-red-50' : 'border-gray-200'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900">{item.name}</h3>
                      {isLowStock && (
                        <Badge variant="destructive" className="text-xs">
                          LOW STOCK
                        </Badge>
                      )}
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Current:</span>
                        <span className={isLowStock ? 'text-red-600 font-medium' : 'text-gray-900'}>{item.currentStock} unit</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Min Stock:</span>
                        <span className="text-gray-900">{item.minStock} unit</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Weekly Use:</span>
                        <span className="text-gray-900">{item.usagePerWeek} unit</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Est. Duration:</span>
                        <span className={weeksRemaining < 1 ? 'text-red-600 font-medium' : 'text-gray-900'}>
                          {weeksRemaining.toFixed(1)} weeks
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Optimization Results */}
        {isOptimizing ? (
          <Suspense fallback={<div className="h-96 bg-gray-100 animate-pulse rounded" />}>
            <InventoryOptimizationSkeleton />
          </Suspense>
        ) : optimization ? (
          <div className="space-y-6">
            {/* Reorder Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-orange-600" />
                  Rekomendasi Reorder AI
                </CardTitle>
              </CardHeader>
              <CardContent>
                {optimization.reorderRecommendations.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                    <h3 className="font-medium text-gray-900 mb-1">Stock Optimal!</h3>
                    <p className="text-sm text-gray-500">Semua item masih dalam level yang aman</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {optimization.reorderRecommendations.map((rec: any, index: number) => {
                      const Icon = getPriorityIcon(rec.priority)
                      return (
                        <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-sm transition-shadow">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-orange-50 rounded-full flex items-center justify-center">
                              <Icon className="h-4 w-4 text-orange-600" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{rec.item}</h4>
                              <p className="text-sm text-gray-600">{rec.reason}</p>
                              <p className="text-xs text-gray-500">Estimasi tiba: {rec.estimatedDelivery}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant={getPriorityColor(rec.priority) as any} className="text-xs mb-2">
                              {rec.priority.toUpperCase()}
                            </Badge>
                            <p className="text-sm font-medium text-gray-900">{rec.recommendedOrder} unit</p>
                            <p className="text-xs text-gray-500">Stock: {rec.currentStock} unit</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Cost Optimization */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-green-600" />
                  Optimasi Biaya
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-800">Potensi Penghematan</span>
                  </div>
                  <p className="text-2xl font-bold text-green-700">
                    {formatCurrency(optimization.costOptimization.totalSavings)}
                  </p>
                  <p className="text-sm text-green-600">Per bulan</p>
                </div>
                <div className="space-y-2">
                  {optimization.costOptimization.recommendations.map((rec: string, index: number) => (
                    <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <p className="text-sm text-gray-700">{rec}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Seasonal Adjustments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-blue-600" />
                  Penyesuaian Musiman
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {optimization.seasonalAdjustments.map((adj: any, index: number) => (
                    <div key={index} className="p-4 border border-blue-200 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-1">{adj.item}</h4>
                      <p className="text-sm text-blue-800 mb-2">{adj.adjustment}</p>
                      <p className="text-xs text-blue-600">{adj.reason}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Brain className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="font-medium text-gray-500 mb-2">
                Siap Menganalisis Inventory
              </h3>
              <p className="text-sm text-gray-400">
                Klik "Analisis AI" untuk mendapatkan rekomendasi optimasi inventory berbasis AI
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  )
}
