import { NextRequest, NextResponse } from 'next/server';
import { AIDataFetcher } from '@/lib/ai/data-fetcher';
import { OpenRouterClient } from '@/lib/openrouter-client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, context = 'general' } = body;

    if (!message) {
      return NextResponse.json({
        success: false,
        error: 'Message is required'
      }, { status: 400 });
    }

    // Initialize OpenRouter client
    const openRouterClient = new OpenRouterClient();

    // Fetch relevant data based on message context
    let dataContext = '';
    const messageLower = message.toLowerCase();

    // Detect context from message
    const needsInventoryData = messageLower.includes('stok') || 
                                messageLower.includes('bahan') || 
                                messageLower.includes('ingredient') ||
                                messageLower.includes('inventory');

    const needsOrderData = messageLower.includes('pesanan') || 
                            messageLower.includes('order') || 
                            messageLower.includes('penjualan') ||
                            messageLower.includes('sales');

    const needsCustomerData = messageLower.includes('pelanggan') || 
                               messageLower.includes('customer') || 
                               messageLower.includes('pembeli');

    const needsFinancialData = messageLower.includes('keuangan') || 
                                messageLower.includes('finansial') || 
                                messageLower.includes('financial') ||
                                messageLower.includes('untung') ||
                                messageLower.includes('profit');

    const needsRecipeData = messageLower.includes('resep') || 
                             messageLower.includes('recipe') || 
                             messageLower.includes('produk') ||
                             messageLower.includes('product');

    // Build context from database
    if (needsInventoryData) {
      const ingredients = await AIDataFetcher.getIngredientsData({ limit: 20 });
      if (ingredients.length > 0) {
        dataContext += '\n\n📦 DATA INVENTORI:\n';
        dataContext += AIDataFetcher.formatForAI(ingredients, 'ingredients');
      }
    }

    if (needsOrderData) {
      const orders = await AIDataFetcher.getOrdersData({ limit: 20 });
      if (orders.length > 0) {
        dataContext += '\n\n📋 DATA PESANAN (30 hari terakhir):\n';
        dataContext += AIDataFetcher.formatForAI(orders, 'orders');
      }
    }

    if (needsCustomerData) {
      const customers = await AIDataFetcher.getCustomersData({ limit: 20 });
      if (customers.length > 0) {
        dataContext += '\n\n👥 DATA PELANGGAN:\n';
        dataContext += AIDataFetcher.formatForAI(customers, 'customers');
      }
    }

    if (needsFinancialData) {
      const financial = await AIDataFetcher.getFinancialData({ limit: 20 });
      if (financial.length > 0) {
        dataContext += '\n\n💰 DATA KEUANGAN (30 hari terakhir):\n';
        dataContext += AIDataFetcher.formatForAI(financial, 'financial');
      }
    }

    if (needsRecipeData) {
      const recipes = await AIDataFetcher.getRecipesData({ limit: 10 });
      if (recipes.length > 0) {
        dataContext += '\n\n🍰 DATA RESEP/PRODUK:\n';
        dataContext += AIDataFetcher.formatForAI(recipes, 'recipes');
      }
    }

    // If no specific context detected, get general dashboard stats
    if (!dataContext) {
      const stats = await AIDataFetcher.getDashboardStats();
      if (stats) {
        dataContext = `\n\n📊 STATISTIK BISNIS (30 hari terakhir):
- Total Bahan: ${stats.ingredients.total} (Low Stock: ${stats.ingredients.lowStock})
- Total Resep: ${stats.recipes.total}
- Total Pesanan: ${stats.orders.total} (Completed: ${stats.orders.completed})
- Total Revenue: Rp ${stats.orders.totalRevenue.toLocaleString()}
- Total Customer: ${stats.customers.total} (Active: ${stats.customers.active})
- Total Income: Rp ${stats.financial.totalIncome.toLocaleString()}
- Total Expense: Rp ${stats.financial.totalExpense.toLocaleString()}
- Net Profit: Rp ${(stats.financial.totalIncome - stats.financial.totalExpense).toLocaleString()}`;
      }
    }

    // Create enhanced system prompt with data context
    const systemPrompt = `Anda adalah asisten bisnis AI untuk UMKM F&B di Indonesia.

${dataContext ? 'DATA BISNIS REAL-TIME:' + dataContext : 'Saat ini tidak ada data spesifik tersedia.'}

INSTRUKSI:
- Jawab pertanyaan user dengan menggunakan data real di atas
- Berikan analisis yang actionable dan relevan
- Gunakan Bahasa Indonesia yang profesional tapi friendly
- Fokus pada insight yang membantu pengambilan keputusan
- Sertakan angka konkret dari data jika relevan
- Berikan rekomendasi yang spesifik dan praktis

Jika user menanyakan tentang data yang tidak tersedia, beritahu dengan jelas dan sarankan data apa yang perlu ditambahkan.`;

    // Generate AI response
    const aiResponse = await openRouterClient.generateResponse([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message }
    ], {
      temperature: 0.7,
      max_tokens: 1500
    });

    return NextResponse.json({
      success: true,
      response: aiResponse,
      hasData: !!dataContext,
      dataContext: {
        hasInventory: needsInventoryData,
        hasOrders: needsOrderData,
        hasCustomers: needsCustomerData,
        hasFinancial: needsFinancialData,
        hasRecipes: needsRecipeData
      },
      metadata: {
        timestamp: new Date().toISOString(),
        model: 'grok-4-fast-free',
        dataSource: 'database',
        contextType: dataContext ? 'specific' : 'general'
      }
    });

  } catch (error) {
    console.error('AI Chat with Data API error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to generate AI response',
      suggestion: 'Check OpenRouter API key and database connection'
    }, { status: 500 });
  }
}
