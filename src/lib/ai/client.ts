/**
 * AI Client Module
 * Handles API calls to OpenRouter and OpenAI
 */

import { apiLogger } from '@/lib/logger'

export class AIClient {
  /**
   * Call OpenRouter API (primary method)
   */
  static async callAI(
    prompt: string,
    systemPrompt: string,
    model = 'meta-llama/llama-3.1-8b-instruct:free'
  ): Promise<string> {
    return await this.callOpenRouter(prompt, systemPrompt, model)
  }

  /**
   * Call OpenRouter API with enhanced security
   */
  static async callOpenRouter(
    prompt: string,
    systemPrompt: string,
    model = 'meta-llama/llama-3.1-8b-instruct:free'
  ): Promise<string> {
    const apiKey = process.env['OPENROUTER_API_KEY']

    if (!apiKey) {
      throw new Error('OpenRouter API key not configured. Please set OPENROUTER_API_KEY in your .env file')
    }

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': process.env['NEXT_PUBLIC_APP_URL'] || 'http://localhost:3000',
          'X-Title': 'HeyTrack AI Assistant'
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1500
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        let errorData
        try {
          errorData = JSON.parse(errorText)
        } catch {
          errorData = { error: { message: errorText } }
        }
        
        apiLogger.error({ 
          status: response.status, 
          error: errorData,
          model,
          hasApiKey: !!apiKey 
        }, 'OpenRouter API Error')
        
        throw new Error(`OpenRouter API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`)
      }

      const data = await response.json()
      const content = data.choices?.[0]?.message?.content
      
      if (!content) {
        throw new Error('No content in OpenRouter response')
      }
      
      return content
      
    } catch (err) {
      apiLogger.error({ error: err, model, hasApiKey: !!apiKey }, 'OpenRouter Client Error')
      throw err
    }
  }

  /**
   * Call OpenAI API as fallback
   */
  static async callOpenAI(
    prompt: string,
    systemPrompt: string,
    model = 'gpt-3.5-turbo'
  ): Promise<string> {
    const apiKey = process.env['OPENAI_API_KEY']

    if (!apiKey) {
      throw new Error('OpenAI API key not configured')
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1500
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`)
    }

    const data = await response.json()
    return data.choices[0]?.message?.content || 'No response generated'
  }

  /**
   * Call external AI service (generic method)
   */
  static async callExternalAI(prompt: string, options: {
    model?: string
    temperature?: number
    maxTokens?: number
  } = {}): Promise<string> {
    return this.callOpenRouter(prompt, 'You are a helpful AI assistant for a food business management system.', options.model)
  }
}
