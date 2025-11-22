import { useMutation } from '@tanstack/react-query'
import { useSupabase } from '@/providers/SupabaseProvider'
import { apiLogger } from '@/lib/logger'
import { toast } from 'sonner'
import { postApi } from '@/lib/query/query-helpers'
import type { GeneratedRecipe } from '@/app/recipes/ai-generator/components/types'

interface GenerateRecipeParams {
  name: string
  type: string
  servings: number
  targetPrice?: number
  dietaryRestrictions: string[]
  preferredIngredients: string[]
  customIngredients: string[]
  specialInstructions?: string
}

export function useGenerateRecipe(onSuccess?: (data: GeneratedRecipe) => void) {
  const { supabase } = useSupabase()

  return useMutation({
    mutationFn: async (params: GenerateRecipeParams): Promise<GeneratedRecipe> => {
      // Get user_id from Supabase Auth
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) {
        throw new Error('User not authenticated')
      }

      const data = await postApi<{ recipe: GeneratedRecipe }>('/api/ai/generate-recipe', {
        ...params,
        userId: session.user.id
      })
      return data.recipe
    },
    onSuccess: (data) => {
      toast.success('AI telah meracik resep profesional untuk Anda')
      onSuccess?.(data)
    },
    onError: (error: Error) => {
      apiLogger.error({ error }, 'Error generating recipe:')

      // More detailed error messages
      if (error.message.includes('API key')) {
        toast.error('Konfigurasi AI tidak valid. Silakan hubungi administrator.')
      } else if (error.message.includes('authentication')) {
        toast.error('Sesi Anda telah habis. Silakan login kembali.')
      } else if (error.message.includes('ingredients')) {
        toast.error('Pastikan Anda memiliki cukup bahan untuk membuat resep ini.')
      } else {
        toast.error(error.message || 'Terjadi kesalahan saat membuat resep. Silakan coba lagi.')
      }
    }
  })
}