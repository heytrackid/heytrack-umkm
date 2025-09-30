'use client'

import React, { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Edit2,
  Trash2,
  MoreHorizontal,
  DollarSign,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { format } from 'date-fns'
import { useI18n } from '@/providers/I18nProvider'

interface CostTableProps {
  costs: any[]
  onEdit: (cost: any) => void
  onDelete: (cost: any) => void
  formatCurrency: (amount: number) => string
  isMobile?: boolean
}

const categoryIcons: Record<string, string> = {
  rent: '🏢',
  utilities: '💡',
  salaries: '👥',
  equipment: '🔧',
  marketing: '📢',
  packaging: '📦',
  transportation: '🚗',
  maintenance: '🛠️',
  other: '📋'
}

/**
 * Cost Table Component
 * Extracted from operational-costs/page.tsx for code splitting
 */
export default function CostTable({
  costs,
  onEdit,
  onDelete,
  formatCurrency,
  isMobile = false
}: CostTableProps) {
  const { t } = useI18n()
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  
  // Calculate pagination
  const totalItems = costs.length
  const totalPages = Math.ceil(totalItems / pageSize)
  
  // Get paginated data
  const paginatedCosts = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return costs.slice(startIndex, endIndex)
  }, [costs, currentPage, pageSize])
  
  // Reset to page 1 when costs change
  useMemo(() => {
    setCurrentPage(1)
  }, [costs.length])
  
  if (costs.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-medium mb-2">{t('operationalCosts.empty.noCosts')}</h3>
          <p className="text-muted-foreground mb-4">
            {t('operationalCosts.empty.startTracking')}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('operationalCosts.table.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('forms.labels.date')}</TableHead>
                <TableHead>{t('forms.labels.category')}</TableHead>
                <TableHead>{t('forms.labels.description')}</TableHead>
                <TableHead>{t('forms.labels.amount')}</TableHead>
                <TableHead>{t('operationalCosts.table.payment')}</TableHead>
                <TableHead className="text-right">{t('tables.headers.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedCosts.map((cost) => (
                <TableRow key={cost.id}>
                  <TableCell>
                    {format(new Date(cost.date), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span>{categoryIcons[cost.category] || '📋'}</span>
                      <span className="capitalize">{cost.category}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs truncate">{cost.description}</div>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-red-600">
                      {formatCurrency(cost.amount)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {t(`forms.paymentMethods.${cost.payment_method}`) || cost.payment_method}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEdit(cost)}>
                            <Edit2 className="h-4 w-4 mr-2" />
                            {t('common.actions.edit')}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => onDelete(cost)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            {t('common.actions.delete')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-4 border-t bg-muted/30">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {t('operationalCosts.pagination.showing', {
                    from: ((currentPage - 1) * pageSize) + 1,
                    to: Math.min(currentPage * pageSize, totalItems),
                    total: totalItems
                  })}
                </span>
              </div>
              
              <div className="flex items-center gap-6">
                {/* Page Size Selector */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{t('operationalCosts.pagination.showLabel')}</span>
                  <Select value={pageSize.toString()} onValueChange={(value) => {
                    setPageSize(Number(value))
                    setCurrentPage(1)
                  }}>
                    <SelectTrigger className="w-20 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Page Navigation */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  <span className="text-sm font-medium">
                    {t('operationalCosts.pagination.pageLabel', { current: currentPage, total: totalPages })}
                  </span>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
