// Sync Events System
// Event-driven synchronization for cross-module data integration

import type { Ingredient, Recipe, Order, Customer, Expense } from './types'

export interface SyncEvent {
  type: 'ingredient_updated' | 'recipe_updated' | 'order_created' | 'order_updated' |
        'customer_updated' | 'expense_added' | 'stock_consumed' | 'price_updated'
  payload: unknown
  timestamp: Date
  source: string
}

export interface SyncEventPayloads {
  ingredient_updated: { id: string; updates: Partial<Ingredient> }
  recipe_updated: { id: string; updates: Partial<Recipe> }
  order_created: Order
  order_updated: { id: string; updates: Partial<Order> }
  customer_updated: { id: string; updates: Partial<Customer> }
  expense_added: Expense
  stock_consumed: { orderItems: unknown[] }
  price_updated: { ingredientId: string; newPrice: number; oldPrice: number }
}

export type SyncEventType = keyof SyncEventPayloads
export type SyncEventData<T extends SyncEventType> = SyncEventPayloads[T]

export class SyncEventEmitter {
  private listeners: Map<SyncEventType, ((event: SyncEvent) => void)[]> = new Map()

  on<T extends SyncEventType>(eventType: T, listener: (event: SyncEvent & { payload: SyncEventData<T> }) => void) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, [])
    }
    this.listeners.get(eventType)!.push(listener as any)
  }

  off<T extends SyncEventType>(eventType: T, listener: (event: SyncEvent & { payload: SyncEventData<T> }) => void) {
    const listeners = this.listeners.get(eventType)
    if (listeners) {
      const index = listeners.indexOf(listener as any)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }

  emit<T extends SyncEventType>(eventType: T, payload: SyncEventData<T>, source: string = 'system') {
    const event: SyncEvent = {
      type: eventType,
      payload,
      timestamp: new Date(),
      source
    }

    const listeners = this.listeners.get(eventType)
    if (listeners) {
      listeners.forEach(listener => listener(event))
    }
  }

  clear() {
    this.listeners.clear()
  }
}

// Global sync event emitter instance
export const syncEmitter = new SyncEventEmitter()
