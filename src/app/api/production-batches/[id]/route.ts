import { createSupabaseClient } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import { getErrorMessage } from '@/lib/type-guards';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const supabase = createSupabaseClient();

    const { data: batch, error } = await supabase
      .from('productions')
      .select(`
        *,
        recipe:recipes(name)
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

    const updatePayload = {
      ...body,
      updated_at: new Date().toISOString()
    };

    const { data: batch, error } = await supabase
      .from('productions')
      .update(updatePayload)
      .eq('id', id)
      .select(`
        *,
        recipe:recipes(name)
      `)
      .single();

    if (error) throw error;

    return NextResponse.json(batch);
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
      .from('productions')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'Production log deleted successfully' });
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
