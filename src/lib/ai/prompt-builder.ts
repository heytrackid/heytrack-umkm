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
}
