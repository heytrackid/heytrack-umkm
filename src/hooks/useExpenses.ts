import { useEffect, useState } from 'react'

import { apiLogger } from '@/lib/logger'
export interface Expense {
  id: string
  date: string
  category: string
  description: string
  amount: number
  payment_method: string
  vendor: string
  receipt_number: string
  notes?: string
  status: 'paid' | 'pending' | 'overdue'
  recurring: boolean
  recurring_period?: 'weekly' | 'monthly' | 'quarterly' | 'yearly'
  created_at?: string
  updated_at?: string
}

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchExpenses = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/expenses')

      if (!response.ok) {
        throw new Error('Failed to fetch expenses')
      }

      const data = await response.json()
      setExpenses(data)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage)
      apiLogger.error({ error: err }, 'Error fetching expenses:')
    } finally {
      setLoading(false)
    }
  }

  const addExpense = async (expenseData: Omit<Expense, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(expenseData),
      })

      if (!response.ok) {
        throw new Error('Failed to add expense')
      }

      const newExpense = await response.json()
      setExpenses(prev => [newExpense, ...prev])
      return newExpense
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage)
      throw err
    }
  }

  const updateExpense = async (id: string, expenseData: Partial<Expense>) => {
    try {
      const response = await fetch(`/api/expenses/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(expenseData),
      })

      if (!response.ok) {
        throw new Error('Failed to update expense')
      }

      const updatedExpense = await response.json()
      setExpenses(prev =>
        prev.map(expense =>
          expense.id === id ? updatedExpense : expense
        )
      )
      return updatedExpense
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage)
      throw err
    }
  }

  const deleteExpense = async (id: string) => {
    try {
      const response = await fetch(`/api/expenses/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete expense')
      }

      setExpenses(prev => prev.filter(expense => expense.id !== id))
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage)
      throw err
    }
  }

  useEffect(() => {
    fetchExpenses()
  }, [])

  return {
    expenses,
    loading,
    error,
    addExpense,
    updateExpense,
    deleteExpense,
    refetch: fetchExpenses
  }
}