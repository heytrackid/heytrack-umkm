export const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'
export const PRIMARY_MODEL = 'x-ai/grok-4-fast'
export const FALLBACK_MODEL = 'x-ai/grok-4-fast'
export const MAX_RETRIES = 3
export const ESTIMATED_DAILY_PRODUCTION = 50
export const DEFAULT_OPERATIONAL_COST_PERCENTAGE = 0.3
export const SUGGESTED_MARKUP = 2.5
export const ESTIMATED_MARGIN = 60

export const INGREDIENT_ALIASES: Record<string, string[]> = {
  'tepung terigu': ['tepung', 'terigu', 'flour', 'wheat flour'],
  'gula': ['gula pasir', 'gula halus', 'sugar', 'white sugar'],
  'garam': ['salt', 'sea salt'],
  'telur': ['egg', 'eggs', 'telur ayam'],
  'mentega': ['butter', 'unsalted butter'],
  'margarin': ['margarine', 'blue band'],
  'susu': ['milk', 'fresh milk', 'susu sapi'],
  'ragi': ['yeast', 'ragi instan', 'fermipan'],
  'baking powder': ['bp', 'baking powder double action'],
  'vanili': ['vanilla', 'vanili bubuk'],
  'coklat bubuk': ['chocolate powder', 'cocoa powder'],
  'minyak goreng': ['cooking oil', 'vegetable oil', 'minyak sayur'],
  'air': ['water'],
  'soda kue': ['baking soda', 'soda'],
  'kelapa parut': ['coconut', 'grated coconut'],
  'pisang': ['banana', 'pisang raja'],
  'coklat chip': ['chocolate chips', 'choco chips'],
  'kacang tanah': ['peanut', 'groundnut'],
  'keju': ['cheese', 'cheddar cheese']
}

export const BASE_FLOUR_PER_UNIT: Record<string, number> = {
  bread: 250,
  cake: 200,
  pastry: 180,
  cookies: 150,
  donuts: 220,
  other: 200
}
