'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { SwipeActions } from '@/components/ui/mobile-gestures'
import { Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react'

interface TransactionItemProps {
  transaction: any
  onView: (transaction: any) => void
  onEdit?: () => void
  onDelete?: () => void
  isMobile: boolean
  getPaymentMethodLabel: (method: string) => string
  transactionTypes: any[]
}

/**
 * Individual transaction item component
 */
export function TransactionItem({
  transaction,
  onView,
  onEdit,
  onDelete,
  isMobile,
  getPaymentMethodLabel,
  transactionTypes
}: TransactionItemProps) {
  const typeInfo = transactionTypes.find(t => t.value === transaction.type) || transactionTypes[0]

  if (isMobile) {
    return (
      <SwipeActions
        actions={[
          {
            id: 'view',
            label: 'Lihat',
            icon: <span>👁️</span>,
            color: 'blue',
            onClick: () => onView(transaction)
          },
          {
            id: 'edit',
            label: 'Edit',
            icon: <span>✏️</span>,
            color: 'yellow',
            onClick: onEdit
          },
          {
            id: 'delete',
            label: 'Hapus',
            icon: <span>🗑️</span>,
            color: 'red',
            onClick: onDelete
          }
        ]}
      >
        <Card className="cursor-pointer transition-shadow" onClick={() => onView(transaction)}>
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{transaction.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">{transaction.date}</p>
                </div>
                <div className="flex flex-col items-end gap-1 ml-2">
                  <Badge className={`${typeInfo.color} text-xs`}>
                    {transaction.type === 'INCOME' ? (
                      <ArrowUpRight className="h-2.5 w-2.5 mr-1" />
                    ) : (
                      <ArrowDownRight className="h-2.5 w-2.5 mr-1" />
                    )}
                    {typeInfo.label}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {transaction.category}
                  </Badge>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs text-muted-foreground">Jumlah</p>
                  <p className={`font-bold text-lg ${
                    transaction.type === 'INCOME' ? 'text-gray-600 dark:text-gray-400' : 'text-gray-600 dark:text-gray-400'
                  }`}>
                    {transaction.type === 'INCOME' ? '+' : '-'}Rp {transaction.amount.toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Via</p>
                  <p className="text-sm font-medium">{getPaymentMethodLabel(transaction.paymentMethod)}</p>
                </div>
              </div>

              <div className="pt-1 border-t border-border">
                <p className="text-xs text-muted-foreground font-mono">{transaction.reference}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </SwipeActions>
    )
  }

  return (
    <tr className="border-b hover:bg-muted/50">
      <td className="p-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>{transaction.date}</span>
        </div>
      </td>
      <td className="p-4">
        <div>
          <p className="font-medium">{transaction.description}</p>
        </div>
      </td>
      <td className="p-4">
        <Badge variant="outline">{transaction.category}</Badge>
      </td>
      <td className="p-4">
        <Badge className={typeInfo.color}>
          {transaction.type === 'INCOME' ? (
            <ArrowUpRight className="h-3 w-3 mr-1" />
          ) : (
            <ArrowDownRight className="h-3 w-3 mr-1" />
          )}
          {typeInfo.label}
        </Badge>
      </td>
      <td className="p-4">
        <span className={`font-medium ${transaction.type === 'INCOME' ? 'text-gray-600 dark:text-gray-400' : 'text-gray-600 dark:text-gray-400'}`}>
          {transaction.type === 'INCOME' ? '+' : '-'}Rp {transaction.amount.toLocaleString()}
        </span>
      </td>
      <td className="p-4">
        <span className="text-sm">{getPaymentMethodLabel(transaction.paymentMethod)}</span>
      </td>
      <td className="p-4">
        <span className="font-mono text-sm">{transaction.reference}</span>
      </td>
      <td className="p-4">
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onView(transaction)}
          >
            👁️
          </Button>
          <Button variant="ghost" size="sm" onClick={onEdit}>
            ✏️
          </Button>
          <Button variant="ghost" size="sm" className="text-gray-600 dark:text-gray-400" onClick={onDelete}>
            🗑️
          </Button>
        </div>
      </td>
    </tr>
  )
}
