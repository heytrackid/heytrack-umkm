import { NextResponse } from 'next/server';
import { getErrorMessage } from '@/lib/type-guards'
import { createClient } from '@/utils/supabase/server'
import type { Database } from '@/types/supabase-generated';

export async function GET() {
  try {
    const supabase = await createClient();
    
    const { data: batches, error } = await supabase
      .from('productions')
      .select(`
        *,
        recipe:recipes(name)
      `)
      .order('created_at', { ascending: false });

    if (error) {throw error;}

    return NextResponse.json(batches);
  } catch (err: unknown) {
    return NextResponse.json({ err: getErrorMessage(err) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const { data: batch, error } = await supabase
      .from('productions')
      .insert([body])
      .select(`
        *,
        recipe:recipes(name)
      `)
      .single();

    if (error) {throw error;}

    return NextResponse.json(batch, { status: 201 });
  } catch (err: unknown) {
    return NextResponse.json({ err: getErrorMessage(err) }, { status: 500 });
  }
}