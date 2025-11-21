'use client'

import { BarChart3, DollarSign, Package, TrendingDown, TrendingUp } from '@/components/icons'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

import type { ProfitData } from '@/app/profit/components/types'

interface ProfitBreakdownProps {
  summary: ProfitData['summary']
  formatCurrency: (amount: number) => string
}

export const ProfitBreakdown = ({ summary, formatCurrency }: ProfitBreakdownProps) => {
  const totalRevenue = summary.total_revenue
  const cogsDeg = totalRevenue > 0 ? (summary.total_cogs / totalRevenue) * 360 : 0
  const opexDeg = totalRevenue > 0 ? (summary.total_operating_expenses / totalRevenue) * 360 : 0

  return (
    <Card className="border-0 shadow-2xl">
      <CardHeader>
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          <CardTitle>Ringkasan Laba Rugi</CardTitle>
        </div>
        <CardDescription>
          Perhitungan laba dengan metode WAC (Weighted Average Cost)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center p-4 bg-green-50 dark:bg-green-950 rounded-lg border shadow-sm">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <span className="font-medium">Total Pendapatan</span>
            </div>
            <span className="font-semibold text-green-700 dark:text-green-300">
              {formatCurrency(summary.total_revenue)}
            </span>
          </div>
          
          <div className="flex justify-between items-center p-4 bg-orange-50 dark:bg-orange-950 rounded-lg border shadow-sm">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-orange-600" />
              <span className="font-medium">Harga Pokok Penjualan (WAC)</span>
            </div>
            <span className="font-semibold text-orange-700 dark:text-orange-300">
              - {formatCurrency(summary.total_cogs)}
            </span>
          </div>
          
          <div className="flex justify-between items-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border-2 border-blue-200 shadow-lg">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <span className="font-semibold">Laba Kotor</span>
            </div>
            <span className="font-semibold text-blue-700 dark:text-blue-300">
              {formatCurrency(summary.gross_profit)} ({summary.gross_profit_margin.toFixed(1)}%)
            </span>
          </div>
          
          <div className="flex justify-between items-center p-4 bg-red-50 dark:bg-red-950 rounded-lg border shadow-sm">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-600" />
              <span className="font-medium">Biaya Operasional</span>
            </div>
            <span className="font-semibold text-red-700 dark:text-red-300">
              - {formatCurrency(summary.total_operating_expenses)}
            </span>
          </div>
          
          <div className="flex justify-between items-center p-6 bg-gradient-to-r from-muted to-accent rounded-2xl border-2 shadow-2xl">
            <div className="flex items-center gap-2">
              <TrendingUp className={`h-6 w-6 ${summary.net_profit >= 0 ? 'text-green-600' : 'text-red-600'}`} />
              <span className="text-xl font-bold">Laba Bersih</span>
            </div>
            <span className={`text-2xl font-bold ${
              summary.net_profit >= 0 ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
            }`}>
              {formatCurrency(summary.net_profit)} ({summary.net_profit_margin.toFixed(1)}%)
            </span>
          </div>
        </div>

        {/* Profit Composition Chart */}
        <div className="mt-12 p-8 bg-gradient-to-br from-muted/30 to-background/50 rounded-3xl shadow-2xl border border-border/30">
          <h4 className="text-2xl font-bold mb-8 flex items-center gap-3 text-foreground">
            <BarChart3 className="h-8 w-8 text-primary drop-shadow-lg" />
            Komposisi Laba (% dari Revenue)
          </h4>
          {totalRevenue > 0 ? (
            <>
              <div className="aspect-square max-w-md mx-auto rounded-3xl shadow-2xl overflow-hidden ring-8 ring-background/60 group hover:rotate-1 transition-all duration-500">
                <div 
                  className="w-full h-full rounded-3xl relative"
                  style={{
                    background: `conic-gradient(
                      hsl(9, 80%, 55%) 0deg ${cogsDeg}deg,
                      hsl(39, 80%, 55%) ${cogsDeg}deg ${cogsDeg + opexDeg}deg,
                      hsl(163, 80%, 45%) ${cogsDeg + opexDeg}deg 360deg
                    )`
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent rounded-3xl shadow-2xl" />
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-12 text-center">
                <div className="p-6 rounded-2xl bg-gradient-to-r from-red-50 to-red-100 border border-red-200 shadow-md hover:shadow-xl transition-all">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-200 flex items-center justify-center shadow-lg">
                    <Package className="h-8 w-8 text-red-600" />
                  </div>
                  <p className="font-bold text-xl text-red-800 mb-1">{((summary.total_cogs / totalRevenue) * 100).toFixed(1)}%</p>
                  <p className="text-sm text-muted-foreground font-medium">HPP (WAC)</p>
                </div>
                <div className="p-6 rounded-2xl bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 shadow-md hover:shadow-xl transition-all">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-orange-200 flex items-center justify-center shadow-lg">
                    <TrendingDown className="h-8 w-8 text-orange-600" />
                  </div>
                  <p className="font-bold text-xl text-orange-800 mb-1">{((summary.total_operating_expenses / totalRevenue) * 100).toFixed(1)}%</p>
                  <p className="text-sm text-muted-foreground font-medium">Biaya Operasional</p>
                </div>
                <div className="p-6 rounded-2xl bg-gradient-to-r from-green-50 to-emerald-100 border border-green-200 shadow-md hover:shadow-xl transition-all">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-200 flex items-center justify-center shadow-lg">
                    <TrendingUp className="h-8 w-8 text-emerald-600" />
                  </div>
                  <p className="font-bold text-xl text-emerald-800 mb-1">{summary.net_profit_margin.toFixed(1)}%</p>
                  <p className="text-sm text-muted-foreground font-medium">Profit Bersih</p>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-20">
              <BarChart3 className="h-20 w-20 mx-auto mb-6 text-muted-foreground/40 animate-pulse" />
              <p className="text-foreground/70 text-xl font-semibold mb-2">Tidak ada data untuk visualisasi</p>
              <p className="text-muted-foreground">Tambah data pesanan & biaya untuk melihat komposisi laba</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
