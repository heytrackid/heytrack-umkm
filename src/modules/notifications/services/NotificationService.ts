import type { SupabaseClient } from '@supabase/supabase-js'
import type { Insert, Database, Json } from '@/types/database'
import type { CreateNotificationParams } from '@/types/domain/notifications'
import { apiLogger } from '@/lib/logger'



type NotificationInsert = Insert<'notifications'>

export class NotificationService {
  /**
   * Create a notification for a user
   */
  static async createNotification(
    supabase: SupabaseClient<Database>,
    userId: string,
    params: CreateNotificationParams
  ): Promise<void> {
    try {
      const metadata: Json | undefined = params.metadata
        ? JSON.parse(JSON.stringify(params.metadata)) as Json
        : undefined

      const notification: NotificationInsert = {
        user_id: userId,
        type: params.type,
        category: params.category,
        title: params.title,
        message: params.message,
        priority: params.priority ?? 'normal',
        entity_type: params.entity_type,
        entity_id: params.entity_id,
        action_url: params.action_url,
        metadata,
        expires_at: params.expires_at,
      }

      const { error } = await supabase
        .from('notifications')
        .insert(notification)

      if (error) {
        apiLogger.error({ error, userId, params }, 'Failed to create notification')
      }
    } catch (error: unknown) {
      apiLogger.error({ error, userId, params }, 'Error creating notification')
    }
  }

  /**
   * Create low stock alert notification
   */
  static async createLowStockAlert(
    supabase: SupabaseClient<Database>,
    userId: string,
    ingredientId: string,
    ingredientName: string,
    currentStock: number,
    minStock: number
  ): Promise<void> {
    await this.createNotification(supabase, userId, {
      type: 'warning',
      category: 'inventory',
      title: 'Stok Bahan Menipis',
      message: `${ingredientName} tersisa ${currentStock} (minimum: ${minStock})`,
      priority: 'high',
      entity_type: 'ingredient',
      entity_id: ingredientId,
      action_url: `/ingredients?highlight=${ingredientId}`,
      metadata: {
        ingredient_name: ingredientName,
        current_stock: currentStock,
        min_stock: minStock,
      },
    })
  }

  /**
   * Create HPP increase alert notification
   */
  static async createHppIncreaseAlert(
    supabase: SupabaseClient<Database>,
    userId: string,
    recipeId: string,
    recipeName: string,
    oldHpp: number,
    newHpp: number,
    changePercentage: number
  ): Promise<void> {
    await this.createNotification(supabase, userId, {
      type: 'alert',
      category: 'finance',
      title: 'HPP Meningkat',
      message: `HPP ${recipeName} naik ${changePercentage.toFixed(1)}% dari Rp ${oldHpp.toLocaleString('id-ID')} ke Rp ${newHpp.toLocaleString('id-ID')}`,
      priority: changePercentage > 20 ? 'urgent' : 'high',
      entity_type: 'recipe',
      entity_id: recipeId,
      action_url: `/recipes/${recipeId}`,
      metadata: {
        recipe_name: recipeName,
        old_hpp: oldHpp,
        new_hpp: newHpp,
        change_percentage: changePercentage,
      },
    })
  }

  /**
   * Create new order notification
   */
  static async createNewOrderNotification(
    supabase: SupabaseClient<Database>,
    userId: string,
    orderId: string,
    orderNo: string,
    customerName: string,
    totalAmount: number
  ): Promise<void> {
    await this.createNotification(supabase, userId, {
      type: 'info',
      category: 'orders',
      title: 'Pesanan Baru',
      message: `Pesanan ${orderNo} dari ${customerName} - Rp ${totalAmount.toLocaleString('id-ID')}`,
      priority: 'normal',
      entity_type: 'order',
      entity_id: orderId,
      action_url: `/orders/${orderId}`,
      metadata: {
        order_no: orderNo,
        customer_name: customerName,
        total_amount: totalAmount,
      },
    })
  }

  /**
   * Create order status change notification
   */
  static async createOrderStatusNotification(
    supabase: SupabaseClient<Database>,
    userId: string,
    orderId: string,
    orderNo: string,
    status: string
  ): Promise<void> {
    const statusMessages: Record<string, string> = {
      CONFIRMED: 'dikonfirmasi',
      IN_PROGRESS: 'sedang diproses',
      READY: 'siap diambil',
      DELIVERED: 'telah dikirim',
      CANCELLED: 'dibatalkan',
    }

    await this.createNotification(supabase, userId, {
      type: status === 'CANCELLED' ? 'warning' : 'success',
      category: 'orders',
      title: 'Status Pesanan Berubah',
      message: `Pesanan ${orderNo} ${statusMessages[status] || status}`,
      priority: 'normal',
      entity_type: 'order',
      entity_id: orderId,
      action_url: `/orders/${orderId}`,
      metadata: {
        order_no: orderNo,
        status,
      },
    })
  }

  /**
   * Create production completion notification
   */
  static async createProductionCompleteNotification(
    supabase: SupabaseClient<Database>,
    userId: string,
    productionId: string,
    recipeName: string,
    quantity: number
  ): Promise<void> {
    await this.createNotification(supabase, userId, {
      type: 'success',
      category: 'production',
      title: 'Produksi Selesai',
      message: `${recipeName} sebanyak ${quantity} unit telah selesai diproduksi`,
      priority: 'normal',
      entity_type: 'production',
      entity_id: productionId,
      action_url: `/production/${productionId}`,
      metadata: {
        recipe_name: recipeName,
        quantity,
      },
    })
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(
    supabase: SupabaseClient<Database>,
    userId: string,
    notificationId: string
  ): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true, updated_at: new Date().toISOString() })
      .eq('id', notificationId)
      .eq('user_id', userId)

    if (error) {
      apiLogger.error({ error, userId, notificationId }, 'Failed to mark notification as read')
    }
  }

  /**
   * Mark all notifications as read
   */
  static async markAllAsRead(
    supabase: SupabaseClient<Database>,
    userId: string,
    category?: string
  ): Promise<void> {
    let query = supabase
      .from('notifications')
      .update({ is_read: true, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('is_read', false)

    if (category) {
      query = query.eq('category', category)
    }

    const { error } = await query

    if (error) {
      apiLogger.error({ error, userId, category }, 'Failed to mark all notifications as read')
    }
  }

  /**
   * Dismiss notification
   */
  static async dismissNotification(
    supabase: SupabaseClient<Database>,
    userId: string,
    notificationId: string
  ): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ is_dismissed: true, updated_at: new Date().toISOString() })
      .eq('id', notificationId)
      .eq('user_id', userId)

    if (error) {
      apiLogger.error({ error, userId, notificationId }, 'Failed to dismiss notification')
    }
  }

  /**
   * Clean up expired notifications
   */
  static async cleanupExpiredNotifications(
    supabase: SupabaseClient<Database>,
    userId: string
  ): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', userId)
      .lt('expires_at', new Date().toISOString())

    if (error) {
      apiLogger.error({ error, userId }, 'Failed to cleanup expired notifications')
    }
  }
}
