'use client'

import { Calendar } from '@/components/icons'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '@/components/ui/select'
 
import { type ProfitPeriodType, filterProfitPeriodOptions } from '@/app/profit/constants'

interface ProfitPeriodFilterProps {
  selectedPeriod: ProfitPeriodType
  onPeriodChange: (period: ProfitPeriodType) => void
  startDate: string
  onStartDateChange: (date: string) => void
  endDate: string
  onEndDateChange: (date: string) => void
  onApplyFilters: () => void
  loading: boolean
  isMobile: boolean
}

export const ProfitPeriodFilter = ({
  selectedPeriod,
  onPeriodChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  onApplyFilters,
  loading,
  isMobile
}: ProfitPeriodFilterProps) => (
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
          <label htmlFor="profit-period-select" className="text-sm font-medium mb-2 block">Periode</label>
          <Select value={selectedPeriod} onValueChange={onPeriodChange}>
            <SelectTrigger id="profit-period-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {filterProfitPeriodOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedPeriod === 'custom' && (
          <>
            <div>
              <label htmlFor="tanggal-mulai" className="text-sm font-medium mb-2 block">Tanggal Mulai</label>
              <input
                id="tanggal-mulai"
                type="date"
                value={startDate}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => onStartDateChange(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label htmlFor="tanggal-akhir" className="text-sm font-medium mb-2 block">Tanggal Akhir</label>
              <input
                id="tanggal-akhir"
                type="date"
                value={endDate}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => onEndDateChange(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
          </>
        )}

        <div className="flex items-end">
          <Button onClick={onApplyFilters} className="w-full" disabled={loading}>
            {loading ? 'Memuat...' : 'Terapkan Filter'}
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
)
