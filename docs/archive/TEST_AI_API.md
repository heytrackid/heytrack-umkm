# 🧪 AI API Testing Guide

## 🚀 Quick Start

### Step 1: Start Dev Server

```bash
npm run dev
```

Wait until you see: `✓ Ready on http://localhost:3000`

---

### Step 2: Run All Tests (Automated)

```bash
./test-ai-api.sh
```

This will test all 7 API endpoints automatically!

---

## 📝 Manual Testing (Individual Endpoints)

### Test 1: Data Fetcher Verification ✅

**What it does**: Verifies AI can access Supabase database

```bash
curl http://localhost:3000/api/test-ai-data | jq '.'
```

**Expected Response**:
```json
{
  "success": true,
  "message": "🎉 AI dapat mengakses data dari Supabase!",
  "summary": {
    "ingredientsCount": 20,
    "recipesCount": 5,
    "ordersCount": 5
  }
}
```

---

### Test 2: AI Pricing Analysis (All Recipes) 💰

**What it does**: Analyzes pricing for all recipes in database

```bash
curl http://localhost:3000/api/ai/pricing | jq '.'
```

**Expected Response**:
```json
{
  "success": true,
  "totalRecipes": 5,
  "analyses": [
    {
      "recipeId": "...",
      "recipeName": "Roti Tawar Putih",
      "currentPrice": 29100,
      "hpp": 17489,
      "analysis": {
        "currentMargin": 40
      }
    }
  ]
}
```

---

### Test 3: AI Pricing (Specific Recipe) 🎯

**What it does**: Analyzes specific recipe with AI recommendations

```bash
curl -X POST http://localhost:3000/api/ai/pricing \
  -H "Content-Type: application/json" \
  -d '{"useDatabase": true, "productName": "Roti"}' | jq '.'
```

**Expected Response**:
```json
{
  "success": true,
  "dataSource": "database",
  "recipe": {
    "name": "Roti Tawar Putih",
    "calculatedHPP": 17489,
    "currentSellingPrice": 29100
  },
  "analysis": {
    "marginAnalysis": {
      "currentMargin": 40,
      "optimalMargin": 45
    }
  }
}
```

---

### Test 4: AI Inventory Optimization 📦

**What it does**: Provides inventory optimization recommendations

```bash
curl -X POST http://localhost:3000/api/ai/inventory \
  -H "Content-Type: application/json" \
  -d '{"useDatabase": true}' | jq '.'
```

**Expected Response**:
```json
{
  "success": true,
  "dataSource": "database",
  "optimization": {
    "criticalItems": [],
    "recommendations": [
      "All inventory levels are healthy",
      "Consider stock rotation for..."
    ]
  }
}
```

---

### Test 5: Customer Insights 👥

**What it does**: Analyzes customer behavior and segments

```bash
curl http://localhost:3000/api/ai/customer-insights | jq '.'
```

**Expected Response**:
```json
{
  "success": true,
  "dataSource": "database",
  "insights": {
    "segments": [
      {
        "segment": "vip",
        "customers": ["..."]
      }
    ],
    "churnRisk": []
  },
  "summary": {
    "totalCustomers": 8,
    "activeCustomers": 8,
    "activeRate": "100.0%"
  }
}
```

---

### Test 6: Dashboard Insights 📊

**What it does**: Comprehensive business intelligence from all data

```bash
curl http://localhost:3000/api/ai/dashboard-insights | jq '.'
```

**Expected Response**:
```json
{
  "success": true,
  "dataSource": "database",
  "stats": {
    "ingredients": {
      "total": 20,
      "lowStock": 0,
      "outOfStock": 0
    },
    "orders": {
      "total": 5,
      "totalRevenue": 285000,
      "avgOrderValue": 57000
    },
    "customers": {
      "total": 8,
      "active": 8
    },
    "financial": {
      "totalIncome": 285000,
      "totalExpense": 0,
      "netProfit": 285000
    }
  },
  "insights": {
    "summary": "Business operations running smoothly...",
    "priorityActions": []
  }
}
```

---

### Test 7: AI Chat with Context 💬

**What it does**: Contextual AI chat with real database data

```bash
curl -X POST http://localhost:3000/api/ai/chat-with-data \
  -H "Content-Type: application/json" \
  -d '{"message": "Berapa total bahan yang ada di inventory?"}' | jq '.'
```

**Expected Response**:
```json
{
  "success": true,
  "response": "Saat ini ada 20 bahan aktif di inventory Anda...",
  "hasData": true,
  "dataContext": {
    "hasInventory": true
  }
}
```

---

## 🎯 Test Different Chat Questions

### Inventory Questions:
```bash
curl -X POST http://localhost:3000/api/ai/chat-with-data \
  -H "Content-Type: application/json" \
  -d '{"message": "Bahan mana yang low stock?"}' | jq '.response'
```

### Order Questions:
```bash
curl -X POST http://localhost:3000/api/ai/chat-with-data \
  -H "Content-Type: application/json" \
  -d '{"message": "Berapa total pesanan bulan ini?"}' | jq '.response'
```

### Financial Questions:
```bash
curl -X POST http://localhost:3000/api/ai/chat-with-data \
  -H "Content-Type: application/json" \
  -d '{"message": "Berapa profit margin bisnis saya?"}' | jq '.response'
```

### Customer Questions:
```bash
curl -X POST http://localhost:3000/api/ai/chat-with-data \
  -H "Content-Type: application/json" \
  -d '{"message": "Siapa customer VIP saya?"}' | jq '.response'
```

---

## 🔍 Debugging Tips

### Check if server is running:
```bash
curl http://localhost:3000/api/health
```

### Check raw response (without jq):
```bash
curl http://localhost:3000/api/test-ai-data
```

### Check specific field:
```bash
curl -s http://localhost:3000/api/test-ai-data | jq '.success'
```

### Pretty print JSON:
```bash
curl -s http://localhost:3000/api/test-ai-data | jq '.' | less
```

---

## ⚠️ Common Issues

### Issue 1: "Connection refused"
**Problem**: Dev server not running  
**Solution**: Run `npm run dev` first

### Issue 2: "OPENROUTER_API_KEY is required"
**Problem**: Missing API key  
**Solution**: Add to `.env.local`:
```bash
OPENROUTER_API_KEY=your_key_here
```

### Issue 3: "Failed to fetch dashboard stats"
**Problem**: Database connection issue  
**Solution**: Check Supabase credentials in `.env.local`

### Issue 4: "jq: command not found"
**Problem**: jq not installed  
**Solution**: 
```bash
brew install jq
```
Or remove `| jq '.'` from commands

---

## 📊 Performance Testing

### Test Response Time:
```bash
time curl -s http://localhost:3000/api/ai/dashboard-insights > /dev/null
```

### Test Multiple Concurrent Requests:
```bash
for i in {1..5}; do
  curl -s http://localhost:3000/api/test-ai-data &
done
wait
```

---

## 🎉 Success Criteria

All tests should return:
- ✅ `"success": true`
- ✅ `"dataSource": "database"`
- ✅ Valid data in response
- ✅ Response time < 5 seconds
- ✅ No error messages

---

## 📝 Next Steps After Testing

1. **✅ Verify all endpoints work**
2. **✅ Check data accuracy**
3. **🔄 Integrate into frontend**
4. **🔄 Add error handling in UI**
5. **🔄 Setup monitoring/logging**
6. **🔄 Deploy to production**

---

## 🚀 Quick Test Command

One-liner to test all endpoints:
```bash
echo "Test 1:" && curl -s http://localhost:3000/api/test-ai-data | jq '.success' && \
echo "Test 2:" && curl -s http://localhost:3000/api/ai/pricing | jq '.success' && \
echo "Test 3:" && curl -s http://localhost:3000/api/ai/customer-insights | jq '.success' && \
echo "Test 4:" && curl -s http://localhost:3000/api/ai/dashboard-insights | jq '.success' && \
echo "✅ All tests completed!"
```

---

**Happy Testing! 🎉**
