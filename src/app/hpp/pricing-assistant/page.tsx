'use client'
 

import { AlertTriangle, Calculator, CheckCircle, DollarSign, Lightbulb, Target, TrendingUp } from '@/components/icons'
import { useState } from 'react'

import { AppLayout } from '@/components/layout/app-layout'
import { PageHeader } from '@/components/layout/PageHeader'
import { SharedStatsCards } from '@/components/shared/index'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { useCurrency } from '@/hooks/useCurrency'
import { useRecipes } from '@/hooks/useRecipes'
import { usePricingAssistant, type PricingRecommendation } from '@/hooks/api/useHpp'
import { handleError } from '@/lib/error-handling'
import { successToast, } from '@/hooks/use-toast'

const pricingBreadcrumbs = [
  { label: 'Dashboard', href: '/' },
  { label: 'HPP & Pricing', href: '/hpp' },
  { label: 'AI Pricing Assistant' }
]



const PricingAssistantPage = (): JSX.Element => {
  const { formatCurrency } = useCurrency()
  const { data: recipes = [], isLoading: recipesLoading, error: recipesError, refetch: refetchRecipes } = useRecipes({ limit: 1000 })
  const [selectedRecipe, setSelectedRecipe] = useState<string>('')
  const [recommendation, setRecommendation] = useState<PricingRecommendation | null>(null)

  const pricingAssistantMutation = usePricingAssistant()

  // Generate pricing recommendation
  const generateRecommendation = async () => {
    if (!selectedRecipe) {
      handleError(new Error('Validation: Please select a recipe'), 'HPP Pricing Assistant: validation', true, 'Silakan pilih resep')
      return
    }

    try {
      const result = await pricingAssistantMutation.mutateAsync(selectedRecipe)
      setRecommendation(result)
      successToast('Berhasil', 'Pricing recommendation generated successfully')
    } catch (_error) {
      handleError(_error as Error, 'HPP Pricing Assistant: generate recommendation', true, 'Gagal membuat rekomendasi harga')
    }
  }

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high': return 'destructive'
      case 'medium': return 'default'
      case 'low': return 'secondary'
      default: return 'outline'
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) { return 'text-muted-foreground' }
    if (confidence >= 0.6) { return 'text-yellow-600' }
    return 'text-red-600'
  }

  return (
    <AppLayout pageTitle="Pricing Assistant">
      <div className="container mx-auto p-6 space-y-6">
        <PageHeader
          title="AI Pricing Assistant"
          description="Rekomendasi harga jual cerdas berdasarkan HPP, pasar, dan kompetitor"
          breadcrumbs={pricingBreadcrumbs}
        />

        {/* Stats Cards */}
        <SharedStatsCards
          stats={[
            {
              title: "Total Recommendations",
              value: "0",
              subtitle: "Jumlah rekomendasi yang dihasilkan",
              icon: <Lightbulb className="h-4 w-4" />
            },
            {
              title: "Avg. Adjustment",
              value: "0%",
              subtitle: "Penyesuaian harga rata-rata",
              icon: <TrendingUp className="h-4 w-4" />
            },
            {
              title: "Market Insights",
              value: "0",
              subtitle: "Analisis pasar tersedia",
              icon: <Target className="h-4 w-4" />
            },
            {
              title: "Risk Assessment",
              value: "-",
              subtitle: "Tingkat risiko rekomendasi",
              icon: <AlertTriangle className="h-4 w-4" />
            }
          ]}
        />

        {/* Pricing Calculator */}
        <Card>
          <CardHeader>
            <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Generate Pricing Recommendation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="pricing-recipe-select" className="text-sm font-medium">Pilih Resep</label>
                <Select
                  value={selectedRecipe}
                  onValueChange={setSelectedRecipe}
                  disabled={recipesLoading || recipes.length === 0}
                >
                  <SelectTrigger id="pricing-recipe-select">
                    <SelectValue placeholder={recipesLoading ? 'Memuat resep...' : 'Pilih resep untuk analisis...'} />
                  </SelectTrigger>
                  <SelectContent>
                    {recipes.length === 0 ? (
                      <SelectItem value="__no-recipes" disabled>
                        {recipesLoading ? 'Memuat resep...' : 'Belum ada resep tersedia'}
                      </SelectItem>
                    ) : (
                      recipes.map((recipe) => (
                        <SelectItem key={recipe['id']} value={recipe['id']}>
                          {recipe.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <div className="text-sm text-muted-foreground">
                  {recipesLoading
                    ? 'Memuat daftar resep...'
                    : recipes.length > 0
                      ? `${recipes.length} resep siap dianalisis`
                      : 'Tambahkan resep terlebih dahulu untuk menggunakan asisten harga'}
                </div>
                {recipesError && (
                  <div className="text-sm text-destructive flex items-center gap-2">
                    Gagal memuat resep
                    <Button variant="link" size="sm" className="px-0" onClick={() => { void refetchRecipes() }}>
                      Coba lagi
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <Button
              onClick={generateRecommendation}
              disabled={pricingAssistantMutation.isPending || recipesLoading || !selectedRecipe}
              className="w-full md:w-auto"
            >
              {pricingAssistantMutation.isPending ? 'Menganalisis...' : 'Generate Recommendation'}
            </Button>
          </CardContent>
        </Card>

        {/* Recommendation Results */}
        {recommendation && (
          <div className="grid grid-cols-1 grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Price Comparison */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Price Comparison</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span className="font-medium">Current Price</span>
                    <span className="font-semibold">{formatCurrency(recommendation.currentPrice)}</span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg border-2 border-primary">
                    <span className="font-medium">Recommended Price</span>
                    <span className="font-bold text-primary">{formatCurrency(recommendation.recommendedPrice)}</span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span className="font-medium">HPP Cost</span>
                    <span className="font-semibold">{formatCurrency(recommendation.hppValue)}</span>
                  </div>
                </div>

                <Separator />

                <div className="text-center">
                  <div className="text-2xl font-bold text-muted-foreground">
                    +{formatCurrency(recommendation.recommendedPrice - recommendation.currentPrice)}
                  </div>
                  <div className="text-sm text-muted-foreground">Potential Revenue Increase</div>
                </div>
              </CardContent>
            </Card>

            {/* Margin Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Margin Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Optimal Margin</span>
                    <Badge variant="secondary">{recommendation.optimalMargin.toFixed(1)}%</Badge>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm">Price Range</span>
                    <span className="text-sm text-muted-foreground">
                      {formatCurrency(recommendation.minPrice)} - {formatCurrency(recommendation.maxPrice)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm">AI Confidence</span>
                    <span className={`font-semibold ${getConfidenceColor(recommendation.confidence)}`}>
                      {(recommendation.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Margin Breakdown</h4>
                  <div className="text-xs text-muted-foreground">
                    <div>HPP: {formatCurrency(recommendation.hppValue)}</div>
                    <div>Profit: {formatCurrency(recommendation.recommendedPrice - recommendation.hppValue)}</div>
                    <div>Margin: {recommendation.optimalMargin.toFixed(1)}%</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Market Factors */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Market Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Demand Level</span>
                    <Badge variant={
                      (() => {
                        if (recommendation.marketFactors.demandLevel === 'high') {return 'default'}
                        if (recommendation.marketFactors.demandLevel === 'medium') {return 'secondary'}
                        return 'outline'
                      })()
                    }>
                      {recommendation.marketFactors.demandLevel}
                    </Badge>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm">Seasonality</span>
                    <Badge variant={
                      (() => {
                        if (recommendation.marketFactors.seasonality === 'peak') {return 'default'}
                        if (recommendation.marketFactors.seasonality === 'normal') {return 'secondary'}
                        return 'outline'
                      })()
                    }>
                      {recommendation.marketFactors.seasonality}
                    </Badge>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm">Competitors</span>
                    <span className="text-sm font-semibold">
                      {recommendation.marketFactors.competitorPrices.length}
                    </span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Risk Assessment</h4>
                  <Badge variant={getRiskColor(recommendation.riskAssessment.riskLevel)}>
                    {recommendation.riskAssessment.riskLevel} risk
                  </Badge>
                  {recommendation.riskAssessment?.riskFactors?.length > 0 && (
                    <ul className="text-xs text-muted-foreground mt-2 space-y-1">
                      {recommendation.riskAssessment.riskFactors.map((factor, index) => (
                        <li key={index}>• {factor}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Reasoning */}
        {recommendation && (
          <Card>
            <CardHeader>
              <CardTitle>AI Reasoning & Recommendations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {recommendation.reasoning?.map((reason, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{reason}</span>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">
                  <Target className="h-4 w-4 mr-2" />
                  Apply Price
                </Button>
                <Button variant="outline" className="flex-1">
                  <Calculator className="h-4 w-4 mr-2" />
                  Recalculate
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Sample Insights */}
        {!recommendation && (
          <Card>
            <CardHeader>
              <CardTitle>Pricing Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Lightbulb className="h-4 w-4" />
                <AlertDescription>
                  AI Pricing Assistant menganalisis berbagai faktor untuk memberikan rekomendasi harga optimal:
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <DollarSign className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <h4 className="font-semibold">Cost-Based</h4>
                  <p className="text-sm text-muted-foreground">
                    Margin optimal berdasarkan HPP dan biaya produksi
                  </p>
                </div>

                <div className="text-center p-4 border rounded-lg">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <h4 className="font-semibold">Market-Driven</h4>
                  <p className="text-sm text-muted-foreground">
                    Penyesuaian harga berdasarkan kondisi pasar dan kompetitor
                  </p>
                </div>

                <div className="text-center p-4 border rounded-lg">
                  <Target className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <h4 className="font-semibold">Risk-Aware</h4>
                  <p className="text-sm text-muted-foreground">
                    Analisis risiko dan confidence level untuk setiap rekomendasi
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  )
}

export default PricingAssistantPage