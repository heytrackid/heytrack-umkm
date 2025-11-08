'use client'

import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfQuarter,
  endOfQuarter,
  startOfYear,
  endOfYear
} from 'date-fns'
import { Calendar } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '@/components/ui/select'

import type { ProfitFilters, PeriodType } from './types'
import type { DateRange } from 'react-day-picker'

interface ProfitFiltersProps {
  filters: ProfitFilters
  onFiltersChange: (filters: Partial<ProfitFilters>) => void
  onApplyFilters: () => void
  isMobile: boolean
}

const getDateRangeForPeriod = (period: PeriodType): DateRange | undefined => {
  const now = new Date()
  switch (period) {
    case 'week':
      return { from: startOfWeek(now, { weekStartsOn: 1 }), to: endOfWeek(now, { weekStartsOn: 1 }) }
    case 'month':
      return { from: startOfMonth(now), to: endOfMonth(now) }
    case 'quarter':
      return { from: startOfQuarter(now), to: endOfQuarter(now) }
    case 'year':
      return { from: startOfYear(now), to: endOfYear(now) }
    default:
      return undefined
  }
}

export const ProfitFiltersComponent = ({ filters, onFiltersChange, onApplyFilters, isMobile }: ProfitFiltersProps) => {
  const handlePeriodChange = (value: PeriodType) => {
    const newFilters: Partial<ProfitFilters> = { selectedPeriod: value }
    if (value !== 'custom') {
      newFilters.dateRange = getDateRangeForPeriod(value)
    } else {
      newFilters.dateRange = undefined
    }
    onFiltersChange(newFilters)
  }

  const _handleDateRangeChange = (dateRange: DateRange | undefined) => {
    onFiltersChange({ dateRange })
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
