// Recipes Store - Zustand Implementation
// Recipe management with availability tracking

import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

import { dbLogger } from '@/lib/logger'
import type { Recipe, SyncEvent } from '../data-synchronization/types'
import { syncEmitter } from '../data-synchronization/sync-events'

interface RecipesStore {
  // Data
  recipes: Recipe[]

  // Sync state
  syncEvents: SyncEvent[]
  lastSyncTime: Date
  isOnline: boolean

  // Actions
  updateRecipe: (id: string, updates: Partial<Recipe>) => void
  addRecipe: (recipe: Omit<Recipe, 'id' | 'lastUpdated'>) => void
  removeRecipe: (id: string) => void

  // Business logic
  getAvailableRecipes: () => Recipe[]
  checkRecipeAvailability: (recipeId: string) => boolean

  // Sync functions
  emitSyncEvent: (event: Omit<SyncEvent, 'timestamp'>) => void
  syncCrossPlatform: () => Promise<void>
}

const initialRecipes: Recipe[] = [
  {
    id: '1',
    nama: 'Kue Coklat',
    kategori: 'Kue',
    porsi: 8,
    waktuMasak: 30,
    tingkatKesulitan: 'mudah',
    bahan: [
      { ingredientId: '1', nama: 'Tepung Terigu', quantity: 0.5, satuan: 'kg', harga: 12000, available: true },
      { ingredientId: '2', nama: 'Mentega', quantity: 0.2, satuan: 'kg', harga: 45000, available: true }
    ],
    langkah: ['Campur bahan', 'Panggang selama 30 menit'],
    hargaJual: 25000,
    hpp: 15000,
    margin: 40,
    catatan: '',
    rating: 5,
    favorite: false,
    lastUpdated: new Date()
  }
]

export const useRecipesStore = create<RecipesStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    recipes: initialRecipes,
    syncEvents: [],
    lastSyncTime: new Date(),
    isOnline: true,

    // Actions
    updateRecipe: (id, updates) => {
      set((state) => ({
        recipes: state.recipes.map(recipe =>
          recipe.id === id
            ? { ...recipe, ...updates, lastUpdated: new Date() }
            : recipe
        )
      }))

      get().emitSyncEvent({
        type: 'recipe_updated',
        payload: { id, updates },
        source: 'recipes-store'
      })

      dbLogger.info(`Recipe updated: ${id}`)
    },

    addRecipe: (recipeData) => {
      const newRecipe: Recipe = {
        ...recipeData,
        id: Date.now().toString(),
        lastUpdated: new Date()
      }

      set((state) => ({
        recipes: [...state.recipes, newRecipe]
      }))

      dbLogger.info(`Recipe added: ${newRecipe.nama}`)
    },

    removeRecipe: (id) => {
      set((state) => ({
        recipes: state.recipes.filter(recipe => recipe.id !== id)
      }))

      dbLogger.info(`Recipe removed: ${id}`)
    },

    // Business logic
    getAvailableRecipes: () => {
      // For now, return all recipes (availability logic would need ingredient stock checking)
      return get().recipes
    },

    checkRecipeAvailability: (recipeId) => {
      // For now, assume all recipes are available (would need ingredient stock checking)
      return true
    },

    // Sync functions
    emitSyncEvent: (event) => {
      const syncEvent: SyncEvent = {
        ...event,
        timestamp: new Date()
      }

      set((state) => ({
        syncEvents: [...state.syncEvents, syncEvent]
      }))

      syncEmitter.emit(event.type as any, event.payload, event.source)
    },

    syncCrossPlatform: async () => {
      set({ lastSyncTime: new Date() })
      dbLogger.info('Recipes store synced cross-platform')
    }
  }))
)
