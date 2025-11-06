import type { Row, Insert, Update } from '@/types/database'

export type Ingredient = Row<'ingredients'>
export type IngredientInsert = Insert<'ingredients'>
export type IngredientUpdate = Update<'ingredients'>

export type InventoryAlert = Row<'inventory_alerts'>
export type InventoryAlertInsert = Insert<'inventory_alerts'>
export type InventoryAlertUpdate = Update<'inventory_alerts'>

export type IngredientPurchase = Row<'ingredient_purchases'>
export type IngredientPurchaseInsert = Insert<'ingredient_purchases'>
export type IngredientPurchaseUpdate = Update<'ingredient_purchases'>

export type StockTransaction = Row<'stock_transactions'>
export type StockTransactionInsert = Insert<'stock_transactions'>
export type StockTransactionUpdate = Update<'stock_transactions'>
