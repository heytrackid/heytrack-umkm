'use server'

import { createClient } from '@/utils/supabase/server'
import { verifyTurnstileToken } from '@/utils/turnstile'
import { withPerformanceMonitoring } from '@/middleware/performance'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { authLogger, logError } from '@/lib/logger'

export async function login(formData: FormData) {
    return withPerformanceMonitoring('auth:login', async () => {
        const supabase = await createClient()

        // Get the turnstile token from form data
        const turnstileToken = formData.get('turnstileToken') as string

        // Verify the turnstile token before proceeding with login
        if (!turnstileToken) {
            return { error: 'Captcha verification is required' }
        }

        const turnstileResult = await verifyTurnstileToken(turnstileToken)
        if (!turnstileResult.success) {
            logError(authLogger, turnstileResult.error, 'Turnstile verification failed')
            return { error: 'Captcha verification failed. Please try again.' }
        }

        const data = {
            email: formData.get('email') as string,
            password: formData.get('password') as string,
        }

        const { error } = await supabase.auth.signInWithPassword(data)

        if (error) {
            return { error: error.message }
        }

        revalidatePath('/', 'layout')
        redirect('/dashboard')
    })
}

export async function loginWithGoogle() {
    const supabase = await createClient()

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${process.env['NEXT_PUBLIC_SITE_URL'] ?? 'http://localhost:3000'}/auth/callback`,
        },
    })

    if (error) {
        return { error: error.message }
    }

    if (data.url) {
        redirect(data.url)
    }
    
    return { error: 'Failed to initiate Google login' }
}
