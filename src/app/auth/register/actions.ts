'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { verifyHCaptcha } from '@/lib/hcaptcha-verification'
import { HCAPTCHA_CONFIG } from '@/lib/config/hcaptcha'

export async function signup(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string
    const captchaToken = formData.get('hcaptcha-token') as string

    // Verify hCaptcha token if it's enabled
    if (HCAPTCHA_CONFIG.secretKey) {
        if (!captchaToken) {
            return { error: 'Verifikasi hCaptcha diperlukan' };
        }

        const captchaResult = await verifyHCaptcha(captchaToken);
        if (!captchaResult.success) {
            return { error: captchaResult.error || 'Verifikasi hCaptcha gagal' };
        }
    }

    // Validate password match
    if (password !== confirmPassword) {
        return { error: 'Password tidak cocok' }
    }

    // Validate password length
    if (password.length < 8) {
        return { error: 'Password minimal 8 karakter' }
    }

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: `${process.env['NEXT_PUBLIC_SITE_URL'] ?? 'http://localhost:3000'}/auth/callback`,
        },
    })

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/', 'layout')
    return { success: true }
}

export async function signupWithGoogle() {
    const supabase = await createClient()

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/auth/callback`,
        },
    })

    if (error) {
        return { error: error.message }
    }

    if (data.url) {
        redirect(data.url)
    }
    
    return { error: 'Failed to initiate Google signup' }
}
