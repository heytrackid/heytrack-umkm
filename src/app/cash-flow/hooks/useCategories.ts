import { useState, useEffect } from 'react'

import { incomeCategories, expenseCategories } from '../constants'

type CategoryType = 'income' | 'expense'

interface CategoryItem {
  id: string
  name: string
  type: CategoryType
}

const STORAGE_KEY = 'custom_categories'

export function useCategories() {
  const [categories, setCategories] = useState<CategoryItem[]>([])

  // Load categories from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setCategories(parsed)
      } catch (error) {
        console.error('Failed to parse stored categories:', error)
        initializeDefaultCategories()
      }
    } else {
      initializeDefaultCategories()
    }
  }, [])

  const initializeDefaultCategories = () => {
    const defaultCategories: CategoryItem[] = [
      ...incomeCategories.map(name => ({ id: `income-${name}`, name, type: 'income' as CategoryType })),
      ...expenseCategories.map(name => ({ id: `expense-${name}`, name, type: 'expense' as CategoryType }))
    ]
    setCategories(defaultCategories)
  }

  const getIncomeCategories = (): string[] => {
    return categories.filter(cat => cat.type === 'income').map(cat => cat.name)
  }

  const getExpenseCategories = (): string[] => {
    return categories.filter(cat => cat.type === 'expense').map(cat => cat.name)
  }

  return {
    incomeCategories: getIncomeCategories(),
    expenseCategories: getExpenseCategories(),
    refreshCategories: () => {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          setCategories(parsed)
        } catch (error) {
          initializeDefaultCategories()
        }
      } else {
        initializeDefaultCategories()
      }
    }
  }
}