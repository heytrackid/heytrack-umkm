'use client'

import { Suspense, useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import AppLayout from '@/components/layout/app-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { useResponsive } from '@/hooks/use-mobile'
import { TrendingUp, Brain, Calculator, Target, Lightbulb, AlertCircle } from 'lucide-react'
import { formatCurrency } from '@/shared/utils/currency'

// Skeleton components
const PricingAnalysisSkeleton = () => (
  <Card>
    <CardContent className="p-6">
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-5 w-40" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="border rounded-lg p-4">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-8 w-24 mb-1" />
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </div>
        <div className="space-y-3">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 flex-1" />
            </div>
          ))}
        </div>
      </div>
    </CardContent>
  </Card>
)

// Dynamic imports
const PricingAIService = dynamic(() => 
  impor"Placeholder".then(m => ({ default: m.PricingAIService })), {
  ssr: false
})

export default function AIPricingPage() {
  const { isMobile } = useResponsive()
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  
  // Form state
  const [formData, setFormData] = useState({
    productName: '',
    location: 'Jakarta',
    targetMarket: 'mid-market' as 'premium' | 'mid-market' | 'budget',
    currentPrice: '',
    ingredients: [
      { name: '', cost: '', quantity: '' }
    ]
  })

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleIngredientChange = (index: number, field: string, value: string) => {
    const newIngredients = [...formData.ingredients]
    newIngredients[index] = { ...newIngredients[index], [field]: value }
    setFormData(prev => ({ ...prev, ingredients: newIngredients }))
  }

  const addIngredient = () => {
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { name: '', cost: '', quantity: '' }]
    }))
  }

  const removeIngredient = (index: number) => {
    if (formData.ingredients.length > 1) {
      const newIngredients = formData.ingredients.filter((_, i) => i !== index)
      setFormData(prev => ({ ...prev, ingredients: newIngredients }))
    }
  }

  const analyzePricing = async () => {
    if (!formData.productName || formData.ingredients.some(ing => !ing.name || !ing.cost)) {
      setError('Mohon lengkapi data produk dan bahan baku')
      return
    }

    setIsAnalyzing(true)
    setError(null)

    try {
      const service = new (await impor"Placeholder").PricingAIService()
      
      const pricingData = {
        productName: formData.productName,
        location: formData.location,
        targetMarket: formData.targetMarket,
        currentPrice: formData.currentPrice ? parseFloa"" : undefined,
        ingredients: formData.ingredients.map(ing => ({
          name: ing.name,
          cost: parseFloa"",
          quantity: parseFloa"" || 1
        }))
      }

      const result = await service.analyzePricing(pricingData)
      setAnalysis(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menganalisis pricing')
    } finally {
      setIsAnalyzing(false)
    }
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
              <BreadcrumbPage>Smart Pricing</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div className={`flex gap-4 ${isMobile ? 'flex-col items-center text-center' : 'justify-between items-center'}`}>
          <div className={isMobile ? 'text-center' : ''}>
            <h1 className={`font-bold text-gray-900 ${isMobile ? 'text-2xl' : 'text-3xl'} flex items-center justify-center gap-2`}>
              <TrendingUp className="h-8 w-8 text-green-600" />
              Smart Pricing AI
              <Badge variant="default" className="text-xs">AI</Badge>
            </h1>
            <p className="text-gray-600 mt-1">
              Analisis harga optimal berbasis AI untuk produk bakery
            </p>
          </div>
        </div>

        <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'lg:grid-cols-2'}`}>
          {/* Input Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-gray-600" />
                Data Produk
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Product Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="productName">Nama Produk *</Label>
                  <Input
                    id="productName"
                    value={formData.productName}
                    onChange={(e) => handleInputChange('productName', e.target.value)}
                    placeholder="Croissant Premium"
                  />
                </div>
                <div>
                  <Label htmlFor="currentPrice">Harga Saat Ini (Opsional)</Label>
                  <Input
                    id="currentPrice"
                    type="number"
                    value={formData.currentPrice}
                    onChange={(e) => handleInputChange('currentPrice', e.target.value)}
                    placeholder="25000"
                  />
                </div>
                <div>
                  <Label htmlFor="location">Lokasi</Label>
                  <Select value={formData.location} onValueChange={(value) => handleInputChange('location', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Jakarta">Jakarta</SelectItem>
                      <SelectItem value="Surabaya">Surabaya</SelectItem>
                      <SelectItem value="Bandung">Bandung</SelectItem>
                      <SelectItem value="Yogyakarta">Yogyakarta</SelectItem>
                      <SelectItem value="Medan">Medan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="targetMarket">Target Market</Label>
                  <Select value={formData.targetMarket} onValueChange={(value) => handleInputChange('targetMarket', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="budget">Budget (Ekonomis)</SelectItem>
                      <SelectItem value="mid-market">Mid-Market (Menengah)</SelectItem>
                      <SelectItem value="premium">Premium (Mewah)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Ingredients */}
              <div>
                <Label className="text-base font-medium">Bahan Baku *</Label>
                <div className="space-y-3 mt-2">
                  {formData.ingredients.map((ingredient, index) => (
                    <div key={index} className="grid grid-cols-3 gap-2 items-end">
                      <div>
                        <Label className="text-sm">Nama Bahan</Label>
                        <Input
                          value={ingredient.name}
                          onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                          placeholder="Tepung Terigu"
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-sm">Biaya (Rp)</Label>
                        <Input
                          type="number"
                          value={ingredient.cost}
                          onChange={(e) => handleIngredientChange(index, 'cost', e.target.value)}
                          placeholder="15000"
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeIngredien""}
                          disabled={formData.ingredients.length === 1}
                          className="text-red-600"
                        >
                          Hapus
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={addIngredient}
                    className="text-blue-600"
                  >
                    + Tambah Bahan
                  </Button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  <AlertCircle className="h-4 w-4" />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              <Button
                onClick={analyzePricing}
                disabled={isAnalyzing}
                className="w-full"
              >
                {isAnalyzing ? (
                  <>
                    <Brain className="h-4 w-4 mr-2 animate-pulse" />
                    Menganalisis...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4 mr-2" />
                    Analisis Harga AI
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Analysis Results */}
          {isAnalyzing ? (
            <Suspense fallback={<div className="h-96 bg-gray-100 animate-pulse rounded" />}>
              <PricingAnalysisSkeleton />
            </Suspense>
          ) : analysis ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-green-600" />
                  Hasil Analisis AI
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Price Recommendations */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Rekomendasi Harga</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="border rounded-lg p-3 bg-red-50">
                      <p className="text-sm text-red-600 font-medium">Minimum</p>
                      <p className="text-xl font-bold text-red-700">{formatCurrency(analysis.recommendedPrice.min)}</p>
                      <p className="text-xs text-red-600">Break-even</p>
                    </div>
                    <div className="border rounded-lg p-3 bg-green-50">
                      <p className="text-sm text-green-600 font-medium">Optimal</p>
                      <p className="text-xl font-bold text-green-700">{formatCurrency(analysis.recommendedPrice.optimal)}</p>
                      <p className="text-xs text-green-600">Recommended</p>
                    </div>
                    <div className="border rounded-lg p-3 bg-blue-50">
                      <p className="text-sm text-blue-600 font-medium">Maximum</p>
                      <p className="text-xl font-bold text-blue-700">{formatCurrency(analysis.recommendedPrice.max)}</p>
                      <p className="text-xs text-blue-600">Premium</p>
                    </div>
                  </div>
                </div>

                {/* Action Items */}
                {analysis.actionItems && analysis.actionItems.length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-yellow-600" />
                      Action Items
                    </h3>
                    <div className="space-y-2">
                      {analysis.actionItems.map((item: string, index: number) => (
                        <div key={index} className="flex items-center gap-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                          <p className="text-sm text-yellow-800">{item}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Market Positioning */}
                <div className="pt-4 border-t">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Market Position:</span>
                      <Badge variant="secondary" className="ml-2">
                        {analysis.marketPositioning}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-gray-500">Optimal Margin:</span>
                      <span className="ml-2 font-medium">{analysis.marginAnalysis.optimalMargin.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Brain className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="font-medium text-gray-500 mb-2">
                  Siap Menganalisis
                </h3>
                <p className="text-sm text-gray-400">
                  Lengkapi form di sebelah kiri dan klik "Analisis Harga AI" untuk mendapatkan rekomendasi pricing
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
