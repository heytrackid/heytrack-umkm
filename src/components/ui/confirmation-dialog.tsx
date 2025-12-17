'use client'

import { AlertTriangle, CheckCircle, Trash2, type LucideIcon } from '@/components/icons'
import { useState } from 'react'

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { LoadingButton } from '@/components/ui/loading-button'

interface ConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: 'default' | 'destructive' | 'success' | 'warning'
  onConfirm: () => Promise<void> | void
  loading?: boolean
  icon?: LucideIcon
}

const variantConfig = {
  default: {
    icon: CheckCircle,
    confirmButtonClass: "bg-primary hover:bg-primary/90",
    iconColor: "text-muted-foreground"
  },
  destructive: {
    icon: Trash2,
    confirmButtonClass: "bg-red-500 hover:bg-red-600 text-white",
    iconColor: "text-red-500"
  },
  success: {
    icon: CheckCircle,
    confirmButtonClass: "bg-muted0 hover:bg-green-600 text-white",
    iconColor: "text-muted-foreground"
  },
  warning: {
    icon: AlertTriangle,
    confirmButtonClass: "bg-orange-500 hover:bg-orange-600 text-white",
    iconColor: "text-orange-500"
  }
}

export const ConfirmationDialog = ({
  open,
  onOpenChange,
  title,
  description,
  confirmText,
  cancelText,
  variant = "default",
  onConfirm,
  loading = false,
  icon
}: ConfirmationDialogProps) => {
   const _config = variantConfig[variant]
   const IconComponent = icon ?? _config.icon
  const [internalLoading, setInternalLoading] = useState(false)
  const isLoading = loading || internalLoading

  const handleConfirm = async () => {
    try {
      setInternalLoading(true)
      await onConfirm()
      onOpenChange(false)
    } catch {
      // Error handling is done by the caller
    } finally {
      setInternalLoading(false)
    }
  }

  const getBgColor = () => {
    if (variant === 'destructive') {return 'bg-red-100'}
    if (variant === 'success') {return 'bg-secondary'}
    if (variant === 'warning') {return 'bg-orange-100'}
    return 'bg-secondary'
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="w-[95vw] sm:max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className={`rounded-full p-2 ${getBgColor()}`}>
              <IconComponent className={`h-5 w-5 ${_config.iconColor}`} />
            </div>
            <AlertDialogTitle className="text-left">{title}</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-left">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex flex-row gap-2 justify-end">
          <AlertDialogCancel asChild>
            <Button variant="outline" disabled={isLoading}>
              {cancelText ?? "Batal"}
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <LoadingButton
              className={_config.confirmButtonClass}
              onClick={handleConfirm}
              loading={isLoading}
              loadingText="Memproses..."
              hapticFeedback
              hapticType="medium"
            >
              {confirmText ?? "Konfirmasi"}
            </LoadingButton>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// Specialized confirmation dialogs for common actions
export const DeleteConfirmationDialog = ({
  open,
  onOpenChange,
  itemName,
  onConfirm,
  loading = false
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  itemName: string
  onConfirm: () => Promise<void> | void
  loading?: boolean
}) => (
  <ConfirmationDialog
    open={open}
    onOpenChange={onOpenChange}
    title="Hapus Item"
    description={`Apakah Anda yakin ingin menghapus "${itemName}"? Tindakan ini tidak dapat dibatalkan.`}
    confirmText="Ya, Hapus"
    variant="destructive"
    onConfirm={onConfirm}
    loading={loading}
  />
)

export const CancelConfirmationDialog = ({
  open,
  onOpenChange,
  onConfirm,
  loading = false
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => Promise<void> | void
  loading?: boolean
}) => (
  <ConfirmationDialog
    open={open}
    onOpenChange={onOpenChange}
    title="Batalkan Perubahan"
    description="Anda memiliki perubahan yang belum disimpan. Apakah Anda yakin ingin membatalkan?"
    confirmText="Ya, Batalkan"
    variant="warning"
    onConfirm={onConfirm}
    loading={loading}
  />
)

// Hook for easy usage
export function useConfirmationDialog(): { confirm: (options: Omit<ConfirmationDialogProps, 'onOpenChange' | 'open'>) => Promise<boolean> } {
  const confirm = (options: Omit<ConfirmationDialogProps, 'onOpenChange' | 'open'>) => new Promise<boolean>((resolve) => {
    // Implementation akan menggunakan state management untuk dialog
    // Untuk sekarang, kita akan return Promise yang resolve dengan hasil
     
    // eslint-disable-next-line no-alert
    const result = window.confirm(`${options.title}\n\n${options.description}`)
    resolve(result)
  })

  return { confirm }
}