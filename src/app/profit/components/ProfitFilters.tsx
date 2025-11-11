'use client'

import { Calendar } from 'lucide-react'
import { format } from 'date-fns'
import type { DateRange } from 'react-day-picker'

import { calculateProfitDateRange } from '@/app/profit/utils'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DateRangePicker } from '@/components/ui/date-range-picker'
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

  const handleDateRangeChange = (dateRange: DateRange | undefined) => {
    if (!dateRange?.from || !dateRange?.to) {
      onFiltersChange({ dateRange: null })
      return
    }

    const newFilters: Partial<ProfitFilters> = {
      dateRange,
      startDate: format(dateRange.from, 'yyyy-MM-dd'),
      endDate: format(dateRange.to, 'yyyy-MM-dd')
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
            <label htmlFor="periode-select" className="text-sm font-medium mb-2 block">Periode</label>
            <Select
              value={filters.selectedPeriod}
              onValueChange={handlePeriodChange}
            >
              <SelectTrigger id="periode-select">
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
              <label htmlFor="date-range" className="text-sm font-medium mb-2 block">Rentang Tanggal</label>
              <DateRangePicker
                date={filters.dateRange ?? undefined}
                onDateChange={handleDateRangeChange}
                showPresets={true}
                maxDate={new Date()}
                placeholder="Pilih rentang tanggal"
              />
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
