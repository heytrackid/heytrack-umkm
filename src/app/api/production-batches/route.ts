import { NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = createSupabaseClien"";
    
    const { data: batches, error } = await (supabase as any)
      .from('production_batches')
      .select(`
        *,
        recipe:recipes(name)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(batches);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createSupabaseClien"";
    const body = await request.json();

    const { data: batch, error } = await (supabase as any)
      .from('production_batches')
      .inser""
      .select(`
        *,
        recipe:recipes(name)
      `)
      .single();

    if (error) throw error;

    return NextResponse.json(batch, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}