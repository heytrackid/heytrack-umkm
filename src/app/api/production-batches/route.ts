// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
export const runtime = 'nodejs'


import { NextResponse } from 'next/server'

import { isErrorResponse, requireAuth } from '@/lib/api-auth'
import { cacheInvalidation } from '@/lib/cache'
import { handleAPIError } from '@/lib/errors/api-error-handler'
import { apiLogger } from '@/lib/logger'
import { SecurityPresets, withSecurity } from '@/utils/security/index'
import { createClient } from '@/utils/supabase/server'



async function getHandler() {
  try {
    // Authenticate with Stack Auth
    const authResult = await requireAuth()
    if (isErrorResponse(authResult)) {
      return authResult
    }
    const user = authResult

    const supabase = await createClient();

    // ✅ Fetch with RLS (user_id filter automatically applied)
    const { data: batches, error } = await supabase
      .from('productions')
      .select(`
        *,
        recipe:recipes(name, cook_time)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      apiLogger.error({ error, userId: user.id }, 'Failed to fetch production batches')
      throw error
    }

    // ✅ Map database columns to expected format
    const mappedBatches = batches?.map(batch => {
      const typedBatch = batch as any // Type assertion to fix RLS inference
      return {
        ...typedBatch,
        recipe_name: typedBatch.recipe?.name, // Extract recipe name from joined data
        batch_number: typedBatch['id'].slice(0, 8).toUpperCase(), // Generate batch number from ID
        planned_date: typedBatch.created_at, // Use created_at as planned_date
        actual_cost: typedBatch.total_cost, // Map total_cost to actual_cost
        unit: 'pcs', // Default unit since recipes table doesn't have unit column
        // Add missing fields with default values
        priority: 5, // Default priority (assuming 1-10 scale)
        estimated_duration: typedBatch.recipe?.cook_time ?? 30, // Default to 30 minutes if not available
      }
    }) ?? []

    return NextResponse.json(mappedBatches);
  } catch (error) {
    return handleAPIError(error)
  }
}

export const POST = withSecurity(postHandler, SecurityPresets.enhanced())

 export const GET = withSecurity(getHandler, SecurityPresets.enhanced())

 async function postHandler(request: Request) {
  try {
    // Authenticate with Stack Auth
    const authResult = await requireAuth()
    if (isErrorResponse(authResult)) {
      return authResult
    }
    const user = authResult

    const supabase = await createClient();

    const _body = await request.json() as Record<string, unknown>;

    // ✅ Insert with user_id
    const { data: batch, error } = await supabase
      .from('productions')
      .insert([{
        ..._body,
        user_id: user.id
      } as never])
      .select(`
        *,
        recipe:recipes(name, cook_time)
      `)
      .single();

    if (error) {
      apiLogger.error({ error, userId: user.id }, 'Failed to create production batch')
      throw error
    }

    // ✅ Map database columns to expected format
    const typedBatch = batch as any // Type assertion to fix RLS inference
    const mappedBatch = {
      ...typedBatch,
      recipe_name: typedBatch.recipe?.name, // Extract recipe name from joined data
      batch_number: typedBatch['id'].slice(0, 8).toUpperCase(),
      planned_date: typedBatch.created_at,
      actual_cost: typedBatch.total_cost,
      unit: 'pcs', // Default unit since recipes table doesn't have unit column
      // Add missing fields with default values
      priority: 5, // Default priority (assuming 1-10 scale)
      estimated_duration: typedBatch.recipe?.cook_time ?? 30, // Default to 30 minutes if not available
    }

    // Invalidate cache
    cacheInvalidation.all()

    return NextResponse.json(mappedBatch, { status: 201 })
  } catch (error) {
    return handleAPIError(error)
  }
}
