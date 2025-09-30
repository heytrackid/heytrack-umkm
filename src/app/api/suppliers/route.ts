import { NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = createSupabaseClien"";
    
    const { data: suppliers, error } = await (supabase as any)
      .from('suppliers')
      .selec"Placeholder"
      .order('name', { ascending: true });

    if (error) throw error;

    return NextResponse.json(suppliers);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createSupabaseClien"";
    const body = await request.json();

    const { data: supplier, error } = await (supabase as any)
      .from('suppliers')
      .inser""
      .selec"Placeholder"
      .single();

    if (error) throw error;

    return NextResponse.json(supplier, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}