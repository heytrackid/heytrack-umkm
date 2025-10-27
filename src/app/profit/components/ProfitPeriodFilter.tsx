import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { type ProfitPeriodType, filterProfitPeriodOptions } from '../constants'

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
          <label className="text-sm font-medium mb-2 block">Periode</label>
          <Select value={selectedPeriod} onValueChange={onPeriodChange}>
            <SelectTrigger>
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
              <label className="text-sm font-medium mb-2 block">Tanggal Mulai</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => onStartDateChange(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Tanggal Akhir</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => onEndDateChange(e.target.value)}
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
