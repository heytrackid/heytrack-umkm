import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server'
import { getErrorMessage, isValidUUID } from '@/lib/type-guards';
import { prepareUpdate } from '@/lib/supabase/insert-helpers';

// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
export const runtime = 'nodejs'

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  
  // Validate UUID format
  if (!isValidUUID(id)) {
    return NextResponse.json({ error: 'Invalid sale ID format' }, { status: 400 });
  }
  
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

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Sale record not found' },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { error: error.message || 'Failed to fetch sale record' },
        { status: 500 }
      )
    }

    return NextResponse.json(sale);
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  
  // Validate UUID format
  if (!isValidUUID(id)) {
    return NextResponse.json({ error: 'Invalid sale ID format' }, { status: 400 });
  }
  
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

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Sale record not found' },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { error: error.message || 'Failed to update sale record' },
        { status: 500 }
      )
    }

    return NextResponse.json(sale);
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  
  // Validate UUID format
  if (!isValidUUID(id)) {
    return NextResponse.json({ error: 'Invalid sale ID format' }, { status: 400 });
  }
  
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from('financial_records')
      .delete()
      .eq('id', id)
      .eq('record_type', 'INCOME');

    if (error) {
      return NextResponse.json(
        { error: error.message || 'Failed to delete sale record' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Sale deleted successfully' });
  } catch (err: unknown) {
    return NextResponse.json({ err: getErrorMessage(err) }, { status: 500 });
  }
}