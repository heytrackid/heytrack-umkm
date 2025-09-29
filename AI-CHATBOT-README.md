# 🤖 AI Chatbot for UMKM F&B

Smart AI Assistant untuk sistem manajemen bakery dengan kemampuan Natural Language Processing, Business Intelligence, dan Action Execution.

## 🌟 Fitur Utama

### 1. **Conversational AI dengan Context Awareness**
- Pemahaman bahasa alami (Bahasa Indonesia & Inggris)
- Context memory untuk percakapan multi-turn
- Intent recognition untuk berbagai kebutuhan bisnis

### 2. **Action Execution**
- ✅ **Add Order**: Tambah pesanan baru langsung dari chat
- 📦 **Check Stock**: Cek status inventori real-time
- 📊 **Generate Reports**: Buat laporan keuangan, inventory, pelanggan
- 🔍 **Business Analysis**: Analisis komprehensif performa bisnis
- 💡 **Smart Recommendations**: Rekomendasi berbasis data untuk optimasi bisnis

### 3. **Business Intelligence**
- **Financial Analytics**: Margin keuntungan, revenue, cost analysis
- **Inventory Intelligence**: Alert stok kritis, reorder recommendations
- **Customer Analytics**: Retention rate, customer value analysis
- **Product Performance**: Best-selling products, profitability analysis

### 4. **Interactive UI Components**
- Modern chat bubble interface dengan avatars
- Action buttons untuk quick execution
- Data visualizations (charts, metrics, progress bars)
- Mobile-responsive design dengan overlay mode
- Floating Action Button (FAB) untuk easy access

## 🎯 Intent Recognition

Sistem dapat mengenali berbagai intent bisnis:

| Intent | Contoh Query | Action |
|--------|--------------|--------|
| `greeting` | "Halo", "Selamat pagi" | Intro & menu options |
| `check_stock` | "Cek stok tepung", "Kondisi inventori" | Stock analysis + alerts |
| `financial_report` | "Laporan keuangan bulan ini" | Financial dashboard |
| `add_order` | "Tambah pesanan untuk Ibu Sari" | Order creation form |
| `profit_analysis` | "Produk mana yang menguntungkan?" | Product profitability |
| `customer_analysis` | "Analisis pelanggan terbaik" | Customer insights |
| `business_advice` | "Saran untuk tingkatkan penjualan" | Strategic recommendations |

## 🏗️ Arsitektur Teknis

### Core Components

```
src/lib/ai-chatbot-service.ts          # Main AI service
src/components/ai-chatbot/
├── ChatbotInterface.tsx               # Main chat UI
├── ChatbotFAB.tsx                    # Floating Action Button
└── DataVisualization.tsx             # Charts & metrics
```

### Service Architecture

```typescript
AIChatbotService
├── IntentRecognizer                   # NLP & pattern matching
├── BusinessIntelligence               # Analytics engine
├── ActionExecutor                     # Action handling
└── Context Management                 # Conversation state
```

### Business Intelligence Modules

1. **Financial Analysis**
   - Revenue & cost tracking
   - Profit margin calculation
   - Industry benchmark comparison
   - Trend analysis

2. **Inventory Intelligence** 
   - Low stock detection
   - Critical item alerts
   - Reorder point recommendations
   - Stock value analysis

3. **Customer Behavior**
   - Retention rate calculation
   - Customer lifetime value
   - Order frequency analysis
   - VIP customer identification

4. **Product Performance**
   - Sales volume tracking
   - Profitability analysis
   - Market performance insights
   - Product recommendation engine

## 🚀 Quick Start

### 1. Integration
Chatbot sudah terintegrasi otomatis di layout utama:

```tsx
// src/app/layout.tsx
<ChatbotFAB userId="demo-user" />
```

### 2. Usage Examples

#### Basic Queries
```
User: "Halo, kondisi bisnis hari ini bagaimana?"
AI: "Selamat pagi! Saya akan analisis kondisi bisnis Anda..."

User: "Cek stok bahan-bahan kue"
AI: "📦 Status Inventori: 2 item kritis perlu restock..."

User: "Berapa profit margin bulan ini?"
AI: "💰 Margin: 28.5% (Baik), Revenue: Rp 15,500,000..."
```

#### Action Execution
```
User: "Tambah pesanan untuk Ibu Sari"
AI: [Shows order form with action buttons]
User: [Clicks "Buat Pesanan Baru"]
AI: "✅ Pesanan berhasil ditambahkan: ORD-1738156789"
```

### 3. Advanced Features

#### Business Analysis
```
User: "Analisis lengkap bisnis minggu ini"
AI: [Shows comprehensive dashboard with:]
    - Financial performance charts
    - Inventory status alerts  
    - Top products & customers
    - Strategic recommendations
```

#### Smart Recommendations
```
User: "Saran untuk tingkatkan penjualan bakery"
AI: "💡 Rekomendasi berdasarkan data Anda:
     • Fokus pada Roti Tawar (margin 60%)
     • Implementasi program loyalitas
     • Cross-selling dengan produk premium..."
```

## 🎨 UI/UX Features

### Modern Chat Interface
- **Message Bubbles**: Different styles for user/assistant/system
- **Avatars**: Bot icon, user icon, system notifications
- **Timestamps**: Local time formatting (Indonesia)
- **Loading States**: Animated typing indicators

### Interactive Elements
- **Action Buttons**: Execute business actions directly
- **Quick Actions**: Preset queries (Cek Stok, Laporan, Saran)
- **Data Visualizations**: Charts, progress bars, metrics cards
- **Mobile Optimization**: Responsive design, touch-friendly

### Visual Feedback
- **Status Indicators**: Online badge, notification alerts
- **Progress Tracking**: Task completion status
- **Data Context**: Rich cards with business metrics
- **Error Handling**: Graceful failure messages

## 📊 Data Integration

### Real-time Data Sources
- **Ingredients**: Current stock, pricing, suppliers
- **Orders**: Sales data, customer information, order history
- **Financial**: Revenue, expenses, profit calculations
- **Customers**: Purchasing patterns, loyalty metrics

### Query Optimization
Menggunakan optimized database queries untuk performa maksimal:
- Indexed searches untuk ingredients, orders, customers
- Cached results untuk frequent queries  
- Efficient aggregations untuk analytics

## 🔧 Configuration

### Business Context
```typescript
businessContext: {
  businessType: 'bakery' | 'restaurant' | 'cafe' | 'catering',
  currentPeriod: string,
  lastAnalysis?: Date
}
```

### Customization Options
- **Industry Standards**: Margin targets, reorder points
- **Language Support**: Indonesia localization
- **Currency Formatting**: IDR dengan thousand separators
- **Business Rules**: Custom thresholds & alerts

## 📈 Performance Optimization

### Response Times
- Intent Recognition: ~50ms
- Database Queries: ~100-200ms (with indexes)
- Action Execution: ~200-500ms
- Data Visualization: ~100ms rendering

### Caching Strategy
- Query result caching untuk analytics
- Context memory untuk conversation state
- Pre-computed metrics untuk dashboard

### Scalability
- Stateless service design
- Database connection pooling
- Optimized SQL queries dengan proper indexing

## 🧪 Testing

Run comprehensive tests:

```bash
# Business Intelligence Tests
node test-ai-chatbot.js

# E2E Tests dengan Playwright
pnpm test:e2e

# Performance Tests
npm run test:performance
```

### Test Coverage
- ✅ Intent recognition accuracy
- ✅ Action execution reliability  
- ✅ Business intelligence calculations
- ✅ Data visualization rendering
- ✅ Error handling & edge cases
- ✅ Mobile responsive behavior

## 🚀 Production Deployment

### Environment Setup
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### Build & Deploy
```bash
# Optimized production build
pnpm build

# Vercel deployment
vercel --prod

# Health check
curl https://your-domain.com/api/health
```

## 🤖 Future Enhancements

### Planned Features
- [ ] **Voice Integration**: Speech-to-text & text-to-speech
- [ ] **Advanced NLP**: GPT integration untuk complex queries
- [ ] **Predictive Analytics**: Sales forecasting, trend predictions
- [ ] **Multi-language**: Full English support
- [ ] **Integration APIs**: WhatsApp, Telegram bot
- [ ] **Advanced Visualizations**: Interactive dashboards
- [ ] **Machine Learning**: Personalized recommendations

### AI Capabilities
- [ ] **Sentiment Analysis**: Customer feedback analysis
- [ ] **Anomaly Detection**: Unusual patterns in sales/inventory
- [ ] **Dynamic Pricing**: AI-powered price optimization
- [ ] **Demand Forecasting**: Predict future inventory needs
- [ ] **Customer Segmentation**: AI-based customer grouping

## 📞 Support & Documentation

### Help Commands
```
User: "Help" atau "Bantuan"
AI: [Shows complete feature list and usage examples]
```

### Error Recovery
- Graceful error handling dengan user-friendly messages
- Automatic retry untuk failed operations
- Context preservation selama error states

### Debugging
- Console logging untuk development mode
- Performance metrics tracking
- User interaction analytics

---

## 🎉 Ready to Use!

AI Chatbot telah fully integrated dan siap digunakan. Klik tombol chat di kanan bawah untuk mulai berinteraksi dengan asisten AI UMKM Anda!

**Developed with ❤️ for Indonesian UMKM F&B**