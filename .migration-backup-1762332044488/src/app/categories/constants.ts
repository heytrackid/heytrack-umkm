// Categories Types and Constants

export interface Category {
  id: string
  name: string
  icon: string
  description: string
  commonIngredients: string[]
}

export type CategoryView = 'list' | 'add' | 'edit'

export interface CategoriesState {
  categories: Category[]
  currentView: CategoryView
  editingCategory: Category | null
  selectedItems: string[]
  searchTerm: string
  isLoading: boolean
  currentPage: number
  pageSize: number
}

export interface CategoryFormData {
  id: string
  name: string
  icon: string
  description: string
  commonIngredients: string[]
}

// Default category icons
export const CATEGORY_ICONS = [
  '🍽️', '🍕', '🍔', '🌭', '🍟', '🍗', '🍖', '🥩', '🥓', '🍳',
  '🥞', '🧇', '🥓', '🥨', '🥖', '🥐', '🥯', '🍞', '🥞', '🧇',
  '🍕', '🍔', '🌭', '🍟', '🍗', '🍖', '🥩', '🥓', '🍳', '🥞',
  '🍰', '🎂', '🥧', '🍫', '🍬', '🍭', '🍮', '🍯', '🧁', '🍪',
  '🥤', '🧃', '🧊', '🍶', '🍺', '🍻', '🥂', '🍷', '🥃', '🍸'
] as const

// Common ingredients suggestions by category
export const COMMON_INGREDIENTS_BY_CATEGORY: Record<string, string[]> = {
  'Makanan Cepat Saji': ['Tepung Terigu', 'Telur', 'Minyak Goreng', 'Garam'],
  'Roti & Kue': ['Tepung Terigu', 'Gula', 'Telur', 'Mentega', 'Ragi'],
  'Makanan Laut': ['Ikan Segar', 'Udang', 'Cumi', 'Kerang'],
  'Ayam & Unggas': ['Ayam Kampung', 'Ayam Broiler', 'Telur', 'Bumbu'],
  'Daging': ['Daging Sapi', 'Daging Kambing', 'Daging Ayam', 'Bumbu'],
  'Sayuran': ['Wortel', 'Kentang', 'Bawang', 'Cabe'],
  'Minuman': ['Air Mineral', 'Es Batu', 'Gula', 'Jeruk'],
  'Dessert': ['Gula', 'Tepung', 'Telur', 'Cokelat']
}

// Default pagination settings
export const PAGINATION_DEFAULTS = {
  PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50] as const
} as const

// Loading delay for better UX
export const LOADING_DELAY = 800

// Export types
export type CategoryIcon = typeof CATEGORY_ICONS[number]
export type PageSize = typeof PAGINATION_DEFAULTS.PAGE_SIZE_OPTIONS[number]
