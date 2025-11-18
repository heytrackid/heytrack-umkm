// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
export const runtime = 'nodejs'


import { NextResponse } from 'next/server';

import { isErrorResponse, requireAuth } from '@/lib/api-auth';
import { apiLogger, logError } from '@/lib/logger';
import { prepareUpdate } from '@/lib/supabase/insert-helpers';
import { extractFirst, getErrorMessage, isRecord, isValidUUID, safeString } from '@/lib/type-guards';
import { UpdateExpenseSchema } from '@/lib/validations/api-schemas';
import type { Database } from '@/types/database';
import { createSecureRouteHandler, SecurityPresets } from '@/utils/security/index';
import { createClient } from '@/utils/supabase/server';

// GET handler for fetching a single expense
async function getExpenseHandler(
  _request: Request,
  { params }: { params: Promise<Record<string, string>> }
): Promise<NextResponse> {
  const { id } = await params;

  // Validate UUID format
  if (!isValidUUID(id)) {
    return NextResponse.json({ error: 'Invalid expense ID format' }, { status: 400 });
  }

  try {
    apiLogger.info({ expenseId: id }, 'GET /api/expenses/[id] - Request received');

    // Authenticate with Stack Auth
    const authResult = await requireAuth()
    if (isErrorResponse(authResult)) {
      return authResult
    }
    const user = authResult

    const supabase = await createClient();

    const { data: expense, error } = await supabase
      .from('financial_records')
      .select('*')
      .eq('id', id)
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

    const responseExpense: Record<string, unknown> = { ...(expense as Record<string, unknown>) };
    if ('supplier' in expense) {
      const supplier = extractFirst(expense['supplier'])
      if (supplier && isRecord(supplier) && 'name' in supplier) {
        // Supplier data safely extracted
        responseExpense['supplier_name'] = safeString(supplier['name'], 'Unknown');
      }
    }

    apiLogger.info({ expenseId: id, userId: user.id }, 'GET /api/expenses/[id] - Success');

    return NextResponse.json(responseExpense);
  } catch (error) {
    logError(apiLogger, error, 'GET /api/expenses/[id] - Unexpected error');
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

// PUT handler for updating an expense
async function updateExpenseHandler(
  request: Request,
  { params }: { params: Promise<Record<string, string>> }
): Promise<NextResponse> {
  const { id } = await params;

  // Validate UUID format
  if (!isValidUUID(id)) {
    return NextResponse.json({ error: 'Invalid expense ID format' }, { status: 400 });
  }

  try {
    apiLogger.info({ expenseId: id }, 'PUT /api/expenses/[id] - Request received');

    // Authenticate with Stack Auth
    const authResult = await requireAuth()
    if (isErrorResponse(authResult)) {
      return authResult
    }
    const user = authResult

    const supabase = await createClient();

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
      Object.entries(validation.data).filter(([, value]) => value !== undefined)
    ) as Database['public']['Tables']['financial_records']['Update'])

    // ✅ Use financial_records table

    const { data: expense, error } = await supabase
      .from('financial_records')
      .update(updatePayload as never)
      .eq('id', id)
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

    apiLogger.info({ expenseId: id, userId: user.id }, 'PUT /api/expenses/[id] - Success');
    return NextResponse.json(expense);
  } catch (error) {
    logError(apiLogger, error, 'PUT /api/expenses/[id] - Unexpected error');
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

// DELETE handler for deleting an expense
async function deleteExpenseHandler(
  _request: Request,
  { params }: { params: Promise<Record<string, string>> }
): Promise<NextResponse> {
  const { id } = await params;

  // Validate UUID format
  if (!isValidUUID(id)) {
    return NextResponse.json({ error: 'Invalid expense ID format' }, { status: 400 });
  }

  try {
    apiLogger.info({ expenseId: id }, 'DELETE /api/expenses/[id] - Request received');

    // Authenticate with Stack Auth
    const authResult = await requireAuth()
    if (isErrorResponse(authResult)) {
      return authResult
    }
    const user = authResult

    const supabase = await createClient();

    const { error } = await supabase
      .from('financial_records')
      .delete()
      .eq('id', id)
      .eq('type', 'EXPENSE');

    if (error) {
      logError(apiLogger, error, 'DELETE /api/expenses/[id] - Database error');
      return NextResponse.json(
        { error: error.message || 'Failed to delete expense' },
        { status: 500 }
      )
    }

    apiLogger.info({ expenseId: id, userId: user.id }, 'DELETE /api/expenses/[id] - Success');
    return NextResponse.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    logError(apiLogger, error, 'DELETE /api/expenses/[id] - Unexpected error');
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

// Apply security middleware
export const GET = createSecureRouteHandler(getExpenseHandler, 'GET /api/expenses/[id]', SecurityPresets.enhanced())
export const PUT = createSecureRouteHandler(updateExpenseHandler, 'PUT /api/expenses/[id]', SecurityPresets.enhanced())
export const DELETE = createSecureRouteHandler(deleteExpenseHandler, 'DELETE /api/expenses/[id]', SecurityPresets.enhanced())
