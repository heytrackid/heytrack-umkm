// @ts-nocheck
'use client'

import { useCallback, useState } from 'react'
import { successToast } from '@/hooks/use-toast'
import { createClient as createSupabaseClient } from '@/utils/supabase/client'
import type { 
  AppSettingsTable, AppSettingsInsert, AppSettingsUpdate,
  ChatContextCacheTable, ChatContextCacheInsert, ChatContextCacheUpdate,
  ChatMessagesTable, ChatMessagesInsert, ChatMessagesUpdate,
  ChatSessionsTable, ChatSessionsInsert, ChatSessionsUpdate,
  ConversationHistoryTable, ConversationHistoryInsert, ConversationHistoryUpdate,
  ConversationSessionsTable, ConversationSessionsInsert, ConversationSessionsUpdate,
  CustomersTable, CustomersInsert, CustomersUpdate,
  DailySalesSummaryTable, DailySalesSummaryInsert, DailySalesSummaryUpdate,
  ErrorLogsTable, ErrorLogsInsert, ErrorLogsUpdate,
  ExpensesTable, ExpensesInsert, ExpensesUpdate,
  FinancialRecordsTable, FinancialRecordsInsert, FinancialRecordsUpdate,
  HppAlertsTable, HppAlertsInsert, HppAlertsUpdate,
  HppCalculationsTable, HppCalculationsInsert, HppCalculationsUpdate,
  HppHistoryTable, HppHistoryInsert, HppHistoryUpdate,
  HppRecommendationsTable, HppRecommendationsInsert, HppRecommendationsUpdate,
  IngredientPurchasesTable, IngredientPurchasesInsert, IngredientPurchasesUpdate,
  IngredientsTable, IngredientsInsert, IngredientsUpdate,
  InventoryAlertsTable, InventoryAlertsInsert, InventoryAlertsUpdate,
  InventoryReorderRulesTable, InventoryReorderRulesInsert, InventoryReorderRulesUpdate,
  InventoryStockLogsTable, InventoryStockLogsInsert, InventoryStockLogsUpdate,
  NotificationPreferencesTable, NotificationPreferencesInsert, NotificationPreferencesUpdate,
  NotificationsTable, NotificationsInsert, NotificationsUpdate,
  OperationalCostsTable, OperationalCostsInsert, OperationalCostsUpdate,
  OrderItemsTable, OrderItemsInsert, OrderItemsUpdate,
  OrdersTable, OrdersInsert, OrdersUpdate,
  PaymentsTable, PaymentsInsert, PaymentsUpdate,
  PerformanceLogsTable, PerformanceLogsInsert, PerformanceLogsUpdate,
  ProductionBatchesTable, ProductionBatchesInsert, ProductionBatchesUpdate,
  ProductionSchedulesTable, ProductionSchedulesInsert, ProductionSchedulesUpdate,
  ProductionsTable, ProductionsInsert, ProductionsUpdate,
  RecipeIngredientsTable, RecipeIngredientsInsert, RecipeIngredientsUpdate,
  RecipesTable, RecipesInsert, RecipesUpdate,
  StockTransactionsTable, StockTransactionsInsert, StockTransactionsUpdate,
  SupplierIngredientsTable, SupplierIngredientsInsert, SupplierIngredientsUpdate,
  SuppliersTable, SuppliersInsert, SuppliersUpdate,
  UsageAnalyticsTable, UsageAnalyticsInsert, UsageAnalyticsUpdate,
  UserProfilesTable, UserProfilesInsert, UserProfilesUpdate,
  WhatsappTemplatesTable, WhatsappTemplatesInsert, WhatsappTemplatesUpdate
} from '@/types/database'
import type { EnhancedCRUDOptions } from './types'
import { handleCRUDError, validateCRUDInputs, validateBulkInputs } from './utils'
import { getErrorMessage } from '@/lib/type-guards'

// Mapping table names to their corresponding types
type TableMap = {
  // App settings
  'app_settings': { row: AppSettingsTable; insert: AppSettingsInsert; update: AppSettingsUpdate }
  'chat_context_cache': { row: ChatContextCacheTable; insert: ChatContextCacheInsert; update: ChatContextCacheUpdate }
  'chat_messages': { row: ChatMessagesTable; insert: ChatMessagesInsert; update: ChatMessagesUpdate }
  'chat_sessions': { row: ChatSessionsTable; insert: ChatSessionsInsert; update: ChatSessionsUpdate }
  'conversation_history': { row: ConversationHistoryTable; insert: ConversationHistoryInsert; update: ConversationHistoryUpdate }
  'conversation_sessions': { row: ConversationSessionsTable; insert: ConversationSessionsInsert; update: ConversationSessionsUpdate }
  'customers': { row: CustomersTable; insert: CustomersInsert; update: CustomersUpdate }
  'daily_sales_summary': { row: DailySalesSummaryTable; insert: DailySalesSummaryInsert; update: DailySalesSummaryUpdate }
  'error_logs': { row: ErrorLogsTable; insert: ErrorLogsInsert; update: ErrorLogsUpdate }
  'expenses': { row: ExpensesTable; insert: ExpensesInsert; update: ExpensesUpdate }
  'financial_records': { row: FinancialRecordsTable; insert: FinancialRecordsInsert; update: FinancialRecordsUpdate }
  'hpp_alerts': { row: HppAlertsTable; insert: HppAlertsInsert; update: HppAlertsUpdate }
  'hpp_calculations': { row: HppCalculationsTable; insert: HppCalculationsInsert; update: HppCalculationsUpdate }
  'hpp_history': { row: HppHistoryTable; insert: HppHistoryInsert; update: HppHistoryUpdate }
  'hpp_recommendations': { row: HppRecommendationsTable; insert: HppRecommendationsInsert; update: HppRecommendationsUpdate }
  'ingredient_purchases': { row: IngredientPurchasesTable; insert: IngredientPurchasesInsert; update: IngredientPurchasesUpdate }
  'ingredients': { row: IngredientsTable; insert: IngredientsInsert; update: IngredientsUpdate }
  'inventory_alerts': { row: InventoryAlertsTable; insert: InventoryAlertsInsert; update: InventoryAlertsUpdate }
  'inventory_reorder_rules': { row: InventoryReorderRulesTable; insert: InventoryReorderRulesInsert; update: InventoryReorderRulesUpdate }
  'inventory_stock_logs': { row: InventoryStockLogsTable; insert: InventoryStockLogsInsert; update: InventoryStockLogsUpdate }
  'notification_preferences': { row: NotificationPreferencesTable; insert: NotificationPreferencesInsert; update: NotificationPreferencesUpdate }
  'notifications': { row: NotificationsTable; insert: NotificationsInsert; update: NotificationsUpdate }
  'operational_costs': { row: OperationalCostsTable; insert: OperationalCostsInsert; update: OperationalCostsUpdate }
  'order_items': { row: OrderItemsTable; insert: OrderItemsInsert; update: OrderItemsUpdate }
  'orders': { row: OrdersTable; insert: OrdersInsert; update: OrdersUpdate }
  'payments': { row: PaymentsTable; insert: PaymentsInsert; update: PaymentsUpdate }
  'performance_logs': { row: PerformanceLogsTable; insert: PerformanceLogsInsert; update: PerformanceLogsUpdate }
  'production_batches': { row: ProductionBatchesTable; insert: ProductionBatchesInsert; update: ProductionBatchesUpdate }
  'production_schedules': { row: ProductionSchedulesTable; insert: ProductionSchedulesInsert; update: ProductionSchedulesUpdate }
  'productions': { row: ProductionsTable; insert: ProductionsInsert; update: ProductionsUpdate }
  'recipe_ingredients': { row: RecipeIngredientsTable; insert: RecipeIngredientsInsert; update: RecipeIngredientsUpdate }
  'recipes': { row: RecipesTable; insert: RecipesInsert; update: RecipesUpdate }
  'stock_transactions': { row: StockTransactionsTable; insert: StockTransactionsInsert; update: StockTransactionsUpdate }
  'supplier_ingredients': { row: SupplierIngredientsTable; insert: SupplierIngredientsInsert; update: SupplierIngredientsUpdate }
  'suppliers': { row: SuppliersTable; insert: SuppliersInsert; update: SuppliersUpdate }
  'usage_analytics': { row: UsageAnalyticsTable; insert: UsageAnalyticsInsert; update: UsageAnalyticsUpdate }
  'user_profiles': { row: UserProfilesTable; insert: UserProfilesInsert; update: UserProfilesUpdate }
  'whatsapp_templates': { row: WhatsappTemplatesTable; insert: WhatsappTemplatesInsert; update: WhatsappTemplatesUpdate }
}

/**
 * Enhanced CRUD hook with toast notifications and error handling
 * 
 * Generic type parameters:
 * - TTable: Table name from database
 * - TRow: Row type for query results
 * - TInsert: Insert type for create operations
 * - TUpdate: Update type for update operations
 */
export function useEnhancedCRUD<
  TTable extends keyof TableMap,
  TRow = TableMap[TTable]['row'],
  TInsert = TableMap[TTable]['insert'],
  TUpdate = TableMap[TTable]['update']
>(
  table: TTable,
  options: EnhancedCRUDOptions = {}
) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    showSuccessToast = true,
    showErrorToast = true,
    successMessages = {},
    customErrorHandler
  } = options

  const handleSuccess = useCallback((operation: 'create' | 'update' | 'delete') => {
    void setError(null)

    if (showSuccessToast) {
      const defaultMessages = {
        create: 'Data berhasil ditambahkan',
        update: 'Data berhasil diperbarui',
        delete: 'Data berhasil dihapus'
      }

      const message = successMessages[operation] || defaultMessages[operation]
      successToast(message)
    }
  }, [showSuccessToast, successMessages])

  const createRecord = useCallback(async (data: TInsert): Promise<TRow> => {
    validateCRUDInputs('create', data)

    void setLoading(true)
    void setError(null)

    try {
      const supabase = createSupabaseClient()

      const { data: result, error } = await supabase
        .from(table)
        .insert(data)
        .select()
        .single() as { data: TRow | null; error: Error | null }

      if (error) {
        throw new Error((error instanceof Error ? error.message : String(error)))
      }

      void handleSuccess('create')
      return result!
    } catch (error: unknown) {
      void handleCRUDError(error as Error, 'create', showErrorToast, customErrorHandler)
      throw error
    } finally {
      void setLoading(false)
    }
  }, [table, handleSuccess, showErrorToast, customErrorHandler])

  const updateRecord = useCallback(async (id: string, data: TUpdate): Promise<TRow> => {
    validateCRUDInputs('update', data, id)

    void setLoading(true)
    void setError(null)

    try {
      const supabase = createSupabaseClient()

      const { data: result, error } = await supabase
        .from(table)
        .update(data)
        .eq('id', id)
        .select()
        .single() as { data: TRow | null; error: Error | null }

      if (error) {
        throw new Error((error instanceof Error ? error.message : String(error)))
      }

      if (!result) {
        throw new Error('Data tidak ditemukan')
      }

      void handleSuccess('update')
      return result!
    } catch (error: unknown) {
      void handleCRUDError(new Error(getErrorMessage(error)), 'update', showErrorToast, customErrorHandler)
      throw error
    } finally {
      void setLoading(false)
    }
  }, [table, handleSuccess, showErrorToast, customErrorHandler])

  const deleteRecord = useCallback(async (id: string) => {
    validateCRUDInputs('delete', undefined, id)

    void setLoading(true)
    void setError(null)

    try {
      const supabase = createSupabaseClient()

      // Check if record exists first
      const { data: existingRecord, error: fetchError } = await supabase
        .from(table)
        .select('*')
        .eq('id', id)
        .single() as { data: TRow | null; error: Error | null }

      if (fetchError || !existingRecord) {
        throw new Error('Data tidak ditemukan')
      }

      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id)

      if (error) {
        throw new Error((error instanceof Error ? error.message : String(error)))
      }

      void handleSuccess('delete')
      return true
    } catch (error: unknown) {
      void handleCRUDError(new Error(getErrorMessage(error)), 'delete', showErrorToast, customErrorHandler)
      throw error
    } finally {
      void setLoading(false)
    }
  }, [table, handleSuccess, showErrorToast, customErrorHandler])

  const bulkCreate = useCallback(async (records: TInsert[]): Promise<TRow[]> => {
    validateBulkInputs('create', records as Array<Record<string, unknown>>)

    void setLoading(true)
    void setError(null)

    try {
      const supabase = createSupabaseClient()

      const { data: result, error } = await supabase
        .from(table)
        .insert(records)
        .select() as { data: TRow[] | null; error: Error | null }

      if (error) {
        throw new Error(getErrorMessage(error))
      }

      if (showSuccessToast) {
        successToast(
          'Berhasil!',
          `${records.length} data berhasil ditambahkan`
        )
      }

      return result!
    } catch (error: unknown) {
      void handleCRUDError(new Error(getErrorMessage(error)), 'create', showErrorToast, customErrorHandler)
      throw error
    } finally {
      void setLoading(false)
    }
  }, [table, showSuccessToast, showErrorToast, customErrorHandler])

  const bulkUpdate = useCallback(async (
    updates: Array<{ id: string; data: TUpdate }>
  ): Promise<TRow[]> => {
    validateBulkInputs('update', updates as Array<Record<string, unknown>>)

    void setLoading(true)
    void setError(null)

    try {
      const supabase = createSupabaseClient()
      const results: TRow[] = []

      for (const update of updates) {
        const { data: result, error } = await supabase
          .from(table)
          .update(update.data)
          .eq('id', update.id)
          .select()
          .single() as { data: TRow | null; error: Error | null }

        if (error) {
          throw new Error(`Gagal update record ${update.id}: ${error.message}`)
        }

        results.push(result!)
      }

      if (showSuccessToast) {
        successToast(
          'Berhasil!',
          `${updates.length} data berhasil diperbarui`
        )
      }

      return results
    } catch (error: unknown) {
      void handleCRUDError(new Error(getErrorMessage(error)), 'update', showErrorToast, customErrorHandler)
      throw error
    } finally {
      void setLoading(false)
    }
  }, [table, showSuccessToast, showErrorToast, customErrorHandler])

  const bulkDelete = useCallback(async (ids: string[]) => {
    validateBulkInputs('delete', ids as unknown as Array<Record<string, unknown>>)

    void setLoading(true)
    void setError(null)

    try {
      const supabase = createSupabaseClient()

      const { error } = await supabase
        .from(table)
        .delete()
        .in('id', ids)

      if (error) {
        throw new Error(getErrorMessage(error))
      }

      if (showSuccessToast) {
        successToast(
          'Berhasil!',
          `${ids.length} data berhasil dihapus`
        )
      }

      return true
    } catch (error: unknown) {
      void handleCRUDError(new Error(getErrorMessage(error)), 'delete', showErrorToast, customErrorHandler)
      throw error
    } finally {
      void setLoading(false)
    }
  }, [table, showSuccessToast, showErrorToast, customErrorHandler])

  const clearError = useCallback(() => {
    void setError(null)
  }, [])

  return {
    // Core CRUD operations
    create: createRecord,
    update: updateRecord,
    delete: deleteRecord,

    // Bulk operations
    bulkCreate,
    bulkUpdate,
    bulkDelete,

    // State
    loading,
    error,

    // Utility
    clearError,
  }
}
