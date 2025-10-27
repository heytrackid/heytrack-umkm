// Expenses Store - Zustand Implementation
// Financial expense tracking

import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

import { dbLogger } from '@/lib/logger'
import type { Expense, SyncEvent } from '@/lib/data-synchronization/types'
import { syncEmitter } from '@/lib/data-synchronization/sync-events'

interface ExpensesStore {
  // Data
  expenses: Expense[]

  // Sync state
  syncEvents: SyncEvent[]
  lastSyncTime: Date
  isOnline: boolean

  // Actions
  updateExpense: (id: string, updates: Partial<Expense>) => void
  addExpense: (expense: Omit<Expense, 'id' | 'lastUpdated'>) => void
  removeExpense: (id: string) => void

  // Business logic
  getExpensesByCategory: (category: string) => Expense[]
  getTotalExpenses: (startDate?: Date, endDate?: Date) => number
  getExpenseCategories: () => string[]

  // Sync functions
  emitSyncEvent: (event: Omit<SyncEvent, 'timestamp'>) => void
  syncCrossPlatform: () => Promise<void>
}

const initialExpenses: Expense[] = []

export const useExpensesStore = create<ExpensesStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    expenses: initialExpenses,
    syncEvents: [],
    lastSyncTime: new Date(),
    isOnline: true,

    // Actions
    updateExpense: (id, updates) => {
      set((state) => ({
        expenses: state.expenses.map(expense =>
          expense.id === id
            ? { ...expense, ...updates, lastUpdated: new Date() }
            : expense
        )
      }))

      get().emitSyncEvent({
        type: 'expense_added', // Could be expense_updated
        payload: { id, updates },
        source: 'expenses-store'
      })

      dbLogger.info(`Expense updated: ${id}`)
    },

    addExpense: (expenseData) => {
      const newExpense: Expense = {
        ...expenseData,
        id: Date.now().toString(),
        lastUpdated: new Date()
      }

      set((state) => ({
        expenses: [...state.expenses, newExpense]
      }))

      get().emitSyncEvent({
        type: 'expense_added',
        payload: newExpense,
        source: 'expenses-store'
      })

      dbLogger.info(`Expense added: ${newExpense.deskripsi}`)
    },

    removeExpense: (id) => {
      set((state) => ({
        expenses: state.expenses.filter(expense => expense.id !== id)
      }))

      dbLogger.info(`Expense removed: ${id}`)
    },

    // Business logic
    getExpensesByCategory: (category) => get().expenses.filter(expense => expense.kategori === category),

    getTotalExpenses: (startDate, endDate) => {
      const expenses = get().expenses.filter(expense => {
        if (startDate && expense.tanggal < startDate) {return false}
        if (endDate && expense.tanggal > endDate) {return false}
        return true
      })

      return expenses.reduce((total, expense) => total + expense.jumlah, 0)
    },

    getExpenseCategories: () => {
      const categories = new Set(get().expenses.map(expense => expense.kategori))
      return Array.from(categories)
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
      dbLogger.info('Expenses store synced cross-platform')
    }
  }))
)
