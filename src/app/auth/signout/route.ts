import { createClient } from '@/utils/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'

async function handleSignOut(request: NextRequest) {
    const supabase = await createClient()

    // Check if user is authenticated
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (user) {
        // Sign out the user - this clears the session and cookies
        await supabase.auth.signOut()
    }

    // Redirect to login page after logout
    const redirectUrl = new URL('/auth/login', request.url)
    return NextResponse.redirect(redirectUrl)
}

export async function POST(request: NextRequest) {
    return handleSignOut(request)
}

export async function GET(request: NextRequest) {
    return handleSignOut(request)
}
