'use client'

import AppLayout from '@/components/layout/app-layout'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import PrefetchLink from '@/components/ui/prefetch-link'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CardSkeleton, StatsSkeleton, ListSkeleton } from '@/components/ui'
import { useResponsive } from '@/hooks/useResponsive'
import { AlertCircle, Calculator, RefreshCw, Target, TrendingUp } from 'lucide-react'
import dynamic from 'next/dynamic'
import * as React from 'react'
import { Suspense } from 'react'

// Dynamic imports for better performance
const HPPSummaryStats = dynamic(() => import('./components/HPPSummaryStats'), {
  ssr: false,
  loading: () => <StatsSkeleton count={4} />
})

const HPPCalculatorTab = dynamic(() => import('./components/HPPCalculatorTab'), {
  ssr: false,
  loading: () => <CardSkeleton rows={5} />
})

const PricingStrategyTab = dynamic(() => import('./components/PricingStrategyTab'), {
  ssr: false,
  loading: () => <CardSkeleton rows={5} />
})

const HPPHistoricalTab = dynamic(() => import('./components/HPPHistoricalTab'), {
  ssr: false,
  loading: () => <CardSkeleton rows={4} />
})

// Hook import
import { useHPPLogic } from './hooks/useHPPLogic'

// Import tracking components
const HPPAlertsList = dynamic(() => import('./components/HPPAlertsList'), {
  ssr: false,
  loading: () => <ListSkeleton items={5} />
})

const HPPRecommendationsPanel = dynamic(() => import('./components/HPPRecommendationsPanel'), {
  ssr: false,
  loading: () => <CardSkeleton rows={4} />
})

export default function HPPAndPricingPage() {
  const { isMobile } = useResponsive()
  const {
    recipes,
    loading,
    selectedRecipe,
    summaryStats,
    selectedRecipeId,
    setSelectedRecipeId,
    targetMargin,
    setTargetMargin,
    productCost,
    setProductCost,
    recommendedPrice,
    isUpdating,
    marginCategories,
    handleUpdateRecipePrice,
    formatCurrency,
    getMarginBadgeVariant,
    getMarginStatus
  } = useHPPLogic()

  if (loading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          {/* Breadcrumb Navigation */}
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <PrefetchLink href="/">Dashboard</PrefetchLink>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>HPP & Pricing</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className={`${isMobile ? 'text-center' : ''}`}>
            <h1 className={`font-bold text-foreground ${isMobile ? 'text-2xl' : 'text-3xl'}`}>
              HPP & Pricing
            </h1>
            <p className="text-muted-foreground">
              Kelola Harga Pokok Produksi (HPP) dan strategi pricing untuk setiap produk
            </p>
          </div>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin text-primary mr-3" />
                <span className={`${isMobile ? 'text-sm' : ''}`}>Memuat data resep dan bahan...</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Breadcrumb Navigation */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <PrefetchLink href="/">Dashboard</PrefetchLink>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>HPP & Pricing</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div className={`flex gap-4 ${isMobile ? 'flex-col items-center text-center' : 'justify-between items-center'}`}>
          <div className={isMobile ? 'text-center' : ''}>
            <h1 className={`font-bold text-foreground ${isMobile ? 'text-2xl' : 'text-3xl'}`}>
              HPP & Pricing
            </h1>
            <p className="text-muted-foreground">
              Kelola Harga Pokok Produksi (HPP) dan strategi pricing untuk setiap produk
            </p>
          </div>
          <Button variant="outline" className={isMobile ? 'w-full' : ''} onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
        </div>

        {recipes.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Calculator className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className={`font-medium mb-2 ${isMobile ? 'text-base' : 'text-lg'}`}>
                Belum ada data resep
              </h3>
              <p className="text-muted-foreground mb-4">
                Silakan tambahkan resep terlebih dahulu di halaman Resep
              </p>
              <Button onClick={() => window.location.href = '/resep'}>
                Ke Halaman Resep
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Summary Stats */}
            <Suspense fallback={<div className="h-32 bg-muted animate-pulse rounded" />}>
              <HPPSummaryStats
                totalRecipes={summaryStats.totalRecipes}
                highMarginRecipes={summaryStats.highMarginRecipes}
                mediumMarginRecipes={summaryStats.mediumMarginRecipes}
                lowMarginRecipes={summaryStats.lowMarginRecipes}
                isMobile={isMobile}
              />
            </Suspense>

            {/* Main Tabs */}
            <Tabs defaultValue="hpp-calculator" className="space-y-6">
              <TabsList className={`grid w-full ${isMobile ? 'grid-cols-2 h-auto' : 'grid-cols-5'}`}>
                <TabsTrigger value="hpp-calculator" className={isMobile ? 'w-full text-xs' : ''}>
                  <Calculator className="h-4 w-4 mr-2" />
                  {!isMobile && 'Kalkulator HPP'}
                  {isMobile && 'HPP'}
                </TabsTrigger>
                <TabsTrigger value="pricing-strategy" className={isMobile ? 'w-full text-xs' : ''}>
                  <Target className="h-4 w-4 mr-2" />
                  {!isMobile && 'Strategi Pricing'}
                  {isMobile && 'Pricing'}
                </TabsTrigger>
                <TabsTrigger value="hpp-historical" className={isMobile ? 'w-full text-xs' : ''}>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  {!isMobile && 'Tracking Lanjutan'}
                  {isMobile && 'Tracking'}
                </TabsTrigger>
                <TabsTrigger value="hpp-alerts" className={isMobile ? 'w-full text-xs' : ''}>
                  <AlertCircle className="h-4 w-4 mr-2" />
                  {!isMobile && 'Alerts'}
                  {isMobile && 'Alert'}
                </TabsTrigger>
                <TabsTrigger value="hpp-recommendations" className={isMobile ? 'w-full text-xs' : ''}>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  {!isMobile && 'Rekomendasi'}
                  {isMobile && 'Tips'}
                </TabsTrigger>
              </TabsList>

              {/* HPP Calculator Tab */}
              <TabsContent value="hpp-calculator">
                <Suspense fallback={<div className="h-96 bg-muted animate-pulse rounded" />}>
                  <HPPCalculatorTab
                    recipes={recipes}
                    formatCurrency={formatCurrency}
                    getMarginBadgeVariant={getMarginBadgeVariant}
                    getMarginStatus={getMarginStatus}
                    isMobile={isMobile}
                  />
                </Suspense>
              </TabsContent>

              {/* Pricing Strategy Tab */}
              <TabsContent value="pricing-strategy">
                <Suspense fallback={<div className="h-96 bg-muted animate-pulse rounded" />}>
                  <PricingStrategyTab
                    recipes={recipes}
                    selectedRecipe={selectedRecipe}
                    selectedRecipeId={selectedRecipeId}
                    setSelectedRecipeId={setSelectedRecipeId}
                    targetMargin={targetMargin}
                    setTargetMargin={setTargetMargin}
                    productCost={productCost}
                    setProductCost={setProductCost}
                    recommendedPrice={recommendedPrice}
                    isUpdating={isUpdating}
                    marginCategories={marginCategories}
                    handleUpdateRecipePrice={handleUpdateRecipePrice}
                    formatCurrency={formatCurrency}
                    isMobile={isMobile}
                  />
                </Suspense>
              </TabsContent>

              {/* HPP Historical Tab */}
              <TabsContent value="hpp-historical">
                <Suspense fallback={<div className="h-96 bg-muted animate-pulse rounded" />}>
                  <HPPHistoricalTab
                    recipes={recipes}
                    formatCurrency={formatCurrency}
                    isMobile={isMobile}
                  />
                </Suspense>
              </TabsContent>

              {/* HPP Alerts Tab */}
              <TabsContent value="hpp-alerts">
                <Suspense fallback={<div className="h-96 bg-muted animate-pulse rounded" />}>
                  <HPPAlertsList
                    isMobile={isMobile}
                  />
                </Suspense>
              </TabsContent>

              {/* HPP Recommendations Tab */}
              <TabsContent value="hpp-recommendations">
                <Suspense fallback={<div className="h-96 bg-muted animate-pulse rounded" />}>
                  <HPPRecommendationsPanel
                    isMobile={isMobile}
                  />
                </Suspense>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </AppLayout>
  )
}
