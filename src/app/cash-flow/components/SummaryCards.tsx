'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react'

interface SummaryCardsProps {
  totalIncome: number
  totalExpenses: number
  netFlow: number
  formatCurrency: (amount: number) => string
  getPeriodText: () => string
  isMobile?: boolean
}

export default function SummaryCards({
  totalIncome,
  totalExpenses,
  netFlow,
  formatCurrency,
  getPeriodText,
  isMobile = false
}: SummaryCardsProps) {
  return (
    <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'md:grid-cols-3'}`}>
      <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
        <CardContent className="p-6 text-center">
          <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
          <div className={`font-bold text-green-800 dark:text-green-200 ${isMobile ? 'text-xl' : 'text-2xl'}`}>
            {formatCurrency(totalIncome)}
          </div>
          <p className="text-sm text-green-600 font-medium">Total Pemasukan</p>
          <p className="text-xs text-green-600 mt-1">{getPeriodTex""}</p>
        </CardContent>
      </Card>

      <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
        <CardContent className="p-6 text-center">
          <TrendingDown className="h-8 w-8 text-red-600 mx-auto mb-2" />
          <div className={`font-bold text-red-800 dark:text-red-200 ${isMobile ? 'text-xl' : 'text-2xl'}`}>
            {formatCurrency(totalExpenses)}
          </div>
          <p className="text-sm text-red-600 font-medium">Total Pengeluaran</p>
          <p className="text-xs text-red-600 mt-1">{getPeriodTex""}</p>
        </CardContent>
      </Card>

      <Card className={`${netFlow >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-orange-50 border-orange-200'} dark:${netFlow >= 0 ? 'bg-blue-900/20 border-blue-800' : 'bg-orange-900/20 border-orange-800'}`}>
        <CardContent className="p-6 text-center">
          <DollarSign className={`h-8 w-8 ${netFlow >= 0 ? 'text-blue-600' : 'text-orange-600'} mx-auto mb-2`} />
          <div className={`font-bold ${netFlow >= 0 ? 'text-blue-800 dark:text-blue-200' : 'text-orange-800 dark:text-orange-200'} ${isMobile ? 'text-xl' : 'text-2xl'}`}>
            {formatCurrency(netFlow)}
          </div>
          <p className={`text-sm ${netFlow >= 0 ? 'text-blue-600' : 'text-orange-600'} font-medium`}>
            Arus Kas Bersih
          </p>
          <Badge variant={netFlow >= 0 ? 'default' : 'destructive'} className="mt-1">
            {netFlow >= 0 ? 'Surplus' : 'Defisit'}
          </Badge>
        </CardContent>
      </Card>
    </div>
  )
}
