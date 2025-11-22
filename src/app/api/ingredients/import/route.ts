// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
export const runtime = 'nodejs'

// Internal modules - Core
import { createApiRoute, type RouteContext } from '@/lib/api/route-factory'
import { createSuccessResponse } from '@/lib/api-core'
import { handleAPIError } from '@/lib/errors/api-error-handler'

// Internal modules - Utils
import { apiLogger } from '@/lib/logger'
import { SecurityPresets } from '@/utils/security/api-middleware'

// Types and schemas
import { ImportIngredientsSchema } from '@/lib/validations/domains/ingredient'

// Constants and config
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/lib/constants/messages'

const sanitizeString = (value?: string | null, fallback?: string | null): string | null => {
  const trimmed = value?.trim()
  if (trimmed && trimmed.length > 0) {
    return trimmed
  }

  if (fallback !== undefined) {
    return fallback
  }

  return null
}

export const POST = createApiRoute(
  {
    method: 'POST',
    path: '/api/ingredients/import',
    bodySchema: ImportIngredientsSchema,
    securityPreset: SecurityPresets.enhanced(),
  },
  async (context: RouteContext, _query, body) => {
    const { user, supabase } = context
    const { ingredients } = body!

    // Validate and prepare data (schema already validates required fields)
    const validIngredients = ingredients.map((ing) => ({
      name: ing.name.trim(),
      unit: ing.unit.trim(),
      price_per_unit: ing.price_per_unit,
      current_stock: ing.current_stock,
      min_stock: ing.min_stock,
      weighted_average_cost: ing.price_per_unit, // Initial WAC = price_per_unit
      description: sanitizeString(ing.description),
      category: sanitizeString(ing.category, 'General'),
      supplier: sanitizeString(ing.supplier),
      user_id: user.id,
      is_active: true
    }))

    // Insert ingredients in batch
    const { data, error } = await supabase
      .from('ingredients')
      .insert(validIngredients as never)
      .select()

    if (error) {
      apiLogger.error({ error, userId: user.id }, 'Failed to import ingredients')
      return handleAPIError(new Error(ERROR_MESSAGES.SAVE_FAILED), 'POST /api/ingredients/import')
    }

    apiLogger.info(
      { userId: user.id, count: data.length },
      'Ingredients imported successfully'
    )

    return createSuccessResponse({ count: data.length, data }, SUCCESS_MESSAGES.INGREDIENT_IMPORTED, undefined, 201)
  }
)
