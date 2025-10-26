'use client'

import { useState } from 'react'

interface UseMultiSelectStateProps {
    initialRecipeIds: string[]
    maxSelections?: number
}

interface UseMultiSelectStateReturn {
    selectedRecipeIds: string[]
    visibleProducts: Set<string>
    setSelectedRecipeIds: (ids: string[]) => void
    toggleRecipeSelection: (recipeId: string) => void
    toggleProductVisibility: (recipeId: string) => void
    initializeVisibleProducts: (recipeIds: string[]) => void
    canSelectMore: boolean
}

export function useMultiSelectState({
    initialRecipeIds,
    maxSelections = 5
}: UseMultiSelectStateProps): UseMultiSelectStateReturn {
    const [selectedRecipeIds, setSelectedRecipeIds] = useState<string[]>(initialRecipeIds)
    const [visibleProducts, setVisibleProducts] = useState<Set<string>>(new Set())

    const toggleRecipeSelection = (recipeId: string) => {
        if (selectedRecipeIds.includes(recipeId)) {
            // Remove recipe
            setSelectedRecipeIds(selectedRecipeIds.filter(id => id !== recipeId))
            // Also remove from visible products
            setVisibleProducts(prev => {
                const newSet = new Set(prev)
                newSet.delete(recipeId)
                return newSet
            })
        } else {
            // Add recipe (if under limit)
            if (selectedRecipeIds.length < maxSelections) {
                setSelectedRecipeIds([...selectedRecipeIds, recipeId])
            }
        }
    }

    const toggleProductVisibility = (recipeId: string) => {
        setVisibleProducts(prev => {
            const newSet = new Set(prev)
            if (newSet.has(recipeId)) {
                newSet.delete(recipeId)
            } else {
                newSet.add(recipeId)
            }
            return newSet
        })
    }

    const initializeVisibleProducts = (recipeIds: string[]) => {
        setVisibleProducts(new Set(recipeIds))
    }

    const canSelectMore = selectedRecipeIds.length < maxSelections

    return {
        selectedRecipeIds,
        visibleProducts,
        setSelectedRecipeIds,
        toggleRecipeSelection,
        toggleProductVisibility,
        initializeVisibleProducts,
        canSelectMore
    }
}
