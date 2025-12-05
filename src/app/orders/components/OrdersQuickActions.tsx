'use client'

import { MessageCircle, Package } from '@/components/icons'
import { useRouter } from 'next/navigation'


import { Card, CardContent } from '@/components/ui/card'
import { LoadingButton } from '@/components/ui/loading-button'
import { handleError } from '@/lib/error-handling'
import { successToast, } from '@/hooks/use-toast'
import { useExportOrders } from '@/hooks/api/useOrders'



interface OrdersQuickActionsProps {
  _t?: unknown
}

const OrdersQuickActions = ({ _t: _ }: OrdersQuickActionsProps) => {
  const router = useRouter()
  const exportOrdersMutation = useExportOrders()

  const handleNavigateToTemplates = (): void => {
    router.push('/orders/whatsapp-templates')
  }

  const handleExportOrders = async (): Promise<void> => {
    try {
      const blob = await exportOrdersMutation.mutateAsync()

      const url = URL.createObjectURL(blob)
      const filename = `HeyTrack_Orders_${new Date().toISOString().split('T')[0]}.xlsx`

      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = filename
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      URL.revokeObjectURL(url)

      successToast('Berhasil', 'File orders berhasil diunduh.')
    } catch (error) {
      handleError(error as Error, 'Orders Quick Actions: export', true, 'Terjadi kesalahan saat mengekspor pesanan')
    }
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
            loading={exportOrdersMutation.isPending}
            loadingText="Mengunduh..."
          >
            <Package className="h-4 w-4" />
            Export Orders
          </LoadingButton>
        </div>
      </CardContent>
    </Card>
  )
}

export { OrdersQuickActions }