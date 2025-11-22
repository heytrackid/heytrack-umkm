// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
import { handleAPIError } from '@/lib/errors/api-error-handler'
export const runtime = 'nodejs'

import { apiLogger } from '@/lib/logger'
import type { Insert } from '@/types/database'
import { createSuccessResponse } from '@/lib/api-core/responses'
import { createApiRoute, type RouteContext } from '@/lib/api/route-factory'
import type { NextResponse } from 'next/server'

/**
 * POST /api/operational-costs/quick-setup
 *
 * Creates template operational costs for new users
 */
async function postHandler(context: RouteContext): Promise<NextResponse> {
  const { user, supabase } = context

  try {
    const templates: Array<Insert<'operational_costs'>> = [
      {
        user_id: user.id,
        category: 'utilities',
        description: 'Biaya listrik bulanan',
        amount: 500000,
        frequency: 'monthly',
        recurring: true,
        is_active: true,
        notes: 'Template biaya utilitas - sesuaikan dengan kebutuhan'
      },
      {
        user_id: user.id,
        category: 'utilities',
        description: 'Biaya air bulanan',
        amount: 150000,
        frequency: 'monthly',
        recurring: true,
        is_active: true,
        notes: 'Template biaya utilitas'
      },
      {
        user_id: user.id,
        category: 'utilities',
        description: 'Biaya gas bulanan',
        amount: 200000,
        frequency: 'monthly',
        recurring: true,
        is_active: true,
        notes: 'Template biaya utilitas'
      },
      {
        user_id: user.id,
        category: 'staff',
        description: 'Gaji karyawan bulanan',
        amount: 3000000,
        frequency: 'monthly',
        recurring: true,
        is_active: true,
        notes: 'Template gaji - sesuaikan dengan jumlah karyawan'
      },
      {
        user_id: user.id,
        category: 'rent',
        description: 'Sewa tempat usaha',
        amount: 2000000,
        frequency: 'monthly',
        recurring: true,
        is_active: true,
        notes: 'Template sewa tempat'
      },
      {
        user_id: user.id,
        category: 'communication',
        description: 'Internet & Telepon',
        amount: 300000,
        frequency: 'monthly',
        recurring: true,
        is_active: true,
        notes: 'Template komunikasi'
      },
      {
        user_id: user.id,
        category: 'maintenance',
        description: 'Perawatan peralatan',
        amount: 300000,
        frequency: 'monthly',
        recurring: true,
        is_active: true,
        notes: 'Template perawatan'
      },
      {
        user_id: user.id,
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
      return handleAPIError(new Error('Failed to create template costs'), 'API Route')
    }

    apiLogger.info({ userId: user.id, count: data.length }, 'Template costs created')

    return createSuccessResponse({
      message: 'Template costs created successfully',
      count: data.length,
      costs: data
    }, 'Template costs created successfully', undefined, 201)
  } catch (error) {
    apiLogger.error({ error }, 'Error in POST /api/operational-costs/quick-setup')
    return handleAPIError(new Error('Internal server error'), 'API Route')
  }
}

export const POST = createApiRoute(
  { method: 'POST', path: '/api/operational-costs/quick-setup' },
  postHandler
)
