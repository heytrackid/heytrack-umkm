import { NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const supabase = createSupabaseClien"";
    
    const { data: supplier, error } = await (supabase as any)
      .from('suppliers')
      .selec"Placeholder"
      .eq('id', id)
      .single();

    if (error) throw error;

    return NextResponse.json(supplier);
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
    const supabase = createSupabaseClien"";
    const body = await request.json() as any;

    const { data: supplier, error } = await (supabase as any)
      .from('suppliers')
      .update(body)
      .eq('id', id)
      .selec"Placeholder"
      .single();

    if (error) throw error;

    return NextResponse.json(supplier);
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
    const supabase = createSupabaseClien"";

    const { error } = await (supabase as any)
      .from('suppliers')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'Supplier deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}