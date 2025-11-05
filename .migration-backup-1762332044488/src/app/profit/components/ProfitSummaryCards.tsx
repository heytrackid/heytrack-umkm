'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { ProfitData } from './types'
import { TrendingUp, TrendingDown, DollarSign, Package, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react' 

interface ProfitSummaryCardsProps {
  summary: ProfitData['summary']
  trends?: ProfitData['trends']
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
      return <ArrowUpRight className="h-4 w-4 text-muted-foreground" />;
    }
    if (value < 0) {
      return <ArrowDownRight className="h-4 w-4 text-muted-foreground" />;
    }
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  // Function to get trend color
  const getTrendColor = (_value: number) => 'text-muted-foreground';

  return (
    <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-4'}`}>
      {/* Total Revenue */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Pendapatan
          </CardTitle>
           <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
             <DollarSign className="h-5 w-5 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <div>
            <p className="text-2xl font-bold text-foreground">{formatCurrency(summary.total_revenue)}</p>
            {revenueGrowth !== 0 && (
              <p className={`text-xs flex items-center gap-1 mt-1 ${getTrendColor(revenueGrowth)}`}>
                {getTrendElement(revenueGrowth)}
                <span className="font-medium">{Math.abs(revenueGrowth).toFixed(1)}%</span>
                <span className="text-muted-foreground">dari periode sebelumnya</span>
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Gross Profit */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Laba Kotor
          </CardTitle>
           <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
             <TrendingUp className="h-5 w-5 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <div>
            <p className="text-2xl font-bold text-foreground">{formatCurrency(summary.gross_profit)}</p>
            <div className="flex items-center gap-1 mt-1">
              <p className="text-xs text-muted-foreground">
                Margin: {summary.gross_profit_margin.toFixed(1)}%
              </p>
              {grossProfitGrowth !== 0 && (
                <p className={`text-xs flex items-center gap-1 ${getTrendColor(grossProfitGrowth)}`}>
                  {getTrendElement(grossProfitGrowth)}
                  <span className="font-medium">{Math.abs(grossProfitGrowth).toFixed(1)}%</span>
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Net Profit */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Laba Bersih
          </CardTitle>
           <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
             {summary.net_profit >= 0 ? (
               <TrendingUp className="h-5 w-5 text-muted-foreground" />
             ) : (
               <TrendingDown className="h-5 w-5 text-muted-foreground" />
             )}
          </div>
        </CardHeader>
        <CardContent>
          <div>
             <p className="text-2xl font-bold text-foreground">
               {formatCurrency(summary.net_profit)}
            </p>
            <div className="flex items-center gap-1 mt-1">
              <p className="text-xs text-muted-foreground">
                Margin: {summary.net_profit_margin.toFixed(1)}%
              </p>
              {netProfitGrowth !== 0 && (
                <p className={`text-xs flex items-center gap-1 ${getTrendColor(netProfitGrowth)}`}>
                  {getTrendElement(netProfitGrowth)}
                  <span className="font-medium">{Math.abs(netProfitGrowth).toFixed(1)}%</span>
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* COGS */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Harga Pokok Penjualan
          </CardTitle>
           <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
             <Package className="h-5 w-5 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <div>
            <p className="text-2xl font-bold text-foreground">{formatCurrency(summary.total_cogs)}</p>
            <div className="flex items-center gap-1 mt-1">
              <p className="text-xs text-muted-foreground">
                Metode: WAC
              </p>
              {cogsGrowth !== 0 && (
                <p className={`text-xs flex items-center gap-1 ${getTrendColor(cogsGrowth)}`}>
                  {getTrendElement(cogsGrowth)}
                  <span className="font-medium">{Math.abs(cogsGrowth).toFixed(1)}%</span>
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
