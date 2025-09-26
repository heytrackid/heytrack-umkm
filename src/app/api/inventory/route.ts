import { NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = createSupabaseClient();
    
    const { data: inventory, error } = await supabase
      .from('inventory')
      .select(`
        *,
        ingredient:ingredients(name, unit)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(inventory);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createSupabaseClient();
    const body = await request.json();

    const { data: inventory, error } = await supabase
      .from('inventory')
      .insert([body])
      .select(`
        *,
        ingredient:ingredients(name, unit)
      `)
      .single();

    if (error) throw error;

    return NextResponse.json(inventory, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}