import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import type { ProfitData } from './types'
import { DollarSign, Package, TrendingUp, TrendingDown } from 'lucide-react'


interface ProfitBreakdownProps {
  summary: ProfitData['summary']
  formatCurrency: (amount: number) => string
}

export const ProfitBreakdown = ({ summary, formatCurrency }: ProfitBreakdownProps) => (
  <Card className="border-0 shadow-sm">
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
        <div className="flex justify-between items-center p-4 bg-green-50 dark:bg-green-950 rounded-lg border">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            <span className="font-medium">Total Pendapatan</span>
          </div>
          <span className="font-semibold text-green-700 dark:text-green-300">
            {formatCurrency(summary.total_revenue)}
          </span>
        </div>
        
        <div className="flex justify-between items-center p-4 bg-orange-50 dark:bg-orange-950 rounded-lg border">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-orange-600" />
            <span className="font-medium">Harga Pokok Penjualan (WAC)</span>
          </div>
          <span className="font-semibold text-orange-700 dark:text-orange-300">
            - {formatCurrency(summary.total_cogs)}
          </span>
        </div>
        
        <div className="flex justify-between items-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border-2 border-blue-200">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <span className="font-semibold">Laba Kotor</span>
          </div>
          <span className="font-semibold text-blue-700 dark:text-blue-300">
            {formatCurrency(summary.gross_profit)} ({summary.gross_profit_margin.toFixed(1)}%)
          </span>
        </div>
        
        <div className="flex justify-between items-center p-4 bg-red-50 dark:bg-red-950 rounded-lg border">
          <div className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-red-600" />
            <span className="font-medium">Biaya Operasional</span>
          </div>
          <span className="font-semibold text-red-700 dark:text-red-300">
            - {formatCurrency(summary.total_operating_expenses)}
          </span>
        </div>
        
        <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-950 rounded-lg border-2 border-gray-300">
          <div className="flex items-center gap-2">
            <TrendingUp className={`h-5 w-5 ${summary.net_profit >= 0 ? 'text-green-600' : 'text-red-600'}`} />
            <span className="text-lg font-bold">Laba Bersih</span>
          </div>
          <span className={`text-xl font-bold ${
            summary.net_profit >= 0 ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
          }`}>
            {formatCurrency(summary.net_profit)} ({summary.net_profit_margin.toFixed(1)}%)
          </span>
        </div>
      </div>
    </CardContent>
  </Card>
)
