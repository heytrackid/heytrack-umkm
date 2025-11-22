'use client'

import { CheckCircle2, XCircle, AlertCircle, Info, Undo2 } from '@/components/icons'
import { toast as sonnerToast } from 'sonner'

import { Button } from '@/components/ui/button'

export type ToastProps = {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
  variant?: 'default' | 'destructive' | 'success' | 'warning'
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export type ToastActionElement = React.ReactElement

export interface ToastAction {
  label: string
  onClick: () => void
}

export interface ToastOptions {
  title: string
  description?: string
  action?: ToastAction
  duration?: number
  type?: 'error' | 'info' | 'success' | 'warning'
}

const getIcon = (type: string) => {
  switch (type) {
    case 'success':
      return <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
    case 'error':
      return <XCircle className="h-5 w-5 text-red-600" />
    case 'warning':
      return <AlertCircle className="h-5 w-5 text-orange-600" />
    case 'info':
      return <Info className="h-5 w-5 text-muted-foreground" />
    default:
      return null
  }
}

export function toast({
  title,
  description,
  action,
  duration = 4000,
  type = 'info'
}: ToastOptions) {
  return sonnerToast.custom(
    (t) => (
      <div className="bg-background border rounded-lg  p-4 min-w-[300px] max-w-[500px] animate-in slide-in-from-bottom-5">
        <div className="flex items-start gap-3">
          {getIcon(type)}
          <div className="flex-1 space-y-1">
            <p className="font-semibold text-sm">{title}</p>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
            {action && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  action.onClick()
                  sonnerToast.dismiss(t)
                }}
                className="mt-2"
              >
                {action.label}
              </Button>
            )}
          </div>
          <button
            onClick={() => sonnerToast.dismiss(t)}
            className="text-muted-foreground hover:text-foreground"
          >
            <XCircle className="h-4 w-4" />
          </button>
        </div>
      </div>
    ),
    { duration }
  )
}

// Specialized toast for delete operations with undo
export function deleteToast({
  itemName,
  onUndo,
  duration = 5000
}: {
  itemName: string
  onUndo: () => Promise<void>
  duration?: number
}) {
  return toast({
    title: `${itemName} dihapus`,
    description: 'Item telah dihapus dari sistem',
    type: 'success',
    duration,
    action: {
      label: 'Undo',
      onClick: onUndo
    }
  })
}

// Quick success toast
export function successToast(title: string, description?: string) {
  return toast({
    title,
    ...(description !== undefined && { description }),
    type: 'success',
    duration: 3000
  })
}

// Quick error toast
export function errorToast(title: string, description?: string) {
  return toast({
    title,
    ...(description !== undefined && { description }),
    type: 'error',
    duration: 3000
  })
}

// Toast with undo action
export function undoableToast({
  title,
  description,
  onUndo,
  duration = 5000
}: {
  title: string
  description?: string
  onUndo: () => Promise<void> | void
  duration?: number
}) {
  return sonnerToast.custom(
    (t) => (
      <div className="bg-background border rounded-lg  p-4 min-w-[350px] animate-in slide-in-from-bottom-5">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
          <div className="flex-1 space-y-2">
            <div>
              <p className="font-semibold text-sm">{title}</p>
              {description && (
                <p className="text-sm text-muted-foreground mt-1">{description}</p>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                await onUndo()
                sonnerToast.dismiss(t)
              }}
              className="w-full"
            >
              <Undo2 className="h-4 w-4 mr-2" />
              Undo
            </Button>
          </div>
          <button
            onClick={() => sonnerToast.dismiss(t)}
            className="text-muted-foreground hover:text-foreground"
          >
            <XCircle className="h-4 w-4" />
          </button>
        </div>
      </div>
    ),
    { duration }
  )
}
