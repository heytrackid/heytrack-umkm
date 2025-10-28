import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server'
import type { Database } from '@/types/supabase-generated';
import { getErrorMessage } from '@/lib/type-guards';
import { safeUpdate } from '@/lib/supabase/type-helpers';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const supabase = await createClient();
    
    const { data: supplier, error } = await supabase
      .from('suppliers')
      .select('id, name, contact_person, email, phone, address, notes, is_active, created_at, updated_at')
      .eq('id', id)
      .single();

    if (error) {throw error;}

    return NextResponse.json(supplier);
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

    const updatePayload: Database['public']['Tables']['suppliers']['Update'] = body

    const { data: supplier, error } = await safeUpdate(supabase, 'suppliers', updatePayload)
      .eq('id', id)
      .select('id, name, contact_person, email, phone, address, notes, is_active, updated_at')
      .single();

    if (error) {throw error;}

    return NextResponse.json(supplier);
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
      .from('suppliers')
      .delete()
      .eq('id', id);

    if (error) {throw error;}

    return NextResponse.json({ message: 'Supplier deleted successfully' });
  } catch (err: unknown) {
    return NextResponse.json({ err: getErrorMessage(err) }, { status: 500 });
  }
}