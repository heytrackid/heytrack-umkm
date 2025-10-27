// Ingredients Store - Zustand Implementation
// Ingredient inventory management with real-time sync

import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

import { dbLogger } from '@/lib/logger'
import type { Ingredient, SyncEvent } from '@/lib/data-synchronization/types'
import { syncEmitter } from '@/lib/data-synchronization/sync-events'

interface IngredientsStore {
  // Data
  ingredients: Ingredient[]

  // Sync state
  syncEvents: SyncEvent[]
  lastSyncTime: Date
  isOnline: boolean

  // Actions
  updateIngredient: (id: string, updates: Partial<Ingredient>) => void
  addIngredient: (ingredient: Omit<Ingredient, 'id' | 'lastUpdated'>) => void
  removeIngredient: (id: string) => void

  // Sync functions
  emitSyncEvent: (event: Omit<SyncEvent, 'timestamp'>) => void
  syncCrossPlatform: () => Promise<void>
}

const initialIngredients: Ingredient[] = [
  {
    id: '1',
    nama: 'Tepung Terigu',
    stok: 25,
    satuan: 'kg',
    harga: 12000,
    stokMinimal: 10,
    total: 300000,
    statusStok: 'aman',
    lastUpdated: new Date()
  },
  {
    id: '2',
    nama: 'Mentega',
    stok: 3,
    satuan: 'kg',
    harga: 45000,
    stokMinimal: 5,
    total: 135000,
    statusStok: 'rendah',
    lastUpdated: new Date()
  },
  {
    id: '3',
    nama: 'Telur',
    stok: 0,
    satuan: 'kg',
    harga: 28000,
    stokMinimal: 3,
    total: 0,
    statusStok: 'habis',
    lastUpdated: new Date()
  }
]

export const useIngredientsStore = create<IngredientsStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    ingredients: initialIngredients,
    syncEvents: [],
    lastSyncTime: new Date(),
    isOnline: true,

    // Actions
    updateIngredient: (id, updates) => {
      set((state) => ({
        ingredients: state.ingredients.map(ingredient =>
          ingredient.id === id
            ? { ...ingredient, ...updates, lastUpdated: new Date() }
            : ingredient
        )
      }))

      // Emit sync event
      get().emitSyncEvent({
        type: 'ingredient_updated',
        payload: { id, updates },
        source: 'ingredients-store'
      })

      dbLogger.info(`Ingredient updated: ${id}`)
    },

    addIngredient: (ingredientData) => {
      const newIngredient: Ingredient = {
        ...ingredientData,
        id: Date.now().toString(),
        lastUpdated: new Date()
      }

      set((state) => ({
        ingredients: [...state.ingredients, newIngredient]
      }))

      dbLogger.info(`Ingredient added: ${newIngredient.nama}`)
    },

    removeIngredient: (id) => {
      set((state) => ({
        ingredients: state.ingredients.filter(ingredient => ingredient.id !== id)
      }))

      dbLogger.info(`Ingredient removed: ${id}`)
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
      // Implement cross-platform sync logic here
      set({ lastSyncTime: new Date() })
      dbLogger.info('Ingredients store synced cross-platform')
    }
  }))
)
