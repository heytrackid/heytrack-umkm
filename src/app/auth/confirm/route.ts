import { createClient } from '@/utils/supabase/server'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const token_hash = searchParams.get('token_hash')
    const type = searchParams.get('type')
    const next = searchParams.get('next') ?? '/dashboard'

    // Validate required parameters
    if (!token_hash || !type) {
        return NextResponse.redirect(
            new URL('/auth/login?error=missing_parameters', request.url)
        )
    }

    // Only handle email confirmation type
    if (type !== 'email') {
        return NextResponse.redirect(
            new URL('/auth/login?error=invalid_type', request.url)
        )
    }

    const supabase = await createClient()

    // Verify the OTP token
    const { error } = await supabase.auth.verifyOtp({
        type: 'email',
        token_hash,
    })

    if (error) {
        console.error('Email confirmation error:', error)
        return NextResponse.redirect(
            new URL('/auth/login?error=confirmation_failed', request.url)
        )
    }

    // Redirect to dashboard on success
    return NextResponse.redirect(new URL(next, request.url))
}
