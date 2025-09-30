'use client'

import { useState, Suspense } from 'react'
import dynamic from 'next/dynamic'
import AppLayout from '@/components/layout/app-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useResponsive } from '@/hooks/use-mobile'
import { useHPPReview } from '@/hooks/useDatabase'
import { useCurrency } from '@/hooks/useCurrency'
import { DataGridSkeleton } from '@/components/ui/skeletons/table-skeletons'
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  CheckCircle,
  Target,
  Calculator,
  ArrowRight,
  RefreshCw,
  Package
} from 'lucide-react'

export default function HPPReviewPage() {
  const { isMobile } = useResponsive()
  const { formatCurrency } = useCurrency()
  const { reviewData, loading, summaryStats } = useHPPReview()

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


  if (loading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div className={`${isMobile ? 'text-center' : ''}`}>
            <h1 className={`font-bold text-foreground ${isMobile ? 'text-2xl' : 'text-3xl'}`}>
              Review HPP
            </h1>
            <p className="text-muted-foreground">
              Evaluasi dan tingkatkan harga pokok produksi berdasarkan perubahan pasar
            </p>
          </div>
          <DataGridSkeleton rows={8} />
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className={`flex gap-4 ${isMobile ? 'flex-col items-center text-center' : 'justify-between items-center'}`}>
          <div className={isMobile ? 'text-center' : ''}>
            <h1 className={`font-bold text-foreground ${isMobile ? 'text-2xl' : 'text-3xl'}`}>
              Review HPP
            </h1>
            <p className="text-muted-foreground">
              Evaluasi dan tingkatkan harga pokok produksi berdasarkan perubahan pasar
            </p>
          </div>
          <div className={`flex gap-2 ${isMobile ? 'w-full flex-col' : ''}`}>
            <Button variant="outline" className={isMobile ? 'w-full' : ''} onClick={() => window.location.reload()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Analisis
            </Button>
          </div>
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

        {reviewData.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className={`font-medium mb-2 ${isMobile ? 'text-base' : 'text-lg'}`}>
                Belum ada data produk untuk direview
              </h3>
              <p className="text-muted-foreground mb-4">
                Silakan tambahkan resep produk terlebih dahulu untuk mulai analisis HPP
              </p>
              <Button onClick={() => window.location.href = '/hpp'}>
                Ke HPP Calculator
              </Button>
            </CardContent>
          </Card>
        ) : (
          /* Review Cards */
          <div className="space-y-4">
            {reviewData.map((item) => {
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
                            <span className="font-medium">{formatCurrency(item.currentHPP)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Harga Jual:</span>
                            <span className="font-medium">{formatCurrency(item.currentPrice)}</span>
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
                              <span className="font-medium">{formatCurrency(item.suggestedHPP)}</span>
                              {hppChange !== 0 && (
                                <Badge variant={hppChange < 0 ? 'default' : 'destructive'} className="text-xs">
                                  {hppChange > 0 ? '+' : ''}{formatCurrency(hppChange)}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Harga Jual:</span>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{formatCurrency(item.suggestedPrice)}</span>
                              {priceChange !== 0 && (
                                <Badge variant={priceChange > 0 ? 'default' : 'destructive'} className="text-xs">
                                  {priceChange > 0 ? '+' : ''}{formatCurrency(priceChange)}
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
        )}
      </div>
    </AppLayout>
  )
}