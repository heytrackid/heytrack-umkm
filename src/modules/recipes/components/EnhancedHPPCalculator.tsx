'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'

// Services
import { EnhancedHPPCalculationService } from '../services/EnhancedHPPCalculationService'
import type { PricingMethod, HPPCalculationResult } from '../services/EnhancedHPPCalculationService'

import {
  Calculator,
  HelpCircle,
  Info,
  Lightbulb,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  DollarSign,
  Package,
  Factory,
  PieChart,
  BarChart3
} from 'lucide-react'

// Sample data
const sampleRecipe = {
  id: 'recipe-1',
  name: 'Brownies Cokelat Premium',
  servings: 12
}

const sampleRecipeIngredients = [
  {
    id: 'ri-1',
    recipe_id: 'recipe-1',
    ingredient_id: 'ing-1',
    quantity: 0.5,
    unit: 'kg',
    ingredient: {
      id: 'ing-1',
      name: 'Tepung Terigu Premium',
      unit: 'kg',
      current_stock: 45,
      price_per_unit: 15000
    }
  },
  {
    id: 'ri-2',
    recipe_id: 'recipe-1', 
    ingredient_id: 'ing-2',
    quantity: 0.3,
    unit: 'kg',
    ingredient: {
      id: 'ing-2',
      name: 'Gula Pasir',
      unit: 'kg',
      current_stock: 25,
      price_per_unit: 18000
    }
  },
  {
    id: 'ri-3',
    recipe_id: 'recipe-1',
    ingredient_id: 'ing-3', 
    quantity: 0.2,
    unit: 'kg',
    ingredient: {
      id: 'ing-3',
      name: 'Mentega',
      unit: 'kg',
      current_stock: 8,
      price_per_unit: 45000
    }
  },
  {
    id: 'ri-4',
    recipe_id: 'recipe-1',
    ingredient_id: 'ing-4',
    quantity: 0.15,
    unit: 'kg',
    ingredient: {
      id: 'ing-4',
      name: 'Cokelat Bubuk',
      unit: 'kg',
      current_stock: 5,
      price_per_unit: 65000
    }
  }
]

const sampleOperationalCosts = [
  {
    id: 'op-1',
    name: 'Listrik & Gas',
    amount: 150000,
    type: 'monthly' as const
  },
  {
    id: 'op-2', 
    name: 'Gaji Karyawan',
    amount: 2500000,
    type: 'monthly' as const
  },
  {
    id: 'op-3',
    name: 'Packaging & Label',
    amount: 25000,
    type: 'per_batch' as const
  }
]

const sampleStockTransactions = [
  // Tepung transactions
  { id: 't-1', ingredient_id: 'ing-1', type: 'PURCHASE', quantity: 25, unit_price: 14500, created_at: '2024-01-15' },
  { id: 't-2', ingredient_id: 'ing-1', type: 'PURCHASE', quantity: 30, unit_price: 15200, created_at: '2024-01-25' },
  { id: 't-3', ingredient_id: 'ing-1', type: 'PURCHASE', quantity: 20, unit_price: 15800, created_at: '2024-02-05' },
  
  // Gula transactions
  { id: 't-4', ingredient_id: 'ing-2', type: 'PURCHASE', quantity: 20, unit_price: 17500, created_at: '2024-01-20' },
  { id: 't-5', ingredient_id: 'ing-2', type: 'PURCHASE', quantity: 15, unit_price: 18500, created_at: '2024-02-01' },
  
  // Mentega transactions - stable price
  { id: 't-6', ingredient_id: 'ing-3', type: 'PURCHASE', quantity: 10, unit_price: 45000, created_at: '2024-01-10' },
  
  // Cokelat transactions - volatile
  { id: 't-7', ingredient_id: 'ing-4', type: 'PURCHASE', quantity: 5, unit_price: 60000, created_at: '2024-01-12' },
  { id: 't-8', ingredient_id: 'ing-4', type: 'PURCHASE', quantity: 3, unit_price: 70000, created_at: '2024-02-03' }
]

// Tooltip edukasi untuk UMKM
const UMKMTooltip = ({ title, content, children }: { title: string, content: string, children: React.ReactNode }) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center gap-1 cursor-help">
          {children}
          <HelpCircle className="h-4 w-4 text-gray-400" />
        </div>
      </TooltipTrigger>
      <TooltipContent className="max-w-80 p-4">
        <div className="space-y-2">
          <h4 className="font-semibold text-sm">{title}</h4>
          <p className="text-xs text-gray-600">{content}</p>
        </div>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
)

// Method descriptions untuk UMKM
const getPricingMethodDescription = (method: PricingMethod) => {
  const descriptions = {
    'list_price': {
      name: 'Harga List Tetap',
      description: 'Pakai harga yang sudah ditulis di daftar, tidak berubah',
      icon: '📋',
      pros: 'Gampang, tidak ribet',
      cons: 'Bisa kurang akurat jika harga bahan sudah beda'
    },
    'weighted': {
      name: 'Rata-rata Tertimbang', 
      description: 'Hitung rata-rata dari semua pembelian, yang banyak lebih berpengaruh',
      icon: '⚖️',
      pros: 'Akurat untuk pembelian besar',
      cons: 'Agak susah dipahami'
    },
    'fifo': {
      name: 'FIFO (Masuk Pertama Keluar Pertama)',
      description: 'Bahan yang dibeli duluan dipakai duluan, seperti di warung',
      icon: '📦',
      pros: 'Sesuai cara kerja gudang',
      cons: 'Ribet track bahan mana yang duluan'
    },
    'moving': {
      name: 'Rata-rata Bergerak',
      description: 'Harga rata-rata yang selalu update setiap beli bahan baru',
      icon: '📈',
      pros: 'Paling akurat untuk HPP, otomatis update',
      cons: 'Perlu sistem yang bagus'
    },
    'latest': {
      name: 'Harga Terakhir',
      description: 'Pakai harga dari pembelian paling baru',
      icon: '🆕',
      pros: 'Sederhana, harga terkini',
      cons: 'Bisa fluktuatif, tidak stabil'
    }
  }
  return descriptions[method] || descriptions['list_price']
}

export default function EnhancedHPPCalculator() {
  const [selectedPricingMethod, setSelectedPricingMethod] = useState<PricingMethod>('moving')
  const [profitMarginPercent, setProfitMarginPercent] = useState(30)
  const [includeOperationalCosts, setIncludeOperationalCosts] = useState(true)
  const [calculationResult, setCalculationResult] = useState<HPPCalculationResult | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  // Calculate HPP
  const calculateHPP = async () => {
    setIsCalculating(true)
    
    try {
      const result = await EnhancedHPPCalculationService.calculateHPP(
        sampleRecipe,
        sampleRecipeIngredients,
        sampleOperationalCosts,
        sampleStockTransactions,
        {
          pricingMethod: selectedPricingMethod,
          includeOperationalCosts,
          profitMarginPercent,
          overheadAllocationMethod: 'per_batch'
        }
      )
      
      setCalculationResult(result)
    } catch (error) {
      console.error('Error calculating HPP:', error)
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
        {/* Settings Panel */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Pengaturan Perhitungan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Pricing Method Selection */}
              <div>
                <UMKMTooltip
                  title="Metode Harga Bahan"
                  content="Cara sistem menghitung harga bahan baku. Pilih 'Rata-rata Bergerak' untuk hasil paling akurat!"
                >
                  <Label className="text-sm font-medium">Metode Harga Bahan</Label>
                </UMKMTooltip>
                <Select value={selectedPricingMethod} onValueChange={(value: PricingMethod) => setSelectedPricingMethod(value)}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(['list_price', 'weighted', 'fifo', 'moving', 'latest'] as PricingMethod[]).map(method => {
                      const methodInfo = getPricingMethodDescription(method)
                      return (
                        <SelectItem key={method} value={method}>
                          <div className="flex items-center gap-2">
                            <span>{methodInfo.icon}</span>
                            <span>{methodInfo.name}</span>
                            {method === 'moving' && <Badge variant="secondary" className="text-xs">Rekomendasi</Badge>}
                          </div>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
                
                {/* Method explanation */}
                <div className="mt-2 p-3 bg-gray-50 rounded-lg text-xs">
                  <div className="flex items-center gap-2 mb-1">
                    <span>{getPricingMethodDescription(selectedPricingMethod).icon}</span>
                    <span className="font-medium">{getPricingMethodDescription(selectedPricingMethod).name}</span>
                  </div>
                  <p className="text-gray-600 mb-2">{getPricingMethodDescription(selectedPricingMethod).description}</p>
                  <div className="grid grid-cols-1 gap-1">
                    <p className="text-green-600">✅ {getPricingMethodDescription(selectedPricingMethod).pros}</p>
                    <p className="text-orange-600">⚠️ {getPricingMethodDescription(selectedPricingMethod).cons}</p>
                  </div>
                </div>
              </div>

              {/* Profit Margin */}
              <div>
                <UMKMTooltip
                  title="Target Keuntungan"
                  content="Berapa persen keuntungan yang Anda inginkan? 30% artinya jika HPP Rp10.000, harga jual jadi Rp13.000"
                >
                  <Label className="text-sm font-medium">Target Keuntungan (%)</Label>
                </UMKMTooltip>
                <Input
                  type="number"
                  value={profitMarginPercent}
                  onChange={(e) => setProfitMarginPercent(Number(e.target.value))}
                  className="mt-2"
                  placeholder="30"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Rekomendasi: 25-40% untuk produk bakery
                </p>
              </div>

              {/* Include Operational Costs */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={includeOperationalCosts}
                  onChange={(e) => setIncludeOperationalCosts(e.target.checked)}
                  className="rounded"
                />
                <UMKMTooltip
                  title="Biaya Operasional"
                  content="Termasuk biaya listrik, gaji, sewa tempat, dll. Penting untuk HPP yang lengkap!"
                >
                  <Label className="text-sm">Sertakan Biaya Operasional</Label>
                </UMKMTooltip>
              </div>
            </CardContent>
          </Card>

          {/* Recipe Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Info Resep
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <h3 className="font-semibold">{sampleRecipe.name}</h3>
                <p className="text-sm text-gray-600">Hasil: {sampleRecipe.servings} porsi</p>
                <div className="space-y-1">
                  <p className="text-xs font-medium">Bahan-bahan:</p>
                  {sampleRecipeIngredients.map(ingredient => (
                    <div key={ingredient.id} className="text-xs text-gray-600 flex justify-between">
                      <span>{ingredient.ingredient?.name}</span>
                      <span>{ingredient.quantity} {ingredient.unit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2 space-y-6">
          {calculationResult && (
            <>
              {/* Main Results */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Hasil Perhitungan HPP
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <UMKMTooltip
                        title="HPP Per Porsi"
                        content="Berapa biaya untuk membuat 1 porsi produk. Ini adalah cost minimum sebelum profit."
                      >
                        <p className="text-sm text-gray-600">HPP Per Porsi</p>
                      </UMKMTooltip>
                      <p className="text-2xl font-bold text-blue-600">
                        {formatCurrency(calculationResult.calculations.hppPerUnit)}
                      </p>
                    </div>
                    
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <UMKMTooltip
                        title="Harga Jual Saran"
                        content="Harga jual yang disarankan sudah termasuk target keuntungan Anda."
                      >
                        <p className="text-sm text-gray-600">Harga Jual Saran</p>
                      </UMKMTooltip>
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(calculationResult.calculations.suggestedSellingPrice)}
                      </p>
                      <Badge variant="secondary" className="mt-1 text-xs">
                        +{calculationResult.calculations.profitMarginPercent}% profit
                      </Badge>
                    </div>

                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <UMKMTooltip
                        title="Total HPP"
                        content="Total biaya untuk membuat seluruh batch resep ini."
                      >
                        <p className="text-sm text-gray-600">Total HPP</p>
                      </UMKMTooltip>
                      <p className="text-xl font-bold text-purple-600">
                        {formatCurrency(calculationResult.calculations.totalHPP)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {calculationResult.servings} porsi
                      </p>
                    </div>

                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <UMKMTooltip
                        title="Profit Per Porsi"
                        content="Keuntungan bersih yang Anda dapat dari setiap porsi yang terjual."
                      >
                        <p className="text-sm text-gray-600">Profit Per Porsi</p>
                      </UMKMTooltip>
                      <p className="text-xl font-bold text-orange-600">
                        {formatCurrency(
                          calculationResult.calculations.suggestedSellingPrice - 
                          calculationResult.calculations.hppPerUnit
                        )}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Cost Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Rincian Biaya
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Visual breakdown */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Bahan Baku</span>
                        <span className="text-sm">
                          {formatCurrency(calculationResult.costBreakdown.materialCost)} 
                          ({calculationResult.costBreakdown.materialPercentage.toFixed(1)}%)
                        </span>
                      </div>
                      <Progress 
                        value={calculationResult.costBreakdown.materialPercentage} 
                        className="h-2" 
                      />
                      
                      {includeOperationalCosts && (
                        <>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Biaya Operasional</span>
                            <span className="text-sm">
                              {formatCurrency(calculationResult.costBreakdown.operationalCost)} 
                              ({calculationResult.costBreakdown.operationalPercentage.toFixed(1)}%)
                            </span>
                          </div>
                          <Progress 
                            value={calculationResult.costBreakdown.operationalPercentage} 
                            className="h-2" 
                          />
                        </>
                      )}
                    </div>

                    {/* Ingredient breakdown */}
                    <div className="mt-6">
                      <h4 className="font-medium mb-3">Rincian Per Bahan:</h4>
                      <div className="space-y-2">
                        {calculationResult.costBreakdown.ingredientBreakdown.map((ingredient, index) => (
                          <div key={index} className="flex items-center justify-between text-sm">
                            <span>{ingredient.ingredientName}</span>
                            <div className="flex items-center gap-2">
                              <span>{formatCurrency(ingredient.cost)}</span>
                              <Badge variant="outline" className="text-xs">
                                {ingredient.percentage.toFixed(1)}%
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Method Comparison */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Perbandingan Metode Harga
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {calculationResult.pricingAlternatives.map((alternative, index) => (
                      <div 
                        key={alternative.method}
                        className={`flex items-center justify-between p-3 rounded-lg border ${
                          alternative.method === selectedPricingMethod 
                            ? 'border-blue-200 bg-blue-50' 
                            : 'border-gray-200'
                        }`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span>{getPricingMethodDescription(alternative.method).icon}</span>
                            <span className="font-medium">
                              {getPricingMethodDescription(alternative.method).name}
                            </span>
                            {alternative.method === selectedPricingMethod && (
                              <Badge variant="default" className="text-xs">Dipilih</Badge>
                            )}
                            {alternative.method === 'moving' && alternative.method !== selectedPricingMethod && (
                              <Badge variant="secondary" className="text-xs">Rekomendasi</Badge>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 mt-1">
                            {alternative.methodDescription}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">
                            {formatCurrency(alternative.costPerUnit)}
                          </p>
                          <p className="text-xs text-gray-500">per porsi</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recommendations */}
              {calculationResult.recommendations.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5" />
                      Saran & Rekomendasi
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {calculationResult.recommendations.map((recommendation, index) => (
                        <Alert key={index}>
                          <Info className="h-4 w-4" />
                          <AlertDescription>
                            {recommendation}
                          </AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
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

      {/* Educational Footer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800 text-sm">💡 Tips Penetapan Harga untuk UMKM</CardTitle>
          </CardHeader>
          <CardContent className="text-green-700 text-xs space-y-2">
            <p><strong>Margin 25-30%:</strong> Untuk produk harian seperti roti, kue kering</p>
            <p><strong>Margin 35-50%:</strong> Untuk produk premium, custom cake, wedding cake</p>
            <p><strong>Selalu cek kompetitor:</strong> Jangan terlalu jauh dari harga pasar</p>
            <p><strong>Review rutin:</strong> Minimal sebulan sekali, atau saat harga bahan naik</p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-800 text-sm">🎯 Cara Pakai Hasil HPP</CardTitle>
          </CardHeader>
          <CardContent className="text-blue-700 text-xs space-y-2">
            <p><strong>Harga Retail:</strong> Langsung pakai harga jual saran</p>
            <p><strong>Harga Grosir:</strong> HPP + margin 15-20% saja</p>
            <p><strong>Harga Reseller:</strong> HPP + margin 10-15%</p>
            <p><strong>Promo/Diskon:</strong> Jangan di bawah HPP, minimal HPP + 5%</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}