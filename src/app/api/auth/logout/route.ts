export const runtime = 'nodejs'

import { type NextRequest, NextResponse } from 'next/server'

import { createClient } from '@/utils/supabase/server'

export async function POST(_request: NextRequest) {
  try {
    const supabase = await createClient()
    await supabase.auth.signOut()

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { error: 'Gagal logout' },
      { status: 500 }
    )
  }
}
