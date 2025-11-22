'use client'



import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import type { PeriodType, ProfitFiltersProps } from '@/app/profit/components/types'



export const ProfitFiltersComponent = ({ filters, onFiltersChange, onApplyFilters, isMobile }: ProfitFiltersProps) => {
  const handlePeriodChange = (value: PeriodType) => {
    onFiltersChange({ selectedPeriod: value })
  }



  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
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
              </SelectContent>
            </Select>
          </div>



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
