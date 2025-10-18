'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Users, 
  Mail, 
  Phone,
  Eye,
  Edit2,
  Trash2,
  ChevronRight,
  DollarSign,
  ShoppingCart
} from 'lucide-react'
import { useSwipeable } from 'react-swipeable'
import { cn } from '@/lib/utils'

interface MobileCustomersTableProps {
  customers: any[]
  selectedItems: string[]
  onSelectItem: (itemId: string) => void
  onView: (customer: any) => void
  onEdit: (customer: any) => void
  onDelete: (customer: any) => void
  formatCurrency: (amount: number) => string
  isMobile: boolean
}

export default function MobileCustomersTable({
  customers,
  selectedItems,
  onSelectItem,
  onView,
  onEdit,
  onDelete,
  formatCurrency,
  isMobile
}: MobileCustomersTableProps) {

  if (!isMobile) return null

  return (
    <div className="space-y-3">
      {customers.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium mb-2">Belum Ada Pelanggan</h3>
            <p className="text-muted-foreground">Mulai tambahkan pelanggan pertama Anda</p>
          </CardContent>
        </Card>
      ) : (
        customers.map((customer) => (
          <MobileCustomerCard
            key={customer.id}
            customer={customer}
            isSelected={selectedItems.includes(customer.id.toString())}
            onSelect={() => onSelectItem(customer.id.toString())}
            onView={() => onView(customer)}
            onEdit={() => onEdit(customer)}
            onDelete={() => onDelete(customer)}
            formatCurrency={formatCurrency}
          />
        ))
      )}
    </div>
  )
}

interface MobileCustomerCardProps {
  customer: any
  isSelected: boolean
  onSelect: () => void
  onView: () => void
  onEdit: () => void
  onDelete: () => void
  formatCurrency: (amount: number) => string
}

function MobileCustomerCard({
  customer,
  isSelected,
  onSelect,
  onView,
  onEdit,
  onDelete,
  formatCurrency
}: MobileCustomerCardProps) {
  const [swipeOffset, setSwipeOffset] = React.useState(0)
  const [showActions, setShowActions] = React.useState(false)

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      setSwipeOffset(-80)
      setShowActions(true)
    },
    onSwipedRight: () => {
      setSwipeOffset(0)
      setShowActions(false)
    },
    preventScrollOnSwipe: true,
    trackMouse: false
  })

  return (
    <div className="relative overflow-hidden rounded-lg">
      {/* Action buttons (shown on swipe) */}
      <div 
        className={cn(
          "absolute right-0 top-0 h-full w-20 bg-red-500 flex items-center justify-center transition-transform duration-200",
          showActions ? "translate-x-0" : "translate-x-full"
        )}
      >
        <Button
          variant="ghost"
          size="sm"
          className="text-white hover:bg-red-600"
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Main card */}
      <Card 
        {...handlers}
        className={cn(
          "transition-transform duration-200 cursor-pointer",
          isSelected && "ring-2 ring-primary"
        )}
        style={{ transform: `translateX(${swipeOffset}px)` }}
        onClick={() => {
          if (showActions) {
            setSwipeOffset(0)
            setShowActions(false)
          } else {
            onView()
          }
        }}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              {/* Header */}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm truncate">{customer.name}</h3>
                  <Badge 
                    variant={customer.status === 'active' ? 'default' : 'secondary'} 
                    className="text-xs mt-1"
                  >
                    {customer.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
                  </Badge>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>

              {/* Contact Info */}
              <div className="space-y-2 mb-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-3 w-3" />
                  <span className="truncate">{customer.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-3 w-3" />
                  <span>{customer.phone}</span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
                    <DollarSign className="h-3 w-3" />
                    <span className="text-xs font-medium">
                      {formatCurrency(customer.totalSpent)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">Total Belanja</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
                    <ShoppingCart className="h-3 w-3" />
                    <span className="text-xs font-medium">{customer.totalOrders}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Total Order</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 mt-4 pt-3 border-t">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 min-h-[44px]"
              onClick={(e) => {
                e.stopPropagation()
                onView()
              }}
            >
              <Eye className="h-4 w-4 mr-2" />
              Lihat
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 min-h-[44px]"
              onClick={(e) => {
                e.stopPropagation()
                onEdit()
              }}
            >
              <Edit2 className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
