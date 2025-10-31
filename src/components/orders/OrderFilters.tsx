'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useResponsive } from '@/hooks/useResponsive'
import { Search, X } from 'lucide-react'
import type { OrderFilters as OrderFiltersType } from './types'

interface OrderFiltersProps {
  filters: OrderFiltersType
  onFiltersChange: (filters: OrderFiltersType) => void
  onReset: () => void
}

export default function OrderFilters({
  filters,
  onFiltersChange,
  onReset
}: OrderFiltersProps) {
  const { isMobile } = useResponsive()

  const handleFilterChange = (key: keyof OrderFiltersType, value: string) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const hasActiveFilters =
    filters.status !== 'all' ||
    filters.paymentStatus !== 'all' ||
    filters.priority !== 'all' ||
    filters.dateFrom ||
    filters.dateTo ||
    filters.searchTerm

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder=""
              value={filters.searchTerm}
              onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter Row */}
          <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-5'}`}>
            {/* Status Filter */}
            <div>
              <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="CONFIRMED">Dikonfirmasi</SelectItem>
                  <SelectItem value="IN_PROGRESS">Sedang Diproses</SelectItem>
                  <SelectItem value="READY">Siap Diantar</SelectItem>
                  <SelectItem value="DELIVERED">Dikirim</SelectItem>
                  <SelectItem value="CANCELLED">Dibatalkan</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Payment Status Filter */}
            <div>
              <Select value={filters.paymentStatus} onValueChange={(value) => handleFilterChange('paymentStatus', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Pembayaran</SelectItem>
                  <SelectItem value="UNPAID">Belum Dibayar</SelectItem>
                  <SelectItem value="PARTIAL">Dibayar Sebagian</SelectItem>
                  <SelectItem value="PAID">Lunas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Priority Filter */}
            <div>
              <Select value={filters.priority} onValueChange={(value) => handleFilterChange('priority', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Prioritas</SelectItem>
                  <SelectItem value="high">Tinggi</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="low">Rendah</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date From */}
            <div>
              <Input
                type="date"
                value={filters.dateFrom || ''}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                placeholder=""
              />
            </div>

            {/* Date To */}
            <div>
              <Input
                type="date"
                value={filters.dateTo || ''}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                placeholder=""
              />
            </div>
          </div>

          {/* Quick Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={filters.status === 'PENDING' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleFilterChange('status', filters.status === 'PENDING' ? 'all' : 'PENDING')}
            >
              Pending
            </Button>
            <Button
              variant={filters.status === 'IN_PROGRESS' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleFilterChange('status', filters.status === 'IN_PROGRESS' ? 'all' : 'IN_PROGRESS')}
            >
              Diproses
            </Button>
            <Button
              variant={filters.status === 'READY' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleFilterChange('status', filters.status === 'READY' ? 'all' : 'READY')}
            >
              Siap Kirim
            </Button>
            <Button
              variant={filters.paymentStatus === 'UNPAID' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleFilterChange('paymentStatus', filters.paymentStatus === 'UNPAID' ? 'all' : 'UNPAID')}
            >
              Belum Bayar
            </Button>
            <Button
              variant={filters.priority === 'high' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleFilterChange('priority', filters.priority === 'high' ? 'all' : 'high')}
            >
              Prioritas
            </Button>
          </div>

          {/* Reset Filter */}
          {hasActiveFilters && (
            <div className="flex justify-between items-center pt-2 border-t">
              <span className="text-sm text-muted-foreground">
                Filter aktif diterapkan
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={onReset}
                className="text-red-600 hover:text-red-700"
              >
                <X className="h-4 w-4 mr-2" />
                Reset Filter
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}