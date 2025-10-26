import { NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@/utils/supabase';
import { getErrorMessage } from '@/lib/type-guards';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const supabase = createSupabaseClient();
    
    const { data: supplier, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {throw error;}

    return NextResponse.json(supplier);
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

    const { data: supplier, error } = await supabase
      .from('suppliers')
      .update(updatePayload)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {throw error;}

    return NextResponse.json(supplier);
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
      .from('suppliers')
      .delete()
      .eq('id', id);

    if (error) {throw error;}

    return NextResponse.json({ message: 'Supplier deleted successfully' });
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}