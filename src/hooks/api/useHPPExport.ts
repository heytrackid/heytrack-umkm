'use client'

import { toast } from '@/hooks/use-toast'
import type { TimePeriod } from '@/types/hpp-tracking'
import { useMutation } from '@tanstack/react-query'

export interface ExportHPPParams {
    recipeId: string
    period?: TimePeriod
    recipeName?: string
}

/**
 * Export HPP data to Excel file
 * Downloads the file automatically on success
 */
const exportHPPToExcel = async ({
    recipeId,
    period = '30d',
    recipeName = 'Product',
}: ExportHPPParams): Promise<void> => {
    const params = new URLSearchParams({
        recipe_id: recipeId,
        period,
    })

    const response = await fetch(`/api/hpp/export?${params.toString()}`)

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to export HPP data')
    }

    // Get the blob from response
    const blob = await response.blob()

    // Create download link
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url

    // Generate filename with current date
    const date = new Date().toISOString().split('T')[0]
    const filename = `HPP_History_${recipeName.replace(/\s+/g, '_')}_${date}.xlsx`
    link.download = filename

    // Trigger download
    document.body.appendChild(link)
    link.click()

    // Cleanup
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
}

/**
 * Hook to export HPP data to Excel with loading and error states
 * 
 * Features:
 * - Automatic file download on success
 * - Loading state management
 * - Error handling with notifications
 * - Success notifications
 * 
 * @example
 * ```tsx
 * const { mutate: exportToExcel, isPending } = useHPPExport()
 * 
 * const handleExport = () => {
 *   exportToExcel({
 *     recipeId: 'recipe-uuid',
 *     period: '30d',
 *     recipeName: 'Nasi Goreng'
 *   })
 * }
 * 
 * return (
 *   <button onClick={handleExport} disabled={isPending}>
 *     {isPending ? 'Exporting...' : 'Export to Excel'}
 *   </button>
 * )
 * ```
 */
export const useHPPExport = () => {
    return useMutation({
        mutationFn: exportHPPToExcel,
        onSuccess: (_, variables) => {
            toast({
                title: 'Export Berhasil',
                description: `Data HPP ${variables.recipeName || 'produk'} berhasil diekspor ke Excel`,
            })
        },
        onError: (error) => {
            toast({
                title: 'Export Gagal',
                description: error instanceof Error ? error.message : 'Gagal mengekspor data HPP',
                variant: 'destructive',
            })
        },
    })
}

/**
 * Hook to export multiple recipes to Excel
 * Useful for batch exports
 * 
 * @example
 * ```tsx
 * const { mutate: exportMultiple, isPending } = useHPPBatchExport()
 * 
 * exportMultiple({
 *   recipes: [
 *     { recipeId: 'uuid-1', recipeName: 'Product 1' },
 *     { recipeId: 'uuid-2', recipeName: 'Product 2' }
 *   ],
 *   period: '30d'
 * })
 * ```
 */
export const useHPPBatchExport = () => {
    return useMutation({
        mutationFn: async ({
            recipes,
            period = '30d',
        }: {
            recipes: Array<{ recipeId: string; recipeName: string }>
            period?: TimePeriod
        }) => {
            // Export each recipe sequentially
            for (const recipe of recipes) {
                await exportHPPToExcel({
                    recipeId: recipe.recipeId,
                    period,
                    recipeName: recipe.recipeName,
                })
                // Add small delay between exports to avoid overwhelming the server
                await new Promise((resolve) => setTimeout(resolve, 500))
            }
        },
        onSuccess: (_, variables) => {
            toast({
                title: 'Batch Export Berhasil',
                description: `${variables.recipes.length} file berhasil diekspor`,
            })
        },
        onError: (error) => {
            toast({
                title: 'Batch Export Gagal',
                description: error instanceof Error ? error.message : 'Gagal mengekspor data HPP',
                variant: 'destructive',
            })
        },
    })
}
