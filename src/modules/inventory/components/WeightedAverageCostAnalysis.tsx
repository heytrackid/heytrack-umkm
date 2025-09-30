'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  DollarSign, 
  BarChart3,
  Calculator,
  Info
} from 'lucide-react'
import { WeightedAverageCostService, PricingInsights } from '../services/WeightedAverageCostService'
import { Ingredient, StockTransaction } from '../types'
import { useCurrency } from '@/hooks/useCurrency'

interface WeightedAverageCostAnalysisProps {
  ingredient: Ingredient
  transactions: StockTransaction[]
  onUpdatePrice?: (newPrice: number, method: string) => void
}

export function WeightedAverageCostAnalysis({ 
  ingredient, 
  transactions, 
  onUpdatePrice 
}: WeightedAverageCostAnalysisProps) {
  const { formatCurrency } = useCurrency()
  const [selectedMethod, setSelectedMethod] = useState<'weighted' | 'fifo' | 'moving' | 'latest'>('moving')
  
  // Calculate pricing insights
  const pricingInsights = WeightedAverageCostService.generatePricingInsights(ingredient, transactions)
  const weightedAvgData = WeightedAverageCostService.calculateWeightedAveragePrice(ingredient, transactions)
  const fifoData = WeightedAverageCostService.calculateFIFOStockValue(ingredient, transactions)
  const movingAvgData = WeightedAverageCostService.calculateMovingAverageValue(ingredient, transactions)

  // Calculate price differences
  const currentPrice = ingredient.price_per_unit
  const priceDifferences = {
    weighted: ((pricingInsights.weightedAveragePrice - currentPrice) / currentPrice) * 100,
    fifo: ((pricingInsights.fifoAveragePrice - currentPrice) / currentPrice) * 100,
    moving: ((pricingInsights.movingAveragePrice - currentPrice) / currentPrice) * 100
  }

  // Format percentage
  const formatPercent = (value: number) => {
    const sign = value > 0 ? '+' : ''
    return `${sign}${value.toFixed(2)}%`
  }

  // Get trend icon and color
  const getTrendIndicator = (percentage: number) => {
    if (Math.abs(percentage) < 2) return { icon: BarChart3, color: 'text-gray-500', bg: 'bg-gray-50' }
    if (percentage > 0) return { icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' }
    return { icon: TrendingDown, color: 'text-red-600', bg: 'bg-red-50' }
  }

  return (
    <div className="space-y-6">
      {/* Header Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Analisis Harga Rata-rata: {ingredient.name}
          </CardTitle>
          <CardDescription>
            Perbandingan berbagai metode perhitungan harga untuk HPP yang akurat
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Current List Price */}
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">Harga List Saat Ini</p>
              <p className="text-lg font-semibold text-blue-600">
                {formatCurrency(currentPrice)}
              </p>
            </div>

            {/* Recommended Price */}
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600">Rekomendasi untuk HPP</p>
              <p className="text-lg font-semibold text-green-600">
                {formatCurrency(pricingInsights.recommendedPriceForHPP)}
              </p>
              <Badge variant="secondary" className="text-xs mt-1">
                Moving Average
              </Badge>
            </div>

            {/* Price Volatility */}
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <p className="text-sm text-gray-600">Volatilitas Harga</p>
              <p className="text-lg font-semibold text-orange-600">
                {(pricingInsights.priceVolatility.coefficient * 100).toFixed(1)}%
              </p>
              <Badge 
                variant={pricingInsights.priceVolatility.coefficient > 0.15 ?"destructive" :"secondary"}
                className="text-xs mt-1"
              >
                {pricingInsights.priceVolatility.coefficient > 0.15 ? 'Tinggi' : 'Stabil'}
              </Badge>
            </div>

            {/* Stock Value */}
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <p className="text-sm text-gray-600">Nilai Stock</p>
              <p className="text-lg font-semibold text-purple-600">
                {formatCurrency(pricingInsights.stockValue.moving)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {ingredient.current_stock || 0} {ingredient.unit}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Methods Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Perbandingan Metode Perhitungan Harga</CardTitle>
          <CardDescription>
            Pilih metode yang paling sesuai untuk bisnis Anda
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Weighted Average */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold">Weighted Average</h4>
                  {getTrendIndicator(priceDifferences.weighted).icon && (
                    <div className={`p-1 rounded ${getTrendIndicator(priceDifferences.weighted).bg}`}>
                      {React.createElement(getTrendIndicator(priceDifferences.weighted).icon, {
                        className: `h-4 w-4 ${getTrendIndicator(priceDifferences.weighted).color}`
                      })}
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  Rata-rata tertimbang dari semua pembelian
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {weightedAvgData.purchaseHistory.length} transaksi pembelian
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-lg">
                  {formatCurrency(pricingInsights.weightedAveragePrice)}
                </p>
                <p className={`text-sm ${priceDifferences.weighted > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatPercen""}
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-2"
                  onClick={() => onUpdatePrice?.(pricingInsights.weightedAveragePrice, 'weighted')}
                >
                  Gunakan Harga Ini
                </Button>
              </div>
            </div>

            {/* FIFO Average */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold">FIFO Average</h4>
                  {getTrendIndicator(priceDifferences.fifo).icon && (
                    <div className={`p-1 rounded ${getTrendIndicator(priceDifferences.fifo).bg}`}>
                      {React.createElement(getTrendIndicator(priceDifferences.weighted).icon, {
                        className: `h-4 w-4 ${getTrendIndicator(priceDifferences.fifo).color}`
                      })}
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  First In, First Out - stock layers
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {fifoData.stockLayers.length} layers stock
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-lg">
                  {formatCurrency(pricingInsights.fifoAveragePrice)}
                </p>
                <p className={`text-sm ${priceDifferences.fifo > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatPercen""}
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-2"
                  onClick={() => onUpdatePrice?.(pricingInsights.fifoAveragePrice, 'fifo')}
                >
                  Gunakan Harga Ini
                </Button>
              </div>
            </div>

            {/* Moving Average */}
            <div className="flex items-center justify-between p-4 border rounded-lg bg-green-50">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold">Moving Average</h4>
                  <Badge variant="default">Rekomendasi</Badge>
                  {getTrendIndicator(priceDifferences.moving).icon && (
                    <div className={`p-1 rounded ${getTrendIndicator(priceDifferences.moving).bg}`}>
                      {React.createElement(getTrendIndicator(priceDifferences.weighted).icon, {
                        className: `h-4 w-4 ${getTrendIndicator(priceDifferences.moving).color}`
                      })}
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  Menyesuaikan setiap transaksi - paling akurat
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {movingAvgData.movementHistory.length} movement records
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-lg">
                  {formatCurrency(pricingInsights.movingAveragePrice)}
                </p>
                <p className={`text-sm ${priceDifferences.moving > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatPercen""}
                </p>
                <Button
                  size="sm"
                  className="mt-2"
                  onClick={() => onUpdatePrice?.(pricingInsights.movingAveragePrice, 'moving')}
                >
                  Gunakan Harga Ini
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Analysis Tabs */}
      <Tabs defaultValue="purchase-history" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="purchase-history">Riwayat Pembelian</TabsTrigger>
          <TabsTrigger value="stock-layers">Lapisan Stock</TabsTrigger>
          <TabsTrigger value="recommendations">Rekomendasi</TabsTrigger>
        </TabsList>

        <TabsContent value="purchase-history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Riwayat Pembelian</CardTitle>
              <CardDescription>
                Detail pembelian yang digunakan untuk perhitungan weighted average
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {weightedAvgData.purchaseHistory.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    Belum ada riwayat pembelian
                  </p>
                ) : (
                  weightedAvgData.purchaseHistory.map((purchase, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">
                          {purchase.quantity} {ingredient.unit} × {formatCurrency(purchase.unitPrice)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(purchase.date).toLocaleDateString('id-ID')}
                        </p>
                        {purchase.reference && (
                          <p className="text-xs text-gray-400">
                            Ref: {purchase.reference}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          {formatCurrency(purchase.totalValue)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stock-layers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lapisan Stock FIFO</CardTitle>
              <CardDescription>
                Stock layers berdasarkan First In, First Out method
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {fifoData.stockLayers.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    Tidak ada stock layers
                  </p>
                ) : (
                  fifoData.stockLayers.map((layer, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">
                          {layer.quantity} {ingredient.unit} @ {formatCurrency(layer.unitPrice)}
                        </p>
                        <p className="text-sm text-gray-500">
                          Dibeli: {new Date(layer.purchaseDate).toLocaleDateString('id-ID')}
                        </p>
                        {layer.reference && (
                          <p className="text-xs text-gray-400">
                            Ref: {layer.reference}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          {formatCurrency(layer.totalValue)}
                        </p>
                        <div className="w-24 mt-1">
                          <Progress 
                            value={(layer.quantity / (ingredient.current_stock || 1)) * 100} 
                            className="h-2"
                          />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <div className="space-y-4">
            {pricingInsights.recommendations.map((recommendation, index) => (
              <Alert key={index}>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  {recommendation}
                </AlertDescription>
              </Alert>
            ))}
            
            {pricingInsights.recommendations.length === 0 && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Pricing analysis terlihat normal. Tidak ada rekomendasi khusus saat ini.
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle>Ringkasan Rekomendasi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Untuk HPP Calculation:</h4>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="font-medium">Gunakan Moving Average</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {formatCurrency(pricingInsights.movingAveragePrice)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Paling akurat untuk fluktuasi harga
                    </p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Update Price List:</h4>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="font-medium">
                      {Math.abs(priceDifferences.moving) > 5 ? 'Perlu Update' : 'Masih Wajar'}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Selisih: {formatPercen""}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Dari list price saat ini
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}