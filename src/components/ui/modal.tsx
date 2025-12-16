'use client'

import { X } from '@/components/icons'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { type ReactNode } from 'react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
  size?: 'full' | 'lg' | 'md' | 'sm' | 'xl'
  showCloseButton?: boolean
  closeOnBackdropClick?: boolean
  fullScreenOnMobile?: boolean
}

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnBackdropClick = true,
  fullScreenOnMobile = false,
}: ModalProps) => {
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md sm:max-w-lg',
    lg: 'max-w-lg sm:max-w-xl lg:max-w-2xl',
    xl: 'max-w-xl sm:max-w-2xl lg:max-w-4xl',
    full: 'max-w-full',
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className={cn(
          'max-h-[90vh] sm:max-h-[85vh]',
          sizeClasses[size],
          fullScreenOnMobile && 'h-full sm:h-auto'
        )}
        onPointerDownOutside={(e) => {
          if (!closeOnBackdropClick) {
            e.preventDefault()
          }
        }}
        onEscapeKeyDown={(e) => {
          if (!closeOnBackdropClick) {
            e.preventDefault()
          }
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg pr-8">
            {title}
          </DialogTitle>
          {showCloseButton && (
            <button
              onClick={onClose}
              className="absolute right-3 top-3 sm:right-4 sm:top-4 text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-full p-1 transition-colors"
              aria-label="Close modal"
            >
              <X className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          )}
        </DialogHeader>
        <div
          className={cn(
            'overflow-y-auto px-4 py-4 sm:px-6 sm:py-5',
            fullScreenOnMobile
              ? 'flex-1 h-full'
              : 'max-h-[calc(90vh-8rem)] sm:max-h-[calc(85vh-8rem)]'
          )}
        >
          {children}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Drawer variant for mobile-first design
export const Drawer = ({
  isOpen,
  onClose,
  title,
  children,
  showCloseButton = true,
  closeOnBackdropClick = true,
  position = 'bottom',
}: ModalProps & { position?: 'bottom' | 'right' | 'top' | 'left' }) => {
  const positionClasses = {
    bottom: 'bottom' as const,
    right: 'right' as const,
    top: 'top' as const,
    left: 'left' as const,
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side={positionClasses[position]}
        className="w-full max-w-[85vh] rounded-t-xl sm:max-w-lg sm:mx-auto sm:rounded-xl sm:max-h-[90vh] data-[state=open]:slide-in-from-bottom-full sm:data-[state=open]:slide-in-from-bottom-0"
        onPointerDownOutside={(e) => {
          if (!closeOnBackdropClick) {
            e.preventDefault()
          }
        }}
        onEscapeKeyDown={(e) => {
          if (!closeOnBackdropClick) {
            e.preventDefault()
          }
        }}
      >
        <SheetHeader>
          <SheetTitle className="text-lg pr-8">{title}</SheetTitle>
          {showCloseButton && (
            <button
              onClick={onClose}
              className="absolute right-3 top-3 sm:right-4 sm:top-4 text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-full p-1 transition-colors"
              aria-label="Close drawer"
            >
              <X className="h-6 w-6" />
            </button>
          )}
        </SheetHeader>
        <div className="px-4 py-4 sm:px-6 sm:py-5 overflow-y-auto flex-1">
          {children}
        </div>
      </SheetContent>
    </Sheet>
  )
}
