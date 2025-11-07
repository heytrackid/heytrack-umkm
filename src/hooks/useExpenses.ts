'use client'

import { useEffect, useState } from 'react'

import { createClientLogger } from '@/lib/client-logger'

const logger = createClientLogger('Hook')
import { getErrorMessage } from '@/lib/type-guards'


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
  status: 'overdue' | 'paid' | 'pending'
  recurring: boolean
  recurring_period?: 'monthly' | 'quarterly' | 'weekly' | 'yearly'
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
      const response = await fetch('/api/expenses', {
        credentials: 'include', // Include cookies for authentication
      })

      if (!response.ok) {
        throw new Error('Failed to fetch expenses')
      }

      const data = await response.json()
      setExpenses(data)
    } catch (error) {
      const errorMessage = getErrorMessage(error)
      setError(errorMessage)
      logger.error({ error: errorMessage }, 'Error fetching expenses:')
    } finally {
      setLoading(false)
    }
  }

  const addExpense = async (expenseData: Omit<Expense, 'created_at' | 'id' | 'updated_at'>) => {
    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(expenseData),
        credentials: 'include', // Include cookies for authentication
      })

      if (!response.ok) {
        throw new Error('Failed to add expense')
      }

      const newExpense = await response.json()
      setExpenses(prev => [newExpense, ...prev])
      return newExpense
    } catch (error) {
      const errorMessage = getErrorMessage(error)
      setError(errorMessage)
      throw error
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
        credentials: 'include', // Include cookies for authentication
      })

      if (!response.ok) {
        throw new Error('Failed to update expense')
      }

      const updatedExpense = await response.json()
      setExpenses(prev =>
        prev.map(expense =>
          expense['id'] === id ? updatedExpense : expense
        )
      )
      return updatedExpense
    } catch (error) {
      const errorMessage = getErrorMessage(error)
      setError(errorMessage)
      throw error
    }
  }

  const deleteExpense = async (id: string) => {
    try {
      const response = await fetch(`/api/expenses/${id}`, {
        method: 'DELETE',
        credentials: 'include', // Include cookies for authentication
      })

      if (!response.ok) {
        throw new Error('Failed to delete expense')
      }

      setExpenses(prev => prev.filter(expense => expense['id'] !== id))
    } catch (error) {
      const errorMessage = getErrorMessage(error)
      setError(errorMessage)
      throw error
    }
  }

  useEffect(() => {
    void fetchExpenses()
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
