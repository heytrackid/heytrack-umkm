import type { Category, CategoryFormData } from './constants'

/**
 * Generate unique ID for new category
 */
export function generateCategoryId(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .slice(0, 50) // Limit length
}

/**
 * Validate category form data
 */
export function validateCategoryForm(formData: CategoryFormData): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!formData.name?.trim()) {
    errors.push('Nama kategori wajib diisi')
  }

  if (!formData.icon?.trim()) {
    errors.push('Icon kategori wajib dipilih')
  }

  if (!formData.description?.trim()) {
    errors.push('Deskripsi kategori wajib diisi')
  }

  // Check for duplicate names (would need categories list as parameter)
  // This validation would be done in the hook

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Filter categories based on search term
 */
export function filterCategories(categories: Category[], searchTerm: string): Category[] {
  if (!searchTerm.trim()) {return categories}

  const term = searchTerm.toLowerCase()
  return categories.filter(category =>
    category.name?.toLowerCase().includes(term) ||
    category.description?.toLowerCase().includes(term) ||
    category.commonIngredients?.some(ingredient =>
      ingredient.toLowerCase().includes(term)
    )
  )
}

/**
 * Paginate categories array
 */
export function paginateCategories(
  categories: Category[],
  currentPage: number,
  pageSize: number
): Category[] {
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  return categories.slice(startIndex, endIndex)
}

/**
 * Calculate pagination info
 */
export function calculatePagination(totalItems: number, pageSize: number): { totalPages: number; totalItems: number } {
  const totalPages = Math.ceil(totalItems / pageSize)
  return { totalPages, totalItems }
}

/**
 * Get pagination display info
 */
export function getPaginationInfo(
  currentPage: number,
  pageSize: number,
  totalItems: number
): { startItem: number; endItem: number; totalItems: number; currentPage: number; totalPages: number } {
  const startItem = ((currentPage - 1) * pageSize) + 1
  const endItem = Math.min(currentPage * pageSize, totalItems)

  return {
    startItem,
    endItem,
    totalItems,
    currentPage,
    totalPages: Math.ceil(totalItems / pageSize)
  }
}

/**
 * Create new category from form data
 */
export function createCategoryFromForm(formData: CategoryFormData): Category {
  return {
    id: generateCategoryId(formData.name),
    name: formData.name.trim(),
    icon: formData.icon,
    description: formData.description.trim(),
    commonIngredients: formData.commonIngredients || []
  }
}

/**
 * Update existing category with form data
 */
export function updateCategoryFromForm(
  existingCategory: Category,
  formData: CategoryFormData
): Category {
  return {
    ...existingCategory,
    name: formData.name.trim(),
    icon: formData.icon,
    description: formData.description.trim(),
    commonIngredients: formData.commonIngredients || []
  }
}

/**
 * Check if category name already exists
 */
export function isCategoryNameTaken(
  categories: Category[],
  name: string,
  excludeId?: string
): boolean {
  const normalizedName = name.toLowerCase().trim()
  return categories.some(category =>
    category.name.toLowerCase().trim() === normalizedName &&
    category['id'] !== excludeId
  )
}

/**
 * Get category suggestions based on common ingredients
 */
export function getIngredientSuggestions(categoryName: string): string[] {
  // This would use COMMON_INGREDIENTS_BY_CATEGORY from constants
  // For now, return some basic suggestions
  const suggestions: Record<string, string[]> = {
    'roti': ['Tepung Terigu', 'Gula', 'Telur', 'Mentega', 'Ragi'],
    'kue': ['Tepung Terigu', 'Gula', 'Telur', 'Mentega', 'Vanili'],
    'ayam': ['Ayam Kampung', 'Bawang Putih', 'Jahe', 'Kunyit', 'Lengkuas'],
    'ikan': ['Ikan Segar', 'Jeruk Nipis', 'Bawang Merah', 'Cabe', 'Tomat'],
    'sayur': ['Wortel', 'Kentang', 'Bawang Bombay', 'Cabe', 'Tomat']
  }

  const key = categoryName.toLowerCase()
  for (const [categoryKey, ingredients] of Object.entries(suggestions)) {
    if (key.includes(categoryKey)) {
      return ingredients
    }
  }

  return ['Tepung Terigu', 'Gula', 'Telur', 'Minyak Goreng']
}

/**
 * Sort categories alphabetically
 */
export function sortCategories(categories: Category[]): Category[] {
  return [...categories].sort((a, b) => a.name.localeCompare(b.name))
}
