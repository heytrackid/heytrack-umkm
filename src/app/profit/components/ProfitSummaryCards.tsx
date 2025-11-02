'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { ProfitData } from './types'
import { TrendingUp, TrendingDown, DollarSign, Package, ArrowUpRight, ArrowDownRight } from 'lucide-react' 

interface ProfitSummaryCardsProps {
  summary: ProfitData['summary']
  trends?: ProfitData['trends']
  formatCurrency: (amount: number) => string
  isMobile: boolean
}

export const ProfitSummaryCards = ({ summary, trends, formatCurrency, isMobile }: ProfitSummaryCardsProps) => (
  <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-4'}`}>
    {/* Total Revenue */}
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Total Pendapatan
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold">{formatCurrency(summary.total_revenue)}</p>
            {trends?.revenue_trend && trends.revenue_trend !== 0 && (
              <p className={`text-xs flex items-center gap-1 mt-1 ${trends.revenue_trend > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                {trends.revenue_trend > 0 ? (
                  <ArrowUpRight className="h-3 w-3" />
                ) : (
                  <ArrowDownRight className="h-3 w-3" />
                )}
                {Math.abs(trends.revenue_trend).toFixed(1)}%
              </p>
            )}
          </div>
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
            <DollarSign className="h-6 w-6 text-muted-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>

    {/* Gross Profit */}
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Laba Kotor
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold">{formatCurrency(summary.gross_profit)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Margin: {summary.gross_profit_margin.toFixed(1)}%
            </p>
          </div>
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
            <TrendingUp className="h-6 w-6 text-muted-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>

    {/* Net Profit */}
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Laba Bersih
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-2xl font-bold ${summary.net_profit >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
              {formatCurrency(summary.net_profit)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Margin: {summary.net_profit_margin.toFixed(1)}%
            </p>
          </div>
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
            {summary.net_profit >= 0 ? (
              <TrendingUp className="h-6 w-6 text-muted-foreground" />
            ) : (
              <TrendingDown className="h-6 w-6 text-muted-foreground" />
            )}
          </div>
        </div>
      </CardContent>
    </Card>

    {/* COGS */}
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Harga Pokok Penjualan
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold">{formatCurrency(summary.total_cogs)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Metode: WAC
            </p>
          </div>
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
            <Package className="h-6 w-6 text-muted-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
)
