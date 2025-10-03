'use client'

import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import PrefetchLink from '@/components/ui/prefetch-link'
import AppLayout from '@/components/layout/app-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { useResponsive } from '@/hooks/use-mobile'
import { Brain, RefreshCw, Sparkles } from 'lucide-react'

// Dynamic imports with skeletons
const AIStatsCards = dynamic(() => import('./components/AIStatsCards'), {
  ssr: false,
  loading: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array(4).fill(0).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="w-10 h-10 rounded-lg" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
})

const AIInsightsCard = dynamic(() => import('./components/AIInsightsCard'), {
  ssr: false,
  loading: () => (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-5 w-32" />
          </div>
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-3/4" />
              </div>
              <div className="flex justify-between items-center mt-4">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-24" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
})

const AIQuickActions = dynamic(() => import('./components/AIQuickActions'), {
  ssr: false,
  loading: () => (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-5 w-40" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <Skeleton className="w-8 h-8 rounded-lg" />
                  <Skeleton className="h-5 w-12" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-full" />
                </div>
                <div className="mt-4 flex gap-2">
                  <Skeleton className="h-8 flex-1" />
                  <Skeleton className="h-8 w-20" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
})

// Hook import
import { useAILogic } from './hooks/useAILogic'

export default function AIPage() {
  const { isMobile } = useResponsive()
  const {
    isLoading,
    error,
    insights,
    aiStats,
    executeAIAction,
    dismissInsight,
    refreshInsights
  } = useAILogic()

  const handleAnalyzeClick = async (type: string) => {
    // Handle quick analyze action
    console.log('Quick analyze:', type)
    // Could open modal or navigate to specific analysis page
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <PrefetchLink href="/">Dashboard</PrefetchLink>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>New Features</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div className={`flex gap-4 ${isMobile ? 'flex-col items-center text-center' : 'justify-between items-center'}`}>
          <div className={isMobile ? 'text-center' : ''}>
            <h1 className={`font-bold text-gray-900 ${isMobile ? 'text-2xl' : 'text-3xl'} flex items-center justify-center gap-2`}>
              <Sparkles className="h-8 w-8 text-orange-500" />
              New Features
              <Brain className="h-6 w-6 text-blue-600" />
            </h1>
            <p className="text-gray-600 mt-1">
              Fitur-fitur terbaru HeyTrack untuk meningkatkan produktivitas UMKM Anda
            </p>
          </div>
          <Button 
            variant="outline" 
            className={isMobile ? 'w-full' : ''}
            onClick={refreshInsights}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Error State */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-red-700">
                <Brain className="h-4 w-4" />
                <p className="text-sm font-medium">AI Service Error:</p>
              </div>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* AI Stats Cards */}
        <Suspense fallback={<div className="h-32 bg-gray-100 animate-pulse rounded" />}>
          <AIStatsCards stats={aiStats} loading={isLoading} />
        </Suspense>

        {/* New Features Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* AI Recipe Generator */}
          <Card className="group hover:shadow-lg transition-shadow cursor-pointer border-orange-200 hover:border-orange-300">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <Brain className="h-6 w-6 text-orange-600" />
                </div>
                <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-medium">
                  New
                </span>
              </div>
              <div className="space-y-3">
                <h3 className="font-semibold text-lg text-gray-900">AI Recipe Generator</h3>
                <p className="text-sm text-gray-600">
                  Generate resep autentik makanan dan minuman Indonesia dengan AI.
                  Lengkap dengan 22 kategori kuliner Nusantara.
                </p>
                <div className="flex flex-wrap gap-1 pt-2">
                  <span className="text-xs bg-orange-50 text-orange-600 px-2 py-1 rounded">🍚 Nasi Goreng</span>
                  <span className="text-xs bg-orange-50 text-orange-600 px-2 py-1 rounded">🥘 Rendang</span>
                  <span className="text-xs bg-orange-50 text-orange-600 px-2 py-1 rounded">🥤 Wedang</span>
                </div>
                <PrefetchLink href="/ai/recipes">
                  <Button className="w-full mt-4 bg-orange-600 hover:bg-orange-700">
                    Try Recipe Generator
                  </Button>
                </PrefetchLink>
              </div>
            </CardContent>
          </Card>

          {/* AI Chat Assistant */}
          <Card className="group hover:shadow-lg transition-shadow cursor-pointer border-blue-200 hover:border-blue-300">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-blue-600" />
                </div>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                  Available
                </span>
              </div>
              <div className="space-y-3">
                <h3 className="font-semibold text-lg text-gray-900">AI Chat Assistant</h3>
                <p className="text-sm text-gray-600">
                  Konsultasi bisnis kuliner dengan AI. Dapatkan saran untuk pricing,
                  inventory, dan strategi pemasaran UMKM.
                </p>
                <div className="flex flex-wrap gap-1 pt-2">
                  <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded">💰 Smart Pricing</span>
                  <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded">📊 Analytics</span>
                  <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded">🎯 Strategy</span>
                </div>
                <PrefetchLink href="/ai/chat">
                  <Button variant="outline" className="w-full mt-4 border-blue-200 text-blue-700 hover:bg-blue-50">
                    Start Chat
                  </Button>
                </PrefetchLink>
              </div>
            </CardContent>
          </Card>

          {/* AI Insights & Analytics */}
          <Card className="group hover:shadow-lg transition-shadow cursor-pointer border-purple-200 hover:border-purple-300">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Brain className="h-6 w-6 text-purple-600" />
                </div>
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">
                  Available
                </span>
              </div>
              <div className="space-y-3">
                <h3 className="font-semibold text-lg text-gray-900">AI Business Insights</h3>
                <p className="text-sm text-gray-600">
                  Analisis mendalam data bisnis Anda. Prediksi penjualan,
                  optimasi inventory, dan rekomendasi actionable.
                </p>
                <div className="flex flex-wrap gap-1 pt-2">
                  <span className="text-xs bg-purple-50 text-purple-600 px-2 py-1 rounded">📈 Forecasting</span>
                  <span className="text-xs bg-purple-50 text-purple-600 px-2 py-1 rounded">📊 Trends</span>
                  <span className="text-xs bg-purple-50 text-purple-600 px-2 py-1 rounded">💡 Insights</span>
                </div>
                <PrefetchLink href="/ai/insights">
                  <Button variant="outline" className="w-full mt-4 border-purple-200 text-purple-700 hover:bg-purple-50">
                    View Insights
                  </Button>
                </PrefetchLink>
              </div>
            </CardContent>
          </Card>

          {/* Smart Pricing Tool */}
          <Card className="group hover:shadow-lg transition-shadow cursor-pointer border-green-200 hover:border-green-300">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <RefreshCw className="h-6 w-6 text-green-600" />
                </div>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                  Available
                </span>
              </div>
              <div className="space-y-3">
                <h3 className="font-semibold text-lg text-gray-900">Smart Pricing Tool</h3>
                <p className="text-sm text-gray-600">
                  Optimalkan harga menu dengan AI. Analisis kompetitor,
                  margin keuntungan, dan psikologi harga konsumen.
                </p>
                <div className="flex flex-wrap gap-1 pt-2">
                  <span className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded">💰 Dynamic Pricing</span>
                  <span className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded">📊 Margin Analysis</span>
                  <span className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded">🎯 Optimization</span>
                </div>
                <PrefetchLink href="/ai/pricing">
                  <Button variant="outline" className="w-full mt-4 border-green-200 text-green-700 hover:bg-green-50">
                    Optimize Pricing
                  </Button>
                </PrefetchLink>
              </div>
            </CardContent>
          </Card>

          {/* Coming Soon Features */}
          <Card className="group hover:shadow-lg transition-shadow cursor-not-allowed opacity-75 border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                  <Brain className="h-6 w-6 text-gray-400" />
                </div>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full font-medium">
                  Soon
                </span>
              </div>
              <div className="space-y-3">
                <h3 className="font-semibold text-lg text-gray-500">AI Menu Designer</h3>
                <p className="text-sm text-gray-500">
                  Desain menu otomatis berdasarkan target audience,
                  budget, dan trend pasar kuliner Indonesia.
                </p>
                <div className="flex flex-wrap gap-1 pt-2">
                  <span className="text-xs bg-gray-50 text-gray-400 px-2 py-1 rounded">🎨 Menu Design</span>
                  <span className="text-xs bg-gray-50 text-gray-400 px-2 py-1 rounded">📱 Digital Menu</span>
                  <span className="text-xs bg-gray-50 text-gray-400 px-2 py-1 rounded">📈 Marketing</span>
                </div>
                <Button variant="outline" className="w-full mt-4" disabled>
                  Coming Soon
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-shadow cursor-not-allowed opacity-75 border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-gray-400" />
                </div>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full font-medium">
                  Soon
                </span>
              </div>
              <div className="space-y-3">
                <h3 className="font-semibold text-lg text-gray-500">AI Supplier Network</h3>
                <p className="text-sm text-gray-500">
                  Jaringan supplier cerdas dengan rekomendasi bahan
                  berkualitas dan harga terbaik untuk UMKM.
                </p>
                <div className="flex flex-wrap gap-1 pt-2">
                  <span className="text-xs bg-gray-50 text-gray-400 px-2 py-1 rounded">🏪 Suppliers</span>
                  <span className="text-xs bg-gray-50 text-gray-400 px-2 py-1 rounded">📦 Quality Check</span>
                  <span className="text-xs bg-gray-50 text-gray-400 px-2 py-1 rounded">💰 Best Price</span>
                </div>
                <Button variant="outline" className="w-full mt-4" disabled>
                  Coming Soon
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Info */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mt-0.5">
                <Brain className="h-4 w-4 text-blue-600" />
              </div>
              <div className="space-y-2">
                <h3 className="font-medium text-blue-900">
                  Tentang AI Assistant
                </h3>
                <p className="text-sm text-blue-800">
                  AI Assistant HeyTrack menggunakan teknologi machine learning untuk menganalisis data bisnis Anda 
                  dan memberikan rekomendasi yang actionable. Semua analisis disesuaikan dengan konteks UMKM F&B Indonesia.
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Smart Pricing</span>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Inventory Prediction</span>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Business Intelligence</span>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Cost Optimization</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
