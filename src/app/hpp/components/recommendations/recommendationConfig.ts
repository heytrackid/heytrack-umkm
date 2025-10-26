import type { HPPRecommendation } from '@/types/hpp-tracking'

// Helper function to get priority badge variant
export const getPriorityConfig = (priority: HPPRecommendation['priority']) => {
    switch (priority) {
        case 'high':
            return {
                variant: 'destructive' as const,
                label: 'Prioritas Tinggi',
                color: 'text-red-600 dark:text-red-500'
            }
        case 'medium':
            return {
                variant: 'default' as const,
                label: 'Prioritas Sedang',
                color: 'text-yellow-600 dark:text-yellow-500'
            }
        case 'low':
            return {
                variant: 'secondary' as const,
                label: 'Prioritas Rendah',
                color: 'text-blue-600 dark:text-blue-500'
            }
    }
}

// Helper function to get recommendation type icon and label
export const getTypeConfig = (type: HPPRecommendation['type']) => {
    switch (type) {
        case 'supplier_review':
            return {
                icon: 'users',
                label: 'Review Supplier',
                color: 'text-purple-600 dark:text-purple-500'
            }
        case 'ingredient_alternative':
            return {
                icon: 'package',
                label: 'Alternatif Bahan',
                color: 'text-blue-600 dark:text-blue-500'
            }
        case 'operational_efficiency':
            return {
                icon: 'trending-up',
                label: 'Efisiensi Operasional',
                color: 'text-green-600 dark:text-green-500'
            }
        case 'price_adjustment':
            return {
                icon: 'dollar-sign',
                label: 'Penyesuaian Harga',
                color: 'text-orange-600 dark:text-orange-500'
            }
    }
}
