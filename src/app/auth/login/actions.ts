'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { authLogger } from '@/lib/logger'

export async function login(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const captchaToken = formData.get('hcaptcha-token') as string

    // Log the login attempt with more details
    authLogger.info({ 
        email, 
        captchaProvided: !!captchaToken,
        timestamp: new Date().toISOString()
    }, 'Login attempt initiated')

    const data = {
        email,
        password,
    }

    const { error } = await supabase.auth.signInWithPassword(data)

    if (error) {
        authLogger.error({ 
            email, 
            errorCode: error.code,
            errorMessage: error.message,
            errorStatus: error.status,
            errorName: error.name,
            errorDetails: JSON.stringify(error),
            timestamp: new Date().toISOString()
        }, 'Supabase authentication failed')
        
        // Provide more specific error messages based on Supabase error codes
        let errorMessage = error.message
        
        // Check for common error patterns
        if (error.message.includes('Invalid login credentials') || error.message.includes('Invalid identifier or password')) {
            errorMessage = 'Email atau password salah. Silakan coba lagi.'
        } else if (error.message.includes('Email not confirmed') || error.message.includes('email not confirmed')) {
            errorMessage = 'Email belum dikonfirmasi. Silakan periksa inbox Anda untuk email konfirmasi.'
        } else if (error.message.includes('Rate limit') || error.message.includes('rate limit')) {
            errorMessage = 'Terlalu banyak percobaan login. Silakan coba lagi nanti.'
        } else if (error.message.includes('Network') || error.message.includes('network')) {
            errorMessage = 'Koneksi jaringan gagal. Silakan periksa koneksi internet Anda.'
        } else if (error.message.includes('User not found') || error.message.includes('user not found')) {
            errorMessage = 'Akun dengan email tersebut tidak ditemukan.'
        } else if (error.message.includes('Invalid session') || error.message.includes('invalid session')) {
            errorMessage = 'Sesi tidak valid. Silakan login kembali.'
        } else if (error.message.includes('JWT') || error.message.includes('jwt')) {
            errorMessage = 'Terjadi kesalahan pada sesi otentikasi. Silakan login kembali.'
        } else {
            // Log unknown errors for debugging
            authLogger.warn({
                email,
                originalError: error.message,
                errorCode: error.code,
                errorName: error.name,
                errorStatus: error.status,
                errorDetails: error
            }, 'Unknown authentication error encountered')
        }
        
        return { error: errorMessage }
    }

    authLogger.info({ email }, 'Login successful')
    revalidatePath('/', 'layout')
    redirect('/dashboard')
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
        authLogger.error({ 
            error: error.message, 
            errorCode: error.code 
        }, 'Google OAuth login failed')
        return { error: error.message }
    }

    if (data.url) {
        redirect(data.url)
    }
    
    return { error: 'Failed to initiate Google login' }
}
