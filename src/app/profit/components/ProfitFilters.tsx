'use client'

import type { DateRange } from 'react-day-picker'

import { Button } from '@/components/ui/button'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import type { PeriodType, ProfitFiltersProps } from '@/app/profit/components/types'

export const ProfitFiltersComponent = ({ filters, onFiltersChange, onApplyFilters, isMobile }: ProfitFiltersProps) => {
  const handlePeriodChange = (value: PeriodType) => {
    onFiltersChange({ selectedPeriod: value })
  }

  const handleDateRangeChange = (range: DateRange | undefined) => {
    onFiltersChange({ 
      dateRange: range,
      selectedPeriod: range ? 'custom' : filters.selectedPeriod
    })
  }

  return (
    <div className="space-y-4 mb-6">
      <div className={`grid gap-3 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-[200px_1fr_auto]'}`}>
        {/* Period Select */}
        <Select
          value={filters.selectedPeriod}
          onValueChange={handlePeriodChange}
        >
          <SelectTrigger className="bg-background">
            <SelectValue placeholder="Pilih Periode" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Minggu Ini</SelectItem>
            <SelectItem value="month">Bulan Ini</SelectItem>
            <SelectItem value="quarter">Kuartal Ini</SelectItem>
            <SelectItem value="year">Tahun Ini</SelectItem>
            <SelectItem value="custom">Kustom</SelectItem>
          </SelectContent>
        </Select>

        {/* Date Range Picker */}
        <DateRangePicker
          value={filters.dateRange}
          onChange={handleDateRangeChange}
          placeholder="Pilih rentang tanggal"
          className="w-full bg-background"
        />

        {/* Apply Button */}
        <Button onClick={onApplyFilters} className={isMobile ? 'w-full' : 'w-auto'}>
          Terapkan Filter
        </Button>
      </div>
    </div>
  )
}
