import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server'
import type { Database } from '@/types/supabase-generated';
import { getErrorMessage } from '@/lib/type-guards';
import { prepareUpdate } from '@/lib/supabase/insert-helpers';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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

    if (error) {throw error;}

    return NextResponse.json(expense);
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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

    if (error) {throw error;}

    return NextResponse.json(expense);
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id);

    if (error) {throw error;}

    return NextResponse.json({ message: 'Expense deleted successfully' });
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
