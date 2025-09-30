interface ChatMessage {
  id: string
  content: string
  sender: 'user' | 'ai'
  timestamp: Date
  suggestions?: string[]
}

export function generateAIResponse(userInput: string): ChatMessage {
  const lowerInput = userInput.toLowerCase()
  
  let content = ''
  let suggestions: string[] = []

  if (lowerInput.includes('penjualan') || lowerInput.includes('sales')) {
    content = `Berdasarkan data bulan ini, penjualan Anda menunjukkan tren yang positif! 📈

**Highlights:**
• Total penjualan: Rp 45.2 juta (+12% dari bulan lalu)
• Produk terlaris: Croissant Butter (340 unit)
• Jam puncak: 07:00-09:00 dan 15:00-17:00
• Customer repeat rate: 68%

**Rekomendasi:**
- Tambah stok croissant untuk jam puncak
- Pertimbangkan bundle promo morning breakfast
- Focus marketing pada pelanggan baru di jam sepi`

    suggestions = [
      'Analisa produk dengan margin tertinggi',
      'Bagaimana cara meningkatkan repeat customer?',
      'Strategi untuk jam sepi'
    ]
  } 
  else if (lowerInput.includes('stok') || lowerInput.includes('inventory')) {
    content = `Mari saya analisa kondisi stok Anda saat ini: 📦

**Status Inventory:**
• ⚠️ Tepung terigu: 15kg (butuh reorder 100kg)
• ⚠️ Butter: 5kg (level kritis, segera order)
• ✅ Gula pasir: 30kg (aman)
• ✅ Telur: 200 butir (aman)

**AI Prediction:**
- Tepung akan habis dalam 6 hari
- Butter habis dalam 3 hari (URGENT!)
- Rekomendasi total belanja: Rp 850k

**Action Items:**
1. Order butter hari ini juga
2. Bulk order tepung untuk hemat 8%
3. Review usage pattern mingguan`

    suggestions = [
      'Buat automatic reorder system',
      'Analisa seasonal patterns',
      'Cara hemat biaya supplier'
    ]
  }
  else if (lowerInput.includes('profit') || lowerInput.includes('margin')) {
    content = `Analisa profitabilitas produk Anda: 💰

**Top Performers:**
1. **Croissant Almond**: 65% margin (⭐ Best seller)
2. **Danish Pastry**: 58% margin
3. **Roti Bakar Special**: 52% margin

**Improvement Opportunities:**
• Donut Glaze: 35% margin (bisa ditingkatkan ke 45%)
• Kue Lapis: 28% margin (review pricing)

**Recommendations:**
- Focus promosi pada high-margin items
- Bundle low-margin dengan high-margin
- Uji coba kenaikan harga 10% untuk produk populer`

    suggestions = [
      'Strategi pricing optimal untuk semua produk',
      'Analisa kompetitor pricing',
      'Tips reduce cost production'
    ]
  }
  else if (lowerInput.includes('tips') || lowerInput.includes('saran')) {
    content = `Berikut adalah tips bisnis bakery yang dipersonalisasi untuk Anda: 💡

**Marketing & Sales:**
• Buat Instagram content untuk produk signature
• Implement loyalty point system (10 poin = 1 free pastry)
• Cross-sell combo (coffee + pastry discount 15%)

**Operational Excellence:**
• Pre-order system untuk weekend demand
• Staff schedule optimization (save 20% labor cost)
• Quality control checklist untuk consistency

**Growth Strategy:**
• Catering services untuk office meetings
• Online delivery partnership (Gofood/Grab)
• Seasonal menu untuk special occasions

Mau saya elaborate tips mana yang paling cocok untuk kondisi bisnis Anda?`

    suggestions = [
      'Strategi online marketing yang efektif',
      'Cara optimize staff scheduling',
      'Expand ke catering business'
    ]
  }
  else {
    content = `Terima kasih atas pertanyaannya! Sebagai AI assistant untuk bisnis bakery, saya bisa membantu Anda dengan:

📊 **Business Analytics:**
- Analisa penjualan dan trend
- Profitability analysis per produk
- Customer behavior insights

📦 **Inventory Management:**
- Stock optimization recommendations
- Auto-reorder predictions
- Supplier performance analysis

💰 **Financial Optimization:**
- HPP calculations & pricing strategy
- Cost reduction opportunities
- Cash flow forecasting

🎯 **Business Growth:**
- Marketing strategy recommendations
- New product suggestions
- Market expansion opportunities

Silakan tanya hal spesifik yang ingin Anda ketahui tentang bisnis Anda!`

    suggestions = [
      'Bagaimana performa penjualan bulan ini?',
      'Cek status inventory dan reorder',
      'Analisa profitabilitas semua produk',
      'Tips marketing untuk meningkatkan sales'
    ]
  }

  return {
    id: Date.now().toString(),
    content,
    sender: 'ai',
    timestamp: new Date(),
    suggestions
  }
}
