export const runtime = 'nodejs'

import { isErrorResponse, requireAuth } from '@/lib/api-auth'
import { handleAPIError } from '@/lib/errors/api-error-handler'
import { SecurityPresets, withSecurity } from '@/utils/security/index'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const generateRecipeSchema = z.object({
  prompt: z.string().min(10, 'Prompt harus minimal 10 karakter'),
  servings: z.number().min(1).max(100).optional(),
  cuisine: z.string().optional(),
  dietary: z.array(z.string()).optional(),
})

async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const authResult = await requireAuth()
    if (isErrorResponse(authResult)) {
      return authResult
    }

    const body = await request.json()
    const validation = generateRecipeSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.issues },
        { status: 400 }
      )
    }

    const { prompt, servings = 4, cuisine, dietary } = validation.data

    // Check if OpenRouter API key is configured
    const apiKey = process.env['OPENROUTER_API_KEY']
    if (!apiKey) {
      return NextResponse.json(
        {
          error: 'AI Recipe Generator belum dikonfigurasi',
          message: 'Silakan tambahkan OPENROUTER_API_KEY di environment variables',
        },
        { status: 503 }
      )
    }

    // Build the AI prompt
    let systemPrompt = `You are a professional chef and recipe creator. Generate a detailed recipe in Indonesian language.`
    
    if (cuisine) {
      systemPrompt += ` The recipe should be ${cuisine} cuisine.`
    }
    
    if (dietary && dietary.length > 0) {
      systemPrompt += ` The recipe must be ${dietary.join(', ')}.`
    }

    const userPrompt = `Create a recipe for: ${prompt}. The recipe should serve ${servings} people.

Please provide the recipe in the following JSON format:
{
  "name": "Recipe name in Indonesian",
  "description": "Brief description",
  "servings": ${servings},
  "prep_time": "preparation time in minutes",
  "cook_time": "cooking time in minutes",
  "difficulty": "EASY, MEDIUM, or HARD",
  "category": "category name",
  "ingredients": [
    {
      "name": "ingredient name",
      "quantity": "amount as number",
      "unit": "unit (kg, gram, liter, ml, pcs, etc)",
      "notes": "optional notes"
    }
  ],
  "instructions": [
    "Step 1 instruction",
    "Step 2 instruction"
  ],
  "tips": "Optional cooking tips"
}`

    // Call OpenRouter API
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env['NEXT_PUBLIC_APP_DOMAIN'] || 'http://localhost:3000',
        'X-Title': 'HeyTrack UMKM',
      },
      body: JSON.stringify({
        model: 'openai/gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Failed to generate recipe')
    }

    const data = await response.json()
    const aiResponse = data.choices[0]?.message?.content

    if (!aiResponse) {
      throw new Error('No response from AI')
    }

    // Parse the JSON response
    let recipe
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = aiResponse.match(/```json\n([\s\S]*?)\n```/) || 
                       aiResponse.match(/```\n([\s\S]*?)\n```/)
      const jsonString = jsonMatch ? jsonMatch[1] : aiResponse
      recipe = JSON.parse(jsonString)
    } catch {
      // If parsing fails, return raw response
      return NextResponse.json({
        error: 'Failed to parse AI response',
        raw_response: aiResponse,
        message: 'AI generated a response but it could not be parsed. Please try again.',
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      recipe,
      usage: data.usage,
    })
  } catch (error) {
    return handleAPIError(error, 'POST /api/recipes/generate')
  }
}

const securedPOST = withSecurity(POST, SecurityPresets.enhanced())
export { securedPOST as POST }
