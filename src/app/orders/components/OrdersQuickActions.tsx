'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MessageCircle, Package } from 'lucide-react'

import { apiLogger } from '@/lib/logger'
interface OrdersQuickActionsProps {
  _t?: unknown
}

const OrdersQuickActions = ({ _t: _ }: OrdersQuickActionsProps) => {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.href = '/orders/whatsapp-templates'}
            className="flex items-center gap-2"
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp Templates
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => apiLogger.info('Export orders')}
            className="flex items-center gap-2"
          >
            <Package className="h-4 w-4" />
            Informasi
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default OrdersQuickActions
