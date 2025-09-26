import { NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = createSupabaseClient();
    
    const { data: expenses, error } = await supabase
      .from('expenses')
      .select(`
        *,
        supplier:suppliers(name)
      `)
      .order('date', { ascending: false });

    if (error) throw error;

    return NextResponse.json(expenses);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createSupabaseClient();
    const body = await request.json();

    const { data: expense, error } = await supabase
      .from('expenses')
      .insert([body])
      .select(`
        *,
        supplier:suppliers(name)
      `)
      .single();

    if (error) throw error;

    return NextResponse.json(expense, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}