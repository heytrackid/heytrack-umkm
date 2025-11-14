// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
export const runtime = 'nodejs'

import { NextResponse } from 'next/server'

import { isErrorResponse, requireAuth } from '@/lib/api-auth'
import { apiLogger } from '@/lib/logger'
import type { Insert } from '@/types/database'
import { createSecureHandler, SecurityPresets } from '@/utils/security/index'

import { createClient } from '@/utils/supabase/server'

/**
 * POST /api/operational-costs/quick-setup
 * 
 * Creates template operational costs for new users
 */
async function postHandler(): Promise<NextResponse> {
  try {
    // Authenticate with Stack Auth
    const authResult = await requireAuth()
    if (isErrorResponse(authResult)) {
      return authResult
    }
    const user = authResult

    const supabase = await createClient()    // Template operational costs (common for Indonesian culinary businesses)
    const templates: Array<Insert<'operational_costs'>> = [
      {
        user_id: user['id'],
        category: 'utilities',
        description: 'Biaya listrik bulanan',
        amount: 500000,
        frequency: 'monthly',
        recurring: true,
        is_active: true,
        notes: 'Template biaya utilitas - sesuaikan dengan kebutuhan'
      },
      {
        user_id: user['id'],
        category: 'utilities',
        description: 'Biaya air bulanan',
        amount: 150000,
        frequency: 'monthly',
        recurring: true,
        is_active: true,
        notes: 'Template biaya utilitas'
      },
      {
        user_id: user['id'],
        category: 'utilities',
        description: 'Biaya gas bulanan',
        amount: 200000,
        frequency: 'monthly',
        recurring: true,
        is_active: true,
        notes: 'Template biaya utilitas'
      },
      {
        user_id: user['id'],
        category: 'staff',
        description: 'Gaji karyawan bulanan',
        amount: 3000000,
        frequency: 'monthly',
        recurring: true,
        is_active: true,
        notes: 'Template gaji - sesuaikan dengan jumlah karyawan'
      },
      {
        user_id: user['id'],
        category: 'rent',
        description: 'Sewa tempat usaha',
        amount: 2000000,
        frequency: 'monthly',
        recurring: true,
        is_active: true,
        notes: 'Template sewa tempat'
      },
      {
        user_id: user['id'],
        category: 'communication',
        description: 'Internet & Telepon',
        amount: 300000,
        frequency: 'monthly',
        recurring: true,
        is_active: true,
        notes: 'Template komunikasi'
      },
      {
        user_id: user['id'],
        category: 'maintenance',
        description: 'Perawatan peralatan',
        amount: 300000,
        frequency: 'monthly',
        recurring: true,
        is_active: true,
        notes: 'Template perawatan'
      },
      {
        user_id: user['id'],
        category: 'transport',
        description: 'BBM & Transport',
        amount: 500000,
        frequency: 'monthly',
        recurring: true,
        is_active: true,
        notes: 'Template transport & logistik'
      }
    ]

    // Insert all templates
    const { data, error } = await supabase
      .from('operational_costs')
      .insert(templates as never)
      .select()

    if (error) {
      apiLogger.error({ error, userId: user.id }, 'Failed to create template costs')
      return NextResponse.json(
        { error: 'Failed to create template costs' },
        { status: 500 }
      )
    }

    apiLogger.info({ userId: user['id'], count: data.length }, 'Template costs created')

    return NextResponse.json({
      message: 'Template costs created successfully',
      count: data.length,
      costs: data
    }, { status: 201 })
  } catch (error) {
    apiLogger.error({ error }, 'Error in POST /api/operational-costs/quick-setup')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const POST = createSecureHandler(postHandler, 'POST /api/operational-costs/quick-setup', SecurityPresets.enhanced())
