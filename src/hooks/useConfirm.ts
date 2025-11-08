'use client'

import { useCallback, useState } from 'react'





/**
 * useConfirm Hook
 * Easy way to add confirmation dialogs
 */


interface UseConfirmOptions {
  title?: string
  description?: string
  confirmText?: string
  variant?: 'default' | 'destructive'
}

export function useConfirm() {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [config, setConfig] = useState<UseConfirmOptions | null>(null)
  const [resolvePromise, setResolvePromise] = useState<((value: boolean) => void) | null>(null)

  const confirm = useCallback((options: UseConfirmOptions): Promise<boolean> =>
    new Promise((resolve) => {
      setResolvePromise(() => resolve)
      setConfig(options)
      setIsOpen(true)
    }), [])

  const handleConfirm = useCallback(() => {
    if (!resolvePromise) {return}

    resolvePromise(true)
    setIsOpen(false)
    setResolvePromise(null)
    setLoading(false)
  }, [resolvePromise])

  const handleCancel = useCallback(() => {
    if (resolvePromise) {
      resolvePromise(false)
      setResolvePromise(null)
    }
    setIsOpen(false)
    setLoading(false)
  }, [resolvePromise])

  return {
    isOpen,
    loading,
    config,
    confirm,
    handleConfirm,
    handleCancel,
    setIsOpen
  }
}

// Usage example:
// const { confirm, isOpen, handleConfirm, handleCancel, loading, config } = useConfirm()
//
// <Button onClick={() => confirm({
//   title: 'Delete item?',
//   description: 'This cannot be undone',
//   onConfirm: async () => {
//     await deleteItem(id)
//   }
// })}>
//   Delete
// </Button>
//
// <ConfirmDialog
//   open={isOpen}
//   onOpenChange={setIsOpen}
//   title={config?.title}
//   description={config?.description}
//   onConfirm={handleConfirm}
//   loading={loading}
// />
