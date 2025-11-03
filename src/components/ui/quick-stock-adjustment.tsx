'use client'

import { useState } from 'react'
import { Button } from './button'
import { Input } from './input'
import { Plus, Minus, Package } from 'lucide-react'
import { cn } from '@/lib/utils'

interface QuickStockAdjustmentProps {
  currentStock: number
  unit: string
  onAdjust: (newStock: number, adjustment: number) => void | Promise<void>
  quickAmounts?: number[]
  className?: string
  disabled?: boolean
}

export function QuickStockAdjustment({
  currentStock,
  unit,
  onAdjust,
  quickAmounts = [10, 50, 100],
  className,
  disabled = false
}: QuickStockAdjustmentProps) {
  const [customAmount, setCustomAmount] = useState('')
  const [isAdjusting, setIsAdjusting] = useState(false)

  const handleQuickAdjust = async (amount: number) => {
    if (disabled || isAdjusting) return
    
    setIsAdjusting(true)
    try {
      const newStock = currentStock + amount
      await onAdjust(newStock, amount)
    } finally {
      setIsAdjusting(false)
    }
  }

  const handleCustomAdjust = async () => {
    const amount = parseFloat(customAmount)
    if (isNaN(amount) || amount === 0) return

    await handleQuickAdjust(amount)
    setCustomAmount('')
  }

  return (
    <div className={cn('space-y-3', className)}>
      {/* Current Stock Display */}
      <div className="flex items-center gap-2 text-sm">
        <Package className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium">Stok Saat Ini:</span>
        <span className="text-lg font-bold">{currentStock} {unit}</span>
      </div>

      {/* Quick Add Buttons */}
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground font-medium">Tambah Cepat:</p>
        <div className="grid grid-cols-3 gap-2">
          {quickAmounts.map((amount) => (
            <Button
              key={amount}
              variant="outline"
              size="sm"
              onClick={() => handleQuickAdjust(amount)}
              disabled={disabled || isAdjusting}
              className="relative group"
            >
              <Plus className="h-3 w-3 mr-1" />
              {amount}
              <span className="ml-1 text-xs text-muted-foreground">{unit}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Quick Subtract Buttons */}
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground font-medium">Kurangi Cepat:</p>
        <div className="grid grid-cols-3 gap-2">
          {quickAmounts.map((amount) => (
            <Button
              key={amount}
              variant="outline"
              size="sm"
              onClick={() => handleQuickAdjust(-amount)}
              disabled={disabled || isAdjusting || currentStock < amount}
              className="relative group text-red-600 hover:text-red-700"
            >
              <Minus className="h-3 w-3 mr-1" />
              {amount}
              <span className="ml-1 text-xs text-muted-foreground">{unit}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Custom Amount */}
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground font-medium">Jumlah Custom:</p>
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="0"
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            disabled={disabled || isAdjusting}
            className="text-center"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                void handleCustomAdjust()
              }
            }}
          />
          <Button
            variant="outline"
            onClick={handleCustomAdjust}
            disabled={disabled || isAdjusting || !customAmount}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Gunakan angka negatif untuk mengurangi (contoh: -25)
        </p>
      </div>

      {/* History indicator */}
      {isAdjusting && (
        <div className="text-xs text-center text-muted-foreground animate-pulse">
          Memperbarui stok...
        </div>
      )}
    </div>
  )
}

// Compact version for inline use
export function CompactStockAdjustment({
  currentStock,
  unit,
  onAdjust,
  quickAmounts = [10, 50, 100],
  disabled = false
}: QuickStockAdjustmentProps) {
  const [isAdjusting, setIsAdjusting] = useState(false)

  const handleQuickAdjust = async (amount: number) => {
    if (disabled || isAdjusting) return
    
    setIsAdjusting(true)
    try {
      const newStock = currentStock + amount
      await onAdjust(newStock, amount)
    } finally {
      setIsAdjusting(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium">{currentStock} {unit}</span>
      <div className="flex gap-1">
        {quickAmounts.map((amount) => (
          <Button
            key={amount}
            variant="ghost"
            size="sm"
            onClick={() => handleQuickAdjust(amount)}
            disabled={disabled || isAdjusting}
            className="h-7 px-2 text-xs"
          >
            +{amount}
          </Button>
        ))}
      </div>
    </div>
  )
}
