import { NextRequest, NextResponse } from 'next/server';
import { aiChatbotService } from '@/lib/ai-chatbot-service';
import { openRouterClient } from '@/lib/openrouter-client';
import { supabaseUserContext } from '@/lib/supabase-user-context';

export async function POST(request: NextRequest) {
  try {
    const { userId, message, contextId, useAI = true } = await request.json();

    if (!userId || !message) {
      return NextResponse.json(
        { error: 'userId and message are required' },
        { status: 400 }
      );
    }

    // Process message with AI chatbot service
    const result = await aiChatbotService.processMessage(userId, message, contextId);

    // If useAI is enabled, enhance response with OpenRouter AI
    if (useAI && result.response.type === 'assistant') {
      try {
        // Get user business context
        const [userProfile, businessData] = await Promise.all([
          supabaseUserContext.getUserProfile(userId),
          supabaseUserContext.getUserBusinessData(userId)
        ]);

        // Create conversation history for AI context
        const conversationHistory = result.context.conversation
          .slice(-5) // Last 5 messages for context
          .map(msg => ({
            role: msg.type === 'user' ? 'user' as const : 'assistant' as const,
            content: msg.content
          }));

        // Generate enhanced AI response
        const enhancedResponse = await openRouterClient.generateBusinessResponse(
          message,
          {
            businessType: userProfile.businessType,
            businessName: userProfile.businessName,
            location: userProfile.location,
            currentData: {
              revenue: businessData.financial.revenue,
              profitMargin: businessData.financial.profitMargin,
              criticalItems: businessData.inventory.criticalItems.length,
              customerCount: businessData.customers.totalCustomers,
              topProducts: businessData.products.topProducts.slice(0, 3)
            }
          },
          conversationHistory
        );

        // Update response content with AI enhancement
        result.response.content = enhancedResponse;
        result.response.data = {
          ...result.response.data,
          aiEnhanced: true,
          businessInsights: await supabaseUserContext.getBusinessInsights(userId)
        };

      } catch (aiError) {
        console.error('AI enhancement failed:', aiError);
        // Continue with original response if AI fails
      }
    }

    return NextResponse.json({
      success: true,
      response: result.response,
      actions: result.actions,
      context: {
        id: result.context.id,
        userId: result.context.userId,
        businessContext: result.context.businessContext
      }
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Get conversation history
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const contextId = searchParams.get('contextId');

    if (!contextId) {
      return NextResponse.json(
        { error: 'contextId is required' },
        { status: 400 }
      );
    }

    const conversation = aiChatbotService.getConversation(contextId);

    return NextResponse.json({
      success: true,
      conversation
    });

  } catch (error) {
    console.error('Get conversation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}