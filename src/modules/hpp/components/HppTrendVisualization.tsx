'use client'

import { Calendar, TrendingDown, TrendingUp } from '@/components/icons'
import { useMemo } from 'react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useCurrency } from '@/hooks/useCurrency'

interface HppTrendData {
  date: string
  hpp_value: number
  margin_percentage: number
  ingredient_cost: number
  operational_cost: number
  labor_cost: number
  overhead_cost: number
}

interface HppTrendVisualizationProps {
  trendData: HppTrendData[]
  recipeName: string
}

export const HppTrendVisualization = ({ trendData, recipeName }: HppTrendVisualizationProps): JSX.Element => {
  const { formatCurrency } = useCurrency()

  const trendAnalysis = useMemo(() => {
    if (trendData.length < 2) {
      return {
        hppTrend: 0,
        marginTrend: 0,
        averageHpp: 0,
        averageMargin: 0,
        volatility: 0,
        bestPeriod: null,
        worstPeriod: null
      }
    }

    const sortedData = [...trendData].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    // Calculate trends
    const firstData = sortedData[0]
    const lastData = sortedData[sortedData.length - 1]

    if (!firstData || !lastData) {
      return {
        hppTrend: 0,
        marginTrend: 0,
        averageHpp: 0,
        averageMargin: 0,
        volatility: 0,
        bestPeriod: null,
        worstPeriod: null
      }
    }

    const firstHpp = firstData.hpp_value
    const lastHpp = lastData.hpp_value
    const hppTrend = firstHpp > 0 ? ((lastHpp - firstHpp) / firstHpp) * 100 : 0

    const firstMargin = firstData.margin_percentage
    const lastMargin = lastData.margin_percentage
    const marginTrend = lastMargin - firstMargin

    // Calculate averages
    const averageHpp = sortedData.reduce((sum, d) => sum + d.hpp_value, 0) / sortedData.length
    const averageMargin = sortedData.reduce((sum, d) => sum + d.margin_percentage, 0) / sortedData.length

    // Calculate volatility (standard deviation of HPP)
    const hppVariance = sortedData.reduce((sum, d) => sum + Math.pow(d.hpp_value - averageHpp, 2), 0) / sortedData.length
    const volatility = Math.sqrt(hppVariance)

    // Find best and worst periods
    const bestPeriod = sortedData.reduce((best, current) =>
      current.margin_percentage > best.margin_percentage ? current : best
    )
    const worstPeriod = sortedData.reduce((worst, current) =>
      current.margin_percentage < worst.margin_percentage ? current : worst
    )

    return {
      hppTrend,
      marginTrend,
      averageHpp,
      averageMargin,
      volatility,
      bestPeriod,
      worstPeriod
    }
  }, [trendData])

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      month: 'short',
      year: 'numeric'
    })
  }

  if (trendData.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-secondary rounded-full flex items-center justify-center">
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <p className="font-semibold mb-1">Belum Ada Data Tren</p>
              <p className="text-sm text-muted-foreground">
                Lakukan beberapa kali kalkulasi HPP untuk melihat tren perubahan biaya
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Trend Summary */}
      <Card className="border-2 border-border/20 bg-gradient-to-br from-muted/30 to-muted/50 dark:from-muted/10 dark:to-muted/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-foreground" />
            Analisis Tren HPP - {recipeName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-card rounded-lg border">
              <div className="text-lg font-bold flex items-center justify-center gap-1">
                {trendAnalysis.hppTrend >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-red-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-green-500" />
                )}
                {Math.abs(trendAnalysis.hppTrend).toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground mt-1">Tren HPP</div>
              <Badge
                variant={trendAnalysis.hppTrend <= 5 ? "default" : "destructive"}
                className="mt-1 text-xs"
              >
                {trendAnalysis.hppTrend <= 5 ? 'Stabil' : 'Meningkat'}
              </Badge>
            </div>

            <div className="text-center p-3 bg-card rounded-lg border">
              <div className="text-lg font-bold flex items-center justify-center gap-1">
                {trendAnalysis.marginTrend >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
                {Math.abs(trendAnalysis.marginTrend).toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground mt-1">Tren Margin</div>
              <Badge
                variant={trendAnalysis.marginTrend >= 0 ? "default" : "destructive"}
                className="mt-1 text-xs"
              >
                {trendAnalysis.marginTrend >= 0 ? 'Meningkat' : 'Menurun'}
              </Badge>
            </div>

            <div className="text-center p-3 bg-card rounded-lg border">
              <div className="text-lg font-bold">{formatCurrency(trendAnalysis.averageHpp)}</div>
              <div className="text-xs text-muted-foreground mt-1">Rata-rata HPP</div>
            </div>

            <div className="text-center p-3 bg-card rounded-lg border">
              <div className="text-lg font-bold">{trendAnalysis.averageMargin.toFixed(1)}%</div>
              <div className="text-xs text-muted-foreground mt-1">Rata-rata Margin</div>
              <Badge
                variant={trendAnalysis.averageMargin >= 30 ? "default" : "secondary"}
                className="mt-1 text-xs"
              >
                {trendAnalysis.averageMargin >= 30 ? 'Sehat' : 'Perlu Perhatian'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trend Chart Visualization */}
      <Card>
        <CardHeader>
          <CardTitle>Visualisasi Tren HPP</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Simple bar chart representation */}
            <div className="space-y-2">
              <div className="text-sm font-medium">HPP per Periode</div>
              <div className="flex items-end gap-2 h-32">
                {trendData.slice(-6).map((data) => {
                  const maxHpp = Math.max(...trendData.map(d => d.hpp_value))
                  const height = maxHpp > 0 ? (data.hpp_value / maxHpp) * 100 : 0

                  return (
                    <div key={data.date} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full bg-primary rounded-t transition-all duration-300 hover:bg-primary/80"
                        style={{ height: `${height}%` }}
                      />
                      <div className="text-xs text-muted-foreground transform -rotate-45 origin-top">
                        {formatDate(data.date)}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Margin trend */}
            <div className="space-y-2">
              <div className="text-sm font-medium">Margin Percentage per Periode</div>
              <div className="flex items-end gap-2 h-24">
                {trendData.slice(-6).map((data) => {
                  const height = Math.max(0, Math.min(100, data.margin_percentage))

                  return (
                    <div key={data.date} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className={`w-full rounded-t transition-all duration-300 ${
                          data.margin_percentage >= 30 ? 'bg-green-500' :
                          data.margin_percentage >= 20 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ height: `${height}%` }}
                      />
                      <div className="text-xs text-muted-foreground">
                        {data.margin_percentage.toFixed(0)}%
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Best/Worst Periods */}
      {trendAnalysis.bestPeriod && trendAnalysis.worstPeriod && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-green-200 dark:border-green-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
                <TrendingUp className="h-5 w-5" />
                Periode Terbaik
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">
                  {formatDate(trendAnalysis.bestPeriod.date)}
                </div>
                <div className="text-lg font-bold">
                  {trendAnalysis.bestPeriod.margin_percentage.toFixed(1)}% margin
                </div>
                <div className="text-sm text-muted-foreground">
                  HPP: {formatCurrency(trendAnalysis.bestPeriod.hpp_value)}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-200 dark:border-red-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
                <TrendingDown className="h-5 w-5" />
                Periode Terburuk
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">
                  {formatDate(trendAnalysis.worstPeriod.date)}
                </div>
                <div className="text-lg font-bold">
                  {trendAnalysis.worstPeriod.margin_percentage.toFixed(1)}% margin
                </div>
                <div className="text-sm text-muted-foreground">
                  HPP: {formatCurrency(trendAnalysis.worstPeriod.hpp_value)}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Insights & Rekomendasi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {trendAnalysis.hppTrend > 10 && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-800 dark:text-red-200">
                ⚠️ <strong>HPP meningkat {trendAnalysis.hppTrend.toFixed(1)}%</strong> dalam periode terakhir.
                Pertimbangkan untuk mencari supplier alternatif atau menegosiasikan harga bahan baku.
              </p>
            </div>
          )}

          {trendAnalysis.marginTrend < -5 && (
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                📉 <strong>Margin menurun {Math.abs(trendAnalysis.marginTrend).toFixed(1)}%</strong>.
                Evaluasi apakah harga jual perlu disesuaikan atau efisiensi biaya perlu ditingkatkan.
              </p>
            </div>
          )}

          {trendAnalysis.volatility > trendAnalysis.averageHpp * 0.1 && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                📊 <strong>Biaya volatile</strong> dengan deviasi {formatCurrency(trendAnalysis.volatility)}.
                Pertimbangkan kontrak harga jangka panjang dengan supplier untuk stabilitas.
              </p>
            </div>
          )}

          {trendAnalysis.averageMargin >= 35 && (
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-sm text-green-800 dark:text-green-200">
                ✅ <strong>Performa baik</strong> dengan margin rata-rata {trendAnalysis.averageMargin.toFixed(1)}%.
                Pertahankan efisiensi dan kualitas untuk sustainabilitas bisnis.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}