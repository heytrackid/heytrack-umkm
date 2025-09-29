'use client'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle } from 'lucide-react'

interface InventoryAlertsProps {
  criticalCount: number
}

/**
 * Critical inventory alerts component
 */
export function InventoryAlerts({ criticalCount }: InventoryAlertsProps) {
  if (criticalCount === 0) return null

  return (
    <Alert className="border-red-200 bg-gray-100 dark:bg-gray-800">
      <AlertTriangle className="h-4 w-4 text-gray-600 dark:text-gray-400" />
      <AlertDescription className="text-red-700">
        <strong>URGENT!</strong> {criticalCount} bahan dalam kondisi stok kritis.
        Segera lakukan reorder untuk menghindari gangguan produksi.
      </AlertDescription>
    </Alert>
  )
}
