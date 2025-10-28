import type { Database } from '@/types/supabase-generated'

export type IngredientsTable = Database['public']['Tables']['ingredients']
export type Ingredient = IngredientsTable['Row']
export type IngredientInsert = IngredientsTable['Insert']
export type IngredientUpdate = IngredientsTable['Update']

export type InventoryAlertsTable = Database['public']['Tables']['inventory_alerts']
export type InventoryAlert = InventoryAlertsTable['Row']
export type InventoryAlertInsert = InventoryAlertsTable['Insert']
export type InventoryAlertUpdate = InventoryAlertsTable['Update']

export type IngredientPurchasesTable = Database['public']['Tables']['ingredient_purchases']
export type IngredientPurchase = IngredientPurchasesTable['Row']
export type IngredientPurchaseInsert = IngredientPurchasesTable['Insert']
export type IngredientPurchaseUpdate = IngredientPurchasesTable['Update']

export type StockTransactionsTable = Database['public']['Tables']['stock_transactions']
export type StockTransaction = StockTransactionsTable['Row']
export type StockTransactionInsert = StockTransactionsTable['Insert']
export type StockTransactionUpdate = StockTransactionsTable['Update']
