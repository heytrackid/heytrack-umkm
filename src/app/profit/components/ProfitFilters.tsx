'use client'

import { Calendar } from 'lucide-react'

import { calculateProfitDateRange } from '@/app/profit/utils'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import type { PeriodType, ProfitFilters, ProfitFiltersProps } from '@/app/profit/components/types'



export const ProfitFiltersComponent = ({ filters, onFiltersChange, onApplyFilters, isMobile }: ProfitFiltersProps) => {
  const handlePeriodChange = (value: PeriodType) => {
    const newFilters: Partial<ProfitFilters> = { selectedPeriod: value }
    if (value !== 'custom') {
      const { startDate, endDate } = calculateProfitDateRange(value)
      if (startDate) {newFilters.startDate = startDate}
      if (endDate) {newFilters.endDate = endDate}
      newFilters.dateRange = null
    } else {
      newFilters.dateRange = null
    }
    onFiltersChange(newFilters)
  }



  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Filter Periode
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
          <div>
            <label className="text-sm font-medium mb-2 block">Periode</label>
            <Select
              value={filters.selectedPeriod}
              onValueChange={handlePeriodChange}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Minggu Ini</SelectItem>
                <SelectItem value="month">Bulan Ini</SelectItem>
                <SelectItem value="quarter">Kuartal Ini</SelectItem>
                <SelectItem value="year">Tahun Ini</SelectItem>
                <SelectItem value="custom">Kustom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filters.selectedPeriod === 'custom' && (
            <div>
              <label className="text-sm font-medium mb-2 block">Rentang Tanggal</label>

            </div>
          )}

          <div className="flex items-end col-span-full">
            <Button onClick={onApplyFilters} className="w-full">
              Terapkan Filter
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
