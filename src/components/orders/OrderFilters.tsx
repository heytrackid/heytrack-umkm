'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useResponsive } from '@/hooks/use-mobile'
import { Search, Filter, X, Calendar } from 'lucide-react'
import { OrderFilters as OrderFiltersType } from './types'
import { useI18n } from '@/providers/I18nProvider'

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
  const { t } = useI18n()
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
              placeholder={t('orders.searchPlaceholder')}
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
                  <SelectValue placeholder={t('orders.table.status')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('orders.allStatus')}</SelectItem>
                  <SelectItem value="PENDING">{t('orders.status.pending')}</SelectItem>
                  <SelectItem value="CONFIRMED">{t('orders.status.confirmed')}</SelectItem>
                  <SelectItem value="IN_PROGRESS">{t('orders.status.in_production')}</SelectItem>
                  <SelectItem value="READY">{t('orders.status.completed')}</SelectItem>
                  <SelectItem value="DELIVERED">{t('orders.status.completed')}</SelectItem>
                  <SelectItem value="CANCELLED">{t('orders.status.cancelled')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Payment Status Filter */}
            <div>
              <Select value={filters.paymentStatus} onValueChange={(value) => handleFilterChange('paymentStatus', value)}>
                <SelectTrigger>
                  <SelectValue placeholder={t('orders.table.payment')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('orders.allPaymentStatus')}</SelectItem>
                  <SelectItem value="UNPAID">{t('orders.paymentStatus.unpaid')}</SelectItem>
                  <SelectItem value="PARTIAL">{t('orders.paymentStatus.partial')}</SelectItem>
                  <SelectItem value="PAID">{t('orders.paymentStatus.paid')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Priority Filter */}
            <div>
              <Select value={filters.priority} onValueChange={(value) => handleFilterChange('priority', value)}>
                <SelectTrigger>
                  <SelectValue placeholder={t('orders.priority')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('orders.allPriority')}</SelectItem>
                  <SelectItem value="high">{t('orders.priority.high')}</SelectItem>
                  <SelectItem value="normal">{t('orders.priority.normal')}</SelectItem>
                  <SelectItem value="low">{t('orders.priority.low')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date From */}
            <div>
              <Input
                type="date"
                value={filters.dateFrom || ''}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                placeholder={t('orders.fromDate')}
              />
            </div>

            {/* Date To */}
            <div>
              <Input
                type="date"
                value={filters.dateTo || ''}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                placeholder={t('orders.toDate')}
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
              {t('orders.status.pending')}
            </Button>
            <Button
              variant={filters.status === 'IN_PROGRESS' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleFilterChange('status', filters.status === 'IN_PROGRESS' ? 'all' : 'IN_PROGRESS')}
            >
              {t('orders.status.in_production')}
            </Button>
            <Button
              variant={filters.status === 'READY' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleFilterChange('status', filters.status === 'READY' ? 'all' : 'READY')}
            >
              {t('orders.status.completed')}
            </Button>
            <Button
              variant={filters.paymentStatus === 'UNPAID' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleFilterChange('paymentStatus', filters.paymentStatus === 'UNPAID' ? 'all' : 'UNPAID')}
            >
              {t('orders.paymentStatus.unpaid')}
            </Button>
            <Button
              variant={filters.priority === 'high' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleFilterChange('priority', filters.priority === 'high' ? 'all' : 'high')}
            >
              {t('orders.priority.high')}
            </Button>
          </div>

          {/* Reset Filter */}
          {hasActiveFilters && (
            <div className="flex justify-between items-center pt-2 border-t">
              <span className="text-sm text-muted-foreground">
                {t('orders.filtersActive')}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={onReset}
                className="text-red-600 hover:text-red-700"
              >
                <X className="h-4 w-4 mr-2" />
                {t('orders.resetFilters')}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}