// lib/api/route-helpers.ts
// Standardized route parameter parsing and utilities

/**
 * Parses route parameters from Next.js dynamic routes
 * Handles the [...slug] pattern consistently across all API routes
 */
export function parseRouteParams(params: Record<string, string | string[]> | undefined) {
  const slug = params?.['slug'] as string[] | undefined

  return {
    slug,
    id: slug?.[0],
    subRoute: slug?.[0],
    subParams: slug?.slice(1),
    hasId: Boolean(slug?.[0]),
    hasSubRoute: Boolean(slug && slug.length > 1),
  }
}

/**
 * Validates that a route has the expected number of slug parameters
 */
export function validateSlugLength(
  slug: string[] | undefined,
  expectedLength: number,
  routeName: string
): { isValid: boolean; error?: string } {
  if (!slug) {
    return expectedLength === 0
      ? { isValid: true }
      : { isValid: false, error: `${routeName}: Missing slug parameters` }
  }

  if (slug.length !== expectedLength) {
    return {
      isValid: false,
      error: `${routeName}: Expected ${expectedLength} slug parameters, got ${slug.length}`
    }
  }

  return { isValid: true }
}

/**
 * Type-safe route parameter extraction with validation
 */
export function extractIdFromSlug(
  params: Record<string, string | string[]> | undefined,
  routeName: string
): { id: string } | { error: string } {
  const { slug, id } = parseRouteParams(params)

  if (!slug || slug.length === 0) {
    return { error: `${routeName}: ID parameter is required` }
  }

  if (!id) {
    return { error: `${routeName}: Invalid ID parameter` }
  }

  return { id }
}