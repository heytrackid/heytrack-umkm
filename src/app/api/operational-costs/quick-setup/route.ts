import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { apiLogger } from '@/lib/logger'
import type { Database } from '@/types/supabase-generated'

/**
 * POST /api/operational-costs/quick-setup
 * 
 * Creates template operational costs for new users
 */
export async function POST() {
  try {
    const supabase = await createClient()
    
    // Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Template operational costs (common for Indonesian culinary businesses)
    const templates: Database['public']['Tables']['expenses']['Insert'][] = [
      {
        user_id: user.id,
        category: 'Utilities',
        subcategory: 'Listrik',
        amount: 500000,
        description: 'Biaya listrik bulanan',
        expense_date: new Date().toISOString().split('T')[0],
        payment_method: 'BANK_TRANSFER',
        status: 'pending',
        is_recurring: true,
        recurring_frequency: 'monthly',
        tags: ['template']
      },
      {
        user_id: user.id,
        category: 'Utilities',
        subcategory: 'Air',
        amount: 150000,
        description: 'Biaya air bulanan',
        expense_date: new Date().toISOString().split('T')[0],
        payment_method: 'BANK_TRANSFER',
        status: 'pending',
        is_recurring: true,
        recurring_frequency: 'monthly',
        tags: ['template']
      },
      {
        user_id: user.id,
        category: 'Utilities',
        subcategory: 'Gas',
        amount: 200000,
        description: 'Biaya gas bulanan',
        expense_date: new Date().toISOString().split('T')[0],
        payment_method: 'CASH',
        status: 'pending',
        is_recurring: true,
        recurring_frequency: 'monthly',
        tags: ['template']
      },
      {
        user_id: user.id,
        category: 'Labor',
        subcategory: 'Gaji Karyawan',
        amount: 3000000,
        description: 'Gaji karyawan bulanan',
        expense_date: new Date().toISOString().split('T')[0],
        payment_method: 'BANK_TRANSFER',
        status: 'pending',
        is_recurring: true,
        recurring_frequency: 'monthly',
        tags: ['template']
      },
      {
        user_id: user.id,
        category: 'Rent',
        subcategory: 'Sewa Tempat',
        amount: 2000000,
        description: 'Sewa tempat usaha bulanan',
        expense_date: new Date().toISOString().split('T')[0],
        payment_method: 'BANK_TRANSFER',
        status: 'pending',
        is_recurring: true,
        recurring_frequency: 'monthly',
        tags: ['template']
      },
      {
        user_id: user.id,
        category: 'Marketing',
        subcategory: 'Iklan Online',
        amount: 500000,
        description: 'Biaya iklan dan promosi',
        expense_date: new Date().toISOString().split('T')[0],
        payment_method: 'BANK_TRANSFER',
        status: 'pending',
        is_recurring: true,
        recurring_frequency: 'monthly',
        tags: ['template']
      },
      {
        user_id: user.id,
        category: 'Maintenance',
        subcategory: 'Perawatan Peralatan',
        amount: 300000,
        description: 'Perawatan dan perbaikan peralatan',
        expense_date: new Date().toISOString().split('T')[0],
        payment_method: 'CASH',
        status: 'pending',
        is_recurring: true,
        recurring_frequency: 'monthly',
        tags: ['template']
      },
      {
        user_id: user.id,
        category: 'Packaging',
        subcategory: 'Kemasan',
        amount: 400000,
        description: 'Biaya kemasan produk',
        expense_date: new Date().toISOString().split('T')[0],
        payment_method: 'CASH',
        status: 'pending',
        is_recurring: true,
        recurring_frequency: 'monthly',
        tags: ['template']
      }
    ]

    // Insert all templates
    const { data, error } = await supabase
      .from('expenses')
      .insert(templates)
      .select()

    if (error) {
      apiLogger.error({ error, userId: user.id }, 'Failed to create template costs')
      return NextResponse.json(
        { error: 'Failed to create template costs' },
        { status: 500 }
      )
    }

    apiLogger.info({ userId: user.id, count: data.length }, 'Template costs created')

    return NextResponse.json({
      message: 'Template costs created successfully',
      count: data.length,
      costs: data
    }, { status: 201 })

  } catch (error: unknown) {
    apiLogger.error({ error }, 'Error in POST /api/operational-costs/quick-setup')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
