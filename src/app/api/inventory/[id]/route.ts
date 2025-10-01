import { NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const supabase = createSupabaseClient();
    
    const { data: inventory, error } = await (supabase as any)
      .from('ingredients')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    return NextResponse.json(inventory);
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

    const { data: inventory, error } = await (supabase as any)
      .from('ingredients')
      .update(body)
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;

    return NextResponse.json(inventory);
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
      .from('ingredients')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'Inventory item deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}