'use client'

import { useCurrency } from '@/hooks/useCurrency'

interface PotentialSavingsSummaryProps {
    totalPotentialSavings: number
}

export function PotentialSavingsSummary({ totalPotentialSavings }: PotentialSavingsSummaryProps) {
    const { formatCurrency } = useCurrency()

    if (totalPotentialSavings <= 0) {
        return null
    }

    return (
        <div className="p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 rounded-lg">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-green-900 dark:text-green-100">
                        Potensi Penghematan Total
                    </p>
                    <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                        Jika semua rekomendasi diterapkan
                    </p>
                </div>
                <p className="text-2xl font-bold text-green-600 dark:text-green-500">
                    {formatCurrency(totalPotentialSavings)}
                </p>
            </div>
        </div>
    )
}
