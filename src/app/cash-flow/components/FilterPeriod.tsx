import { useRef } from 'react'
import { Calendar } from 'lucide-react'

import { type PeriodType } from '@/app/cash-flow/constants'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

interface FilterPeriodProps {
  selectedPeriod: PeriodType
  onPeriodChange: (period: PeriodType) => void
  startDate?: string
  onStartDateChange: (date: string) => void
  endDate?: string
  onEndDateChange: (date: string) => void
  onApplyFilters: () => void
  loading: boolean
  isMobile: boolean
}

const presetPeriods = [
  { value: 'week' as PeriodType, label: '7 Hari', shortLabel: '7D' },
  { value: 'month' as PeriodType, label: '30 Hari', shortLabel: '30D' },
  { value: 'year' as PeriodType, label: 'Tahun Ini', shortLabel: 'Tahun' },
  { value: 'custom' as PeriodType, label: 'Kustom', shortLabel: 'Kustom' }
]

const FilterPeriod = ({
  selectedPeriod,
  onPeriodChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  onApplyFilters,
  loading,
  isMobile
}: FilterPeriodProps): JSX.Element => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const handlePresetClick = (period: PeriodType): void => {
    onPeriodChange(period)
    if (period !== 'custom') {
      // Auto-apply for preset periods
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      timeoutRef.current = setTimeout(() => onApplyFilters(), 100)
    }
  }

  const getActivePeriodText = (): string => {
    if (selectedPeriod === 'custom' && startDate && endDate) {
      const start = new Date(startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
      const end = new Date(endDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
      return `${start} – ${end}`
    }
    return presetPeriods.find(p => p.value === selectedPeriod)?.label ?? ''
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Filter Periode
            </CardTitle>
            <CardDescription className="mt-1">
              Periode aktif: <Badge variant="secondary" className="ml-1">{getActivePeriodText()}</Badge>
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Preset Buttons */}
          <div className={`grid gap-2 ${isMobile ? 'grid-cols-4' : 'grid-cols-4'}`}>
            {presetPeriods.map(preset => (
              <Button
                key={preset.value}
                variant={selectedPeriod === preset.value ? 'default' : 'outline'}
                size={isMobile ? 'sm' : 'default'}
                onClick={() => handlePresetClick(preset.value)}
                disabled={loading}
                className="w-full"
              >
                {isMobile ? preset.shortLabel : preset.label}
              </Button>
            ))}
          </div>

          {/* Custom Date Range */}
          {selectedPeriod === 'custom' && (
            <div className="space-y-3 pt-2 border-t">
              <div className={`grid gap-3 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
                <div>
                  <label className="text-sm font-medium mb-2 block">Tanggal Mulai</label>
                  <input
                    type="date"
                    value={startDate || ''}
                    onChange={(e) => onStartDateChange(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Tanggal Akhir</label>
                  <input
                    type="date"
                    value={endDate || ''}
                    onChange={(e) => onEndDateChange(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <Button onClick={onApplyFilters} className="w-full" disabled={loading}>
                {loading ? 'Memuat...' : 'Terapkan Filter'}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default FilterPeriod
