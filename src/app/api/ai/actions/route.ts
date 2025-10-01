import { NextRequest, NextResponse } from 'next/server';
import { aiChatbot } from '@/lib/ai-chatbot';
import { openRouterClient } from '@/lib/openrouter-client';
import { supabaseUserContext } from '@/lib/supabase-user-context';

// Execute chatbot actions
export async function POST(request: NextRequest) {
  try {
    const { actionId, contextId, userId } = await request.json();

    if (!actionId || !contextId || !userId) {
      return NextResponse.json(
        { error: 'actionId, contextId, and userId are required' },
        { status: 400 }
      );
    }

    // Execute the action
    const result = await aiChatbot.executeAction(userId, { id: actionId, type: 'recommendation', label: '', data: {} });

    // If the action involved analysis or recommendations, enhance with AI
    if (result.success && (result.recommendations || result.analysis)) {
      try {
        const userProfile = await supabaseUserContext.getUserProfile(userId);
        
        if (result.recommendations) {
          // Generate AI-enhanced recommendations
          const businessData = await supabaseUserContext.getUserBusinessData(userId);
          const aiRecommendations = await openRouterClient.generateRecommendations(
            {
              revenue: businessData.financial.revenue,
              profitMargin: businessData.financial.profitMargin,
              criticalItems: businessData.inventory.criticalItems.length,
              retentionRate: businessData.customers.retentionRate,
              topProducts: businessData.products.topProducts.map(p => p.name).join(', ')
            },
            userProfile,
            'growth' // Focus area
          );

          result.aiRecommendations = aiRecommendations;
        }

        if (result.analysis) {
          // Enhance analysis with AI insights
          const insights = await supabaseUserContext.getBusinessInsights(userId);
          result.businessInsights = insights;
        }

      } catch (aiError) {
        console.error('AI enhancement for action failed:', aiError);
        // Continue with original result
      }
    }

    return NextResponse.json({
      success: true,
      result
    });

  } catch (error) {
    console.error('Action execution error:', error);
    
    // More detailed error logging
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    return NextResponse.json(
      { 
        error: 'Action execution failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : error) : undefined
      },
      { status: 500 }
    );
  }
}

// Get user business insights
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const [businessData, insights, recentActivities] = await Promise.all([
      supabaseUserContext.getUserBusinessData(userId),
      supabaseUserContext.getBusinessInsights(userId),
      supabaseUserContext.getRecentActivities(userId, 5)
    ]);

    // Generate AI summary of current business state
    let aiSummary = '';
    try {
      const userProfile = await supabaseUserContext.getUserProfile(userId);
      aiSummary = await openRouterClient.generateBusinessResponse(
        'Berikan ringkasan kondisi bisnis saat ini berdasarkan data yang ada.',
        {
          businessType: userProfile.businessType,
          businessName: userProfile.businessName,
          location: userProfile.location,
          currentData: businessData
        }
      );
    } catch (aiError) {
      console.error('AI summary generation failed:', aiError);
      aiSummary = 'Ringkasan AI tidak tersedia saat ini.';
    }

    return NextResponse.json({
      success: true,
      data: {
        businessData,
        insights,
        recentActivities,
        aiSummary
      }
    });

  } catch (error) {
    console.error('Business insights error:', error);
    return NextResponse.json(
      { error: 'Failed to get business insights' },
      { status: 500 }
    );
  }
}