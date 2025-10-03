// API Route for Recipe Generation
import { NextRequest, NextResponse } from 'next/server'
import { RecipeRequest, GeneratedRecipe } from '@/app/ai/recipes/types/recipe.types'

class RecipeGeneratorAPI {
  private readonly API_URL = 'https://openrouter.ai/api/v1/chat/completions'
  private readonly API_KEY = process.env.OPENROUTER_API_KEY

  async generateRecipe(request: RecipeRequest): Promise<GeneratedRecipe> {
    if (!this.API_KEY) {
      throw new Error('OpenRouter API key tidak ditemukan')
    }

    const prompt = this.buildRecipePrompt(request)

    try {
      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.API_KEY}`,
          'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
          'X-Title': 'HeyTrack Recipe Generator'
        },
        body: JSON.stringify({
          model: 'anthropic/claude-3-haiku',
          messages: [
            {
              role: 'system',
              content: `You are an expert Indonesian chef and culinary historian. Generate authentic, detailed recipes for Indonesian cuisine. Always respond in Bahasa Indonesia with proper measurements, techniques, and cultural context.`
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 2000,
          top_p: 0.9,
          stream: false
        })
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`OpenRouter API error: ${response.status} - ${error}`)
      }

      const data = await response.json()
      const generatedContent = data.choices[0]?.message?.content

      if (!generatedContent) {
        throw new Error('Tidak ada konten yang dihasilkan dari AI')
      }

      return this.parseRecipeResponse(generatedContent, request)
    } catch (error) {
      console.error('Error generating recipe:', error)
      throw new Error(`Gagal generate resep: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private buildRecipePrompt(request: RecipeRequest): string {
    let prompt = `Generate a detailed, authentic Indonesian recipe in Bahasa Indonesia. `

    // Category and specific dish
    if (request.specificDish) {
      prompt += `Create a recipe for "${request.specificDish}". `
    } else {
      prompt += `Create a recipe from the category "${request.category}". `
      if (request.subcategory) {
        prompt += `Specifically from subcategory "${request.subcategory}". `
      }
    }

    // Preferences
    if (request.servingSize) {
      prompt += `Recipe should serve ${request.servingSize} people. `
    }

    if (request.difficulty) {
      const difficultyText = request.difficulty === 'easy' ? 'mudah' :
                            request.difficulty === 'medium' ? 'sedang' : 'sulit'
      prompt += `Difficulty level: ${difficultyText}. `
    }

    if (request.cookingTime) {
      const timeText = request.cookingTime === 'quick' ? 'cepat (kurang dari 30 menit)' :
                      request.cookingTime === 'normal' ? 'normal (30-60 menit)' : 'lama (lebih dari 60 menit)'
      prompt += `Cooking time preference: ${timeText}. `
    }

    if (request.spiceLevel) {
      const spiceText = request.spiceLevel === 'mild' ? 'tidak pedas' :
                       request.spiceLevel === 'medium' ? 'sedang pedas' :
                       request.spiceLevel === 'spicy' ? 'pedas' : 'sangat pedas'
      prompt += `Spice level: ${spiceText}. `
    }

    // Dietary restrictions
    if (request.dietaryRestrictions && request.dietaryRestrictions.length > 0) {
      prompt += `Dietary restrictions: ${request.dietaryRestrictions.join(', ')}. `
    }

    // Required elements
    prompt += `\n\nREQUIRED FORMAT - Respond with valid JSON:
{
  "title": "Recipe Title",
  "description": "Brief description of the dish",
  "difficulty": "easy|medium|hard",
  "cookingTime": number_in_minutes,
  "servingSize": number,
  "spiceLevel": "mild|medium|spicy|very-spicy",
  "ingredients": [
    {
      "name": "Ingredient name",
      "amount": number,
      "unit": "measurement_unit",
      "notes": "optional_notes",
      "substitutes": ["alternative1", "alternative2"]
    }
  ],
  "instructions": [
    {
      "step": 1,
      "instruction": "Detailed cooking instruction",
      "duration": optional_minutes,
      "temperature": optional_celsius,
      "tips": ["tip1", "tip2"]
    }
  ],
  "nutritionalInfo": {
    "calories": number,
    "protein": number_in_grams,
    "carbs": number_in_grams,
    "fat": number_in_grams,
    "fiber": number_in_grams,
    "sugar": number_in_grams,
    "sodium": number_in_mg
  },
  "culturalContext": {
    "region": "Indonesian_region",
    "festival": "optional_festival",
    "tradition": "optional_tradition",
    "notes": "cultural_notes"
  }
}

IMPORTANT: Ensure the recipe is authentic Indonesian cuisine, uses traditional ingredients and cooking methods, and includes proper cultural context. Make measurements practical and instructions detailed but easy to follow.`

    return prompt
  }

  private parseRecipeResponse(content: string, request: RecipeRequest): GeneratedRecipe {
    try {
      // Extract JSON from the response (AI might add extra text)
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('Invalid JSON response from AI')
      }

      const parsedData = JSON.parse(jsonMatch[0])

      // Validate required fields
      if (!parsedData.title || !parsedData.ingredients || !parsedData.instructions) {
        throw new Error('Recipe data incomplete')
      }

      const recipe: GeneratedRecipe = {
        id: `recipe_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: parsedData.title,
        category: request.category,
        subcategory: request.subcategory || '',
        description: parsedData.description || '',
        difficulty: parsedData.difficulty || 'medium',
        cookingTime: parsedData.cookingTime || 30,
        servingSize: parsedData.servingSize || 4,
        spiceLevel: parsedData.spiceLevel || 'medium',
        ingredients: parsedData.ingredients.map((ing: any, index: number) => ({
          id: `ing_${index}`,
          name: ing.name,
          amount: ing.amount,
          unit: ing.unit,
          notes: ing.notes,
          substitutes: ing.substitutes || []
        })),
        instructions: parsedData.instructions.map((inst: any, index: number) => ({
          id: `step_${index + 1}`,
          step: inst.step || (index + 1),
          instruction: inst.instruction,
          duration: inst.duration,
          temperature: inst.temperature,
          tips: inst.tips || []
        })),
        nutritionalInfo: parsedData.nutritionalInfo,
        culturalContext: parsedData.culturalContext,
        generatedAt: new Date().toISOString(),
        aiModel: 'anthropic/claude-3-haiku',
        prompt: this.buildRecipePrompt(request)
      }

      return recipe
    } catch (error) {
      console.error('Error parsing recipe response:', error)
      throw new Error(`Gagal memproses response resep: ${error instanceof Error ? error.message : 'Invalid format'}`)
    }
  }
}

const recipeGeneratorAPI = new RecipeGeneratorAPI()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { category, subcategory, specificDish, dietaryRestrictions, servingSize, difficulty, cookingTime, spiceLevel } = body

    const recipeRequest: RecipeRequest = {
      category,
      subcategory,
      specificDish,
      dietaryRestrictions,
      servingSize,
      difficulty,
      cookingTime,
      spiceLevel
    }

    const generatedRecipe = await recipeGeneratorAPI.generateRecipe(recipeRequest)

    return NextResponse.json({
      success: true,
      data: generatedRecipe
    })

  } catch (error) {
    console.error('Recipe generation error:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    )
  }
}

// GET endpoint untuk mendapatkan suggestions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    if (!category) {
      return NextResponse.json({
        success: false,
        error: 'Category parameter is required'
      }, { status: 400 })
    }

    // Return static suggestions for now
    const suggestions: Record<string, string[]> = {
      'nasi-goreng': ['Nasi Goreng Spesial', 'Nasi Goreng Seafood', 'Nasi Goreng Kampung', 'Nasi Goreng Mawut'],
      'sate': ['Sate Ayam', 'Sate Sapi Madura', 'Sate Padang', 'Sate Lilit Bali'],
      'rendang': ['Rendang Daging Padang', 'Rendang Ayam', 'Rendang Tuna'],
      'minuman': ['Wedang Jahe', 'Es Cendol', 'Bajigur', 'Bandrek', 'Wedang Ronde'],
      'kue-tradisional': ['Klepon', 'Putu Ayu', 'Lapis Legit', 'Kue Lumpur']
    }

    return NextResponse.json({
      success: true,
      data: suggestions[category] || ['Nasi Goreng Spesial', 'Sate Ayam', 'Rendang', 'Wedang Jahe']
    })

  } catch (error) {
    console.error('Suggestions error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get suggestions'
      },
      { status: 500 }
    )
  }
}
