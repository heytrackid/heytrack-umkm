/**
 * TypeScript interfaces for HPP Edge Function
 * 
 * These types define the data structures used throughout the HPP snapshot creation process.
 */

import type { SupabaseClient } from 'jsr:@supabase/supabase-js@2'

// ============================================================================
// HPP Calculation Types
// ============================================================================

export interface HPPCalculationInput {
    recipeId: string
    userId: string
    supabase: SupabaseClient
}

export interface HPPCalculationResult {
    total_hpp: number
    material_cost: number
    operational_cost: number
    breakdown: CostBreakdown
}

export interface CostBreakdown {
    ingredients: IngredientCost[]
    operational: OperationalCost[]
}

export interface IngredientCost {
    id: string
    name: string
    cost: number
    percentage: number
}

export interface OperationalCost {
    category: string
    cost: number
    percentage: number
}

// ============================================================================
// Snapshot Types
// ============================================================================

export interface SnapshotData {
    recipe_id: string
    user_id: string
    snapshot_date: string
    hpp_value: number
    material_cost: number
    operational_cost: number
    cost_breakdown: CostBreakdown
    selling_price: number | null
    margin_percentage: number | null
}

export interface SnapshotCreationResult {
    success: boolean
    recipe_id: string
    snapshot_id?: string
    error?: string
}

// ============================================================================
// Database Types
// ============================================================================

export interface Recipe {
    id: string
    user_id: string
    name: string
    servings: number
    is_active: boolean
    selling_price?: number
}

export interface RecipeIngredient {
    id: string
    recipe_id: string
    ingredient_id: string
    quantity: number
    unit: string
    ingredients: Ingredient
}

export interface Ingredient {
    id: string
    user_id: string
    name: string
    price_per_unit: number
    current_stock: number
    unit: string
}

export interface OperationalCostRow {
    id: string
    user_id: string
    category: string
    amount: number
    date: string
    recurring: boolean
    frequency?: string
}

export interface Production {
    id: string
    recipe_id: string
    user_id: string
    quantity: number
    created_at: string
}

// ============================================================================
// Response Types
// ============================================================================

export interface EdgeFunctionResponse {
    success: boolean
    data?: EdgeFunctionData
    error?: string
    details?: ErrorDetails
}

export interface EdgeFunctionData {
    total_users: number
    total_recipes: number
    snapshots_created: number
    snapshots_failed: number
    execution_time_ms: number
    timestamp: string
    errors?: ProcessingError[]
}

export interface ErrorDetails {
    code: string
    message: string
}

export interface ProcessingError {
    user_id?: string
    recipe_id?: string
    error: string
    timestamp: string
}

// ============================================================================
// Execution Metrics Types
// ============================================================================

export interface ExecutionMetrics {
    total_users: number
    total_recipes: number
    snapshots_created: number
    snapshots_failed: number
    errors: ProcessingError[]
    start_time: number
    end_time?: number
}

export interface UserProcessingResult {
    user_id: string
    recipes_processed: number
    snapshots_created: number
    snapshots_failed: number
    errors: ProcessingError[]
}
