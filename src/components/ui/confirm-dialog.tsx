'use client'

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

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: 'default' | 'destructive'
  onConfirm: () => Promise<void> | void
  consequences?: string[]
  requireConfirmation?: boolean
  confirmationText?: string
  loading?: boolean
}

export const ConfirmDialog = ({
  open,
  onOpenChange,
  title,
  description,
  confirmText = 'Konfirmasi',
  cancelText = 'Batal',
  variant = 'default',
  onConfirm,
  consequences = [],
  requireConfirmation = false,
  confirmationText = ''
}: ConfirmDialogProps) => {
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const canConfirm = !requireConfirmation || inputValue === confirmationText

  const handleConfirm = async () => {
    if (!canConfirm) { return }

    setIsLoading(true)
    try {
      await onConfirm()
      onOpenChange(false)
      setInputValue('')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            {description}
          </AlertDialogDescription>

          {consequences.length > 0 && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg border border-yellow-500/30">
              <div className="flex items-start gap-2">
                <svg className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div className="text-sm">
                  <p className="font-medium text-yellow-900 dark:text-yellow-200 mb-1">Perhatian:</p>
                  <ul className="list-disc list-inside space-y-1 text-yellow-800 dark:text-yellow-300">
                    {consequences.map((consequence, index) => (
                      <li key={index}>{consequence}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {requireConfirmation && (
            <div className="space-y-2">
              <p className="text-sm">
                Ketik <strong className="font-mono bg-secondary px-1 py-0.5 rounded">{confirmationText}</strong> untuk konfirmasi
              </p>
              <input
                type="text"
                value={inputValue}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputValue(e.target.value)}
                placeholder={`Ketik "${confirmationText}"`}
                className="w-full px-3 py-2 border border-border/20  rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"

              />
            </div>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>{cancelText}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={!canConfirm || isLoading}
            className={variant === 'destructive' ? 'bg-red-600 hover:bg-red-700 disabled:bg-red-300' : ''}
          >
            {isLoading ? 'Memproses...' : confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// Hook untuk mudah pakai
export function useConfirm() {
  const [state, setState] = useState<{
    open: boolean
    title: string
    description: string
    confirmText?: string
    cancelText?: string
    variant?: 'default' | 'destructive'
    onConfirm?: () => Promise<void> | void
  }>({
    open: false,
    title: '',
    description: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    variant: 'default'
  })

  const confirm = (options: Omit<typeof state, 'onConfirm' | 'open'>) => new Promise<boolean>((resolve) => {
    setState({
      ...options,
      open: true,
      onConfirm: () => {
        resolve(true)
      }
    })
  })

  const ConfirmDialogComponent = () => (
    <ConfirmDialog
      {...state}
      onConfirm={() => state.onConfirm?.()}
      onOpenChange={(open) => setState(prev => ({ ...prev, open }))}
    />
  )

  return { confirm, ConfirmDialog: ConfirmDialogComponent }
}
