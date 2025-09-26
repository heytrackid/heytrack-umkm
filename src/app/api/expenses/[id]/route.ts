import { NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const supabase = createSupabaseClient();
    
    const { data: expense, error } = await (supabase as any)
      .from('expenses')
      .select(`
        *,
        supplier:suppliers(name)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    return NextResponse.json(expense);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const supabase = createSupabaseClient();
    const body = await request.json() as any;

    const { data: expense, error } = await (supabase as any)
      .from('expenses')
      .update(body)
      .eq('id', id)
      .select(`
        *,
        supplier:suppliers(name)
      `)
      .single();

    if (error) throw error;

    return NextResponse.json(expense);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const supabase = createSupabaseClient();

    const { error } = await (supabase as any)
      .from('expenses')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'Expense deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
