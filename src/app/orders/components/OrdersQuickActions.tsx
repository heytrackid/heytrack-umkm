'use client'

import { MessageCircle, Package } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { Card, CardContent } from '@/components/ui/card'
import { LoadingButton } from '@/components/ui/loading-button'
import { useToast } from '@/hooks/index'



interface OrdersQuickActionsProps {
  _t?: unknown
}

const OrdersQuickActions = ({ _t: _ }: OrdersQuickActionsProps) => {
  const router = useRouter()
  const { toast } = useToast()
  const [isExporting, setIsExporting] = useState(false)

  const handleNavigateToTemplates = (): void => {
    router.push('/orders/whatsapp-templates')
  }

  const handleExportOrders = async (): Promise<void> => {
    try {
      setIsExporting(true)
      const response = await fetch('/api/export/global', { method: 'GET' })
      if (!response.ok) {
        const { error } = await response.json().catch(() => ({ error: 'Failed to export orders' }))
        throw new Error(error ?? 'Failed to export orders')
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const disposition = response.headers.get('Content-Disposition') ?? ''
      const matchedFilename = disposition.match(/filename="?([^";]+)"?/)
      const filename = matchedFilename?.[1] ?? `HeyTrack_Orders_${new Date().toISOString().split('T')[0]}.xlsx`

      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = filename
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      URL.revokeObjectURL(url)

      toast({
        title: 'Export berhasil',
        description: 'File orders berhasil diunduh.',
      })
    } catch (error) {
      toast({
        title: 'Gagal mengekspor orders',
        description: error instanceof Error ? error.message : 'Terjadi kesalahan saat mengekspor orders.',
        variant: 'destructive',
      })
    } finally {
      setIsExporting(false)
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
            loading={isExporting}
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