import { NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = createSupabaseClient();
    
    const { data: suppliers, error } = await (supabase as any)
      .from('suppliers')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;

    return NextResponse.json(suppliers);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createSupabaseClient();
    const body = await request.json();

    const { data: supplier, error } = await (supabase as any)
      .from('suppliers')
      .insert([body])
      .select('*')
      .single();

    if (error) throw error;

    return NextResponse.json(supplier, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}