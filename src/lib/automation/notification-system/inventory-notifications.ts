import type { SmartNotification, Ingredient } from '@/lib/automation/notification-system/types'

/**
 * Inventory Notifications Module
 * Handles inventory-related notification generation
 */


export class InventoryNotifications {
  /**
   * Generate inventory-related notifications
   */
  static generateInventoryNotifications(inventory: Ingredient[]): SmartNotification[] {
    const notifications: SmartNotification[] = []
    const now = new Date()

    inventory.forEach(ingredient => {
      // Critical stock level
      if ((ingredient.current_stock ?? 0) <= (ingredient.min_stock ?? 0) * 0.5) {
        notifications.push({
          type: 'critical',
          category: 'inventory',
          title: `Stok ${ingredient.name} KRITIS!`,
          message: `Tersisa ${ingredient.current_stock ?? 0} ${ingredient.unit}. Segera restock untuk menghindari kehabisan.`,
          action: 'reorder_ingredient',
          priority: 'high',
          timestamp: now,
          data: {
            ingredientId: ingredient['id'],
            currentStock: ingredient.current_stock ?? 0,
            minStock: ingredient.min_stock ?? 0,
            unit: ingredient.unit
          }
        })
      }
      // Low stock level
      else if ((ingredient.current_stock ?? 0) <= (ingredient.min_stock ?? 0)) {
        notifications.push({
          type: 'warning',
          category: 'inventory',
          title: `Stok ${ingredient.name} Menipis`,
          message: `Stok tersisa ${ingredient.current_stock ?? 0} ${ingredient.unit}. Pertimbangkan untuk restock.`,
          action: 'review_inventory',
          priority: 'medium',
          timestamp: now,
          data: {
            ingredientId: ingredient['id'],
            currentStock: ingredient.current_stock ?? 0,
            minStock: ingredient.min_stock ?? 0,
            unit: ingredient.unit
          }
        })
      }
      // Overstocked
      else if ((ingredient.current_stock ?? 0) > (ingredient.min_stock ?? 0) * 4) {
        notifications.push({
          type: 'info',
          category: 'inventory',
          title: `${ingredient.name} Overstocked`,
          message: `Stok ${ingredient.current_stock ?? 0} ${ingredient.unit} mungkin berlebihan. Pertimbangkan untuk mengurangi pembelian.`,
          action: 'optimize_inventory',
          priority: 'low',
          timestamp: now,
          data: {
            ingredientId: ingredient['id'],
            currentStock: ingredient.current_stock ?? 0,
            recommendedMax: ingredient.min_stock ?? 0 * 3
          }
        })
      }
    })

    // Overall inventory health
    const lowStockCount = inventory.filter(ing => (ing.current_stock ?? 0) <= (ing.min_stock ?? 0)).length
    const criticalStockCount = inventory.filter(ing => (ing.current_stock ?? 0) <= (ing.min_stock ?? 0) * 0.5).length

    if (criticalStockCount > 3) {
      notifications.push({
        type: 'critical',
        category: 'inventory',
        title: 'Krisis Stok Multiple Items!',
        message: `${criticalStockCount} bahan dalam kondisi stok kritis. Perlu restock segera.`,
        action: 'bulk_reorder',
        priority: 'high',
        timestamp: now,
        data: { criticalCount: criticalStockCount }
      })
    } else if (lowStockCount > 5) {
      notifications.push({
        type: 'warning',
        category: 'inventory',
        title: 'Multiple Items Low Stock',
        message: `${lowStockCount} bahan memiliki stok rendah. Review kebutuhan restock.`,
        action: 'review_multiple_inventory',
        priority: 'medium',
        timestamp: now,
        data: { lowStockCount }
      })
    }

    return notifications
  }
}
