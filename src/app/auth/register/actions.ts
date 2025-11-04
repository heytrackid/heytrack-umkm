'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// Server-side hCaptcha verification function
async function verifyHCaptcha(token: string) {
  const secretKey = process.env.HCAPTCHA_SECRET_KEY;
  
  if (!secretKey) {
    // In a real application, you might want to log this differently
    // since console.error is not allowed by linting rules
    return { success: false, message: 'Server configuration error' };
  }

  const formData = new FormData();
  formData.append('secret', secretKey);
  formData.append('response', token);

  try {
    const response = await fetch('https://api.hcaptcha.com/siteverify', {
      method: 'POST',
      body: formData
    });

    const data = await response.json();
    
    return {
      success: data.success,
      message: data['error-codes'] ? data['error-codes'].join(', ') : null
    };
  } catch (_error) {
    // In a real application, you might want to log this differently
    // since console.error is not allowed by linting rules
    return { success: false, message: 'Verification service error' };
  }
}

export async function signup(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string
    const captchaToken = formData.get('hcaptcha-token') as string

    // Verify hCaptcha token
    if (!captchaToken) {
        return { error: 'hCaptcha verification required' };
    }

    const captchaResult = await verifyHCaptcha(captchaToken);
    if (!captchaResult.success) {
        return { error: `hCaptcha verification failed: ${captchaResult.message ?? 'Invalid challenge'}` };
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
