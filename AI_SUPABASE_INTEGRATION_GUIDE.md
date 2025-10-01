# AI + Supabase Integration Guide

**Date**: 2025-01-XX  
**Purpose**: Cara menghubungkan AI Services dengan Supabase Database

---

## 📚 **Overview**

AI services sekarang bisa ambil data langsung dari Supabase database untuk analisis yang lebih akurat dan real-time.

---

## 🔧 **Setup**

### **1. Import Data Fetcher**

```typescript
import { AIDataFetcher } from '@/lib/ai/data-fetcher';
```

### **2. Ambil Data dari Database**

```typescript
// Ambil data ingredients
const ingredients = await AIDataFetcher.getIngredientsData({
  category: 'bahan-kering',
  lowStock: true,
  limit: 50
});

// Ambil data recipes
const recipes = await AIDataFetcher.getRecipesData({
  category: 'kue',
  limit: 20
});

// Ambil data orders (30 hari terakhir)
const orders = await AIDataFetcher.getOrdersData({
  status: 'completed',
  dateFrom: '2025-01-01',
  limit: 100
});

// Ambil data customers
const customers = await AIDataFetcher.getCustomersData({
  active: true,
  limit: 50
});

// Ambil data financial
const financial = await AIDataFetcher.getFinancialData({
  type: 'income',
  dateFrom: '2025-01-01',
  limit: 100
});
```

### **3. Format Data untuk AI**

```typescript
// Format data menjadi string yang mudah dibaca AI
const ingredientsContext = AIDataFetcher.formatForAI(ingredients, 'ingredients');
const recipesContext = AIDataFetcher.formatForAI(recipes, 'recipes');
```

---

## 🎯 **Use Cases**

### **1. AI Pricing dengan Data Real**

```typescript
// app/api/ai/pricing/route.ts
import { AIDataFetcher } from '@/lib/ai/data-fetcher';
import { aiService } from '@/lib/ai';

export async function POST(request: Request) {
  const { recipeId } = await request.json();
  
  // Ambil data recipe dan ingredients dari database
  const recipes = await AIDataFetcher.getRecipesData({ limit: 1 });
  const recipe = recipes[0];
  
  // Hitung HPP dari database
  const ingredients = recipe.recipe_ingredients.map((ri: any) => ({
    name: ri.ingredients.name,
    cost: ri.ingredients.unit_price * ri.quantity,
    quantity: ri.quantity
  }));
  
  // AI analysis dengan data real
  const analysis = await aiService.pricing.analyzePricing({
    productName: recipe.name,
    ingredients,
    location: 'Indonesia',
    targetMarket: 'mid-market'
  });
  
  return Response.json(analysis);
}
```

### **2. AI Inventory Optimization dengan Data Real**

```typescript
// app/api/ai/inventory/route.ts
import { AIDataFetcher } from '@/lib/ai/data-fetcher';
import { aiService } from '@/lib/ai';

export async function POST(request: Request) {
  // Ambil semua ingredients dari database
  const ingredients = await AIDataFetcher.getIngredientsData({
    lowStock: false, // semua
    limit: 100
  });
  
  // AI optimization dengan data real
  const optimization = await aiService.optimizeInventory({
    ingredients: ingredients.map((ing: any) => ({
      name: ing.name,
      currentStock: ing.current_stock,
      minStock: ing.min_stock,
      usagePerWeek: ing.usage_per_week || 0,
      price: ing.unit_price,
      supplier: ing.supplier || 'Unknown',
      leadTime: ing.lead_time_days || 3
    }))
  });
  
  return Response.json(optimization);
}
```

### **3. AI Customer Insights dengan Data Real**

```typescript
// app/api/ai/customer-insights/route.ts
import { AIDataFetcher } from '@/lib/ai/data-fetcher';
import { aiService } from '@/lib/ai';

export async function GET() {
  // Ambil data customers dengan order history
  const customers = await AIDataFetcher.getCustomersData({
    limit: 100
  });
  
  // AI customer analysis
  const insights = await aiService.customer.analyzeCustomers({
    customers: customers.map((c: any) => ({
      name: c.name,
      email: c.email,
      phone: c.phone,
      totalOrders: c.totalOrders,
      totalSpent: c.totalSpent,
      lastOrderDate: c.lastOrderDate,
      joinDate: c.created_at
    }))
  });
  
  return Response.json(insights);
}
```

### **4. AI Dashboard Insights dengan Semua Data**

```typescript
// app/api/ai/dashboard-insights/route.ts
import { AIDataFetcher } from '@/lib/ai/data-fetcher';
import { aiService } from '@/lib/ai';

export async function GET() {
  // Ambil semua stats dari database
  const stats = await AIDataFetcher.getDashboardStats();
  
  if (!stats) {
    return Response.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
  
  // AI comprehensive analysis
  const insights = await aiService.getBusinessInsights({
    pricing: {
      recipes: stats.recipes.data,
      avgOrderValue: stats.orders.totalRevenue / stats.orders.total
    },
    production: {
      recipes: stats.recipes.data,
      ingredients: stats.ingredients.data,
      completionRate: stats.orders.completed / stats.orders.total
    },
    customers: {
      customers: stats.customers.data,
      activeRate: stats.customers.active / stats.customers.total
    }
  });
  
  return Response.json({
    stats,
    insights,
    summary: insights.summary,
    priorityActions: insights.priorityActions
  });
}
```

---

## 📊 **Available Data Fetchers**

| Method | Description | Filters |
|--------|-------------|---------|
| `getIngredientsData()` | Ambil data bahan baku | category, lowStock, limit |
| `getRecipesData()` | Ambil data resep + ingredients | category, limit |
| `getOrdersData()` | Ambil data pesanan + items | status, dateFrom, dateTo, limit |
| `getCustomersData()` | Ambil data pelanggan + orders | active, limit |
| `getFinancialData()` | Ambil data keuangan | type, dateFrom, dateTo, limit |
| `getOperationalCostsData()` | Ambil data biaya operasional | category, limit |
| `getDashboardStats()` | Ambil semua stats (30 hari) | - |

---

## 🔥 **Example: Real-time AI Chat dengan Database**

```typescript
// app/api/ai/chat-with-data/route.ts
import { AIDataFetcher } from '@/lib/ai/data-fetcher';
import { openRouterClient } from '@/lib/openrouter-client';

export async function POST(request: Request) {
  const { message, context } = await request.json();
  
  // Ambil data relevan berdasarkan pertanyaan user
  let dataContext = '';
  
  if (message.toLowerCase().includes('stok') || message.toLowerCase().includes('bahan')) {
    const ingredients = await AIDataFetcher.getIngredientsData({ limit: 20 });
    dataContext = AIDataFetcher.formatForAI(ingredients, 'ingredients');
  }
  
  if (message.toLowerCase().includes('pesanan') || message.toLowerCase().includes('order')) {
    const orders = await AIDataFetcher.getOrdersData({ limit: 20 });
    dataContext = AIDataFetcher.formatForAI(orders, 'orders');
  }
  
  if (message.toLowerCase().includes('pelanggan') || message.toLowerCase().includes('customer')) {
    const customers = await AIDataFetcher.getCustomersData({ limit: 20 });
    dataContext = AIDataFetcher.formatForAI(customers, 'customers');
  }
  
  // Kirim ke AI dengan context dari database
  const response = await openRouterClient.chat([
    {
      role: 'system',
      content: `Anda adalah asisten bisnis untuk UMKM F&B di Indonesia.
      
Data bisnis saat ini:
${dataContext}

Jawab pertanyaan user dengan data real di atas.`
    },
    {
      role: 'user',
      content: message
    }
  ]);
  
  return Response.json({ 
    response: response.choices[0].message.content,
    hasData: !!dataContext 
  });
}
```

---

## 🎨 **Frontend Integration**

### **AI Page dengan Real Data**

```typescript
// app/ai/page.tsx
'use client';

import { useEffect, useState } from 'react';

export default function AIPage() {
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function fetchInsights() {
      const response = await fetch('/api/ai/dashboard-insights');
      const data = await response.json();
      setInsights(data);
      setLoading(false);
    }
    
    fetchInsights();
  }, []);
  
  if (loading) return <div>Loading AI insights...</div>;
  
  return (
    <div>
      <h1>AI Business Insights</h1>
      
      {/* Stats dari database */}
      <div className="grid grid-cols-4 gap-4">
        <div>
          <h3>Ingredients</h3>
          <p>Total: {insights.stats.ingredients.total}</p>
          <p>Low Stock: {insights.stats.ingredients.lowStock}</p>
        </div>
        <div>
          <h3>Orders</h3>
          <p>Total: {insights.stats.orders.total}</p>
          <p>Revenue: Rp {insights.stats.orders.totalRevenue.toLocaleString()}</p>
        </div>
        <div>
          <h3>Customers</h3>
          <p>Total: {insights.stats.customers.total}</p>
          <p>Active: {insights.stats.customers.active}</p>
        </div>
        <div>
          <h3>Financial</h3>
          <p>Income: Rp {insights.stats.financial.totalIncome.toLocaleString()}</p>
          <p>Expense: Rp {insights.stats.financial.totalExpense.toLocaleString()}</p>
        </div>
      </div>
      
      {/* AI Insights */}
      <div className="mt-8">
        <h2>AI Analysis</h2>
        <p>{insights.insights.summary}</p>
        
        <h3>Priority Actions</h3>
        <ul>
          {insights.priorityActions.map((action: string, i: number) => (
            <li key={i}>{action}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
```

---

## 🚀 **Quick Start Example**

```bash
# 1. File sudah dibuat: src/lib/ai/data-fetcher.ts

# 2. Test di API route
# app/api/test-ai-data/route.ts
```

```typescript
import { AIDataFetcher } from '@/lib/ai/data-fetcher';

export async function GET() {
  // Test ambil data
  const stats = await AIDataFetcher.getDashboardStats();
  
  return Response.json({
    success: true,
    stats,
    message: 'AI dapat mengakses data dari Supabase!'
  });
}
```

```bash
# 3. Test API
curl http://localhost:3000/api/test-ai-data
```

---

## ⚡ **Performance Tips**

### **1. Cache Data**
```typescript
// Cache hasil untuk 5 menit
const CACHE_TTL = 5 * 60 * 1000;
let cachedStats: any = null;
let cacheTime: number = 0;

export async function getCachedStats() {
  const now = Date.now();
  
  if (cachedStats && (now - cacheTime) < CACHE_TTL) {
    return cachedStats;
  }
  
  cachedStats = await AIDataFetcher.getDashboardStats();
  cacheTime = now;
  
  return cachedStats;
}
```

### **2. Parallel Queries**
```typescript
// Fetch multiple data sources in parallel
const [ingredients, recipes, orders] = await Promise.all([
  AIDataFetcher.getIngredientsData(),
  AIDataFetcher.getRecipesData(),
  AIDataFetcher.getOrdersData()
]);
```

### **3. Limit Data Size**
```typescript
// Hanya ambil data yang relevan
const recentOrders = await AIDataFetcher.getOrdersData({
  dateFrom: thirtyDaysAgo.toISOString(),
  limit: 50 // Batasi jumlah
});
```

---

## 🔒 **Security**

### **Row Level Security (RLS)**

Data fetcher otomatis respect RLS policies dari Supabase:

```sql
-- Contoh RLS policy (sudah ada di Supabase)
CREATE POLICY "Users can read own business data"
ON ingredients FOR SELECT
USING (auth.uid() = user_id);
```

### **API Route Protection**

```typescript
import { createClient } from '@/lib/supabase';

export async function GET(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Fetch data hanya untuk user yang login
  const stats = await AIDataFetcher.getDashboardStats();
  return Response.json(stats);
}
```

---

## 📝 **Next Steps**

1. ✅ Data fetcher sudah dibuat
2. ✅ Dokumentasi lengkap
3. 🔄 Integrasi ke existing AI services
4. 🔄 Buat API routes baru dengan real data
5. 🔄 Update frontend untuk gunakan real data

---

## 🎯 **Summary**

**Sekarang AI bisa:**
- ✅ Ambil data real dari Supabase
- ✅ Analisis inventory berdasarkan stok aktual
- ✅ Rekomendasi pricing dari data orders
- ✅ Customer insights dari purchase history
- ✅ Financial analysis dari transaksi real
- ✅ Dashboard insights dengan semua data

**Tinggal:**
- Implementasi di API routes
- Update frontend components
- Test dengan data production

---

**Status**: ✅ Ready to Use  
**File Created**: `src/lib/ai/data-fetcher.ts`  
**Documentation**: Complete
