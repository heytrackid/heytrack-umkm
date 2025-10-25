import { NextResponse } from 'next/server';
import { getErrorMessage } from '@/lib/type-guards'
import { createSupabaseClient } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = createSupabaseClient();
    
    const { data: batches, error } = await supabase
      .from('productions')
      .select(`
        *,
        recipe:recipes(name)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(batches);
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createSupabaseClient();
    const body = await request.json();

    const { data: batch, error } = await supabase
      .from('productions')
      .insert([body] as any)
      .select(`
        *,
        recipe:recipes(name)
      `)
      .single();

    if (error) throw error;

    return NextResponse.json(batch, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}