// Orders Store - Zustand Implementation
// Order processing with stock consumption tracking

import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

import { dbLogger } from '@/lib/logger'
import type { Order, OrderItem, SyncEvent } from '../data-synchronization/types'
import { syncEmitter } from '../data-synchronization/sync-events'

interface OrdersStore {
  // Data
  orders: Order[]

  // Sync state
  syncEvents: SyncEvent[]
  lastSyncTime: Date
  isOnline: boolean

  // Actions
  updateOrder: (id: string, updates: Partial<Order>) => void
  addOrder: (order: Omit<Order, 'id' | 'lastUpdated'>) => void
  removeOrder: (id: string) => void

  // Business logic
  getPendingOrders: () => Order[]
  getOrdersByStatus: (status: Order['status']) => Order[]
  calculateTotalRevenue: () => number

  // Stock consumption tracking
  consumeStockForOrder: (orderId: string) => Promise<void>

  // Sync functions
  emitSyncEvent: (event: Omit<SyncEvent, 'timestamp'>) => void
  syncCrossPlatform: () => Promise<void>
}

const initialOrders: Order[] = []

export const useOrdersStore = create<OrdersStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    orders: initialOrders,
    syncEvents: [],
    lastSyncTime: new Date(),
    isOnline: true,

    // Actions
    updateOrder: (id, updates) => {
      set((state) => ({
        orders: state.orders.map(order =>
          order.id === id
            ? { ...order, ...updates, lastUpdated: new Date() }
            : order
        )
      }))

      get().emitSyncEvent({
        type: 'order_updated',
        payload: { id, updates },
        source: 'orders-store'
      })

      dbLogger.info(`Order updated: ${id}`)
    },

    addOrder: (orderData) => {
      const newOrder: Order = {
        ...orderData,
        id: Date.now().toString(),
        lastUpdated: new Date()
      }

      set((state) => ({
        orders: [...state.orders, newOrder]
      }))

      // Emit stock consumption event
      get().consumeStockForOrder(newOrder.id)

      dbLogger.info(`Order added: ${newOrder.id}`)
    },

    removeOrder: (id) => {
      set((state) => ({
        orders: state.orders.filter(order => order.id !== id)
      }))

      dbLogger.info(`Order removed: ${id}`)
    },

    // Business logic
    getPendingOrders: () => {
      return get().orders.filter(order => order.status === 'pending')
    },

    getOrdersByStatus: (status) => {
      return get().orders.filter(order => order.status === status)
    },

    calculateTotalRevenue: () => {
      return get().orders.reduce((total, order) => total + order.totalHarga, 0)
    },

    // Stock consumption tracking
    consumeStockForOrder: async (orderId) => {
      // This would integrate with ingredients store to consume stock
      // For now, just emit an event
      get().emitSyncEvent({
        type: 'stock_consumed',
        payload: { orderId },
        source: 'orders-store'
      })

      dbLogger.info(`Stock consumed for order: ${orderId}`)
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
      dbLogger.info('Orders store synced cross-platform')
    }
  }))
)
