'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { checkBotId } from 'botid/server'

export async function updatePassword(formData: FormData) {
    // Check if the request is from a bot
    const verification = await checkBotId({
      advancedOptions: {
        checkLevel: 'deepAnalysis',
      },
    })
    if (verification.isBot) {
      return { error: 'Access denied' }
    }

    const supabase = await createClient()
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string

    // Validate password match
    if (password !== confirmPassword) {
        return { error: 'Password tidak cocok' }
    }

    // Validate password length
    if (password.length < 8) {
        return { error: 'Password minimal 8 karakter' }
    }

    const { error } = await supabase.auth.updateUser({
        password
    })

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/', 'layout')
    return { success: true }
}
