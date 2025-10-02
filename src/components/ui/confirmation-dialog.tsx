'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from"@/components/ui/alert-dialog"
import { Button } from"@/components/ui/button"
import { AlertTriangle, Trash2, CheckCircle, XCircle } from"lucide-react"
import { ReactNode } from"react"

interface ConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: 'default' | 'destructive' | 'success' | 'warning'
  onConfirm: () => void | Promise<void>
  loading?: boolean
  icon?: ReactNode
}

const variantConfig = {
  default: {
    icon: CheckCircle,
    confirmButtonClass:"bg-primary hover:bg-primary/90",
    iconColor:"text-blue-500"
  },
  destructive: {
    icon: Trash2,
    confirmButtonClass:"bg-red-500 hover:bg-red-600 text-white",
    iconColor:"text-red-500"
  },
  success: {
    icon: CheckCircle,
    confirmButtonClass:"bg-green-500 hover:bg-green-600 text-white",
    iconColor:"text-green-500"
  },
  warning: {
    icon: AlertTriangle,
    confirmButtonClass:"bg-orange-500 hover:bg-orange-600 text-white",
    iconColor:"text-orange-500"
  }
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText,
  cancelText, 
  variant ="default",
  onConfirm,
  loading = false,
  icon
}: ConfirmationDialogProps) {
  const config = variantConfig[variant]
  const IconComponent = icon || config.icon

  const handleConfirm = async () => {
    await onConfirm()
    onOpenChange(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className={`rounded-full p-2 ${
              variant === 'destructive' ? 'bg-red-100' :
              variant === 'success' ? 'bg-green-100' :
              variant === 'warning' ? 'bg-orange-100' :
              'bg-blue-100'
            }`}>
              <IconComponent className={`h-5 w-5 ${config.iconColor}`} />
            </div>
            <AlertDialogTitle className="text-left">{title}</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-left">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex flex-row gap-2 justify-end">
          <AlertDialogCancel asChild>
            <Button variant="outline" disabled={loading}>
              {cancelText || Informasi}
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              className={config.confirmButtonClass}
              onClick={handleConfirm}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Informasi
                </>
              ) : (
                confirmText || Informasi
              )}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// Hook for easy usage
export function useConfirmationDialog() {
  const confirm = (options: Omit<ConfirmationDialogProps, 'open' | 'onOpenChange'>) => {
    return new Promise<boolean>((resolve) => {
      // Implementation akan menggunakan state management untuk dialog
      // Untuk sekarang, kita akan return Promise yang resolve dengan hasil
      const result = window.confirm(`${options.title}\n\n${options.description}`)
      resolve(result)
    })
  }

  return { confirm }
}