'use client'

import { Edit2, Eye, Mail, MoreHorizontal, Phone, Trash2 } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

import type { Row } from '@/types/database'
type CustomerRow = Row<'customers'>

interface MobileCustomerCardProps {
  customer: CustomerRow
  onView: (customer: CustomerRow) => void
  onEdit: (customer: CustomerRow) => void
  onDelete: (customer: CustomerRow) => void
  formatCurrency: (amount: number) => string
}

const MobileCustomerCard = ({
  customer,
  onView,
  onEdit,
  onDelete,
  formatCurrency
}: MobileCustomerCardProps): JSX.Element => (
  <Card className="hover:shadow-md transition-shadow">
    <CardContent className="p-4">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold">{customer.name}</h3>
              <Badge variant={customer.is_active ? "default" : "secondary"} className="text-xs">
                {customer.is_active ? 'Aktif' : 'Tidak Aktif'}
              </Badge>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(customer)}>
                <Eye className="h-4 w-4 mr-2" />
                Lihat
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(customer)}>
                <Edit2 className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600"
                onClick={() => onDelete(customer)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Hapus
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Contact */}
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-sm">
            <Mail className="h-3 w-3 text-gray-400 flex-shrink-0" />
            <span className="truncate">{customer.email}</span>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <Phone className="h-3 w-3 text-gray-400 flex-shrink-0" />
            <span>{customer.phone}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Total Belanja</p>
            <p className="font-medium text-gray-600">
              {formatCurrency(customer.total_spent ?? 0)}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Order</p>
            <p className="font-medium">
              {customer.total_orders ?? 0}
            </p>
          </div>
        </div>

        {/* Last Order */}
        {customer.last_order_date && (
          <div>
            <p className="text-sm text-muted-foreground">Order Terakhir</p>
            <p className="text-sm text-gray-600">
              {customer.last_order_date}
            </p>
          </div>
        )}
      </div>
    </CardContent>
  </Card>
)

export default MobileCustomerCard