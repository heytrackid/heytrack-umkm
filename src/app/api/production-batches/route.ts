import { NextResponse } from 'next/server';
import { getErrorMessage } from '@/lib/type-guards'
import { createClient } from '@/utils/supabase/server'
import { handleAPIError, APIError } from '@/lib/errors/api-error-handler'
import { apiLogger } from '@/lib/logger'
import type { Database } from '@/types/supabase-generated';

export async function GET() {
  try {
    const supabase = await createClient();
    
    // ✅ Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new APIError('Unauthorized', 401, 'AUTH_REQUIRED')
    }
    
    // ✅ Fetch with RLS (user_id filter)
    const { data: batches, error } = await supabase
      .from('productions')
      .select(`
        *,
        recipe:recipes(name, unit)
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
      batch_number: batch.id.slice(0, 8).toUpperCase(), // Generate batch number from ID
      planned_date: batch.created_at, // Use created_at as planned_date
      actual_cost: batch.total_cost, // Map total_cost to actual_cost
      unit: Array.isArray(batch.recipe) ? batch.recipe[0]?.unit : batch.recipe?.unit || 'pcs'
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
      throw new APIError('Unauthorized', 401, 'AUTH_REQUIRED')
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
        recipe:recipes(name, unit)
      `)
      .single();

    if (error) {
      apiLogger.error({ error, userId: user.id }, 'Failed to create production batch')
      throw error
    }

    // ✅ Map database columns to expected format
    const mappedBatch = {
      ...batch,
      batch_number: batch.id.slice(0, 8).toUpperCase(),
      planned_date: batch.created_at,
      actual_cost: batch.total_cost,
      unit: Array.isArray(batch.recipe) ? batch.recipe[0]?.unit : batch.recipe?.unit || 'pcs'
    }

    return NextResponse.json(mappedBatch, { status: 201 });
  } catch (error: unknown) {
    return handleAPIError(error)
  }
}