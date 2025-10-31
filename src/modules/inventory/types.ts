import type { 
  IngredientsTable, 
  IngredientsInsert, 
  IngredientsUpdate,
  InventoryAlertsTable, 
  InventoryAlertsInsert, 
  InventoryAlertsUpdate,
  IngredientPurchasesTable, 
  IngredientPurchasesInsert, 
  IngredientPurchasesUpdate,
  StockTransactionsTable, 
  StockTransactionsInsert, 
  StockTransactionsUpdate
} from '@/types/database'

export type Ingredient = IngredientsTable
export type IngredientInsert = IngredientsInsert
export type IngredientUpdate = IngredientsUpdate

export type InventoryAlert = InventoryAlertsTable
export type InventoryAlertInsert = InventoryAlertsInsert
export type InventoryAlertUpdate = InventoryAlertsUpdate

export type IngredientPurchase = IngredientPurchasesTable
export type IngredientPurchaseInsert = IngredientPurchasesInsert
export type IngredientPurchaseUpdate = IngredientPurchasesUpdate

export type StockTransaction = StockTransactionsTable
export type StockTransactionInsert = StockTransactionsInsert
export type StockTransactionUpdate = StockTransactionsUpdate
