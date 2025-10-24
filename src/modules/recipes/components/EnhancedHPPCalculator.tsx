'use client'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { useEffect, useState } from 'react'

// Services
import type { HPPCalculationResult, PricingMethod } from '../services/EnhancedHPPCalculationService'
import { EnhancedHPPCalculationService } from '../services/EnhancedHPPCalculationService'

// Extracted components
import { CostBreakdownCard } from './CostBreakdownCard'
import { EducationalFooter } from './EducationalFooter'
import { MainResultsCard } from './MainResultsCard'
import { MethodComparisonCard } from './MethodComparisonCard'
import { RecommendationsCard } from './RecommendationsCard'
import { SettingsPanel } from './SettingsPanel'

import { useCurrency } from '@/hooks/useCurrency'
import { Lightbulb } from 'lucide-react'

export default function EnhancedHPPCalculator() {
  const { formatCurrency } = useCurrency()
  const [selectedPricingMethod, setSelectedPricingMethod] = useState<PricingMethod>('moving')
  const [profitMarginPercent, setProfitMarginPercent] = useState(30)
  const [includeOperationalCosts, setIncludeOperationalCosts] = useState(true)
  const [calculationResult, setCalculationResult] = useState<HPPCalculationResult | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)

  // Calculate HPP
  const calculateHPP = async () => {
    setIsCalculating(true)

    try {
      // Empty data for now - will be populated with real data later
      const emptyRecipe = {
        id: 'temp-recipe',
        name: 'Pilih resep untuk kalkulasi',
        servings: 0
      }

      const result = await EnhancedHPPCalculationService.calculateHPP(
        emptyRecipe,
        [],
        [],
        [],
        {
          pricingMethod: selectedPricingMethod,
          includeOperationalCosts,
          profitMarginPercent,
          overheadAllocationMethod: 'per_batch'
        }
      )

      setCalculationResult(result)
    } catch (error: any) {
      uiLogger.error({ err: error }, 'Error calculating HPP')
      setCalculationResult(null)
    } finally {
      setIsCalculating(false)
    }
  }

  // Auto calculate when settings change
  useEffect(() => {
    calculateHPP()
  }, [selectedPricingMethod, profitMarginPercent, includeOperationalCosts])

  return (
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
            <BreadcrumbLink asChild>
              <Link href="/hpp">HPP Calculator</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Bahan Baku</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Kalkulator HPP Pintar</h1>
        <p className="text-gray-600">
          Hitung Harga Pokok Produksi dengan harga rata-rata yang akurat
        </p>
      </div>

      {/* Educational Alert */}
      <Alert className="border-blue-200 bg-blue-50">
        <Lightbulb className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          💡 <strong>Tips UMKM:</strong> HPP yang akurat = profit yang stabil! Pakai harga rata-rata agar tidak rugi atau kemahalan jual produk.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SettingsPanel
          selectedPricingMethod={selectedPricingMethod}
          profitMarginPercent={profitMarginPercent}
          includeOperationalCosts={includeOperationalCosts}
          onPricingMethodChange={setSelectedPricingMethod}
          onProfitMarginChange={setProfitMarginPercent}
          onIncludeOperationalCostsChange={setIncludeOperationalCosts}
        />

        <div className="lg:col-span-2 space-y-6">
          {calculationResult && (
            <>
              <MainResultsCard
                calculationResult={calculationResult}
                formatCurrency={formatCurrency}
              />

              <CostBreakdownCard
                calculationResult={calculationResult}
                formatCurrency={formatCurrency}
                includeOperationalCosts={includeOperationalCosts}
              />

              <MethodComparisonCard
                calculationResult={calculationResult}
                formatCurrency={formatCurrency}
                selectedPricingMethod={selectedPricingMethod}
              />

              <RecommendationsCard calculationResult={calculationResult} />
            </>
          )}

          {isCalculating && (
            <Card>
              <CardContent className="py-8">
                <div className="flex items-center justify-center space-x-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span>Menghitung HPP...</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <EducationalFooter />
    </div>
  )
}