'use client'

import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import AppLayout from '@/components/layout/app-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Skeleton } from '@/components/ui/skeleton'
import { useResponsive } from '@/hooks/use-mobile'
import { RefreshCw, Calculator, Target } from 'lucide-react'

// Dynamic imports for better performance
const HPPSummaryStats = dynamic(() => import('./components/HPPSummaryStats'), {
  ssr: false,
  loading: () => (
    <div className="grid gap-4 md:grid-cols-4">
      {Array(4).fill(0).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <div className="text-center space-y-2">
              <Skeleton className="h-8 w-16 mx-auto" />
              <Skeleton className="h-4 w-20 mx-auto" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
})

const HPPCalculatorTab = dynamic(() => import('./components/HPPCalculatorTab'), {
  ssr: false,
  loading: () => (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-full" />
            <div className="grid gap-4 md:grid-cols-2">
              {Array(4).fill(0).map((_, i) => (
                <Card key={i} className="border-2">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                      <Skeleton className="h-6 w-16" />
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-3 border-t">
                      <div className="space-y-2">
                        {Array(2).fill(0).map((_, j) => (
                          <div key={j} className="flex justify-between">
                            <Skeleton className="h-4 w-12" />
                            <Skeleton className="h-4 w-16" />
                          </div>
                        ))}
                      </div>
                      <div className="space-y-2">
                        {Array(2).fill(0).map((_, j) => (
                          <div key={j} className="flex justify-between">
                            <Skeleton className="h-4 w-12" />
                            <Skeleton className="h-4 w-16" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
})

const PricingStrategyTab = dynamic(() => import('./components/PricingStrategyTab'), {
  ssr: false,
  loading: () => (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-full" />
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <div className="p-4 bg-muted/50 rounded-lg">
                <Skeleton className="h-5 w-32 mb-2" />
                <div className="grid grid-cols-2 gap-4">
                  {Array(4).fill(0).map((_, i) => (
                    <div key={i} className="flex justify-between">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
})

// Hook import
import { useHPPLogic } from './hooks/useHPPLogic'

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
                  <Link href="/">Dashboard</Link>
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
                <Link href="/">Dashboard</Link>
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
              <TabsList className={`grid w-full ${isMobile ? 'grid-cols-1 h-auto' : 'grid-cols-2'}`}>
                <TabsTrigger value="hpp-calculator" className={isMobile ? 'w-full' : ''}>
                  <Calculator className="h-4 w-4 mr-2" />
                  Kalkulator HPP
                </TabsTrigger>
                <TabsTrigger value="pricing-strategy" className={isMobile ? 'w-full' : ''}>
                  <Target className="h-4 w-4 mr-2" />
                  Strategi Pricing
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
            </Tabs>
          </>
        )}
      </div>
    </AppLayout>
  )
}
