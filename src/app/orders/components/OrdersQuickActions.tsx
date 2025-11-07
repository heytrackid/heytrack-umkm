'use client'

import { MessageCircle, Package } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { Card, CardContent } from '@/components/ui/card'
import { LoadingButton } from '@/components/ui/loading-button'



interface OrdersQuickActionsProps {
  _t?: unknown
}

const OrdersQuickActions = ({ _t: _ }: OrdersQuickActionsProps) => {
  const router = useRouter()

  const handleNavigateToTemplates = (): void => {
    router.push('/orders/whatsapp-templates')
  }

  const handleExportOrders = async (): Promise<void> => {
    // TODO: Implement actual export functionality
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-wrap gap-2">
          <LoadingButton
            variant="outline"
            size="sm"
            onClick={handleNavigateToTemplates}
            className="flex items-center gap-2"
            hapticFeedback
            hapticType="light"
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp Templates
          </LoadingButton>
          <LoadingButton
            variant="outline"
            size="sm"
            onClick={handleExportOrders}
            className="flex items-center gap-2"
            hapticFeedback
            hapticType="light"
          >
            <Package className="h-4 w-4" />
            Export Orders
          </LoadingButton>
        </div>
      </CardContent>
    </Card>
  )
}

export default OrdersQuickActions
