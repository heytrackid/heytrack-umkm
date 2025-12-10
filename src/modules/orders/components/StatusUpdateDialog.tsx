'use client'

import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { ORDER_STATUS_CONFIG, ORDER_STATUS_LABELS } from '@/modules/orders/constants'
import type { OrderStatus } from '@/types/database'
import { useState } from 'react'

interface StatusUpdateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentStatus: OrderStatus
  orderNo: string
  onConfirm: (newStatus: OrderStatus) => Promise<void>
}

export function StatusUpdateDialog({
  open,
  onOpenChange,
  currentStatus,
  orderNo,
  onConfirm,
}: StatusUpdateDialogProps) {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  const config = ORDER_STATUS_CONFIG[currentStatus]
  const nextStatuses = config?.nextStatuses || []

  const handleConfirm = async () => {
    if (!selectedStatus) return

    setIsUpdating(true)
    try {
      await onConfirm(selectedStatus)
      onOpenChange(false)
      setSelectedStatus(null)
    } catch {
      // Error is handled by the parent component
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ubah Status Pesanan</DialogTitle>
          <DialogDescription>
            Ubah status pesanan <span className="font-semibold">{orderNo}</span> dari{' '}
            <span className="font-semibold">{ORDER_STATUS_LABELS[currentStatus]}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {nextStatuses.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Tidak ada status berikutnya yang tersedia untuk pesanan ini.
            </p>
          ) : (
            <RadioGroup value={selectedStatus || ''} onValueChange={(value) => setSelectedStatus(value as OrderStatus)}>
              <div className="space-y-3">
                {nextStatuses.map((status) => {
                  const statusConfig = ORDER_STATUS_CONFIG[status]
                  return (
                    <div key={status} className="flex items-start space-x-3 space-y-0">
                      <RadioGroupItem value={status} id={status} />
                      <Label
                        htmlFor={status}
                        className="flex-1 cursor-pointer space-y-1 leading-none"
                      >
                        <div className="font-medium">{ORDER_STATUS_LABELS[status]}</div>
                        <div className="text-xs text-muted-foreground">
                          {statusConfig?.description}
                        </div>
                      </Label>
                    </div>
                  )
                })}
              </div>
            </RadioGroup>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              onOpenChange(false)
              setSelectedStatus(null)
            }}
            disabled={isUpdating}
          >
            Batal
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={!selectedStatus || isUpdating || nextStatuses.length === 0}
          >
            {isUpdating ? 'Mengubah...' : 'Ubah Status'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
