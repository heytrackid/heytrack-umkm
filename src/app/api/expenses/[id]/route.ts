import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server'
import { getErrorMessage, isValidUUID, isRecord, extractFirst, safeString } from '@/lib/type-guards';
import { prepareUpdate } from '@/lib/supabase/insert-helpers';

// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
export const runtime = 'nodejs'

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  
  // Validate UUID format
  if (!isValidUUID(id)) {
    return NextResponse.json({ error: 'Invalid expense ID format' }, { status: 400 });
  }
  
  try {
    const supabase = await createClient();
    
    const { data: expense, error } = await supabase
      .from('expenses')
      .select(`
        *,
        supplier:suppliers(name)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Expense not found' },
          { status: 404 }
        )
      }
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
    if ('supplier' in expense) {
      const supplier = extractFirst(expense.supplier)
      if (supplier && isRecord(supplier) && 'name' in supplier) {
        // Supplier data safely extracted
        (expense as any).supplier_name = safeString(supplier.name, 'Unknown')
      }
    }

    return NextResponse.json(expense);
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  
  // Validate UUID format
  if (!isValidUUID(id)) {
    return NextResponse.json({ error: 'Invalid expense ID format' }, { status: 400 });
  }
  
  try {
    const supabase = await createClient();
    const body = await request.json();

    const updatePayload = prepareUpdate('financial_records', body)

    // ✅ Use financial_records table
    const { data: expense, error } = await supabase
      .from('financial_records')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Expense record not found' },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { error: error.message || 'Failed to update expense' },
        { status: 500 }
      )
    }

    return NextResponse.json(expense);
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  
  // Validate UUID format
  if (!isValidUUID(id)) {
    return NextResponse.json({ error: 'Invalid expense ID format' }, { status: 400 });
  }
  
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json(
        { error: error.message || 'Failed to delete expense' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Expense deleted successfully' });
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
