import { NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase';
import { getErrorMessage } from '@/lib/type-guards';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const supabase = createSupabaseClient();
    
    const { data: expense, error } = await supabase
      .from('expenses')
      .select(`
        *,
        supplier:suppliers(name)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

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
    const supabase = createSupabaseClient();
    const body = await request.json();

    const updatePayload = {
      ...body,
      updated_at: new Date().toISOString()
    };

    // @ts-ignore - Supabase table type mismatch with generated schema
    const { data: expense, error } = await supabase
      .from('expenses')
      .update(updatePayload)
      .eq('id', id)
      .select(`
        *,
        supplier:suppliers(name)
      `)
      .single();

    if (error) throw error;

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
    const supabase = createSupabaseClient();

    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'Expense deleted successfully' });
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
