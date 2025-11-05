'use server'

import { createClient } from '@/utils/supabase/server'
import { checkBotId } from 'botid/server'

export async function resetPassword(formData: FormData) {
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
    const email = formData.get('email') as string

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env['NEXT_PUBLIC_SITE_URL'] ?? 'http://localhost:3000'}/auth/update-password`,
    })

    if (error) {
        return { error: error.message }
    }

    return { success: true }
}
