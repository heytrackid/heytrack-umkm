'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import { createClientLogger } from '@/lib/client-logger'
import { isRecipe } from '@/lib/type-guards'

import type { Row } from '@/types/database'

type Recipe = Row<'recipes'>

const orderFormLogger = createClientLogger('OrderItemsController')

export interface OrderItemBase {
  recipe_id: string
  product_name: string | null
  quantity: number
  unit_price: number
  total_price: number
  special_requests: string | null
}

interface FetchConfig {
  url?: string
  init?: RequestInit
}

export interface UseOrderItemsControllerOptions<TItem extends OrderItemBase> {
  items: TItem[]
  onItemsChange: (nextItems: TItem[]) => void
  createEmptyItem: () => TItem
  availableRecipes?: Recipe[]
  fetchConfig?: FetchConfig
  autoFetchRecipes?: boolean
  filterRecipe?: (recipe: Recipe) => boolean
  onRecipeSelected?: (recipe: Recipe, draftItem: TItem) => TItem
  deriveItemTotals?: (item: TItem, field: keyof TItem, value: TItem[keyof TItem]) => TItem
}

interface UseOrderItemsControllerResult<TItem extends OrderItemBase> {
  recipes: Recipe[]
  loadingRecipes: boolean
  recipeError: string | null
  addItem: () => void
  removeItem: (index: number) => void
  updateItem: <K extends keyof TItem>(index: number, field: K, value: TItem[K]) => void
  selectRecipe: (index: number, recipeId: string) => void
  reloadRecipes: () => Promise<void>
}

const defaultFetchConfig: FetchConfig = {
  url: '/api/recipes',
  init: {
    credentials: 'include'
  }
}

const defaultDeriveTotals = <TItem extends OrderItemBase>(
  item: TItem,
  field: keyof TItem,
  _value: TItem[keyof TItem]
): TItem => {
  if (field === 'quantity' || field === 'unit_price') {
    const quantity = Number(item.quantity) || 0
    const unitPrice = Number(item.unit_price) || 0
    return {
      ...item,
      total_price: quantity * unitPrice
    }
  }
  return item
}

/**
 * Shared order-item management hook used by all order form variants.
 * Responsibilities:
 * - Fetch and normalize recipe lists (or accept pre-fetched recipes).
 - Provide add/update/remove helpers that keep totals in sync.
 * - Support both manual item entry and recipe pickers (through `selectRecipe`).
 * - Allow per-form customization via callbacks (e.g., extra fields, memoized totals).
 *
 * Usage pattern:
 * ```ts
 * const {
 *   recipes,
 *   addItem,
 *   updateItem,
 *   removeItem,
 *   selectRecipe,
 * } = useOrderItemsController({
 *   items: formData.order_items,
 *   onItemsChange: (items) => setFormData(prev => ({ ...prev, order_items: items })),
 *   createEmptyItem: () => ({ ...defaultFields }),
 *   availableRecipes, // optional
 *   onRecipeSelected: (recipe, item) => ({ ...item, unit_price: recipe.selling_price ?? 0 }),
 *   deriveItemTotals: (item, field) => ({ ...item, total_price: item.unit_price * item.quantity })
 * })
 * ```
 *
 * Providing a single source of truth here keeps every order form (classic, enhanced, modular)
 * aligned and allows future variants to plug into the same behavior without re‑implementing
 * recipe fetching, price calculations, or optimistic updates.
 */
export const useOrderItemsController = <TItem extends OrderItemBase>(
  options: UseOrderItemsControllerOptions<TItem>
): UseOrderItemsControllerResult<TItem> => {
  const {
    items,
    onItemsChange,
    createEmptyItem,
    availableRecipes,
    fetchConfig = defaultFetchConfig,
    autoFetchRecipes = !availableRecipes,
    filterRecipe,
    onRecipeSelected,
    deriveItemTotals
  } = options

  const [recipes, setRecipes] = useState<Recipe[]>(availableRecipes ?? [])
  const [loadingRecipes, setLoadingRecipes] = useState(false)
  const [recipeError, setRecipeError] = useState<string | null>(null)

  const normalizedRecipes = useMemo(() => {
    return availableRecipes ? (filterRecipe ? availableRecipes.filter(filterRecipe) : availableRecipes) : []
  }, [availableRecipes, filterRecipe])

  useEffect(() => {
    setRecipes(normalizedRecipes)
  }, [normalizedRecipes])

  const fetchRecipes = useCallback(async () => {
    if (!autoFetchRecipes) {
      return
    }

    try {
      setLoadingRecipes(true)
      setRecipeError(null)

      const response = await fetch(fetchConfig.url ?? defaultFetchConfig.url!, fetchConfig.init ?? defaultFetchConfig.init)
      if (!response.ok) {
        throw new Error('Failed to fetch recipes')
      }

      const payload = await response.json() as unknown
      const recipeList: Recipe[] = Array.isArray(payload)
        ? (payload as Recipe[]).filter((item) => isRecipe(item))
        : []

      setRecipes(filterRecipe ? recipeList.filter(filterRecipe) : recipeList)
    } catch (error) {
      orderFormLogger.error({ error }, 'Failed to fetch recipes')
      setRecipeError((error as Error).message)
    } finally {
      setLoadingRecipes(false)
    }
  }, [autoFetchRecipes, fetchConfig, filterRecipe])

  useEffect(() => {
    if (!availableRecipes) {
      void fetchRecipes()
    }
  }, [availableRecipes, fetchRecipes])

  const applyItemsChange = useCallback(
    (updater: (current: TItem[]) => TItem[]) => {
      const nextItems = updater(items)
      onItemsChange(nextItems)
    },
    [items, onItemsChange]
  )

  const addItem = useCallback(() => {
    applyItemsChange((current) => [...current, createEmptyItem()])
  }, [applyItemsChange, createEmptyItem])

  const removeItem = useCallback(
    (index: number) => {
      applyItemsChange((current) => current.filter((_, idx) => idx !== index))
    },
    [applyItemsChange]
  )

  const updateItem = useCallback(
    <K extends keyof TItem>(index: number, field: K, value: TItem[K]) => {
      applyItemsChange((current) =>
        current.map((item, idx) => {
          if (idx !== index) {
            return item
          }

          const updatedItem = {
            ...item,
            [field]: value
          }

          const derive = deriveItemTotals ?? defaultDeriveTotals
          return derive(updatedItem, field, value)
        })
      )
    },
    [applyItemsChange, deriveItemTotals]
  )

  const selectRecipe = useCallback(
    (index: number, recipeId: string) => {
      if (recipeId === 'placeholder') {
        return
      }

      const recipe = recipes.find((entry) => entry['id'] === recipeId)
      if (!recipe) {
        return
      }

      applyItemsChange((current) =>
        current.map((item, idx) => {
          if (idx !== index) {
            return item
          }

          const baseItem = {
            ...item,
            recipe_id: recipeId,
            product_name: recipe.name,
            unit_price: recipe.selling_price ?? item.unit_price,
            total_price: (recipe.selling_price ?? item.unit_price) * item.quantity
          }

          return onRecipeSelected ? onRecipeSelected(recipe, baseItem) : baseItem
        })
      )
    },
    [applyItemsChange, onRecipeSelected, recipes]
  )

  const recipeState = useMemo(
    () => ({
      recipes,
      loadingRecipes,
      recipeError
    }),
    [recipes, loadingRecipes, recipeError]
  )

  return {
    ...recipeState,
    addItem,
    removeItem,
    updateItem,
    selectRecipe,
    reloadRecipes: fetchRecipes
  }
}
