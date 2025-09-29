# 🤖 AI Chatbot Integration dengan OpenRouter & Supabase

Dokumentasi lengkap integrasi AI Chatbot untuk UMKM F&B yang menggunakan OpenRouter (Grok-4-Fast) dan Supabase untuk personalisasi berdasarkan data user.

## 🌟 Fitur Terintegrasi

### 1. **OpenRouter AI Integration**
- Model: `x-ai/grok-4-fast:free` (atau custom model dari env)
- Contextual prompting khusus UMKM F&B Indonesia
- Business intelligence dengan standar industri F&B
- Response dalam Bahasa Indonesia yang natural

### 2. **Supabase User Context**
- User-specific business data retrieval
- Real-time financial, inventory, customer, dan product analytics
- Personalized business insights berdasarkan data aktual user
- Multi-user support dengan context isolation

### 3. **Smart Business Intelligence**
- Analisis keuangan: Revenue, profit margin, cost analysis
- Inventory intelligence: Critical items, low stock alerts, reorder recommendations
- Customer analytics: Retention rate, AOV, customer lifetime value
- Product performance: Best sellers, profitability analysis

## 🏗️ Arsitektur Sistem

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Layer      │    │   AI Services   │
│                 │    │                  │    │                 │
│ ChatbotFAB      ├────┤ /api/ai/chat     ├────┤ OpenRouter API  │
│ ChatbotInterface│    │ /api/ai/actions  │    │ (Grok-4-Fast)   │
│ DataVisualization   │ │                  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                 │
                                 ▼
                       ┌──────────────────┐    ┌─────────────────┐
                       │  Business Logic  │    │   Data Layer    │
                       │                  │    │                 │
                       │ AIChatbotService ├────┤ Supabase DB     │
                       │ UserContext      │    │ User Data       │
                       │ BusinessIntel    │    │ Analytics       │
                       └──────────────────┘    └─────────────────┘
```

## 📁 Struktur File

```
src/
├── lib/
│   ├── openrouter-client.ts          # OpenRouter API client
│   ├── supabase-user-context.ts      # User data retrieval
│   └── ai-chatbot-service.ts         # Enhanced dengan AI integration
├── app/api/ai/
│   ├── chat/route.ts                 # Chat API dengan AI enhancement
│   └── actions/route.ts              # Action execution dengan AI
└── components/ai-chatbot/
    ├── ChatbotInterface.tsx          # Updated untuk API calls
    ├── ChatbotFAB.tsx               # Floating action button
    └── DataVisualization.tsx        # Enhanced visualizations
```

## 🔧 Configuration & Setup

### Environment Variables

```bash
# OpenRouter AI
OPENROUTER_API_KEY="sk-or-v1-your-key-here"
AI_MODEL="x-ai/grok-4-fast:free"

# Supabase Database
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

### Model Configuration

OpenRouter client mendukung berbagai model:
- `x-ai/grok-4-fast:free` (default, gratis)
- `anthropic/claude-3.5-sonnet`
- `openai/gpt-4o`
- `meta-llama/llama-3-70b`

## 🚀 Usage Examples

### Basic Chat Conversation

```typescript
// User mengirim pesan
POST /api/ai/chat
{
  "userId": "user-123",
  "message": "Bagaimana kondisi bisnis bakery saya hari ini?",
  "useAI": true
}

// Response dengan AI enhancement
{
  "success": true,
  "response": {
    "id": "msg_123_assistant",
    "type": "assistant",
    "content": "🍞 Selamat pagi! Berdasarkan data bisnis bakery Anda hari ini:\n\n📊 **Performa Harian:**\n- Revenue: Rp 2,450,000 (↑ 12% dari kemarin)\n- Margin keuntungan: 32% (Sangat baik!)\n- 15 pesanan baru dari 12 pelanggan\n\n🚨 **Alert Penting:**\n- Tepung terigu tinggal 2kg (kritis!)\n- Gula pasir perlu restock dalam 2 hari\n\n💡 **Rekomendasi:**\nDengan performa yang bagus, pertimbangkan untuk:\n1. Segera restock bahan kritis\n2. Promosi produk best-seller (Roti Tawar)\n3. Follow-up pelanggan VIP untuk repeat order\n\nAda yang ingin Anda analisis lebih detail?",
    "data": {
      "aiEnhanced": true,
      "businessInsights": { /* detailed insights */ }
    }
  }
}
```

### Business Intelligence Query

```typescript
// User bertanya tentang analisis profit
"Analisis produk mana yang paling menguntungkan minggu ini"

// AI Response dengan data real user
"📈 **Analisis Profitabilitas (7 hari terakhir):**\n\n**Top 3 Produk Terprofitable:**\n1. 🥐 Croissant - Margin 45% (Rp 1,125,000)\n2. 🍰 Cake Custom - Margin 40% (Rp 850,000)\n3. 🍞 Roti Tawar - Margin 35% (Rp 675,000)\n\n**Insight Bisnis:**\nCroissant memberikan ROI terbaik meski volume lebih rendah. Pertimbangkan:\n• Tingkatkan produksi croissant 20-30%\n• Buat paket bundle dengan roti tawar\n• Marketing khusus untuk cake custom (margin tinggi)\n\n**Rekomendasi Strategis:**\nFokus pada high-margin products untuk meningkatkan overall profitability. Target: 38% average margin."
```

### Inventory Management

```typescript
// User: "Cek stok bahan-bahan yang perlu direstock"
{
  "criticalItems": [
    { "name": "Tepung Terigu", "current_stock": 2, "min_stock": 10, "unit": "kg" }
  ],
  "aiAnalysis": "⚠️ **Status Inventori Kritis:**\n\nTepung terigu dalam kondisi kritis dengan stok tinggal 2kg. Berdasarkan pola konsumsi harian Anda (3.5kg/hari), stok akan habis dalam 14 jam.\n\n🚀 **Action Plan:**\n1. URGENT: Order minimal 25kg tepung terigu hari ini\n2. Pertimbangkan supplier backup untuk emergency\n3. Set automatic reorder point di 15kg untuk masa depan\n4. Monitor waste ratio - saat ini 3.2% (masih normal)\n\n💰 **Impact Analysis:**\nJika kehabisan stok, potensi loss revenue Rp 1.2M/hari dari produk berbasis tepung."
}
```

## 🔍 API Endpoints Detail

### 1. Chat API (`/api/ai/chat`)

**POST Request:**
```json
{
  "userId": "string",
  "message": "string", 
  "contextId": "string?",
  "useAI": "boolean"
}
```

**Response:**
```json
{
  "success": true,
  "response": {
    "id": "string",
    "type": "assistant|user|system",
    "content": "string",
    "timestamp": "Date",
    "actions": [
      {
        "id": "string",
        "type": "add_order|check_stock|view_report|analysis|recommendation",
        "label": "string",
        "data": "object"
      }
    ],
    "data": {
      "aiEnhanced": "boolean",
      "businessInsights": "object"
    }
  },
  "context": {
    "id": "string",
    "userId": "string", 
    "businessContext": "object"
  }
}
```

### 2. Actions API (`/api/ai/actions`)

**POST Request:**
```json
{
  "actionId": "string",
  "contextId": "string",
  "userId": "string"
}
```

**GET Request (Business Insights):**
```
GET /api/ai/actions?userId=user-123
```

**Response:**
```json
{
  "success": true,
  "data": {
    "businessData": {
      "financial": { /* financial metrics */ },
      "inventory": { /* inventory status */ },
      "customers": { /* customer analytics */ },
      "products": { /* product performance */ }
    },
    "insights": {
      "metrics": { /* key metrics */ },
      "alerts": [ /* business alerts */ ],
      "opportunities": [ /* growth opportunities */ ]
    },
    "aiSummary": "string" // AI-generated business summary
  }
}
```

## 💡 Smart Prompting System

### System Prompt Template

```
Anda adalah asisten AI khusus untuk bisnis UMKM F&B di Indonesia.

KONTEKS BISNIS:
- Tipe Bisnis: {businessType}
- Nama Bisnis: {businessName}  
- Lokasi: {location}

KAPABILITAS ANDA:
1. Analisis keuangan dengan standar industri F&B Indonesia
2. Manajemen inventori dengan fokus bahan makanan/minuman
3. Optimasi operasional untuk UMKM
4. Perhitungan HPP yang akurat
5. Strategi pemasaran untuk target market Indonesia
6. Analisis customer behavior dan retensi
7. Rekomendasi pricing strategy yang kompetitif

STANDAR INDUSTRI F&B INDONESIA:
- Margin keuntungan normal: 20-40%
- Food cost ratio: 25-35% 
- Inventory turnover: 4-12x per tahun
- Customer retention rate yang baik: >60%

TONE & BAHASA:
- Bahasa Indonesia profesional tapi friendly
- Contoh konkret relevan dengan bisnis F&B
- Fokus pada solusi praktis dan actionable
- Sertakan angka dan data spesifik jika tersedia
- Gunakan emoji yang sesuai untuk memperjelas pesan
```

### Contextual Data Injection

AI mendapat context real-time dari database user:
- **Financial Context**: Revenue, costs, profit margin, growth rate
- **Inventory Context**: Stock levels, critical items, reorder needs
- **Customer Context**: Customer count, retention rate, AOV
- **Product Context**: Best sellers, profitability, trends

## 🎯 Business Intelligence Features

### 1. Financial Analysis

```typescript
analyzeFinancialPerformance(userId, period) {
  // Real user data dari Supabase
  const revenue = userOrders.reduce(sum);
  const costs = userExpenses.reduce(sum);
  const profitMargin = (revenue - costs) / revenue * 100;
  
  // AI Enhancement
  const aiAnalysis = await openRouterClient.generateDataAnalysis(
    'financial', 
    { revenue, costs, profitMargin },
    userBusinessContext
  );
}
```

**Output:**
```
💰 Analisis Keuangan (30 hari):

📊 METRICS:
• Revenue: Rp 45,600,000 (↑ 8.5%)
• Costs: Rp 31,200,000 (↑ 6.2%) 
• Profit: Rp 14,400,000
• Margin: 31.6% (Excellent!)

🎯 BENCHMARKING:
✅ Margin 31.6% > Industry avg 25%
✅ Cost control baik (68.4% revenue)
⚠️ Growth rate melambat dari 12% → 8.5%

💡 ACTIONABLE INSIGHTS:
1. Margin sangat sehat - fokus scale up
2. Identifikasi penyebab growth slowdown  
3. Optimasi cost structure untuk expansion
4. Consider pricing premium products
```

### 2. Inventory Intelligence

```typescript
analyzeInventoryStatus(userId) {
  // Real inventory data
  const inventory = await getUserInventoryData(userId);
  const criticalItems = inventory.filter(lowStock);
  
  // AI-powered recommendations
  const recommendations = await generateInventoryRecommendations(
    inventory, 
    userBusinessType,
    historicalUsage
  );
}
```

### 3. Customer Analytics

User-specific customer data dengan AI insights:
- Customer lifetime value calculation
- Churn prediction berdasarkan behavior pattern
- Segmentation otomatis untuk targeted marketing
- Personalized retention strategies

### 4. Product Performance

Real-time analysis dari actual sales data:
- Profitability ranking dengan margin calculation
- Demand forecasting berdasarkan historical patterns
- Cross-selling opportunities identification
- Seasonal trend analysis

## ⚡ Performance Optimizations

### 1. Caching Strategy
```typescript
// Context caching
const contextCache = new Map<string, ChatContext>();

// AI response caching untuk common queries
const responseCache = new LRUCache({
  max: 100,
  ttl: 1000 * 60 * 15 // 15 minutes
});
```

### 2. Database Query Optimization
- Indexed queries untuk user-specific data
- Parallel data fetching untuk multiple metrics
- Selective field loading untuk performance

### 3. API Rate Limiting
- OpenRouter rate limiting compliance
- Request queuing untuk high-traffic periods
- Fallback responses jika AI tidak available

## 🧪 Testing & Monitoring

### AI Response Quality Testing

```typescript
// Test AI accuracy untuk business scenarios
const testCases = [
  {
    scenario: 'Low margin alert',
    userData: { profitMargin: 15 },
    expectedKeywords: ['margin rendah', 'industri', 'rekomendasi']
  },
  {
    scenario: 'Critical stock alert', 
    userData: { criticalItems: 5 },
    expectedKeywords: ['kritis', 'restock', 'segera']
  }
];
```

### Performance Monitoring

```typescript
// Track AI performance metrics
const metrics = {
  responseTime: averageApiLatency,
  accuracy: userSatisfactionScore, 
  contextRelevance: businessDataUsage,
  costPerQuery: openRouterUsage
};
```

## 🚀 Production Deployment

### Build & Deploy

```bash
# Build dengan AI integration
pnpm build

# Verify environment variables
echo $OPENROUTER_API_KEY | cut -c1-10
echo $SUPABASE_SERVICE_ROLE_KEY | cut -c1-10

# Deploy ke Vercel
vercel --prod
```

### Health Checks

```bash
# Test AI chat endpoint
curl -X POST https://your-domain.com/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"userId":"test","message":"Hello","useAI":true}'

# Test business insights
curl "https://your-domain.com/api/ai/actions?userId=test"
```

## 📈 Usage Analytics

Monitor penggunaan AI chatbot:
- **User Engagement**: Message volume, session duration
- **AI Quality**: Response relevance, user satisfaction
- **Business Impact**: Insights acted upon, decisions influenced
- **Cost Management**: OpenRouter usage, optimization opportunities

## 🔒 Security & Privacy

### Data Protection
- User data isolasi dengan userId-based queries
- Sensitive business data encryption
- PII handling compliance
- Supabase RLS (Row Level Security) integration

### AI Security
- Prompt injection protection
- Output sanitization
- Rate limiting per user
- Content filtering untuk inappropriate requests

---

## 🎉 Ready for Production!

AI Chatbot dengan OpenRouter dan Supabase integration siap digunakan! 

**Key Benefits:**
- 🤖 Intelligent responses berdasarkan data bisnis real user
- 📊 Business intelligence yang actionable dan contextual  
- 🚀 Scalable architecture untuk multi-user environment
- 💰 Cost-effective dengan free tier OpenRouter models
- 🇮🇩 Optimized untuk UMKM F&B Indonesia

**Next Steps:**
1. Deploy ke production environment
2. Monitor user engagement dan feedback
3. Iterasi improvement berdasarkan usage patterns
4. Ekspansi fitur AI advanced (forecasting, recommendations)

Untuk support atau pertanyaan, silakan check dokumentasi atau create issue di repository.