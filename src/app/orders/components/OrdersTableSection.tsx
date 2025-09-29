"use client"

import React, { memo, useMemo } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useI18n } from '@/providers/I18nProvider'

function OrdersTableSection({
  orders,
  formatCurrency,
  formatDate,
}: {
  orders: any[]
  formatCurrency: (n: number) => string
  formatDate: (d: string) => string
}) {
  const { t } = useI18n()
  
  const ORDER_STATUS_CONFIG = useMemo(() => ({
    pending: { label: t('orders.status.pending'), color: 'bg-gray-100 text-gray-800' },
    confirmed: { label: t('orders.status.confirmed'), color: 'bg-gray-200 text-gray-900' },
    in_production: { label: t('orders.status.in_production'), color: 'bg-gray-300 text-gray-900' },
    completed: { label: t('orders.status.completed'), color: 'bg-gray-400 text-white' },
    cancelled: { label: t('orders.status.cancelled'), color: 'bg-gray-500 text-white' }
  }), [t])

  const PAYMENT_STATUS_CONFIG = useMemo(() => ({
    unpaid: { label: t('orders.paymentStatus.unpaid'), color: 'bg-gray-100 text-gray-800' },
    partial: { label: t('orders.paymentStatus.partial'), color: 'bg-gray-200 text-gray-900' },
    paid: { label: t('orders.paymentStatus.paid'), color: 'bg-gray-300 text-gray-900' }
  }), [t])

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('orders.table.orderCode')}</TableHead>
            <TableHead>{t('orders.table.customerName')}</TableHead>
            <TableHead>{t('orders.table.date')}</TableHead>
            <TableHead>{t('orders.table.dueDate')}</TableHead>
            <TableHead>{t('orders.table.status')}</TableHead>
            <TableHead>{t('orders.table.payment')}</TableHead>
            <TableHead className="text-right">{t('orders.table.total')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
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
    </div>
  )
}

export default memo(OrdersTableSection)
