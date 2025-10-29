# Realtime Setup - Complete ✅

**Tanggal:** 29 Oktober 2025  
**Status:** ✅ Berhasil Diaktifkan

## 📡 Tabel dengan Realtime Enabled

Semua tabel penting sudah diaktifkan realtime subscription:

### Core Business Tables
- ✅ `ingredients` - Real-time stock updates
- ✅ `recipes` - Recipe changes
- ✅ `recipe_ingredients` - Ingredient composition
- ✅ `customers` - Customer data
- ✅ `suppliers` - Supplier information
- ✅ `supplier_ingredients` - Supplier pricing

### Order Management
- ✅ `orders` - Order status & updates
- ✅ `order_items` - Order line items
- ✅ `payments` - Payment tracking

### Inventory & Stock
- ✅ `stock_transactions` - Stock movements
- ✅ `ingredient_purchases` - Purchase history
- ✅ `inventory_alerts` - Low stock alerts

### Production
- ✅ `productions` - Production records
- ✅ `production_batches` - Batch tracking

### Financial
- ✅ `expenses` - Expense tracking
- ✅ `operational_costs` - Operational expenses
- ✅ `financial_records` - Financial transactions

### HPP & Analytics
- ✅ `hpp_snapshots` - HPP calculations
- ✅ `hpp_alerts` - Cost alerts

### System
- ✅ `notifications` - System notifications

---

## 🚀 Cara Menggunakan Realtime

### 1. Subscribe to Table Changes

```typescript
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import type { Database } from '@/types/supabase-generated'

type Order = Database['public']['Tables']['orders']['Row']

export function useRealtimeOrders(userId: string) {
  const [orders, setOrders] = useState<Order[]>([])
  const supabase = createClient()

  useEffect(() => {
    // Initial fetch
    const fetchOrders = async () => {
      const { data } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      
      if (data) setOrders(data)
    }
    
    fetchOrders()

    // Subscribe to changes
    const channel = supabase
      .channel('orders-realtime')
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${userId}` // RLS filter
        },
        (payload) => {
          console.log('Order changed:', payload)
          
          if (payload.eventType === 'INSERT') {
            setOrders(prev => [payload.new as Order, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setOrders(prev => 
              prev.map(order => 
                order.id === payload.new.id ? payload.new as Order : order
              )
            )
          } else if (payload.eventType === 'DELETE') {
            setOrders(prev => 
              prev.filter(order => order.id !== payload.old.id)
            )
          }
        }
      )
      .subscribe()

    // Cleanup
    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  return orders
}
```

### 2. Subscribe to Specific Record

```typescript
export function useRealtimeOrder(orderId: string) {
  const [order, setOrder] = useState<Order | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const channel = supabase
      .channel(`order-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`
        },
        (payload) => {
          setOrder(payload.new as Order)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [orderId])

  return order
}
```

### 3. Subscribe to Multiple Tables

```typescript
export function useRealtimeInventory(userId: string) {
  const supabase = createClient()

  useEffect(() => {
    const channel = supabase
      .channel('inventory-updates')
      // Listen to ingredients
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ingredients',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('Ingredient changed:', payload)
          // Refresh ingredients list
        }
      )
      // Listen to stock transactions
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'stock_transactions',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('Stock transaction:', payload)
          // Update stock display
        }
      )
      // Listen to inventory alerts
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'inventory_alerts',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('New alert:', payload)
          // Show notification
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])
}
```

### 4. Presence (User Online Status)

```typescript
export function usePresence(userId: string) {
  const supabase = createClient()

  useEffect(() => {
    const channel = supabase.channel('online-users')
    
    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        console.log('Online users:', state)
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences)
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: userId,
            online_at: new Date().toISOString()
          })
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])
}
```

### 5. Broadcast (Real-time Messages)

```typescript
export function useBroadcast(roomId: string) {
  const supabase = createClient()

  const sendMessage = async (message: string) => {
    const channel = supabase.channel(roomId)
    await channel.send({
      type: 'broadcast',
      event: 'message',
      payload: { message }
    })
  }

  useEffect(() => {
    const channel = supabase
      .channel(roomId)
      .on('broadcast', { event: 'message' }, (payload) => {
        console.log('Received message:', payload)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [roomId])

  return { sendMessage }
}
```

---

## 🎯 Use Cases

### 1. Live Order Dashboard
```typescript
// Show real-time order updates
const orders = useRealtimeOrders(userId)

return (
  <div>
    {orders.map(order => (
      <OrderCard key={order.id} order={order} />
    ))}
  </div>
)
```

### 2. Stock Level Monitoring
```typescript
// Alert when stock is low
useEffect(() => {
  const channel = supabase
    .channel('stock-alerts')
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'ingredients',
        filter: `user_id=eq.${userId}`
      },
      (payload) => {
        const ingredient = payload.new
        if (ingredient.current_stock < ingredient.min_stock) {
          toast.warning(`Low stock: ${ingredient.name}`)
        }
      }
    )
    .subscribe()

  return () => supabase.removeChannel(channel)
}, [userId])
```

### 3. HPP Alert Notifications
```typescript
// Show HPP increase alerts
useEffect(() => {
  const channel = supabase
    .channel('hpp-alerts')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'hpp_alerts',
        filter: `user_id=eq.${userId}`
      },
      (payload) => {
        const alert = payload.new
        toast.error(`HPP Alert: ${alert.title}`)
      }
    )
    .subscribe()

  return () => supabase.removeChannel(channel)
}, [userId])
```

### 4. Collaborative Editing
```typescript
// Multiple users editing same recipe
const channel = supabase
  .channel(`recipe-${recipeId}`)
  .on('presence', { event: 'sync' }, () => {
    const users = channel.presenceState()
    setActiveUsers(Object.keys(users).length)
  })
  .on('broadcast', { event: 'field-update' }, (payload) => {
    // Update field in real-time
    updateField(payload.field, payload.value)
  })
  .subscribe()
```

---

## ⚠️ Best Practices

### 1. Always Filter by user_id
```typescript
// ✅ CORRECT - RLS filter
filter: `user_id=eq.${userId}`

// ❌ WRONG - No filter (will fail with RLS)
filter: undefined
```

### 2. Cleanup Subscriptions
```typescript
// ✅ CORRECT - Cleanup in useEffect
useEffect(() => {
  const channel = supabase.channel('my-channel')
  // ... subscribe
  
  return () => {
    supabase.removeChannel(channel)
  }
}, [])
```

### 3. Handle Connection States
```typescript
channel.subscribe((status) => {
  if (status === 'SUBSCRIBED') {
    console.log('Connected')
  } else if (status === 'CHANNEL_ERROR') {
    console.error('Connection error')
  } else if (status === 'TIMED_OUT') {
    console.error('Connection timeout')
  }
})
```

### 4. Debounce Updates
```typescript
import { useDebouncedCallback } from 'use-debounce'

const handleUpdate = useDebouncedCallback((payload) => {
  // Update UI
}, 300)

channel.on('postgres_changes', { ... }, handleUpdate)
```

### 5. Optimize Payload Size
```typescript
// ✅ CORRECT - Select only needed fields
const { data } = await supabase
  .from('orders')
  .select('id, status, total_amount')
  .eq('user_id', userId)

// ❌ WRONG - Select all fields
const { data } = await supabase
  .from('orders')
  .select('*')
  .eq('user_id', userId)
```

---

## 📊 Performance Tips

1. **Limit Subscriptions**: Don't subscribe to too many channels at once
2. **Use Filters**: Always filter by user_id and other relevant fields
3. **Batch Updates**: Debounce rapid updates
4. **Cleanup**: Always remove channels when component unmounts
5. **Error Handling**: Handle connection errors gracefully

---

## 🔗 Resources

- [Supabase Realtime Docs](https://supabase.com/docs/guides/realtime)
- [Realtime Broadcast](https://supabase.com/docs/guides/realtime/broadcast)
- [Realtime Presence](https://supabase.com/docs/guides/realtime/presence)
- [Postgres Changes](https://supabase.com/docs/guides/realtime/postgres-changes)

---

**Status:** ✅ Realtime fully configured and ready to use!
