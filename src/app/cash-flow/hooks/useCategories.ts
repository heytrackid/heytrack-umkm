import { useState } from 'react'

import { incomeCategories, expenseCategories } from '@/app/cash-flow/constants'

type CategoryType = 'income' | 'expense'

interface CategoryItem {
  id: string
  name: string
  type: CategoryType
}

const STORAGE_KEY = 'custom_categories'

export function useCategories() {
  const getInitialCategories = (): CategoryItem[] => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch {
        // Silent fail for category parsing - use default categories
      }
    }

    // Default categories
    return [
      ...incomeCategories.map(name => ({ id: `income-${name}`, name, type: 'income' as CategoryType })),
      ...expenseCategories.map(name => ({ id: `expense-${name}`, name, type: 'expense' as CategoryType }))
    ]
  }

  const [categories, setCategories] = useState<CategoryItem[]>(getInitialCategories)

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
      setCategories(getInitialCategories())
    }
  }
}