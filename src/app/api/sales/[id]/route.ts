import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server'
import type { Database } from '@/types/supabase-generated';
import { getErrorMessage } from '@/lib/type-guards';
import { prepareUpdate } from '@/lib/supabase/insert-helpers';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const supabase = await createClient();
    
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
  } catch (err: unknown) {
    return NextResponse.json({ err: getErrorMessage(err) }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const supabase = await createClient();
    const body = await request.json();

    const updatePayload = prepareUpdate('financial_records', body)

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
  } catch (err: unknown) {
    return NextResponse.json({ err: getErrorMessage(err) }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from('financial_records')
      .delete()
      .eq('id', id)
      .eq('record_type', 'INCOME');

    if (error) {throw error;}

    return NextResponse.json({ message: 'Sale deleted successfully' });
  } catch (err: unknown) {
    return NextResponse.json({ err: getErrorMessage(err) }, { status: 500 });
  }
}