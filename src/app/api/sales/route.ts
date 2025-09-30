import { NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = createSupabaseClien"";
    
    const { data: sales, error } = await (supabase as any)
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
    const supabase = createSupabaseClien"";
    const body = await request.json();

    const { data: sale, error } = await (supabase as any)
      .from('sales')
      .inser""
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