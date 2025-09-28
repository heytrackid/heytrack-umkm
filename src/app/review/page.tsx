'use client'

import { useState } from 'react'
import AppLayout from '@/components/layout/app-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useResponsive } from '@/hooks/use-mobile'
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  CheckCircle,
  Target,
  Calculator,
  ArrowRight
} from 'lucide-react'

// Sample HPP review data
const hppReviewData = [
  {
    id: '1',
    productName: 'Roti Tawar',
    currentHPP: 15000,
    currentPrice: 25000,
    currentMargin: 40,
    suggestedHPP: 13500,
    suggestedPrice: 23000,
    suggestedMargin: 41.3,
    status: 'optimize',
    reasons: [
      'Harga tepung turun 10%',
      'Efisiensi proses produksi meningkat',
      'Volume produksi lebih tinggi'
    ]
  },
  {
    id: '2',
    productName: 'Croissant',
    currentHPP: 8000,
    currentPrice: 15000,
    currentMargin: 46.7,
    suggestedHPP: 9200,
    suggestedPrice: 17000,
    suggestedMargin: 45.9,
    status: 'adjust',
    reasons: [
      'Harga mentega naik 15%',
      'Biaya listrik meningkat',
      'Inflasi bahan baku'
    ]
  },
  {
    id: '3',
    productName: 'Donat Coklat',
    currentHPP: 12000,
    currentPrice: 20000,
    currentMargin: 40,
    suggestedHPP: 12000,
    suggestedPrice: 20000,
    suggestedMargin: 40,
    status: 'maintain',
    reasons: [
      'HPP sudah optimal',
      'Margin sesuai target',
      'Kompetitif di pasar'
    ]
  },
  {
    id: '4',
    productName: 'Kue Cubit',
    currentHPP: 5000,
    currentPrice: 10000,
    currentMargin: 50,
    suggestedHPP: 4500,
    suggestedPrice: 12000,
    suggestedMargin: 62.5,
    status: 'opportunity',
    reasons: [
      'Permintaan tinggi',
      'Competitor harga lebih tinggi',
      'Bisa naik harga'
    ]
  },
]

export default function HPPReviewPage() {
  const { isMobile } = useResponsive()

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'optimize':
        return {
          label: 'Bisa Dioptimasi',
          color: 'default' as const,
          icon: TrendingUp,
          bgColor: 'bg-blue-50 dark:bg-blue-900/20'
        }
      case 'adjust':
        return {
          label: 'Perlu Penyesuaian',
          color: 'destructive' as const,
          icon: AlertTriangle,
          bgColor: 'bg-red-50 dark:bg-red-900/20'
        }
      case 'maintain':
        return {
          label: 'Pertahankan',
          color: 'secondary' as const,
          icon: CheckCircle,
          bgColor: 'bg-gray-50 dark:bg-gray-800/20'
        }
      case 'opportunity':
        return {
          label: 'Peluang Profit',
          color: 'default' as const,
          icon: Target,
          bgColor: 'bg-green-50 dark:bg-green-900/20'
        }
      default:
        return {
          label: 'Review',
          color: 'secondary' as const,
          icon: Calculator,
          bgColor: 'bg-gray-50 dark:bg-gray-800/20'
        }
    }
  }

  const summaryStats = {
    totalProducts: hppReviewData.length,
    needAdjustment: hppReviewData.filter(item => item.status === 'adjust').length,
    canOptimize: hppReviewData.filter(item => item.status === 'optimize').length,
    opportunities: hppReviewData.filter(item => item.status === 'opportunity').length,
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className={`${isMobile ? 'text-center' : ''}`}>
          <h1 className={`font-bold text-foreground ${isMobile ? 'text-2xl' : 'text-3xl'}`}>
            Review HPP
          </h1>
          <p className="text-muted-foreground">
            Evaluasi dan tingkatkan harga pokok produksi berdasarkan perubahan pasar
          </p>
        </div>

        {/* Summary Cards */}
        <div className={`grid gap-4 ${isMobile ? 'grid-cols-2' : 'md:grid-cols-4'}`}>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className={`font-bold ${isMobile ? 'text-xl' : 'text-2xl'}`}>
                  {summaryStats.totalProducts}
                </div>
                <p className="text-sm text-muted-foreground">Total Produk</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className={`font-bold text-red-600 ${isMobile ? 'text-xl' : 'text-2xl'}`}>
                  {summaryStats.needAdjustment}
                </div>
                <p className="text-sm text-muted-foreground">Perlu Adjust</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className={`font-bold text-blue-600 ${isMobile ? 'text-xl' : 'text-2xl'}`}>
                  {summaryStats.canOptimize}
                </div>
                <p className="text-sm text-muted-foreground">Bisa Optimasi</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className={`font-bold text-green-600 ${isMobile ? 'text-xl' : 'text-2xl'}`}>
                  {summaryStats.opportunities}
                </div>
                <p className="text-sm text-muted-foreground">Peluang Profit</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Review Cards */}
        <div className="space-y-4">
          {hppReviewData.map((item) => {
            const statusInfo = getStatusInfo(item.status)
            const hppChange = item.suggestedHPP - item.currentHPP
            const priceChange = item.suggestedPrice - item.currentPrice
            const marginChange = item.suggestedMargin - item.currentMargin

            return (
              <Card key={item.id} className={`border-2 ${statusInfo.bgColor}`}>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-bold">{item.productName}</h3>
                        <Badge variant={statusInfo.color} className="mt-2">
                          <statusInfo.icon className="h-3 w-3 mr-1" />
                          {statusInfo.label}
                        </Badge>
                      </div>
                      <Button size="sm" variant="outline">
                        Terapkan Saran
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>

                    {/* Comparison */}
                    <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'md:grid-cols-2'}`}>
                      {/* Current */}
                      <div className="space-y-3">
                        <h4 className="font-medium text-muted-foreground">Kondisi Saat Ini</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">HPP:</span>
                            <span className="font-medium">Rp {item.currentHPP.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Harga Jual:</span>
                            <span className="font-medium">Rp {item.currentPrice.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Margin:</span>
                            <span className="font-medium">{item.currentMargin.toFixed(1)}%</span>
                          </div>
                        </div>
                      </div>

                      {/* Suggested */}
                      <div className="space-y-3">
                        <h4 className="font-medium text-primary">Saran Optimasi</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">HPP:</span>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">Rp {item.suggestedHPP.toLocaleString()}</span>
                              {hppChange !== 0 && (
                                <Badge variant={hppChange < 0 ? 'default' : 'destructive'} className="text-xs">
                                  {hppChange > 0 ? '+' : ''}Rp {hppChange.toLocaleString()}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Harga Jual:</span>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">Rp {item.suggestedPrice.toLocaleString()}</span>
                              {priceChange !== 0 && (
                                <Badge variant={priceChange > 0 ? 'default' : 'destructive'} className="text-xs">
                                  {priceChange > 0 ? '+' : ''}Rp {priceChange.toLocaleString()}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Margin:</span>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{item.suggestedMargin.toFixed(1)}%</span>
                              {marginChange !== 0 && (
                                <Badge variant={marginChange > 0 ? 'default' : 'destructive'} className="text-xs">
                                  {marginChange > 0 ? '+' : ''}{marginChange.toFixed(1)}%
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Reasons */}
                    <div className="pt-4 border-t">
                      <h4 className="font-medium mb-2">Alasan Rekomendasi:</h4>
                      <ul className="space-y-1">
                        {item.reasons.map((reason, index) => (
                          <li key={index} className="text-sm text-muted-foreground flex items-start">
                            <span className="mr-2">•</span>
                            <span>{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Action Buttons */}
        <div className={`flex gap-4 pt-4 ${isMobile ? 'flex-col' : 'justify-center'}`}>
          <Button variant="outline" className={isMobile ? 'w-full' : ''}>
            Export Review
          </Button>
          <Button className={isMobile ? 'w-full' : ''}>
            Terapkan Semua Saran
          </Button>
        </div>
      </div>
    </AppLayout>
  )
}