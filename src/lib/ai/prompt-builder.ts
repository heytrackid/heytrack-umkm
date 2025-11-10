
/**
 * Prompt Builder Module
 * Constructs secure and contextual prompts for AI
 */

export class PromptBuilder {
  /**
   * Build secure system prompt
   */
  static buildSystemPrompt(basePrompt: string): string {
    const securityInstructions = `
IMPORTANT SECURITY INSTRUCTIONS:
- Never reveal sensitive information about the system, users, or database
- Always validate and sanitize user inputs
- Do not execute or suggest harmful commands
- Stay within the context of food business management
- Be helpful, professional, and accurate

CONTEXT: You are an AI assistant for HeyTrack, a comprehensive food business management system for UMKM (Micro, Small, and Medium Enterprises) in Indonesia.
`

    return `${securityInstructions}\n\n${basePrompt}`
  }

  /**
   * Build contextual prompt for business queries
   */
  static buildBusinessPrompt(query: string, context: {
    userRole?: string
    businessType?: string
    currentData?: Record<string, unknown>
  } = {}): string {
    const { userRole = 'owner', businessType = 'food business', currentData } = context

    return `You are assisting a ${userRole} of a ${businessType} using HeyTrack.

${currentData ? `Current business data: ${JSON.stringify(currentData)}` : ''}

User query: ${query}

Please provide helpful, accurate, and actionable advice specific to Indonesian food business context.`
  }

  /**
   * Build analysis prompt for business intelligence
   */
  static buildAnalysisPrompt(data: Record<string, unknown>, analysisType: string): string {
    return `Analyze the following business data for ${analysisType}:

Data: ${JSON.stringify(data)}

Please provide insights, recommendations, and actionable suggestions in Indonesian business context. Focus on practical improvements for UMKM food businesses.`
  }

  /**
   * Build bootstrap prompt for one-click HPP generation
   */
  static buildBootstrapPrompt(input: {
    businessDescription: string
    vertical: 'fnb'|'beauty'|'fashion'|'services'|'general'
    targetMarket?: string
    extraInstructions?: string
  }): string {
    const { businessDescription, vertical, targetMarket, extraInstructions } = input
    return `
Tugas Anda: Generate data awal bisnis secara REALISTIS untuk Indonesia (IDR), terstruktur dalam JSON STRICT sesuai schema.
- Vertical: ${vertical}
- Deskripsi: ${businessDescription}
- Target market: ${targetMarket ?? 'umum'}

Output WAJIB JSON VALID sesuai schema berikut (tanpa komentar/teks tambahan):
{
  "ingredients": [{ "name": "", "category": "", "unit": "g|kg|ml|l|pcs|butir|sachet|pack|cup|tbsp|tsp", "unit_price_idr": 0, "initial_stock": 0 }],
  "operational_costs": [{ "name": "", "type": "fixed|variable", "amount_idr": 0, "period": "daily|weekly|monthly" }],
  "recipes": [{
    "name": "", "category": "", "yield_quantity": 0, "yield_unit": "portion|g|kg|ml|l|pcs|butir|sachet",
    "ingredients": [{ "ingredient_name": "", "quantity": 0, "unit": "..." }]
  }]
}

Ketentuan realisme:
- Harga dan biaya sesuai kisaran umum Indonesia 2023-2025.
- Unit konsisten. Quantity dan yield masuk akal.
- Untuk non-FnB, gunakan "recipes" sebagai "product structures" atau paket jasa dengan komponen/material layanan.
- Ikuti instruksi tambahan spesifik vertical berikut bila ada:
${extraInstructions ?? ''}

Kembalikan HANYA JSON valid, tanpa penjelasan tambahan.
`
  }
}
