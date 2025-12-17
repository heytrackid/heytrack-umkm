'use client'

import { ArrowDownRight, ArrowUpRight, DollarSign, Minus, Package, TrendingDown, TrendingUp } from '@/components/icons'
 
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import type { ProfitData } from '@/app/profit/components/types'

interface ProfitSummaryCardsProps {
  summary: ProfitData['summary']
  trends?: ProfitData['trends'] | undefined
  formatCurrency: (amount: number) => string
  isMobile: boolean
}

export const ProfitSummaryCards = ({ summary, trends, formatCurrency, isMobile }: ProfitSummaryCardsProps) => {
  // Calculate growth percentages (would be derived from previous period data in real implementation)
  const revenueGrowth = trends?.revenue_trend ?? 0;
  const cogsGrowth = 0; // COGS trend not available in current data structure
  const grossProfitGrowth = trends?.profit_trend ?? 0;
  const netProfitGrowth = trends?.profit_trend ?? 0;

  // Function to get trend icon and color
  const getTrendElement = (value: number) => {
    if (value > 0) {
      return <ArrowUpRight className="h-3 w-3" />;
    }
    if (value < 0) {
      return <ArrowDownRight className="h-3 w-3" />;
    }
    return <Minus className="h-3 w-3" />;
  };

  // Function to get trend badge styling
  const getTrendBadge = (value: number) => {
    if (value > 0) return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400';
    if (value < 0) return 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400';
    return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
  };

  return (
    <div className={`grid gap-4 ${isMobile ? 'grid-cols-2' : 'grid-cols-2 lg:grid-cols-4'}`}>
      {/* Total Revenue */}
      <Card className="border-border/50 shadow-sm hover:shadow-md transition-all duration-200">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Pendapatan
          </CardTitle>
           <div className="p-2 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-lg border border-blue-200/20">
             <DollarSign className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-lg sm:text-2xl font-bold tracking-tight text-foreground leading-tight whitespace-normal break-words max-w-full">{formatCurrency(summary.total_revenue)}</p>
            {revenueGrowth !== 0 && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getTrendBadge(revenueGrowth)}`}>
                  {getTrendElement(revenueGrowth)}
                  {Math.abs(revenueGrowth).toFixed(1)}%
                </span>
                <span className="text-xs text-muted-foreground">dari periode lalu</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Gross Profit */}
      <Card className="border-border/50 shadow-sm hover:shadow-md transition-all duration-200">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Laba Kotor
          </CardTitle>
           <div className="p-2 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-lg border border-emerald-200/20">
             <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-lg sm:text-2xl font-bold tracking-tight text-foreground leading-tight whitespace-normal break-words max-w-full">{formatCurrency(summary.gross_profit)}</p>
             <div className="flex flex-col sm:flex-row sm:items-center justify-between">
               <p className="text-xs text-muted-foreground">
                 Margin: <span className="font-medium text-foreground">{((summary?.gross_profit_margin ?? 0) || 0).toFixed(1)}%</span>
               </p>
              {grossProfitGrowth !== 0 && (
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getTrendBadge(grossProfitGrowth)}`}>
                  {getTrendElement(grossProfitGrowth)}
                  {Math.abs(grossProfitGrowth).toFixed(1)}%
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Net Profit */}
      <Card className="border-border/50 shadow-sm hover:shadow-md transition-all duration-200">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Laba Bersih
          </CardTitle>
           <div className="p-2 bg-gradient-to-br from-violet-500/10 to-purple-500/10 rounded-lg border border-violet-200/20">
             {summary.net_profit >= 0 ? (
               <TrendingUp className="h-4 w-4 text-violet-600 dark:text-violet-400" />
             ) : (
               <TrendingDown className="h-4 w-4 text-rose-600 dark:text-rose-400" />
             )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
             <p className="text-lg sm:text-2xl font-bold tracking-tight text-foreground leading-tight whitespace-normal break-words max-w-full">
               {formatCurrency(summary.net_profit)}
            </p>
             <div className="flex flex-col sm:flex-row sm:items-center justify-between">
               <p className="text-xs text-muted-foreground">
                 Margin: <span className="font-medium text-foreground">{((summary?.net_profit_margin ?? 0) || 0).toFixed(1)}%</span>
               </p>
              {netProfitGrowth !== 0 && (
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getTrendBadge(netProfitGrowth)}`}>
                  {getTrendElement(netProfitGrowth)}
                  {Math.abs(netProfitGrowth).toFixed(1)}%
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* COGS */}
      <Card className="border-border/50 shadow-sm hover:shadow-md transition-all duration-200">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Harga Pokok Penjualan
          </CardTitle>
           <div className="p-2 bg-gradient-to-br from-orange-500/10 to-amber-500/10 rounded-lg border border-orange-200/20">
             <Package className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-lg sm:text-2xl font-bold tracking-tight text-foreground leading-tight whitespace-normal break-words max-w-full">{formatCurrency(summary.total_cogs)}</p>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Metode: <span className="font-medium text-foreground">WAC</span>
              </p>
              {cogsGrowth !== 0 && (
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getTrendBadge(cogsGrowth)}`}>
                  {getTrendElement(cogsGrowth)}
                  {Math.abs(cogsGrowth).toFixed(1)}%
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
