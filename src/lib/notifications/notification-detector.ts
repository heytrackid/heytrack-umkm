// Smart notification detection logic

import type { Row } from '@/types/database'

import { 
  type Notification, 
  type NotificationType,
  NOTIFICATION_CONFIGS 
} from './notification-types'


// Generate unique notification ID
function generateNotificationId(type: NotificationType, itemId: string): string {
  return `${type}-${itemId}-${Date.now()}`
}

// Create notification object
function createNotification(
  type: NotificationType,
  title: string,
  message: string,
  options?: {
    actionUrl?: string
    actionLabel?: string
    metadata?: Record<string, unknown>
  }
): Notification {
  const config = NOTIFICATION_CONFIGS[type]
  const { actionUrl, actionLabel, metadata } = options || {}

  return {
    id: generateNotificationId(type, (metadata?.['itemId'] as string) || 'system'),
    type,
    priority: config.defaultPriority,
    title,
    message,
    timestamp: new Date(),
    read: false,
    actionUrl,
    actionLabel,
    metadata,
    icon: config.icon,
    color: config.color
  }
}

// Stock notification detectors
export function detectStockNotifications(ingredients: Array<Row<'ingredients'>>): Notification[] {
  const notifications: Notification[] = []

  ingredients.forEach((ingredient) => {
    const currentStock = ingredient.current_stock ?? 0
    const minStock = ingredient.min_stock ?? 0
    const {name} = ingredient

    // Critical: Out of stock
    if (currentStock <= 0) {
      notifications.push(
        createNotification(
          'stock_out',
          `${name} habis!`,
          `Stok ${name} sudah habis. Segera lakukan pemesanan untuk menghindari gangguan produksi.`,
          {
            actionUrl: `/ingredients?highlight=${ingredient['id']}`,
            actionLabel: 'Lihat Detail',
            metadata: { itemId: ingredient['id'], itemName: name, currentStock, minStock }
          }
        )
      )
    }
    // High: Critical low (< 20% of min stock)
    else if (currentStock < minStock * 0.2) {
      notifications.push(
        createNotification(
          'stock_critical',
          `${name} sangat menipis!`,
          `Stok ${name} tinggal ${currentStock} ${ingredient.unit}. Segera pesan sebelum habis!`,
          {
            actionUrl: `/ingredients?highlight=${ingredient['id']}`,
            actionLabel: 'Pesan Sekarang',
            metadata: { itemId: ingredient['id'], itemName: name, currentStock, minStock }
          }
        )
      )
    }
    // Medium: Low stock (below min)
    else if (currentStock <= minStock) {
      notifications.push(
        createNotification(
          'stock_low',
          `${name} menipis`,
          `Stok ${name} tinggal ${currentStock} ${ingredient.unit}. Pertimbangkan untuk melakukan reorder.`,
          {
            actionUrl: `/ingredients?highlight=${ingredient['id']}`,
            actionLabel: 'Lihat Detail',
            metadata: { itemId: ingredient['id'], itemName: name, currentStock, minStock }
          }
        )
      )
    }
  })

  return notifications
}

// Order notification detectors
export function detectOrderNotifications(orders: Array<Row<'orders'>>): Notification[] {
  const notifications: Notification[] = []
  const now = new Date()

  orders.forEach((order) => {
    // Pending orders
    if (order['status'] === 'PENDING') {
      const orderDate = new Date(order.created_at ?? now)
      const hoursSincePending = (now.getTime() - orderDate.getTime()) / (1000 * 60 * 60)

      if (hoursSincePending > 24) {
        notifications.push(
          createNotification(
            'order_overdue',
            'Pesanan tertunda',
            `Pesanan #${order['id'].slice(0, 8)} belum diproses lebih dari 24 jam.`,
            {
              actionUrl: `/orders?highlight=${order['id']}`,
              actionLabel: 'Proses Pesanan',
              metadata: { itemId: order['id'], hoursPending: Math.floor(hoursSincePending) }
            }
          )
        )
      }
    }

    // Overdue delivery
    if (order['status'] === 'IN_PROGRESS' && order.delivery_date) {
      const deliveryDate = new Date(order.delivery_date)
      if (deliveryDate < now) {
        notifications.push(
          createNotification(
            'order_overdue',
            'Pesanan melewati batas',
            `Pesanan #${order['id'].slice(0, 8)} melewati tanggal pengiriman.`,
            {
              actionUrl: `/orders?highlight=${order['id']}`,
              actionLabel: 'Lihat Pesanan',
              metadata: { itemId: order['id'], deliveryDate: order.delivery_date }
            }
          )
        )
      }
    }
  })

  return notifications
}

// Cost increase detector
export function detectCostIncreaseNotifications(
  ingredients: Array<Row<'ingredients'>>,
  previousPrices: Record<string, number>
): Notification[] {
  const notifications: Notification[] = []

  ingredients.forEach((ingredient) => {
    const currentPrice = ingredient.price_per_unit ?? 0
    const previousPrice = previousPrices[ingredient['id']]

    if (previousPrice && currentPrice > previousPrice) {
      const increasePercent = ((currentPrice - previousPrice) / previousPrice) * 100

      if (increasePercent > 10) {
        notifications.push(
          createNotification(
            'cost_increase',
            `Harga ${ingredient.name} naik`,
            `Harga ${ingredient.name} naik ${increasePercent.toFixed(1)}% dari ${previousPrice} ke ${currentPrice}.`,
            {
              actionUrl: `/ingredients?highlight=${ingredient['id']}`,
              actionLabel: 'Lihat Detail',
              metadata: {
                itemId: ingredient['id'],
                itemName: ingredient.name,
                previousPrice,
                currentPrice,
                increasePercent
              }
            }
          )
        )
      }
    }
  })

  return notifications
}

// Aggregate all notifications
export function detectAllNotifications(data: {
  ingredients?: Array<Row<'ingredients'>>
  orders?: Array<Row<'orders'>>
  previousPrices?: Record<string, number>
}): Notification[] {
  const notifications: Notification[] = []

  if (data.ingredients) {
    notifications.push(...detectStockNotifications(data.ingredients))
  }

  if (data.orders) {
    notifications.push(...detectOrderNotifications(data.orders))
  }

  if (data.ingredients && data.previousPrices) {
    notifications.push(...detectCostIncreaseNotifications(data.ingredients, data.previousPrices))
  }

  // Sort by priority (critical > high > medium > low)
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
  notifications.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])

  return notifications
}
