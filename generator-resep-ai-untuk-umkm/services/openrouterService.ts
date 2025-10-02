import { 
  Recipe, 
  MarketingStrategy,
  HppResult
} from '../types';

async function parseJsonResponse<T>(text: string, errorMessage: string): Promise<T> {
  try {
    // Clean the response to extract JSON if it's wrapped in markdown code blocks
    const jsonMatch = text.match(/```(?:json)?\\s*([\\s\\S]*?)\\s*```/);
    const jsonText = jsonMatch ? jsonMatch[1] : text.trim();
    
    // Remove any additional text around the JSON
    const cleanedText = jsonText
      .replace(/.*?({.*}).*/s, '$1')
      .trim();
      
    return JSON.parse(cleanedText) as T;
  } catch (e) {
    console.error(`Failed to parse JSON: ${errorMessage}`, text);
    throw new Error(`AI provided a response in an unexpected format.`);
  }
}

export async function generateRecipe(category: string): Promise<Recipe> {
  const apiKey = process.env.OPENROUTER_API_KEY || process.env.API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY or API_KEY environment variable not set");
  }

  const prompt = `Buatkan resep yang detail dan lezat untuk kategori '${category}'. Resep harus terdengar kreatif, cocok untuk bisnis kuliner, dan menggugah selera. Mohon berikan nama resep, deskripsi singkat, daftar bahan beserta takarannya, instruksi langkah-demi-langkah, dan tabel perkiraan fakta nutrisi (kalori, protein, karbohidrat, lemak).

Berikan jawaban Anda dalam format JSON yang ketat mengikuti skema berikut:
{
  "name": "string",
  "description": "string",
  "ingredients": ["string"],
  "instructions": ["string"],
  "nutrition": {
    "calories": "string",
    "protein": "string", 
    "carbs": "string",
    "fat": "string"
  }
}

Jangan tambahkan penjelasan tambahan di luar objek JSON.`;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2048,
        response_format: {
          type: "json_object"
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    return parseJsonResponse<Recipe>(content, "recipe");
  } catch (error) {
    console.error("Error generating recipe:", error);
    throw new Error("Failed to generate recipe from AI model.");
  }
}

export async function generateRecipeImages(recipeName: string): Promise<string[]> {
  // OpenRouter doesn't support image generation directly
  // We'll return placeholder images for now, but in a real implementation
  // you might use a different service like OpenAI DALL-E or Stable Diffusion
  console.warn("OpenRouter doesn't support image generation. Returning placeholder images.");
  
  // Return 4 placeholder images
  return Array(4).fill(null).map((_, i) => `https://placehold.co/600x450/EEE/31343C?text=Foto+Makanan+${i+1}`);
}

export async function generateMarketingStrategy(businessContext: string): Promise<MarketingStrategy> {
  const apiKey = process.env.OPENROUTER_API_KEY || process.env.API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY or API_KEY environment variable not set");
  }

  const prompt = `Anda adalah seorang konsultan pemasaran ahli untuk UMKM F&B di Indonesia. Berdasarkan informasi kondisi bisnis yang sangat detail berikut, buatkan strategi marketing dan branding yang komprehensif, strategis, dan praktis. Berikan output dalam format JSON yang terstruktur sesuai schema yang telah ditentukan. Fokus pada langah-langkah yang realistis untuk bisnis skala kecil.

Kondisi Bisnis:
${businessContext}

Berikan jawaban Anda dalam format JSON yang ketat mengikuti skema berikut:
{
  "summary": "string",
  "targetAudience": {
    "personaName": "string",
    "demographics": "string",
    "psychographics": "string"
  },
  "usp": "string",
  "contentPillars": ["string"],
  "branding": {
    "logoConcept": "string",
    "slogan": "string",
    "packaging": "string",
    "toneOfVoice": "string"
  },
  "socialMedia": [
    {
      "platform": "string",
      "strategySummary": "string",
      "contentIdeas": [
        {
          "title": "string",
          "format": "string",
          "description": "string"
        }
      ]
    }
  ],
  "offlineStrategy": ["string"],
  "promotions": [
    {
      "promotionName": "string",
      "description": "string",
      "objective": "string"
    }
  ],
  "kpis": ["string"]
}

Jangan tambahkan penjelasan tambahan di luar objek JSON.`;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2048,
        response_format: {
          type: "json_object"
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    return parseJsonResponse<MarketingStrategy>(content, "marketing strategy");
  } catch (error) {
    console.error("Error generating marketing strategy:", error);
    throw new Error("Failed to generate marketing strategy from AI model.");
  }
}

export async function calculateHpp(recipe: Recipe, ingredientCosts: { [key: string]: string }): Promise<HppResult> {
  const apiKey = process.env.OPENROUTER_API_KEY || process.env.API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY or API_KEY environment variable not set");
  }

  const costsString = Object.entries(ingredientCosts)
    .filter(([, cost]) => cost.trim() !== '')
    .map(([ingredient, cost]) => `- ${ingredient}: Rp ${cost}`)
    .join('\\n');

  const prompt = `Anda adalah seorang konsultan biaya F&B. Berdasarkan resep dan rincian biaya bahan berikut, hitunglah Harga Pokok Produksi (HPP) per porsi. 
  Setelah itu, berikan 3 saran harga jual (level Ekonomis, Standar, dan Premium) lengkap dengan justifikasi singkat untuk setiap harga. 
  Asumsikan resep ini menghasilkan satu porsi.

  **Resep: ${recipe.name}**
  Bahan-bahan:
  ${recipe.ingredients.join('\\n')}

  **Biaya Bahan Baku:**
  ${costsString}

  Berikan jawaban Anda dalam format JSON yang ketat mengikuti skema berikut:
  {
    "hppPerPortion": "string",
    "suggestedPrices": [
      {
        "level": "Ekonomis" | "Standar" | "Premium",
        "price": "string",
        "justification": "string"
      }
    ]
  }

  Jangan tambahkan penjelasan tambahan di luar objek JSON.`;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.5,
        max_tokens: 1024,
        response_format: {
          type: "json_object"
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    return parseJsonResponse<HppResult>(content, "HPP and selling prices");
  } catch (error) {
    console.error("Error calculating HPP:", error);
    throw new Error("Failed to calculate HPP from AI model.");
  }
}

export async function generateProductImage(
  prompt: string, 
  style: string, 
  angle: string, 
  servingStyle: string, 
  background: string, 
  aspectRatio: '1:1' | '4:3' | '3:4'
): Promise<string[]> {
  // OpenRouter doesn't support image generation directly
  // We'll return placeholder images for now
  console.warn("OpenRouter doesn't support image generation. Returning placeholder images.");
  
  // Return 2 placeholder images
  return Array(2).fill(null).map((_, i) => `https://placehold.co/600x450/EEE/31343C?text=Foto+Produk+${i+1}`);
}

export async function editProductImage(base64ImageData: string, mimeType: string, prompt: string): Promise<string[]> {
  // OpenRouter doesn't support image editing directly
  // We'll return placeholder images for now
  console.warn("OpenRouter doesn't support image editing. Returning placeholder images.");
  
  // Return 2 placeholder images
  return Array(2).fill(null).map((_, i) => `https://placehold.co/600x450/EEE/31343C?text=Edit+Gambar+${i+1}`);
}