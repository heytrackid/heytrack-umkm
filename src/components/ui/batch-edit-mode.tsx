 
'use client'

import { CheckSquare, Edit, Trash2, X } from 'lucide-react'
import { useState, type ReactNode } from 'react'

import { cn } from '@/lib/utils'

import { Badge } from './badge'
import { Button } from './button'
import { Checkbox } from './checkbox'

interface BatchEditModeProps<T> {
  items: T[]
  selectedItems: Set<string>
  onSelectionChange: (selected: Set<string>) => void
  getItemId: (item: T) => string
  isActive: boolean
  onToggleMode: () => void
  actions?: BatchAction[]
  children: (item: T, isSelected: boolean, onToggle: () => void) => ReactNode
  className?: string
}

export interface BatchAction {
  icon: ReactNode
  label: string
  onClick: (selectedIds: string[]) => Promise<void> | void
  variant?: 'default' | 'destructive' | 'outline'
  requiresConfirmation?: boolean
}

export const BatchEditMode = <T,>({
  items,
  selectedItems,
  onSelectionChange,
  getItemId,
  isActive,
  onToggleMode,
  actions = [],
  children,
  className
}: BatchEditModeProps<T>): JSX.Element => {
  const selectedCount = selectedItems.size
  const allSelected = items.length > 0 && selectedItems.size === items.length

  const handleSelectAll = () => {
    if (allSelected) {
      onSelectionChange(new Set())
    } else {
      const allIds = new Set(items.map(getItemId))
      onSelectionChange(allIds)
    }
  }

  const handleToggleItem = (id: string) => {
    const newSelection = new Set(selectedItems)
    if (newSelection.has(id)) {
      newSelection.delete(id)
    } else {
      newSelection.add(id)
    }
    onSelectionChange(newSelection)
  }

  const handleAction = async (action: BatchAction) => {
    if (selectedCount === 0) {return}

    const selectedIds = Array.from(selectedItems)
    
    if (action.requiresConfirmation) {
      // eslint-disable-next-line no-alert
      if (!confirm(`Yakin ingin melakukan aksi ini pada ${selectedCount} item?`)) {
        return
      }
    }

    await action.onClick(selectedIds)
    
    // Clear selection after action
    onSelectionChange(new Set())
  }

  if (!isActive) {
    return (
      <div className={className}>
        {items.map((item) => children(item, false, () => {}))}
      </div>
    )
  }

  return (
    <div className={className}>
      {/* Batch toolbar */}
      <div className="sticky top-0 z-10 bg-background border-b mb-4 animate-in slide-in-from-top duration-300">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleMode}
              className="h-9"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>

            <div className="flex items-center gap-2">
              <Checkbox
                checked={allSelected}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm font-medium">
                {selectedCount > 0 ? `${selectedCount} selected` : 'Select all'}
              </span>
            </div>
          </div>

          {selectedCount > 0 && (
            <div className="flex items-center gap-2">
              {actions.map((action, index) => (
                <Button
                  key={index}
                  variant={action.variant ?? 'outline'}
                  size="sm"
                  onClick={() => handleAction(action)}
                >
                  {action.icon}
                  <span className="ml-2">{action.label}</span>
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Items with checkboxes */}
      <div className="space-y-2">
        {items.map((item) => {
          const id = getItemId(item)
          const isSelected = selectedItems.has(id)

          return (
            <div
              key={id}
              className={cn(
                'relative transition-all duration-200',
                isSelected && 'ring-2 ring-primary ring-offset-2 rounded-lg'
              )}
            >
              {/* Selection overlay */}
              <div
                className="absolute inset-0 flex items-center pl-4 pointer-events-none z-10"
                onClick={(e) => {
                  e.stopPropagation()
                  handleToggleItem(id)
                }}
              >
                <Checkbox
                  checked={isSelected}
                  className="pointer-events-auto"
                  onCheckedChange={() => handleToggleItem(id)}
                />
              </div>

              {/* Item content with left padding for checkbox */}
              <div className={cn('pl-12', isSelected && 'opacity-75')}>
                {children(item, isSelected, () => handleToggleItem(id))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Floating action summary */}
      {selectedCount > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5 duration-300">
          <div className="bg-primary text-primary-foreground rounded-full px-6 py-3 shadow-2xl flex items-center gap-3">
            <CheckSquare className="h-5 w-5" />
            <span className="font-semibold">{selectedCount} item dipilih</span>
            <Badge variant="secondary" className="ml-2">
              {items.length} total
            </Badge>
          </div>
        </div>
      )}
    </div>
  )
}

// Hook untuk batch edit state
export function useBatchEdit() {
  const [isActive, setIsActive] = useState(false)
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())

  const toggleMode = () => {
    setIsActive(!isActive)
    if (isActive) {
      setSelectedItems(new Set()) // Clear selection when exiting
    }
  }

  const clearSelection = () => {
    setSelectedItems(new Set())
  }

  return {
    isActive,
    selectedItems,
    toggleMode,
    setSelectedItems,
    clearSelection
  }
}

// Preset batch actions
export const BatchActions = {
  delete: (onDelete: (ids: string[]) => Promise<void>): BatchAction => ({
    icon: <Trash2 className="h-4 w-4" />,
    label: 'Delete',
    onClick: onDelete,
    variant: 'destructive',
    requiresConfirmation: true
  }),
  edit: (onEdit: (ids: string[]) => void): BatchAction => ({
    icon: <Edit className="h-4 w-4" />,
    label: 'Edit',
    onClick: onEdit,
    variant: 'outline'
  })
}
