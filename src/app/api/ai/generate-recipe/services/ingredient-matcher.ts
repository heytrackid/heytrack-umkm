import { INGREDIENT_ALIASES } from '../constants'
import type { IngredientSubset } from '../types'

function calculateSimilarity(str1: string, str2: string): number {
  const s1 = str1?.toLowerCase() || ''
  const s2 = str2?.toLowerCase() || ''

  if (s1 === s2) return 1
  if (!s1 || !s2) return 0
  if (s1.includes(s2) || s2.includes(s1)) return 0.8

  const words1 = s1.split(' ')
  const words2 = s2.split(' ')
  const commonWords = words1.filter(w => words2.includes(w)).length
  const maxWords = Math.max(words1.length, words2.length)

  return maxWords > 0 ? commonWords / maxWords : 0
}

export function findBestIngredientMatch(
  searchName: string,
  ingredients: IngredientSubset[]
): IngredientSubset | null {
  const search = searchName.toLowerCase().trim()

  let match = ingredients.find(i => i.name.toLowerCase() === search)
  if (match) return match

  for (const [canonical, aliases] of Object.entries(INGREDIENT_ALIASES)) {
    if (aliases.includes(search) || canonical === search) {
      match = ingredients.find(i =>
        i.name.toLowerCase().includes(canonical) ||
        canonical.includes(i.name.toLowerCase())
      )
      if (match) return match
    }
  }

  match = ingredients.find(i =>
    i.name.toLowerCase().includes(search) ||
    search.includes(i.name.toLowerCase())
  )
  if (match) return match

  let bestMatch: IngredientSubset | null = null
  let bestScore = 0

  for (const ingredient of ingredients) {
    const score = calculateSimilarity(search, ingredient.name)
    if (score > bestScore && score > 0.6) {
      bestScore = score
      bestMatch = ingredient
    }
  }

  return bestMatch
}
