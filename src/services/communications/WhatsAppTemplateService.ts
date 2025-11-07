import 'server-only'
import { dbLogger } from '@/lib/logger'
import { typed } from '@/types/type-utilities'
import { createClient } from '@/utils/supabase/server'

import type { Row, Insert } from '@/types/database'

type WhatsAppTemplate = Row<'whatsapp_templates'>
type WhatsAppTemplateInsert = Insert<'whatsapp_templates'>

/**
 * WhatsApp Template Service
 * Handles WhatsApp template CRUD operations
 * SERVER-ONLY: Uses server client for database operations
 */
export class WhatsAppTemplateService {
  /**
   * Get WhatsApp templates for a user
   */
  static async getTemplates(
    userId: string,
    filters?: {
      activeOnly?: boolean
    }
  ): Promise<WhatsAppTemplate[]> {
    try {
      const client = await createClient()
      const supabase = typed(client)

      let query = supabase
        .from('whatsapp_templates')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (filters?.activeOnly) {
        query = query.eq('is_active', true)
      }

      const { data, error } = await query

      if (error) {
        throw error
      }

      return data || []

    } catch (error) {
      dbLogger.error({ error, userId, filters }, 'Failed to get WhatsApp templates')
      throw error
    }
  }

  /**
   * Create a new WhatsApp template
   */
  static async createTemplate(
    userId: string,
    templateData: {
      name: string
      description?: string
      category: string
      template_content: string
      variables?: string[]
      is_active?: boolean
      is_default?: boolean
    }
  ): Promise<WhatsAppTemplate> {
    try {
      const client = await createClient()
      const supabase = typed(client)

      // If setting as default, unset other defaults in the same category
      if (templateData.is_default) {
        await supabase
          .from('whatsapp_templates')
          .update({ is_default: false })
          .eq('user_id', userId)
          .eq('category', templateData.category)
      }

      const templateInsert: WhatsAppTemplateInsert = {
        name: templateData.name,
        description: templateData.description ?? '',
        category: templateData.category,
        template_content: templateData.template_content,
        variables: templateData.variables ?? [],
        is_active: templateData.is_active ?? true,
        is_default: templateData.is_default ?? false,
        user_id: userId
      }

      const { data, error } = await supabase
        .from('whatsapp_templates')
        .insert(templateInsert)
        .select()
        .single()

      if (error) {
        throw error
      }

      return data as WhatsAppTemplate

    } catch (error) {
      dbLogger.error({ error, userId, templateData }, 'Failed to create WhatsApp template')
      throw error
    }
  }

  /**
   * Update a WhatsApp template
   */
  static async updateTemplate(
    templateId: string,
    userId: string,
    updates: Partial<{
      name: string
      description: string
      category: string
      template_content: string
      variables: string[]
      is_active: boolean
      is_default: boolean
    }>
  ): Promise<WhatsAppTemplate> {
    try {
      const client = await createClient()
      const supabase = typed(client)

      // If setting as default, unset other defaults in the same category
      if (updates.is_default && updates.category) {
        await supabase
          .from('whatsapp_templates')
          .update({ is_default: false })
          .eq('user_id', userId)
          .eq('category', updates.category)
          .neq('id', templateId)
      }

      const { data, error } = await supabase
        .from('whatsapp_templates')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', templateId)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) {
        throw error
      }

      return data as WhatsAppTemplate

    } catch (error) {
      dbLogger.error({ error, templateId, userId, updates }, 'Failed to update WhatsApp template')
      throw error
    }
  }

  /**
   * Delete a WhatsApp template
   */
  static async deleteTemplate(templateId: string, userId: string): Promise<void> {
    try {
      const client = await createClient()
      const supabase = typed(client)

      const { error } = await supabase
        .from('whatsapp_templates')
        .delete()
        .eq('id', templateId)
        .eq('user_id', userId)

      if (error) {
        throw error
      }

    } catch (error) {
      dbLogger.error({ error, templateId, userId }, 'Failed to delete WhatsApp template')
      throw error
    }
  }

  /**
   * Get default template for a category
   */
  static async getDefaultTemplate(userId: string, category: string): Promise<WhatsAppTemplate | null> {
    try {
      const client = await createClient()
      const supabase = typed(client)

      const { data, error } = await supabase
        .from('whatsapp_templates')
        .select('*')
        .eq('user_id', userId)
        .eq('category', category)
        .eq('is_default', true)
        .eq('is_active', true)
        .single()

      if (error) {
        if (error['code'] === 'PGRST116') { // No rows returned
          return null
        }
        throw error
      }

      return data as WhatsAppTemplate

    } catch (error) {
      dbLogger.error({ error, userId, category }, 'Failed to get default WhatsApp template')
      return null
    }
  }
}