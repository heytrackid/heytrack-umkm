// Customers Store - Zustand Implementation
// Customer relationship management

import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

import { dbLogger } from '@/lib/logger'
import type { Customer, SyncEvent } from '@/lib/data-synchronization/types'
import { syncEmitter } from '@/lib/data-synchronization/sync-events'

interface CustomersStore {
  // Data
  customers: Customer[]

  // Sync state
  syncEvents: SyncEvent[]
  lastSyncTime: Date
  isOnline: boolean

  // Actions
  updateCustomer: (id: string, updates: Partial<Customer>) => void
  addCustomer: (customer: Omit<Customer, 'id' | 'lastUpdated'>) => void
  removeCustomer: (id: string) => void

  // Business logic
  findCustomerByPhone: (phone: string) => Customer | undefined
  getTopCustomers: (limit?: number) => Customer[]

  // Sync functions
  emitSyncEvent: (event: Omit<SyncEvent, 'timestamp'>) => void
  syncCrossPlatform: () => Promise<void>
}

const initialCustomers: Customer[] = []

export const useCustomersStore = create<CustomersStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    customers: initialCustomers,
    syncEvents: [],
    lastSyncTime: new Date(),
    isOnline: true,

    // Actions
    updateCustomer: (id, updates) => {
      set((state) => ({
        customers: state.customers.map(customer =>
          customer.id === id
            ? { ...customer, ...updates, lastUpdated: new Date() }
            : customer
        )
      }))

      get().emitSyncEvent({
        type: 'customer_updated',
        payload: { id, updates },
        source: 'customers-store'
      })

      dbLogger.info(`Customer updated: ${id}`)
    },

    addCustomer: (customerData) => {
      const newCustomer: Customer = {
        ...customerData,
        id: Date.now().toString(),
        lastUpdated: new Date()
      }

      set((state) => ({
        customers: [...state.customers, newCustomer]
      }))

      dbLogger.info(`Customer added: ${newCustomer.nama}`)
    },

    removeCustomer: (id) => {
      set((state) => ({
        customers: state.customers.filter(customer => customer.id !== id)
      }))

      dbLogger.info(`Customer removed: ${id}`)
    },

    // Business logic
    findCustomerByPhone: (phone) => get().customers.find(customer => customer.nomorTelepon === phone),

    getTopCustomers: (limit = 10) => 
      // Sort by total orders or revenue (would need order data integration)
       get().customers.slice(0, limit)
    ,

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
      dbLogger.info('Customers store synced cross-platform')
    }
  }))
)
