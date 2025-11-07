'use client'

import { useCallback, useState } from 'react'

import { createClientLogger } from '@/lib/client-logger'

const logger = createClientLogger('Hook')

/**
 * useConfirm Hook
 * Easy way to add confirmation dialogs
 */


interface UseConfirmOptions {
  onConfirm: () => Promise<void> | void
  title?: string
  description?: string
}

export function useConfirm() {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [config, setConfig] = useState<UseConfirmOptions | null>(null)

  const confirm = useCallback((options: UseConfirmOptions) => {
    setConfig(options)
    setIsOpen(true)
  }, [])

  const handleConfirm = useCallback(async () => {
    if (!config) {return}

    try {
      setLoading(true)
      await config.onConfirm()
      setIsOpen(false)
    } catch (error) {
      logger.error({ error }, 'Confirmation action failed:')
    } finally {
      setLoading(false)
    }
  }, [config])

  const handleCancel = useCallback(() => {
    setIsOpen(false)
    setLoading(false)
  }, [])

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
