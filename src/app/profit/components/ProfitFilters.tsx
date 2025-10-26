/**
 * Profit Filters Component
 * Filter controls for profit report (period selection, date range)
 */

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Calendar } from 'lucide-react'
import type { ProfitFilters, PeriodType } from './types'

interface ProfitFiltersProps {
  filters: ProfitFilters
  onFiltersChange: (filters: Partial<ProfitFilters>) => void
  onApplyFilters: () => void
  isMobile: boolean
}

export function ProfitFilters({ filters, onFiltersChange, onApplyFilters, isMobile }: ProfitFiltersProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Filter Periode
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-4'}`}>
          <div>
            <label className="text-sm font-medium mb-2 block">Periode</label>
            <Select
              value={filters.selectedPeriod}
              onValueChange={(value: PeriodType) => onFiltersChange({ selectedPeriod: value })}
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
            <>
              <div>
                <label className="text-sm font-medium mb-2 block">Tanggal Mulai</label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => onFiltersChange({ startDate: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Tanggal Akhir</label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => onFiltersChange({ endDate: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
            </>
          )}

          <div className="flex items-end">
            <Button onClick={onApplyFilters} className="w-full">
              Terapkan Filter
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
