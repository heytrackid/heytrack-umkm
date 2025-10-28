import type { Json } from '../shared/common'

// Production-related enums
export type ProductionStatus = "PLANNED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED"

// Recipe tables
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

export interface ProductionSchedulesTable {
  Row: {
    actual_duration: number | null
    actual_quantity: number | null
    assigned_staff: string | null
    cost_estimate: number | null
    created_at: string | null
    dependencies: Json | null
    estimated_duration: number | null
    id: string
    notes: string | null
    planned_quantity: number
    priority: number | null
    profit_estimate: number | null
    recipe_id: string | null
    resource_requirements: Json | null
    scheduled_date: string
    status: string | null
    updated_at: string | null
    user_id: string
  }
  Insert: {
    actual_duration?: number | null
    actual_quantity?: number | null
    assigned_staff?: string | null
    cost_estimate?: number | null
    created_at?: string | null
    dependencies?: Json | null
    estimated_duration?: number | null
    id?: string
    notes?: string | null
    planned_quantity: number
    priority?: number | null
    profit_estimate?: number | null
    recipe_id?: string | null
    resource_requirements?: Json | null
    scheduled_date: string
    status?: string | null
    updated_at?: string | null
    user_id: string
  }
  Update: {
    actual_duration?: number | null
    actual_quantity?: number | null
    assigned_staff?: string | null
    cost_estimate?: number | null
    created_at?: string | null
    dependencies?: Json | null
    estimated_duration?: number | null
    id?: string
    notes?: string | null
    planned_quantity?: number
    priority?: number | null
    profit_estimate?: number | null
    recipe_id?: string | null
    resource_requirements?: Json | null
    scheduled_date?: string
    status?: string | null
    updated_at?: string | null
    user_id?: string
  }
  Relationships: [
    {
      foreignKeyName: "production_schedules_recipe_id_fkey"
      columns: ["recipe_id"]
      isOneToOne: false
      referencedRelation: "recipe_availability"
      referencedColumns: ["id"]
    },
    {
      foreignKeyName: "production_schedules_recipe_id_fkey"
      columns: ["recipe_id"]
      isOneToOne: false
      referencedRelation: "recipes"
      referencedColumns: ["id"]
    },
  ]
}

export interface ProductionsTable {
  Row: {
    completed_at: string | null
    cost_per_unit: number
    created_at: string | null
    created_by: string | null
    id: string
    notes: string | null
    quantity: number
    recipe_id: string
    started_at: string | null
    status: ProductionStatus | null
    total_cost: number
    updated_at: string | null
    updated_by: string | null
    user_id: string
  }
  Insert: {
    completed_at?: string | null
    cost_per_unit: number
    created_at?: string | null
    created_by?: string | null
    id?: string
    notes?: string | null
    quantity: number
    recipe_id: string
    started_at?: string | null
    status?: ProductionStatus | null
    total_cost: number
    updated_at?: string | null
    updated_by?: string | null
    user_id: string
  }
  Update: {
    completed_at?: string | null
    cost_per_unit?: number
    created_at?: string | null
    created_by?: string | null
    id?: string
    notes?: string | null
    quantity?: number
    recipe_id?: string
    started_at?: string | null
    status?: ProductionStatus | null
    total_cost?: number
    updated_at?: string | null
    updated_by?: string | null
    user_id?: string
  }
  Relationships: [
    {
      foreignKeyName: "productions_recipe_id_fkey"
      columns: ["recipe_id"]
      isOneToOne: false
      referencedRelation: "recipe_availability"
      referencedColumns: ["id"]
    },
    {
      foreignKeyName: "productions_recipe_id_fkey"
      columns: ["recipe_id"]
      isOneToOne: false
      referencedRelation: "recipes"
      referencedColumns: ["id"]
    },
  ]
}

// Recipe-related views
export interface RecipeAvailabilityView {
  Row: {
    category: string | null
    cost_per_unit: number | null
    id: string | null
    is_active: boolean | null
    is_available: boolean | null
    max_possible_quantity: number | null
    missing_ingredients: Json[] | null
    name: string | null
    selling_price: number | null
  }
  Relationships: []
}

// Type aliases for convenience
export type Recipe = RecipesTable['Row']
export type RecipeInsert = RecipesTable['Insert']
export type RecipeUpdate = RecipesTable['Update']

export type RecipeIngredient = RecipeIngredientsTable['Row']
export type RecipeIngredientInsert = RecipeIngredientsTable['Insert']
export type RecipeIngredientUpdate = RecipeIngredientsTable['Update']

// Complex types
export type RecipeWithIngredients = Recipe & {
  recipe_ingredients?: Array<RecipeIngredient & {
    ingredient?: import('./inventory').Ingredient
  }>
}
