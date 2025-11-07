/* eslint-disable */
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'react-hot-toast'

// Types and constants embedded in hook file for now
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

export type PageSize = 10 | 20 | 50

// Constants embedded in hook
const LOADING_DELAY = 800

// Utility functions embedded in hook
function generateCategoryId(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .slice(0, 50)
}

function validateCategoryForm(formData: CategoryFormData): { isValid: boolean; errors: string[] } {
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

  return {
    isValid: errors.length === 0,
    errors
  }
}

function filterCategories(categories: Category[], searchTerm: string): Category[] {
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

function paginateCategories(
  categories: Category[],
  currentPage: number,
  pageSize: number
): Category[] {
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  return categories.slice(startIndex, endIndex)
}

function getPaginationInfo(
  currentPage: number,
  pageSize: number,
  totalItems: number
) {
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

function createCategoryFromForm(formData: CategoryFormData): Category {
  return {
    id: generateCategoryId(formData.name),
    name: formData.name.trim(),
    icon: formData.icon,
    description: formData.description.trim(),
    commonIngredients: formData.commonIngredients || []
  }
}

function updateCategoryFromForm(
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

function isCategoryNameTaken(
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

function sortCategories(categories: Category[]): Category[] {
  return [...categories].sort((a, b) => a.name.localeCompare(b.name))
}

interface UseCategoriesReturn {
  // State
  categories: Category[]
  currentView: CategoryView
  editingCategory: Category | null
  selectedItems: string[]
  searchTerm: string
  isLoading: boolean
  currentPage: number
  pageSize: PageSize

  // Form data
  formData: CategoryFormData

  // Computed values
  filteredCategories: Category[]
  paginatedCategories: Category[]
  paginationInfo: {
    startItem: number
    endItem: number
    totalItems: number
    currentPage: number
    totalPages: number
  }

  // Actions
  setCurrentView: (view: CategoryView) => void
  setSearchTerm: (term: string) => void
  setCurrentPage: (page: number) => void
  setPageSize: (size: PageSize) => void
  setFormData: (data: CategoryFormData) => void

  // CRUD operations
  handleSaveCategory: () => void
  handleEditCategory: (category: Category) => void
  handleDeleteCategory: (categoryId: string) => void

  // Bulk operations
  handleSelectAll: () => void
  handleSelectItem: (itemId: string) => void
  handleBulkDelete: () => void
  handleBulkEdit: () => void

  // Utility functions
  resetForm: () => void
  handleViewCategory: (category: Category) => void
}

export function useCategories(): UseCategoriesReturn {
  // Import initial data
  const categoriesData = require('@/data/categories.json')

  // State management
  const [categories, setCategories] = useState<Category[]>(sortCategories(categoriesData.categories))
  const [currentView, setCurrentView] = useState<CategoryView>('list')
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState<PageSize>(20)

  // Form data
  const [formData, setFormData] = useState<CategoryFormData>({
    id: '',
    name: '',
    icon: '🍽️',
    description: '',
    commonIngredients: []
  })

  // Computed values
  const filteredCategories = useMemo(() =>
    filterCategories(categories, searchTerm),
    [categories, searchTerm]
  )

  const paginatedCategories = useMemo(() =>
    paginateCategories(filteredCategories, currentPage, pageSize),
    [filteredCategories, currentPage, pageSize]
  )

  const paginationInfo = useMemo(() =>
    getPaginationInfo(currentPage, pageSize, filteredCategories.length),
    [currentPage, pageSize, filteredCategories.length]
  )

  // Reset form to initial state
  const resetForm = () => {
    setFormData({
      id: '',
      name: '',
      icon: '🍽️',
      description: '',
      commonIngredients: []
    })
    void setEditingCategory(null)
  }

  // Handle save category (create/update)
  const handleSaveCategory = () => {
    const validation = validateCategoryForm(formData)
    if (!validation.isValid) {
      toast.error(validation.errors.join(', '))
      return
    }

    // Check for duplicate names
    if (isCategoryNameTaken(categories, formData.name, editingCategory?.id)) {
      toast.error('Nama kategori sudah digunakan. Silakan pilih nama lain.')
      return
    }

    if (currentView === 'add') {
      // Create new category
      const newCategory = createCategoryFromForm(formData)
      setCategories(prev => sortCategories([...prev, newCategory]))
      toast.success('Kategori berhasil ditambahkan!')
    } else if (currentView === 'edit' && editingCategory) {
      // Update existing category
      const updatedCategory = updateCategoryFromForm(editingCategory, formData)
      setCategories(prev => sortCategories(
        prev.map(cat => cat['id'] === editingCategory['id'] ? updatedCategory : cat)
      ))
      toast.success('Kategori berhasil diperbarui!')
    }

    resetForm()
    void setCurrentView('list')
  }

  // Handle edit category
  const handleEditCategory = (category: Category) => {
    void setEditingCategory(category)
    setFormData({
      id: category['id'],
      name: category.name,
      icon: category.icon,
      description: category.description,
      commonIngredients: [...category.commonIngredients]
    })
    void setCurrentView('edit')
  }

  // Handle delete category
  const handleDeleteCategory = (categoryId: string) => {
    const category = categories.find(c => c['id'] === categoryId)
    if (!category) {return}

    toast.error('Konfirmasi diperlukan. Gunakan komponen UI untuk konfirmasi penghapusan.', { 
      icon: '⚠️' 
    })
  }

  // Bulk operations
  const handleSelectAll = () => {
    if (selectedItems.length === filteredCategories.length) {
      void setSelectedItems([])
    } else {
      setSelectedItems(filteredCategories.map(category => category['id']))
    }
  }

  const handleSelectItem = (itemId: string) => {
    setSelectedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  const handleBulkDelete = () => {
    if (selectedItems.length === 0) {return}

    toast.error('Konfirmasi diperlukan. Gunakan komponen UI untuk konfirmasi penghapusan massal.', { 
      icon: '⚠️' 
    })
  }

  const handleBulkEdit = () => {
    if (selectedItems.length === 0) {return}

    const selectedCategories = filteredCategories.filter(category =>
      selectedItems.includes(category['id'])
    )
    
    // Use the selected categories for bulk edit
    toast(`Bulk edit untuk ${selectedCategories.length} kategori akan segera tersedia`, { icon: 'ℹ️' })
  }

  // Handle view category (placeholder)
  const handleViewCategory = (category: Category) => {
    toast(`Melihat detail kategori: ${category.name}`, { icon: '👁️' })
  }

  // Simulate loading delay
  useEffect(() => {
    const timer = setTimeout(() => {
      void setIsLoading(false)
    }, LOADING_DELAY)

    return () => clearTimeout(timer)
  }, [])

  // Reset to page 1 when search changes
  useEffect(() => {
    void setCurrentPage(1)
  }, [searchTerm])

  // Reset selected items when search or page changes
  useEffect(() => {
    void setSelectedItems([])
  }, [searchTerm, currentPage, pageSize])

  return {
    // State
    categories,
    currentView,
    editingCategory,
    selectedItems,
    searchTerm,
    isLoading,
    currentPage,
    pageSize,
    formData,

    // Computed values
    filteredCategories,
    paginatedCategories,
    paginationInfo,

    // Actions
    setCurrentView,
    setSearchTerm,
    setCurrentPage,
    setPageSize,
    setFormData,

    // CRUD operations
    handleSaveCategory,
    handleEditCategory,
    handleDeleteCategory,

    // Bulk operations
    handleSelectAll,
    handleSelectItem,
    handleBulkDelete,
    handleBulkEdit,

    // Utility functions
    resetForm,
    handleViewCategory
  }
}
