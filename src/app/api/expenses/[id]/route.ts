// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
export const runtime = 'nodejs'


import { NextResponse } from 'next/server';

import { apiLogger, logError } from '@/lib/logger';
import { prepareUpdate } from '@/lib/supabase/insert-helpers';
import { extractFirst, getErrorMessage, isRecord, isValidUUID, safeString } from '@/lib/type-guards';
import { UpdateExpenseSchema } from '@/lib/validations/api-schemas';
import type { Database } from '@/types/database';
import { SecurityPresets, withSecurity } from '@/utils/security';
import { createClient } from '@/utils/supabase/server';


// Apply security middleware
const securedGET = withSecurity(getHandler, SecurityPresets.enhanced())
const securedPUT = withSecurity(putHandler, SecurityPresets.enhanced())
const securedDELETE = withSecurity(deleteHandler, SecurityPresets.enhanced())

export { securedDELETE as DELETE, securedGET as GET, securedPUT as PUT };

async function getHandler(
  _request: Request,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  const { id } = params;

  // Validate UUID format
  if (!isValidUUID(id)) {
    return NextResponse.json({ error: 'Invalid expense ID format' }, { status: 400 });
  }

  try {
    apiLogger.info({ expenseId: id }, 'GET /api/expenses/[id] - Request received');

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      logError(apiLogger, authError, 'GET /api/expenses/[id] - Unauthorized');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: expense, error } = await supabase
      .from('financial_records')
      .select('*')
      .eq('id', id)
      .eq('user_id', user['id'])
      .eq('type', 'EXPENSE')
      .single();

    if (error) {
      if (error['code'] === 'PGRST116') {
        return NextResponse.json(
          { error: 'Expense not found' },
          { status: 404 }
        )
      }
      logError(apiLogger, error, 'GET /api/expenses/[id] - Database error');
      return NextResponse.json(
        { error: error.message || 'Failed to fetch expense' },
        { status: 500 }
      )
    }

    // ✅ V2: Validate expense structure
    if (!isRecord(expense)) {
      return NextResponse.json(
        { error: 'Invalid expense data structure' },
        { status: 500 }
      )
    }

    // ✅ V2: Safe extraction of supplier data
    let responseExpense: typeof expense & { supplier_name?: string } = expense;
    if ('supplier' in expense) {
      const supplier = extractFirst(expense.supplier)
      if (supplier && isRecord(supplier) && 'name' in supplier) {
        // Supplier data safely extracted
        responseExpense = {
          ...expense,
          supplier_name: safeString(supplier['name'], 'Unknown')
        };
      }
    }

    apiLogger.info({ expenseId: id, userId: user['id'] }, 'GET /api/expenses/[id] - Success');
    return NextResponse.json(responseExpense);
  } catch (error: unknown) {
    logError(apiLogger, error, 'GET /api/expenses/[id] - Unexpected error');
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

async function putHandler(
  request: Request,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  const { id } = params;

  // Validate UUID format
  if (!isValidUUID(id)) {
    return NextResponse.json({ error: 'Invalid expense ID format' }, { status: 400 });
  }

  try {
    apiLogger.info({ expenseId: id }, 'PUT /api/expenses/[id] - Request received');

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      logError(apiLogger, authError, 'PUT /api/expenses/[id] - Unauthorized');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json() as unknown;

    // Validate request body
    const validation = UpdateExpenseSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid request data',
          details: validation.error.issues
        },
        { status: 400 }
      );
    }

    const updatePayload = prepareUpdate('financial_records', Object.fromEntries(
      Object.entries(validation.data).filter(([_, value]) => value !== undefined)
    ) as Database['public']['Tables']['financial_records']['Update'])

    // ✅ Use financial_records table
    const { data: expense, error } = await supabase
      .from('financial_records')
      .update(updatePayload)
      .eq('id', id)
      .eq('user_id', user['id'])
      .select()
      .single();

    if (error) {
      if (error['code'] === 'PGRST116') {
        return NextResponse.json(
          { error: 'Expense record not found' },
          { status: 404 }
        )
      }
      logError(apiLogger, error, 'PUT /api/expenses/[id] - Database error');
      return NextResponse.json(
        { error: error.message || 'Failed to update expense' },
        { status: 500 }
      )
    }

    apiLogger.info({ expenseId: id, userId: user['id'] }, 'PUT /api/expenses/[id] - Success');
    return NextResponse.json(expense);
  } catch (error: unknown) {
    logError(apiLogger, error, 'PUT /api/expenses/[id] - Unexpected error');
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

async function deleteHandler(
  _request: Request,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  const { id } = params;

  // Validate UUID format
  if (!isValidUUID(id)) {
    return NextResponse.json({ error: 'Invalid expense ID format' }, { status: 400 });
  }

  try {
    apiLogger.info({ expenseId: id }, 'DELETE /api/expenses/[id] - Request received');

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      logError(apiLogger, authError, 'DELETE /api/expenses/[id] - Unauthorized');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { error } = await supabase
      .from('financial_records')
      .delete()
      .eq('id', id)
      .eq('user_id', user['id'])
      .eq('type', 'EXPENSE');

    if (error) {
      logError(apiLogger, error, 'DELETE /api/expenses/[id] - Database error');
      return NextResponse.json(
        { error: error.message || 'Failed to delete expense' },
        { status: 500 }
      )
    }

    apiLogger.info({ expenseId: id, userId: user['id'] }, 'DELETE /api/expenses/[id] - Success');
    return NextResponse.json({ message: 'Expense deleted successfully' });
  } catch (error: unknown) {
    logError(apiLogger, error, 'DELETE /api/expenses/[id] - Unexpected error');
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
