import { createSupabaseClient } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import { getErrorMessage } from '@/lib/type-guards';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const supabase = createSupabaseClient();

    const { data: batch, error } = await supabase
      .from('production_log')
      .select(`
        *,
        recipe:resep(nama)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    return NextResponse.json(batch);
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

    const { data: batch, error } = await supabase
      .from('production_log')
      .update(body as Record<string, unknown>)
      .eq('id', id)
      .select(`
        *,
        recipe:resep(nama)
      `)
      .single();

    if (error) throw error;

    return NextResponse.json(batch);
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
      .from('production_log')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'Production log deleted successfully' });
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
