import { NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = createSupabaseClient();
    
    const { data: sales, error } = await supabase
      .from('sales')
      .select(`
        *,
        recipe:recipes(name)
      `)
      .order('date', { ascending: false });

    if (error) throw error;

    return NextResponse.json(sales);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createSupabaseClient();
    const body = await request.json();

    const { data: sale, error } = await supabase
      .from('sales')
      .insert([body])
      .select(`
        *,
        recipe:recipes(name)
      `)
      .single();

    if (error) throw error;

    return NextResponse.json(sale, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}