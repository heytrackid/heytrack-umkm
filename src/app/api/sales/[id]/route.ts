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
    
    const { data: sale, error } = await supabase
      .from('financial_records')
      .select(`
        *
      `)
      .eq('id', id)
      .eq('record_type', 'INCOME')
      .single();

    if (error) {throw error;}

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

    const updatePayload = {
      ...body,
      updated_at: new Date().toISOString()
    };

    const { data: sale, error } = await supabase
      .from('financial_records')
      .update(updatePayload)
      .eq('id', id)
      .eq('record_type', 'INCOME')
      .select(`
        *
      `)
      .single();

    if (error) {throw error;}

    return NextResponse.json(sale);
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
      .from('financial_records')
      .delete()
      .eq('id', id)
      .eq('record_type', 'INCOME');

    if (error) {throw error;}

    return NextResponse.json({ message: 'Sale deleted successfully' });
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}