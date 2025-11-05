'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'



interface ModalConfig {
  id: string
  title?: string
  description?: string
  content: ReactNode
  isOpen: boolean
  onClose?: () => void
  size?: 'sm' | 'md' | 'lg' | 'xl'
  closeButton?: boolean
  showOverlay?: boolean
}

interface ModalContextType {
  modals: Map<string, ModalConfig>
  openModal: (id: string, config: Omit<ModalConfig, 'id' | 'isOpen'>) => void
  closeModal: (id: string) => void
  closeAllModals: () => void
  isOpen: (id: string) => boolean
}

const ModalContext = createContext<ModalContextType | undefined>(undefined)

export const ModalProvider = ({ children }: { children: ReactNode }) => {
  const [modals, setModals] = useState<Map<string, ModalConfig>>(new Map())

  const openModal = useCallback(
    (id: string, config: Omit<ModalConfig, 'id' | 'isOpen'>) => {
      setModals((prev) => {
        const newModals = new Map(prev)
        newModals.set(id, { ...config, id, isOpen: true })
        return newModals
      })
    },
    []
  )

  const closeModal = useCallback((id: string) => {
    setModals((prev) => {
      const newModals = new Map(prev)
      const modal = newModals.get(id)
      if (modal) {
        modal.onClose?.()
        newModals.delete(id)
      }
      return newModals
    })
  }, [])

  const closeAllModals = useCallback(() => {
    setModals((prev) => {
      const newModals = new Map(prev)
      newModals.forEach((modal) => modal.onClose?.())
      newModals.clear()
      return newModals
    })
  }, [])

  const isOpen = useCallback((id: string) => modals.has(id), [modals])

  const value: ModalContextType = {
    modals,
    openModal,
    closeModal,
    closeAllModals,
    isOpen,
  }

  return (
    <ModalContext.Provider value={value}>
      {children}
      <ModalRenderer />
    </ModalContext.Provider>
  )
}

/**
 * Hook to use modal context
 */
export function useModal() {
  const context = useContext(ModalContext)
  if (!context) {
    throw new Error('useModal must be used within ModalProvider')
  }
  return context
}

/**
 * Internal component to render all modals
 */
const ModalRenderer = () => {
  const { modals, closeModal } = useModal()

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  }

  return (
    <>
      {Array.from(modals.values()).map((modal) => (
        <Dialog
          key={modal.id}
          open
          onOpenChange={(open) => {
            if (!open) { closeModal(modal.id) }
          }}
        >
          <DialogContent className={sizeClasses[modal.size ?? 'md']}>
            {(modal.title ?? modal.description) && (
              <DialogHeader>
                {modal.title && <DialogTitle>{modal.title}</DialogTitle>}
                {modal.description && <DialogDescription>{modal.description}</DialogDescription>}
              </DialogHeader>
            )}
            {modal.content}
          </DialogContent>
        </Dialog>
      ))}
    </>
  )
}
