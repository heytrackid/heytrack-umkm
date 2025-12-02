export const runtime = 'nodejs'

import { createSuccessResponse } from '@/lib/api-core'
import { createApiRoute, type RouteContext } from '@/lib/api/route-factory'
import { handleAPIError } from '@/lib/errors/api-error-handler'
import { SecurityPresets } from '@/utils/security/api-middleware'
import { z } from 'zod'

const UpdateChecklistSchema = z.object({
  completedItems: z.array(z.string()).optional(),
  skippedItems: z.array(z.string()).optional(),
  dismissed: z.boolean().optional(),
  lastUpdated: z.string().optional(),
})

// Check actual data counts to determine completion status
async function checkActualProgress(
  supabase: RouteContext['supabase'],
  userId: string
): Promise<Record<string, boolean>> {
  const progress: Record<string, boolean> = {}

  try {
    // Check business profile (app_settings)
    const { count: settingsCount } = await supabase
      .from('app_settings')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
    progress['business_profile'] = (settingsCount ?? 0) > 0

    // Check ingredients count (min 5)
    const { count: ingredientsCount } = await supabase
      .from('ingredients')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
    progress['first_ingredients'] = (ingredientsCount ?? 0) >= 5

    // Check recipes count (min 1)
    const { count: recipesCount } = await supabase
      .from('recipes')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
    progress['first_recipe'] = (recipesCount ?? 0) >= 1

    // Check customers count (min 1)
    const { count: customersCount } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
    progress['first_customer'] = (customersCount ?? 0) >= 1

    // Check orders count (min 1)
    const { count: ordersCount } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
    progress['first_order'] = (ordersCount ?? 0) >= 1

    // Check purchases count (min 1)
    const { count: purchasesCount } = await supabase
      .from('ingredient_purchases')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
    progress['first_purchase'] = (purchasesCount ?? 0) >= 1

    // Check HPP calculations (min 1)
    const { count: hppCount } = await supabase
      .from('hpp_calculations')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
    progress['calculate_hpp'] = (hppCount ?? 0) >= 1

    // Check WhatsApp templates (min 1)
    const { count: templatesCount } = await supabase
      .from('whatsapp_templates')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
    progress['whatsapp_template'] = (templatesCount ?? 0) >= 1

    // Check production batches (min 1)
    const { count: productionCount } = await supabase
      .from('production_batches')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
    progress['first_production'] = (productionCount ?? 0) >= 1

    // Check financial records (min 1)
    const { count: transactionsCount } = await supabase
      .from('financial_records')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
    progress['first_transaction'] = (transactionsCount ?? 0) >= 1

    // Check suppliers (min 1)
    const { count: suppliersCount } = await supabase
      .from('suppliers')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
    progress['first_supplier'] = (suppliersCount ?? 0) >= 1

    // report_viewed is manual - check from steps_data
    progress['report_viewed'] = false
  } catch {
    // Silently handle errors - progress checks are non-critical
  }

  return progress
}

// GET /api/onboarding/checklist
async function getChecklistHandler(context: RouteContext) {
  const { user, supabase } = context

  try {
    // Get onboarding record
    const { data: onboarding, error } = await supabase
      .from('user_onboarding')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    if (error) throw error

    // Check actual progress from database
    const actualProgress = await checkActualProgress(supabase, user.id)

    // If report_viewed was manually marked, preserve it
    if (onboarding?.steps_data) {
      const stepsData = onboarding.steps_data as { completedItems?: string[] }
      if (stepsData.completedItems?.includes('report_viewed')) {
        actualProgress['report_viewed'] = true
      }
    }

    return createSuccessResponse({
      data: {
        onboarding,
        actualProgress,
      },
      message: 'Checklist progress retrieved',
    })
  } catch (error) {
    return handleAPIError(error, 'GET /api/onboarding/checklist')
  }
}

// PATCH /api/onboarding/checklist
async function updateChecklistHandler(
  context: RouteContext,
  _query?: never,
  body?: z.infer<typeof UpdateChecklistSchema>
) {
  const { user, supabase } = context

  if (!body) {
    return handleAPIError(new Error('Request body is required'), 'API Route')
  }

  try {
    // Get existing data first
    const { data: existing } = await supabase
      .from('user_onboarding')
      .select('steps_data')
      .eq('user_id', user.id)
      .maybeSingle()

    const existingData = (existing?.steps_data as Record<string, unknown>) ?? {}

    const newStepsData = {
      ...existingData,
      ...(body.completedItems && { completedItems: body.completedItems }),
      ...(body.skippedItems && { skippedItems: body.skippedItems }),
      ...(typeof body.dismissed === 'boolean' && { dismissed: body.dismissed }),
      lastUpdated: body.lastUpdated ?? new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from('user_onboarding')
      .upsert(
        {
          user_id: user.id,
          steps_data: newStepsData,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      )
      .select('*')
      .single()

    if (error) throw error

    return createSuccessResponse({
      data,
      message: 'Checklist progress updated',
    })
  } catch (error) {
    return handleAPIError(error, 'PATCH /api/onboarding/checklist')
  }
}

export const GET = createApiRoute(
  {
    method: 'GET',
    path: '/api/onboarding/checklist',
    securityPreset: SecurityPresets.basic(),
  },
  getChecklistHandler
)

export const PATCH = createApiRoute(
  {
    method: 'PATCH',
    path: '/api/onboarding/checklist',
    bodySchema: UpdateChecklistSchema,
    securityPreset: SecurityPresets.basic(),
  },
  updateChecklistHandler
)
