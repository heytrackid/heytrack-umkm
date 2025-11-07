import 'server-only'
import { dbLogger } from '@/lib/logger'
import type { Row, Insert, Json } from '@/types/database'
import { typed } from '@/types/type-utilities'
import { createClient } from '@/utils/supabase/server'


type Notification = Row<'notifications'>

/**
 * Notification Service
 * Handles notification CRUD operations
 * SERVER-ONLY: Uses server client for database operations
 */
export class NotificationService {
  /**
   * Get notifications for a user with optional filters
   */
  static async getNotifications(
    userId: string,
    filters?: {
      unreadOnly?: boolean
      category?: string
      limit?: number
    }
  ): Promise<Notification[]> {
    try {
      const client = await createClient()
      const supabase = typed(client)

      let query = supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(filters?.limit ?? 50)

      // Filter by unread
      if (filters?.unreadOnly) {
        query = query.eq('is_read', false).eq('is_dismissed', false)
      }

      // Filter by category
      if (filters?.category) {
        query = query.eq('category', filters.category)
      }

      // Filter out expired notifications
      query = query.or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)

      const { data, error } = await query

      if (error) {
        throw error
      }

      return data || []

    } catch (error) {
      dbLogger.error({ error, userId, filters }, 'Failed to get notifications')
      throw error
    }
  }

  /**
   * Get unread notification count for a user
   */
  static async getUnreadCount(userId: string): Promise<number> {
    try {
      const client = await createClient()
      const supabase = typed(client)

      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false)
        .eq('is_dismissed', false)
        .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)

      return count ?? 0

    } catch (error) {
      dbLogger.error({ error, userId }, 'Failed to get unread notification count')
      return 0
    }
  }

  /**
   * Create a new notification
   */
  static async createNotification(
    userId: string,
    notificationData: {
      title: string
      message: string
      type?: string
      category?: string
       metadata?: Record<string, unknown>
      expires_at?: string
    }
  ): Promise<Notification> {
    try {
      const client = await createClient()
      const supabase = typed(client)

      const notificationInsert = {
        user_id: userId,
        title: notificationData.title,
        message: notificationData.message,
        type: notificationData['type'] ?? 'info',
        category: notificationData.category ?? 'general',
        ...(notificationData['metadata'] && { metadata: notificationData['metadata'] as Json }),
        ...(notificationData.expires_at && { expires_at: notificationData.expires_at }),
        is_read: false,
        is_dismissed: false
      } as Insert<'notifications'>

      const { data, error } = await supabase
        .from('notifications')
        .insert(notificationInsert)
        .select()
        .single()

      if (error) {
        throw error
      }

      return data as Notification

    } catch (error) {
      dbLogger.error({ error, userId, notificationData }, 'Failed to create notification')
      throw error
    }
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId: string, userId: string): Promise<void> {
    try {
      const client = await createClient()
      const supabase = typed(client)

      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, updated_at: new Date().toISOString() })
        .eq('id', notificationId)
        .eq('user_id', userId)

      if (error) {
        throw error
      }

    } catch (error) {
      dbLogger.error({ error, notificationId, userId }, 'Failed to mark notification as read')
      throw error
    }
  }

  /**
   * Mark notification as dismissed
   */
  static async dismissNotification(notificationId: string, userId: string): Promise<void> {
    try {
      const client = await createClient()
      const supabase = typed(client)

      const { error } = await supabase
        .from('notifications')
        .update({ is_dismissed: true, updated_at: new Date().toISOString() })
        .eq('id', notificationId)
        .eq('user_id', userId)

      if (error) {
        throw error
      }

    } catch (error) {
      dbLogger.error({ error, notificationId, userId }, 'Failed to dismiss notification')
      throw error
    }
  }

  /**
   * Delete a notification
   */
  static async deleteNotification(notificationId: string, userId: string): Promise<void> {
    try {
      const client = await createClient()
      const supabase = typed(client)

      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', userId)

      if (error) {
        throw error
      }

    } catch (error) {
      dbLogger.error({ error, notificationId, userId }, 'Failed to delete notification')
      throw error
    }
  }
}