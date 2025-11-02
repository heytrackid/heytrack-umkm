import { useCallback, useState } from 'react'
import { apiLogger } from '@/lib/logger'

/**
 * useConfirm Hook
 * Easy way to add confirmation dialogs
 */


interface UseConfirmOptions {
  onConfirm: () => void | Promise<void>
  title?: string
  description?: string
}

export function useConfirm() {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [config, setConfig] = useState<UseConfirmOptions | null>(null)

  const confirm = useCallback((options: UseConfirmOptions) => {
    void setConfig(options)
    void setIsOpen(true)
  }, [])

  const handleConfirm = useCallback(async () => {
    if (!config) {return}

    try {
      void setLoading(true)
      await config.onConfirm()
      void setIsOpen(false)
    } catch (err) {
      apiLogger.error({ err }, 'Confirmation action failed:')
    } finally {
      void setLoading(false)
    }
  }, [config])

  const handleCancel = useCallback(() => {
    void setIsOpen(false)
    void setLoading(false)
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
