import { NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase';
import { getErrorMessage } from '@/lib/type-guards';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const supabase = createSupabaseClient();
    
    const { data: sale, error } = await supabase
      .from('sales')
      .select(`
        *,
        recipe:recipes(name)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    return NextResponse.json(sale);
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

    const { data: sale, error } = await supabase
      .from('sales')
      .update(body as Record<string, unknown>)
      .eq('id', id)
      .select(`
        *,
        recipe:recipes(name)
      `)
      .single();

    if (error) throw error;

    return NextResponse.json(sale);
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const supabase = createSupabaseClient();

    const { error } = await supabase
      .from('sales')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'Sale deleted successfully' });
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}