import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { handleAPIError, APIError } from '@/lib/errors/api-error-handler'
import { apiLogger } from '@/lib/logger'
import { cacheInvalidation } from '@/lib/cache'

// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
export const runtime = 'nodejs'

export async function GET() {
  try {
    const supabase = await createClient();
    
    // ✅ Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new APIError('Unauthorized', { status: 401, code: 'AUTH_REQUIRED' })
    }
    
    // ✅ Fetch with RLS (user_id filter)
    const { data: batches, error } = await supabase
      .from('productions')
      .select(`
        *,
        recipe:recipes(name, cook_time)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      apiLogger.error({ error, userId: user.id }, 'Failed to fetch production batches')
      throw error
    }

    // ✅ Map database columns to expected format
    const mappedBatches = batches?.map(batch => ({
      ...batch,
      recipe_name: batch.recipe?.name, // Extract recipe name from joined data
      batch_number: batch.id.slice(0, 8).toUpperCase(), // Generate batch number from ID
      planned_date: batch.created_at, // Use created_at as planned_date
      actual_cost: batch.total_cost, // Map total_cost to actual_cost
      unit: 'pcs', // Default unit since recipes table doesn't have unit column
      // Add missing fields with default values
      priority: 5, // Default priority (assuming 1-10 scale)
      estimated_duration: batch.recipe?.cook_time ?? 30, // Default to 30 minutes if not available
    })) || []

    return NextResponse.json(mappedBatches);
  } catch (error: unknown) {
    return handleAPIError(error)
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    
    // ✅ Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new APIError('Unauthorized', { status: 401, code: 'AUTH_REQUIRED' })
    }
    
    const body = await request.json();

    // ✅ Insert with user_id
    const { data: batch, error } = await supabase
      .from('productions')
      .insert([{
        ...body,
        user_id: user.id
      }])
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
    const mappedBatch = {
      ...batch,
      recipe_name: batch.recipe?.name, // Extract recipe name from joined data
      batch_number: batch.id.slice(0, 8).toUpperCase(),
      planned_date: batch.created_at,
      actual_cost: batch.total_cost,
      unit: 'pcs', // Default unit since recipes table doesn't have unit column
      // Add missing fields with default values
      priority: 5, // Default priority (assuming 1-10 scale)
      estimated_duration: batch.recipe?.cook_time ?? 30, // Default to 30 minutes if not available
    }

    // Invalidate cache
    cacheInvalidation.all()

    return NextResponse.json(mappedBatch, { status: 201 })
  } catch (error: unknown) {
    return handleAPIError(error)
  }
}
