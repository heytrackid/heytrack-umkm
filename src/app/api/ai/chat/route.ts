import { NextRequest, NextResponse } from 'next/server';
// import { aiChatbotService } from '@/lib/ai-chatbot-service';
// import { openRouterClient } from '@/lib/openrouter-client';
// import { supabaseUserContext } from '@/lib/supabase-user-context';

export async function POST(request: NextRequest) {
  try {
    const { userId, message, contextId, useAI = true } = await request.json();

    if (!userId || !message) {
      return NextResponse.json(
        { error: 'userId and message are required' },
        { status: 400 }
      );
    }

    // Simple fallback responses for now
    const responses = [
     "Halo! Saya adalah asisten AI untuk bisnis bakery Anda. Bagaimana saya bisa membantu hari ini?",
     "Terima kasih atas pertanyaannya! Saat ini saya sedang dalam mode pembelajaran untuk memahami bisnis Anda lebih baik.",
     "Saya siap membantu dengan analisis bisnis, cek stok, laporan keuangan, dan saran strategis untuk UMKM Anda.",
     "Berdasarkan data yang tersedia, saya bisa memberikan insights tentang performa produk dan rekomendasi bisnis.",
     "Mari kita tingkatkan bisnis bakery Anda! Saya bisa membantu dengan optimasi HPP, manajemen inventori, dan analisis pelanggan."
    ];

    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    const response = {
      id: `msg_${Date.now()}_assistant`,
      type: 'assistant' as const,
      content: message.toLowerCase().includes('halo') || message.toLowerCase().includes('hello') ? responses[0] : randomResponse,
      timestamp: new Date(),
      contextId: contextId || `ctx_${userId}_${Date.now()}`,
      actions: [
        {
          id: `action_${Date.now()}`,
          type: 'check_stock',
          label: 'Cek Status Stok',
          data: {}
        },
        {
          id: `action_${Date.now() + 1}`,
          type: 'view_report',
          label: 'Lihat Laporan Keuangan',
          data: { type: 'financial' }
        }
      ]
    };

    return NextResponse.json({
      success: true,
      response,
      actions: response.actions,
      context: {
        id: contextId || `ctx_${userId}_${Date.now()}`,
        userId,
        businessContext: {
          businessType: 'bakery',
          currentPeriod: new Date().toISOString().slice(0, 7)
        }
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

    // Simple fallback - return empty conversation
    return NextResponse.json({
      success: true,
      conversation: []
    });

  } catch (error) {
    console.error('Get conversation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
