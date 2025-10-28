/**
 * Recipes Table Types
 * Recipe management and related tables
 */

import type { Json } from '../common'

export interface RecipesTable {
  Row: {
    batch_size: number | null
    category: string | null
    cook_time: number | null
    cost_per_unit: number | null
    created_at: string | null
    created_by: string | null
    description: string | null
    difficulty: string | null
    id: string
    image_url: string | null
    instructions: string | null
    is_active: boolean | null
    last_made_at: string | null
    margin_percentage: number | null
    name: string
    prep_time: number | null
    rating: number | null
    seasonal: boolean | null
    selling_price: number | null
    servings: number | null
    times_made: number | null
    total_revenue: number | null
    updated_at: string | null
    updated_by: string | null
    user_id: string
  }
  Insert: {
    batch_size?: number | null
    category?: string | null
    cook_time?: number | null
    cost_per_unit?: number | null
    created_at?: string | null
    created_by?: string | null
    description?: string | null
    difficulty?: string | null
    id?: string
    image_url?: string | null
    instructions?: string | null
    is_active?: boolean | null
    last_made_at?: string | null
    margin_percentage?: number | null
    name: string
    prep_time?: number | null
    rating?: number | null
    seasonal?: boolean | null
    selling_price?: number | null
    servings?: number | null
    times_made?: number | null
    total_revenue?: number | null
    updated_at?: string | null
    updated_by?: string | null
    user_id: string
  }
  Update: {
    batch_size?: number | null
    category?: string | null
    cook_time?: number | null
    cost_per_unit?: number | null
    created_at?: string | null
    created_by?: string | null
    description?: string | null
    difficulty?: string | null
    id?: string
    image_url?: string | null
    instructions?: string | null
    is_active?: boolean | null
    last_made_at?: string | null
    margin_percentage?: number | null
    name?: string
    prep_time?: number | null
    rating?: number | null
    seasonal?: boolean | null
    selling_price?: number | null
    servings?: number | null
    times_made?: number | null
    total_revenue?: number | null
    updated_at?: string | null
    updated_by?: string | null
    user_id?: string
  }
  Relationships: []
}

export interface RecipeIngredientsTable {
  Row: {
    id: string
    ingredient_id: string
    quantity: number
    recipe_id: string
    unit: string
    user_id: string
  }
  Insert: {
    id?: string
    ingredient_id: string
    quantity: number
    recipe_id: string
    unit: string
    user_id: string
  }
  Update: {
    id?: string
    ingredient_id?: string
    quantity?: number
    recipe_id?: string
    unit?: string
    user_id?: string
  }
  Relationships: [
    {
      foreignKeyName: "recipe_ingredients_ingredient_id_fkey"
      columns: ["ingredient_id"]
      isOneToOne: false
      referencedRelation: "ingredients"
      referencedColumns: ["id"]
    },
    {
      foreignKeyName: "recipe_ingredients_ingredient_id_fkey"
      columns: ["ingredient_id"]
      isOneToOne: false
      referencedRelation: "inventory_status"
      referencedColumns: ["id"]
    },
    {
      foreignKeyName: "recipe_ingredients_recipe_id_fkey"
      columns: ["recipe_id"]
      isOneToOne: false
      referencedRelation: "recipe_availability"
      referencedColumns: ["id"]
    },
    {
      foreignKeyName: "recipe_ingredients_recipe_id_fkey"
      columns: ["recipe_id"]
      isOneToOne: false
      referencedRelation: "recipes"
      referencedColumns: ["id"]
    },
  ]
}
