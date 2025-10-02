import { formatCurrency } from '@/shared/utils/currency'
import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const limit = searchParams.get('limit') || '50'
  const offset = searchParams.get('offset') || '0'
  const category = searchParams.get('category')
  const startDate = searchParams.get('startDate')
  const endDate = searchParams.get('endDate')

  try {
    const supabase = createSupabaseClient()
    
    let query = (supabase as any)
      .from('expenses')
      .select('*')
      .order('expense_date', { ascending: false })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1)

    if (category) {
      query = query.eq('category', category)
    }

    if (startDate) {
      query = query.gte('expense_date', startDate)
    }

    if (endDate) {
      query = query.lte('expense_date', endDate)
    }

    const { data: expenses, error } = await query

    if (error) throw error

    // Get total count for pagination
    const { count } = await (supabase as any)
      .from('expenses')
      .select('*')

    // Get summary stats for dashboard
    const today = new Date().toISOString().split('T')[0]
    const thisMonth = new Date().toISOString().slice(0, 7)
    
    const { data: todayExpenses } = await (supabase as any)
      .from('expenses')
      .select('*')
      .eq('expense_date', today)
    
    const { data: monthExpenses } = await (supabase as any)
      .from('expenses')
      .select('*')
      .gte('expense_date', `${thisMonth}-01`)
      .lte('expense_date', `${thisMonth}-31`)

    const todayTotal = todayExpenses?.reduce((sum: number, exp: any) => sum + parseFloat(exp.amount || '0'), 0) || 0
    const monthTotal = monthExpenses?.reduce((sum: number, exp: any) => sum + parseFloat(exp.amount || '0'), 0) || 0
    
    // Category breakdown
    const categoryBreakdown = monthExpenses?.reduce((acc: any, exp: any) => {
      acc[exp.category] = (acc[exp.category] || 0) + parseFloat(exp.amount || '0')
      return acc
    }, {}) || {}

    return NextResponse.json({ 
      data: expenses, 
      count,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: count
      },
      summary: {
        today: todayTotal,
        thisMonth: monthTotal,
        categoryBreakdown
      }
    })
  } catch (error: any) {
    console.error('Error fetching expenses:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createSupabaseClient()
    const body = await request.json()

    const { data: expense, error } = await (supabase as any)
      .from('expenses')
      .insert([{
        ...body,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select('*')
      .single()

    if (error) throw error

    // Create notification for large expenses
    if (body.amount > 1000000) { // More than 1M IDR
      await (supabase as any).from('notifications').insert([{
        type: 'warning',
        category: 'finance',
        title: 'Large Expense Recorded',
        message: `A large expense of ${formatCurrency(parseFloat(body.amount))} has been recorded for ${body.category}`,
        entity_type: 'expense',
        entity_id: expense.id,
        priority: 'high'
      }])
    }

    return NextResponse.json(expense, { status: 201 })
  } catch (error: any) {
    console.error('Error creating expense:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
