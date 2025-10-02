# AI Integration Documentation

## Overview
Sistem bakery management ini telah diintegrasikan dengan fitur AI-powered yang menggunakan OpenRouter untuk memberikan insight bisnis cerdas khusus untuk UMKM F&B Indonesia.

## Architecture

### Core Components

#### 1. AI Service Layer (`src/lib/aiService.ts`)
Layanan utama yang menghubungkan dengan OpenRouter API:
- **Model**: `anthropic/claude-3.5-sonnet` (dapat dikonfigurasi)
- **Temperature**: 0.3 untuk hasil yang konsisten
- **Max Tokens**: 2000
- **Features**:
  - Pricing optimization analysis
  - Inventory management insights
  - Production planning suggestions
  - Customer behavior analysis
  - Financial forecasting

#### 2. React Hook (`src/hooks/useAIPowered.ts`)
Custom hook yang menyediakan interface mudah untuk konsumsi AI services:
```typescript
const { analyzeData, loading, error, confidence } = useAIPowered()

const result = await analyzeData('/api/ai/pricing', {
  recipes,
  ingredients,
  target_margin: 60
})
```

#### 3. API Endpoints (`src/app/api/ai/`)
RESTful endpoints untuk berbagai analisis AI:
- `/api/ai/pricing` - Analisis dan optimasi harga
- `/api/ai/inventory` - Manajemen stok cerdas  
- `/api/ai/production` - Perencanaan produksi
- `/api/ai/customer` - Analisis perilaku pelanggan
- `/api/ai/financial` - Analisis keuangan & forecasting

#### 4. AI Hub Component (`src/components/ai/AIIntegrationHub.tsx`)
Dashboard utama yang mengintegrasikan semua fitur AI dengan UI yang user-friendly.

## Features

### 1. Smart Pricing Assistant
Analisis AI untuk optimasi harga produk dengan mempertimbangkan:
- HPP (Harga Pokok Produksi) 
- Target margin profit (default 60% untuk pasar Indonesia)
- Kondisi pasar lokal
- Kompetitor pricing
- Seasonal adjustments

**Input**: Recipe data, ingredients cost, market conditions
**Output**: Recommended pricing, margin analysis, competitive positioning

### 2. Intelligent Inventory Management  
Prediksi kebutuhan stok berbasis AI dengan fitur:
- Prediksi penggunaan bahan 7-30 hari ke depan
- Titik reorder optimal berdasarkan lead time supplier
- Deteksi pola seasonality
- Alert untuk bahan yang mendekati expired
- Economic Order Quantity (EOQ) calculations

**Input**: Historical usage, supplier data, seasonal patterns
**Output**: Reorder recommendations, stock alerts, cost optimization

### 3. Production Planning AI
Optimasi jadwal produksi dengan mempertimbangkan:
- Demand forecasting
- Resource availability
- Batch size optimization
- Timeline calculations
- Cost-benefit analysis

### 4. Customer Analytics AI
Analisis perilaku pelanggan untuk:
- Customer segmentation
- Churn prediction
- Lifetime value calculation
- Product recommendation
- Targeted marketing insights

### 5. Financial Intelligence AI
Analisis keuangan mendalam dengan:
- Revenue forecasting
- Cash flow predictions
- Profitability analysis
- Cost optimization
- Business performance metrics

## Indonesian Business Context

Sistem AI ini khusus disesuaikan untuk konteks bisnis F&B Indonesia:

### Default Configuration
```typescript
const UMKM_CONFIG = {
  target_margin: 60, // 60% margin typical for Indonesian bakery
  reorder_days: 7,   // Weekly reorder cycle
  currency: 'IDR',
  tax_rate: 11,      // PPN 11%
  business_hours: {
    open: '06:00',
    close: '21:00'
  }
}
```

### Local Market Considerations
- **Seasonal Patterns**: Ramadan, Lebaran, Christmas demand spikes
- **Indonesian Taste Preferences**: Sweet, rich flavors preference
- **Price Sensitivity**: Middle-class purchasing power optimization
- **Local Suppliers**: Integration with Indonesian ingredient suppliers
- **Regulatory Compliance**: BPOM, halal certification requirements

## Usage Guide

### 1. Setup Environment Variables
```bash
# Required
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENROUTER_API_KEY=your_openrouter_key

# Optional AI Configuration  
AI_MODEL=anthropic/claude-3.5-sonnet
AI_TEMPERATURE=0.3
AI_MAX_TOKENS=2000
```

### 2. Initialize Sample Data
```bash
# Add sample ingredients, recipes, and financial records
node scripts/seed-sample-data.js
```

### 3. Access AI Hub
Navigate to `http://localhost:3000/ai` to access the AI Intelligence Hub.

### 4. Using AI Hook in Components
```typescript
import { useAIPowered } from '@/hooks/useAIPowered'

function MyComponent() {
  const { analyzeData, loading, confidence } = useAIPowered()
  
  const handleAnalysis = async () => {
    const insights = await analyzeData('/api/ai/pricing', {
      recipes: myRecipes,
      target_margin: 65
    })
    
    console.log('AI Confidence:', confidence)
    console.log('Insights:', insights)
  }
}
```

## API Reference

### POST /api/ai/pricing
Analyze and optimize product pricing.

**Request Body:**
```json
{
  "recipes": [...],
  "ingredients": [...],
  "market_conditions": "stable|growth|decline",
  "target_margin": 60
}
```

**Response:**
```json
{
  "success": true,
  "confidence": 87,
  "data": {
    "recommendations": [...],
    "analysis": "...",
    "priority": "medium"
  }
}
```

### POST /api/ai/inventory
Get intelligent inventory management insights.

**Request Body:**
```json
{
  "ingredients": [...],
  "usage_history": 30,
  "supplier_lead_times": true,
  "seasonal_patterns": true
}
```

**Response:**
```json
{
  "success": true,
  "confidence": 92,
  "data": {
    "alerts": [...],
    "reorder_suggestions": [...],
    "cost_savings": "...",
    "urgent_count": 2
  }
}
```

## Performance Optimization

### Caching Strategy
- API responses cached for 5 minutes (adjustable)
- Real-time data updates via Supabase subscriptions
- Intelligent cache invalidation on data changes

### Rate Limiting
- Max 100 AI requests per hour per user
- Graceful degradation when limits exceeded
- Priority queuing for critical insights

### Error Handling
- Retry logic for transient failures
- Fallback to cached insights when API unavailable
- User-friendly error messages

## Monitoring & Analytics

### AI Usage Metrics
- Request volume and success rates
- Average response times
- Confidence score distributions
- User engagement with recommendations

### Business Impact Tracking
- Cost savings from AI recommendations
- Revenue improvements from pricing optimization
- Inventory turnover improvements
- Customer satisfaction metrics

## Security Considerations

### Data Privacy
- No sensitive business data stored on AI provider servers
- Data anonymization for AI analysis
- GDPR/Indonesian privacy law compliance

### API Security
- Rate limiting to prevent abuse
- Input validation and sanitization
- Secure API key management
- Audit logging for all AI requests

## Troubleshooting

### Common Issues

#### 1. OpenRouter API Errors
```bash
# Check API key validity
curl -H "Authorization: Bearer $OPENROUTER_API_KEY" \
     https://openrouter.ai/api/v1/models
```

#### 2. Database Connection Issues
```bash
# Test Supabase connection
node scripts/check-supabase.js
```

#### 3. Low AI Confidence Scores
- Ensure sufficient historical data (minimum 30 days)
- Check data quality and completeness
- Verify market conditions input accuracy

### Debug Mode
Enable detailed logging:
```bash
NODE_ENV=development DEBUG=ai:* pnpm dev
```

## Roadmap

### Q2 2024
- [ ] Advanced customer segmentation
- [ ] Automated pricing rules
- [ ] Multi-location inventory sync
- [ ] Voice-activated insights

### Q3 2024  
- [ ] Predictive maintenance for equipment
- [ ] Supply chain optimization
- [ ] Social media sentiment analysis
- [ ] Competitive intelligence

### Q4 2024
- [ ] IoT sensor integration
- [ ] Machine learning model fine-tuning
- [ ] Advanced reporting & dashboards
- [ ] Mobile app AI assistant

## Support

For technical support or feature requests:
- Create an issue in the repository
- Email: support@heytrack.id
- Documentation: [AI Hub User Guide](./AI-HUB-GUIDE.md)

---

*Last updated: January 2024*
*Version: 1.0.0*