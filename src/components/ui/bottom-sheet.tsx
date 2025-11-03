'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'
import { Button } from './button'

interface BottomSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: ReactNode
  title?: string
  description?: string
  snapPoints?: number[]
  defaultSnap?: number
  className?: string
}

export function BottomSheet({
  open,
  onOpenChange,
  children,
  title,
  description,
  snapPoints = [0.5, 0.9],
  defaultSnap = 0,
  className
}: BottomSheetProps) {
  const [snapIndex, setSnapIndex] = useState(defaultSnap)
  const currentSnap = snapPoints[snapIndex] || snapPoints[0]

  useEffect(() => {
    if (open) {
      // Prevent body scroll when open
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const handleBackdropClick = () => {
    onOpenChange(false)
  }

  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 animate-in fade-in duration-200"
        onClick={handleBackdropClick}
      />

      {/* Sheet */}
      <div
        className={cn(
          'relative w-full bg-background rounded-t-2xl shadow-2xl',
          'animate-in slide-in-from-bottom duration-300',
          className
        )}
        style={{
          height: `${currentSnap * 100}vh`,
          maxHeight: '90vh'
        }}
        onClick={handleContentClick}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1 bg-muted-foreground/30 rounded-full" />
        </div>

        {/* Header */}
        {(title || description) && (
          <div className="px-6 py-4 border-b">
            <div className="flex items-center justify-between">
              <div>
                {title && <h2 className="text-lg font-semibold">{title}</h2>}
                {description && (
                  <p className="text-sm text-muted-foreground mt-1">{description}</p>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="overflow-auto px-6 py-4" style={{ maxHeight: 'calc(100% - 120px)' }}>
          {children}
        </div>
      </div>
    </div>
  )
}

// Specialized bottom sheet for filters
interface FilterBottomSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onApply: () => void
  onReset: () => void
  children: ReactNode
}

export function FilterBottomSheet({
  open,
  onOpenChange,
  onApply,
  onReset,
  children
}: FilterBottomSheetProps) {
  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Filter"
      description="Sesuaikan filter untuk menyaring data"
      snapPoints={[0.6, 0.9]}
    >
      <div className="space-y-4">
        {children}

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t sticky bottom-0 bg-background">
          <Button
            variant="outline"
            onClick={onReset}
            className="flex-1"
          >
            Reset
          </Button>
          <Button
            onClick={() => {
              onApply()
              onOpenChange(false)
            }}
            className="flex-1"
          >
            Terapkan Filter
          </Button>
        </div>
      </div>
    </BottomSheet>
  )
}
