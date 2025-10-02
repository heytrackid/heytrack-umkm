'use client'

import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
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
                <Link href="/">Dashboard</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>AI Assistant</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div className={`flex gap-4 ${isMobile ? 'flex-col items-center text-center' : 'justify-between items-center'}`}>
          <div className={isMobile ? 'text-center' : ''}>
            <h1 className={`font-bold text-gray-900 ${isMobile ? 'text-2xl' : 'text-3xl'} flex items-center justify-center gap-2`}>
              <Brain className="h-8 w-8 text-blue-600" />
              AI Assistant
              <Sparkles className="h-6 w-6 text-yellow-500" />
            </h1>
            <p className="text-gray-600 mt-1">
              Asisten cerdas untuk optimasi dan analisis bisnis UMKM
            </p>
          </div>
          <Button 
            variant="outline" 
            className={isMobile ? 'w-full' : ''}
            onClick={refreshInsights}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh Insights
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

        <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'lg:grid-cols-2'}`}>
          {/* AI Insights */}
          <Suspense fallback={<div className="h-96 bg-gray-100 animate-pulse rounded" />}>
            <AIInsightsCard
              insights={insights}
              onExecuteAction={executeAIAction}
              onDismiss={dismissInsight}
              loading={isLoading}
            />
          </Suspense>

          {/* Quick Actions */}
          <Suspense fallback={<div className="h-96 bg-gray-100 animate-pulse rounded" />}>
            <AIQuickActions 
              onAnalyzeClick={handleAnalyzeClick}
              loading={isLoading}
            />
          </Suspense>
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
