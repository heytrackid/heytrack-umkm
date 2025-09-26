import { NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createSupabaseClient();
    
    const { data: batch, error } = await supabase
      .from('production_batches')
      .select(`
        *,
        recipe:recipes(name)
      `)
      .eq('id', params.id)
      .single();

    if (error) throw error;

    return NextResponse.json(batch);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createSupabaseClient();
    const body = await request.json() as any;

    const { data: batch, error } = await supabase
      .from('production_batches')
      .update(body)
      .eq('id', params.id)
      .select(`
        *,
        recipe:recipes(name)
      `)
      .single();

    if (error) throw error;

    return NextResponse.json(batch);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createSupabaseClient();

    const { error } = await supabase
      .from('production_batches')
      .delete()
      .eq('id', params.id);

    if (error) throw error;

    return NextResponse.json({ message: 'Production batch deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}