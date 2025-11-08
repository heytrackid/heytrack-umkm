'use client'

import { Plus, X } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface FABAction {
  label: string
  icon: React.ReactNode
  onClick: () => void
  color?: string
}

interface FloatingActionButtonProps {
  actions?: FABAction[]
  mainAction?: () => void
  className?: string
}

export const FloatingActionButton = ({ 
  actions = [], 
  mainAction,
  className 
}: FloatingActionButtonProps) => {
  const [isOpen, setIsOpen] = useState(false)

  const handleMainClick = () => {
    if (actions.length > 0) {
      setIsOpen(!isOpen)
    } else if (mainAction) {
      mainAction()
    }
  }

  return (
    <div className={cn('fixed bottom-6 right-6 z-50', className)}>
      {/* Action Menu */}
      {isOpen && actions.length > 0 && (
        <div className="absolute bottom-20 right-0 flex flex-col gap-3 mb-2">
          {actions.map((action, index) => (
            <div
              key={index}
              className="flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <span className="text-sm font-medium bg-background border rounded-lg px-3 py-2 shadow-lg whitespace-nowrap">
                {action.label}
              </span>
              <Button
                size="lg"
                className={cn(
                  'h-12 w-12 rounded-full shadow-lg',
                  action.color ?? 'bg-primary'
                )}
                onClick={() => {
                  action.onClick()
                  setIsOpen(false)
                }}
              >
                {action.icon}
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Main FAB Button */}
      <Button
        size="lg"
        className={cn(
          'h-16 w-16 rounded-full shadow-2xl transition-all',
          isOpen && 'rotate-45'
        )}
        onClick={handleMainClick}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
      </Button>
    </div>
  )
}

// Simple FAB without menu
export const SimpleFAB = ({ 
  onClick, 
  icon, 
  className 
}: { 
  onClick: () => void
  icon?: React.ReactNode
  className?: string 
}) => (
    <Button
      size="lg"
      onClick={onClick}
      className={cn(
        'fixed bottom-6 right-6 z-50 h-16 w-16 rounded-full shadow-2xl',
        className
      )}
    >
      {icon ?? <Plus className="h-6 w-6" />}
    </Button>
  )
