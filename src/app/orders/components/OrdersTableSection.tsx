"use client"

import React, { memo, useMemo, useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

function OrdersTableSection({
  orders,
  formatCurrency,
  formatDate,
}: {
  orders: any[]
  formatCurrency: (n: number) => string
  formatDate: (d: string) => string
}) {
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  
  const ORDER_STATUS_CONFIG = useMemo(() => ({
    pending: { label: "Placeholder", color: 'bg-gray-100 text-gray-800' },
    confirmed: { label: "Placeholder", color: 'bg-gray-200 text-gray-900' },
    in_production: { label: "Placeholder", color: 'bg-gray-300 text-gray-900' },
    completed: { label: "Placeholder", color: 'bg-gray-400 text-white' },
    cancelled: { label: "Placeholder", color: 'bg-gray-500 text-white' }
  }), [t])

  const PAYMENT_STATUS_CONFIG = useMemo(() => ({
    unpaid: { label: "Placeholder", color: 'bg-gray-100 text-gray-800' },
    partial: { label: "Placeholder", color: 'bg-gray-200 text-gray-900' },
    paid: { label: "Placeholder", color: 'bg-gray-300 text-gray-900' }
  }), [t])
  
  // Calculate pagination
  const totalItems = orders.length
  const totalPages = Math.ceil(totalItems / pageSize)
  
  // Get paginated data
  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return orders.slice(startIndex, endIndex)
  }, [orders, currentPage, pageSize])
  
  // Reset to page 1 when orders change
  useMemo(() => {
    setCurrentPage(1)
  }, [orders.length])
  
  // Pagination handlers
  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1))
  }
  
  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages, prev + 1))
  }
  
  const handlePageSizeChange = (value: string) => {
    setPageSize(Number(value))
    setCurrentPage(1)
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{"Placeholder"}</TableHead>
            <TableHead>{"Placeholder"}</TableHead>
            <TableHead>{"Placeholder"}</TableHead>
            <TableHead>{"Placeholder"}</TableHead>
            <TableHead>{"Placeholder"}</TableHead>
            <TableHead>{"Placeholder"}</TableHead>
            <TableHead className="text-right">{"Placeholder"}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedOrders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-medium">{order.order_number}</TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium">{order.customer_name}</span>
                  <span className="text-xs text-muted-foreground">{order.customer_phone}</span>
                </div>
              </TableCell>
              <TableCell>{formatDate(order.order_date)}</TableCell>
              <TableCell>{formatDate(order.due_date)}</TableCell>
              <TableCell>
                <span className={`text-xs px-2 py-1 rounded ${ORDER_STATUS_CONFIG[order.status]?.color}`}>
                  {ORDER_STATUS_CONFIG[order.status]?.label || order.status}
                </span>
              </TableCell>
              <TableCell>
                <span className={`text-xs px-2 py-1 rounded ${PAYMENT_STATUS_CONFIG[order.payment_status]?.color}`}>
                  {PAYMENT_STATUS_CONFIG[order.payment_status]?.label || order.payment_status}
                </span>
              </TableCell>
              <TableCell className="text-right font-medium">
                {formatCurrency(order.total_amount)}
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
              {t('orders.pagination.showing', {
                from: ((currentPage - 1) * pageSize) + 1,
                to: Math.min(currentPage * pageSize, totalItems),
                total: totalItems
              })}
            </span>
          </div>
          
          <div className="flex items-center gap-6">
            {/* Page Size Selector */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{"Placeholder"}</span>
              <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
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
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <span className="text-sm font-medium">
                {"Placeholder"}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default memo(OrdersTableSection)
