# Rekomendasi Improvement: Fitur HPP & Ingredients

## 📊 Analisis Fitur Saat Ini

### ✅ Yang Sudah Bagus

**HPP Module:**
- Unified HPP page dengan tabs (Calculator, Breakdown, Scenario)
- WAC (Weighted Average Cost) calculation
- HPP alerts system
- Scenario planning
- Product comparison
- Progress indicator (3 steps)
- Web worker untuk heavy calculations

**Ingredients Module:**
- Enhanced ingredients page dengan filters
- Stock badges (normal/low/out)
- Mobile-optimized list view
- Real-time updates
- Quick buy action
- Search & filter by stock status
- Total value calculation

### ❌ Yang Perlu Improvement

## 🚀 Top Improvements untuk HPP & Ingredients

---

## FITUR HPP

### 1. **Bulk HPP Calculation** ⭐⭐⭐
**Problem:** User harus calculate HPP satu-satu per recipe

**Solution:**
```typescript
// Bulk calculation API
POST /api/hpp/bulk-calculate
body: {
  recipe_ids: string[] // or 'all' for all recipes
}

// UI: Checkbox selection + "Calculate Selected" button
const [selectedRecipes, setSelectedRecipes] = useState<string[]>([])

<Button onClick={() => bulkCalculateHpp(selectedRecipes)}>
  Calculate {selectedRecipes.length} Recipes
</Button>
```

**Features:**
- Select multiple recipes
- "Select All" checkbox
- Progress indicator (5/20 calculated)
- Background processing
- Notification when complete

---

### 2. **HPP History & Trends** ⭐⭐⭐
**Problem:** Tidak bisa lihat perubahan HPP dari waktu ke waktu

**Solution:**
```typescript
// HPP history chart
<LineChart data={hppHistory}>
  <Line dataKey="hpp_value" stroke="#8884d8" />
  <Line dataKey="ingredient_cost" stroke="#82ca9d" />
  <Line dataKey="operational_cost" stroke="#ffc658" />
</LineChart>

// Show percentage change
const hppChange = ((currentHpp - previousHpp) / previousHpp) * 100
```

**Features:**
- Line chart showing HPP over time (7/30/90 days)
- Breakdown by cost components
- Percentage change indicators
- Highlight significant changes (>10%)
- Export history to Excel
- Compare multiple recipes

**UI Example:**
```
┌─────────────────────────────────────────┐
│ HPP Trend - Nasi Goreng                │
│                                         │
│ Current: Rp 15.000  ↑ 8% vs last month│
│                                         │
│ [Line Chart showing trend]              │
│                                         │
│ Breakdown:                              │
│ • Ingredients: Rp 10.000 (67%)         │
│ • Labor: Rp 3.000 (20%)                │
│ • Overhead: Rp 2.000 (13%)             │
└─────────────────────────────────────────┘
```

---

### 3. **Cost Optimization Suggestions** ⭐⭐⭐
**Problem:** User tidak tahu cara menurunkan HPP

**Solution:**
```typescript
interface CostOptimization {
  type: 'ingredient_substitution' | 'bulk_purchase' | 'waste_reduction'
  current_cost: number
  potential_savings: number
  suggestion: string
  impact: 'high' | 'medium' | 'low'
}

// AI-powered suggestions
const suggestions = [
  {
    type: 'ingredient_substitution',
    suggestion: 'Ganti tepung premium dengan tepung medium',
    current_cost: 15000,
    potential_savings: 3000,
    impact: 'high'
  },
  {
    type: 'bulk_purchase',
    suggestion: 'Beli gula 25kg (hemat 15%)',
    potential_savings: 2250,
    impact: 'medium'
  }
]
```

**Suggestion Types:**
1. **Ingredient Substitution**
   - Find cheaper alternatives
   - Quality vs cost trade-off
   - Impact on taste/quality

2. **Bulk Purchase**
   - Volume discount opportunities
   - ROI calculation
   - Storage consideration

3. **Waste Reduction**
   - Identify high-waste ingredients
   - Portion control suggestions
   - Shelf-life optimization

4. **Process Optimization**
   - Reduce labor time
   - Energy efficiency
   - Equipment utilization

---

### 4. **Target HPP & Margin Goals** ⭐⭐
**Problem:** Tidak ada target atau goal setting

**Solution:**
```typescript
interface HppGoal {
  recipe_id: string
  target_hpp: number
  target_margin: number
  target_selling_price: number
  deadline: Date
  status: 'on_track' | 'at_risk' | 'achieved'
}

// Goal tracking
<Card>
  <CardHeader>
    <CardTitle>HPP Goals</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="space-y-4">
      {goals.map(goal => (
        <div key={goal.id}>
          <div className="flex justify-between">
            <span>{goal.recipe_name}</span>
            <Badge variant={goal.status === 'achieved' ? 'success' : 'warning'}>
              {goal.status}
            </Badge>
          </div>
          <Progress value={goal.progress} />
          <p className="text-sm text-muted-foreground">
            Current: Rp {currentHpp} | Target: Rp {goal.target_hpp}
          </p>
        </div>
      ))}
    </div>
  </CardContent>
</Card>
```

**Features:**
- Set target HPP per recipe
- Set target margin percentage
- Track progress to goal
- Alert when off-track
- Celebrate when achieved
- Historical goal performance

---

### 5. **Ingredient Price Alerts** ⭐⭐⭐
**Problem:** Tidak tahu kapan harga ingredient naik signifikan

**Solution:**
```typescript
// Price change detection
CREATE TABLE ingredient_price_history (
  id UUID PRIMARY KEY,
  ingredient_id UUID REFERENCES ingredients(id),
  price NUMERIC NOT NULL,
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  change_percentage NUMERIC,
  source TEXT -- 'purchase' | 'manual_update'
);

// Alert when price increases > threshold
CREATE FUNCTION detect_price_spike() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.price_per_unit > OLD.price_per_unit * 1.1 THEN
    INSERT INTO hpp_alerts (
      user_id,
      alert_type,
      message,
      severity
    ) VALUES (
      NEW.user_id,
      'INGREDIENT_PRICE_SPIKE',
      format('Harga %s naik %.1f%%', NEW.name, 
        ((NEW.price_per_unit - OLD.price_per_unit) / OLD.price_per_unit) * 100),
      'HIGH'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

**Features:**
- Track price history
- Alert on significant changes (>10%)
- Show affected recipes
- Suggest price adjustments
- Historical price chart
- Price forecast (based on trend)

---

### 6. **Recipe Profitability Dashboard** ⭐⭐⭐
**Problem:** Sulit compare profitability antar recipes

**Solution:**
```typescript
// Profitability matrix
interface RecipeProfitability {
  recipe_id: string
  recipe_name: string
  hpp: number
  selling_price: number
  margin_percentage: number
  margin_amount: number
  sales_volume: number // last 30 days
  total_profit: number
  profitability_score: number // 0-100
}

// Visualization: Bubble chart
<ScatterChart>
  <XAxis dataKey="margin_percentage" label="Margin %" />
  <YAxis dataKey="sales_volume" label="Sales Volume" />
  <ZAxis dataKey="total_profit" range={[50, 400]} />
  <Scatter data={recipes} fill="#8884d8" />
</ScatterChart>
```

**Quadrants:**
1. **Stars** (High margin, High volume) - Keep pushing
2. **Cash Cows** (Low margin, High volume) - Optimize costs
3. **Question Marks** (High margin, Low volume) - Increase marketing
4. **Dogs** (Low margin, Low volume) - Consider discontinuing

---

### 7. **Batch Cost Calculation** ⭐⭐
**Problem:** HPP per unit, tapi produksi dalam batch

**Solution:**
```typescript
interface BatchCost {
  batch_size: number
  cost_per_batch: number
  cost_per_unit: number
  fixed_costs: number // setup, cleaning
  variable_costs: number // ingredients
  economies_of_scale: number // savings %
}

// Calculate optimal batch size
function calculateOptimalBatch(recipe: Recipe) {
  const fixedCost = 50000 // setup cost
  const variableCostPerUnit = recipe.hpp
  
  // Find batch size that minimizes cost per unit
  const optimalSize = Math.sqrt((2 * fixedCost) / variableCostPerUnit)
  
  return {
    optimal_batch_size: Math.ceil(optimalSize),
    cost_per_unit_at_optimal: (fixedCost / optimalSize) + variableCostPerUnit
  }
}
```

**Features:**
- Calculate cost per batch
- Show economies of scale
- Optimal batch size recommendation
- Break-even analysis
- Batch size vs cost chart

---

## FITUR INGREDIENTS

### 8. **Supplier Management** ⭐⭐⭐
**Problem:** Tidak ada tracking supplier dan harga mereka

**Solution:**
```typescript
// Supplier database
CREATE TABLE suppliers (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  contact_person TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  rating NUMERIC(2,1), -- 1-5 stars
  payment_terms TEXT,
  delivery_time_days INT,
  minimum_order NUMERIC,
  notes TEXT
);

CREATE TABLE supplier_ingredients (
  id UUID PRIMARY KEY,
  supplier_id UUID REFERENCES suppliers(id),
  ingredient_id UUID REFERENCES ingredients(id),
  price_per_unit NUMERIC NOT NULL,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  is_preferred BOOLEAN DEFAULT false
);
```

**Features:**
- Multiple suppliers per ingredient
- Price comparison across suppliers
- Supplier rating system
- Delivery time tracking
- Payment terms
- Auto-suggest best supplier
- Purchase history per supplier

**UI:**
```
┌─────────────────────────────────────────┐
│ Tepung Terigu - Supplier Comparison    │
├─────────────────────────────────────────┤
│ ✓ Toko Bahan A    Rp 12.000/kg  ⭐4.5 │
│   • Delivery: 1-2 days                  │
│   • Min order: 25kg                     │
│                                         │
│   Toko Bahan B    Rp 11.500/kg  ⭐4.0 │
│   • Delivery: 3-5 days                  │
│   • Min order: 50kg                     │
└─────────────────────────────────────────┘
```

---

### 9. **Smart Reorder System** ⭐⭐⭐
**Problem:** Manual tracking kapan harus reorder

**Solution:**
```typescript
interface ReorderRule {
  ingredient_id: string
  reorder_point: number
  reorder_quantity: number
  lead_time_days: number
  safety_stock: number
  auto_order: boolean
}

// Calculate reorder point
function calculateReorderPoint(ingredient: Ingredient) {
  const dailyUsage = ingredient.usage_rate || 0
  const leadTime = ingredient.lead_time_days || 7
  const safetyStock = dailyUsage * 3 // 3 days buffer
  
  return (dailyUsage * leadTime) + safetyStock
}

// Auto-generate purchase orders
async function autoGeneratePO() {
  const lowStockIngredients = await getIngredientsNeedingReorder()
  
  for (const ingredient of lowStockIngredients) {
    const po = {
      ingredient_id: ingredient.id,
      supplier_id: ingredient.preferred_supplier_id,
      quantity: ingredient.reorder_quantity,
      estimated_cost: ingredient.reorder_quantity * ingredient.price_per_unit,
      status: 'DRAFT'
    }
    
    await createPurchaseOrder(po)
    await sendNotification(user, `PO created for ${ingredient.name}`)
  }
}
```

**Features:**
- Auto-calculate reorder point
- Consider lead time
- Safety stock buffer
- Usage rate tracking
- Auto-generate PO (draft)
- Email/WhatsApp notification
- Reorder calendar view

---

### 10. **Ingredient Usage Analytics** ⭐⭐⭐
**Problem:** Tidak tahu ingredient mana yang paling banyak dipakai

**Solution:**
```typescript
// Usage analytics
interface IngredientUsage {
  ingredient_id: string
  ingredient_name: string
  total_used: number
  total_cost: number
  usage_frequency: number
  recipes_using: number
  waste_percentage: number
  cost_per_recipe_avg: number
}

// Track usage patterns
<Card>
  <CardHeader>
    <CardTitle>Top 10 Most Used Ingredients</CardTitle>
  </CardHeader>
  <CardContent>
    <BarChart data={usageData}>
      <Bar dataKey="total_used" fill="#8884d8" />
      <Bar dataKey="total_cost" fill="#82ca9d" />
    </BarChart>
  </CardContent>
</Card>
```

**Metrics:**
- Most used ingredients (by quantity)
- Most expensive ingredients (by total cost)
- Usage frequency
- Waste percentage
- Cost per recipe
- Seasonal patterns
- Forecast future usage

---

### 11. **Batch Purchase Discounts** ⭐⭐
**Problem:** Tidak ada tracking volume discounts

**Solution:**
```typescript
interface PriceBreak {
  ingredient_id: string
  supplier_id: string
  min_quantity: number
  price_per_unit: number
  discount_percentage: number
}

// Example
const priceBreaks = [
  { min_quantity: 1, price: 12000, discount: 0 },
  { min_quantity: 25, price: 11500, discount: 4.2 },
  { min_quantity: 50, price: 11000, discount: 8.3 },
  { min_quantity: 100, price: 10500, discount: 12.5 }
]

// Calculate optimal purchase quantity
function calculateOptimalPurchase(
  monthlyUsage: number,
  priceBreaks: PriceBreak[],
  storageCost: number
) {
  // EOQ (Economic Order Quantity) formula
  // considering volume discounts and storage costs
}
```

**Features:**
- Define price breaks per supplier
- Calculate savings from bulk purchase
- Consider storage costs
- Shelf-life consideration
- ROI calculator
- Suggest optimal order quantity

---

### 12. **Ingredient Substitution Matrix** ⭐⭐
**Problem:** Tidak tahu ingredient apa yang bisa diganti

**Solution:**
```typescript
interface IngredientSubstitution {
  original_id: string
  substitute_id: string
  conversion_ratio: number // 1 cup A = 1.2 cups B
  cost_difference: number
  quality_impact: 'none' | 'minor' | 'significant'
  notes: string
}

// Example
const substitutions = [
  {
    original: 'Butter',
    substitute: 'Margarin',
    ratio: 1.0,
    cost_savings: -3000, // Rp 3000 cheaper
    quality_impact: 'minor',
    notes: 'Rasa sedikit berbeda'
  }
]
```

**Features:**
- Predefined substitution rules
- Cost comparison
- Quality impact indicator
- Conversion calculator
- Recipe impact analysis
- "What-if" scenarios

---

### 13. **Expiry Date Tracking** ⭐⭐⭐
**Problem:** Ingredient expired, waste money

**Solution:**
```typescript
// Add expiry tracking
ALTER TABLE ingredients ADD COLUMN expiry_date DATE;
ALTER TABLE ingredient_purchases ADD COLUMN expiry_date DATE;

// FIFO (First In First Out) tracking
CREATE TABLE ingredient_batches (
  id UUID PRIMARY KEY,
  ingredient_id UUID REFERENCES ingredients(id),
  purchase_id UUID REFERENCES ingredient_purchases(id),
  quantity NUMERIC NOT NULL,
  remaining_quantity NUMERIC NOT NULL,
  purchase_date DATE NOT NULL,
  expiry_date DATE,
  batch_number TEXT,
  status TEXT DEFAULT 'ACTIVE' -- ACTIVE, EXPIRED, DEPLETED
);

// Alert for expiring items
SELECT * FROM ingredient_batches
WHERE expiry_date <= CURRENT_DATE + INTERVAL '7 days'
  AND remaining_quantity > 0
  AND status = 'ACTIVE';
```

**Features:**
- Track expiry dates per batch
- FIFO consumption tracking
- Alert 7 days before expiry
- Expiry calendar view
- Waste tracking
- Suggest recipes using expiring ingredients
- Auto-mark as expired

**UI:**
```
┌─────────────────────────────────────────┐
│ ⚠️ Expiring Soon                        │
├─────────────────────────────────────────┤
│ Susu UHT (5L)                           │
│ Expires: 3 days | Batch: #12345        │
│ [Use in Recipe] [Mark as Used]         │
│                                         │
│ Telur (2 tray)                          │
│ Expires: 5 days | Batch: #12346        │
│ [Use in Recipe] [Mark as Used]         │
└─────────────────────────────────────────┘
```

---

### 14. **Ingredient Categories & Tags** ⭐⭐
**Problem:** Sulit organize banyak ingredients

**Solution:**
```typescript
// Add categories
ALTER TABLE ingredients ADD COLUMN category TEXT;
ALTER TABLE ingredients ADD COLUMN tags TEXT[];

// Predefined categories
const categories = [
  'Bahan Kering', // Flour, sugar, etc
  'Bahan Basah', // Milk, eggs, etc
  'Bumbu', // Spices
  'Protein', // Meat, fish
  'Sayuran',
  'Buah',
  'Dairy',
  'Kemasan'
]

// Tags for flexible grouping
const tags = ['organic', 'halal', 'premium', 'local', 'imported']
```

**Features:**
- Hierarchical categories
- Multiple tags per ingredient
- Filter by category/tag
- Category-based reports
- Tag-based search
- Color coding by category

---

### 15. **Mobile Barcode Scanner** ⭐⭐⭐
**Problem:** Manual input lambat dan error-prone

**Solution:**
```typescript
// Use device camera for barcode scanning
import { BarcodeScanner } from '@capacitor-community/barcode-scanner'

async function scanBarcode() {
  const result = await BarcodeScanner.startScan()
  
  if (result.hasContent) {
    // Look up ingredient by barcode
    const ingredient = await findIngredientByBarcode(result.content)
    
    if (ingredient) {
      // Auto-fill form
      setFormData(ingredient)
    } else {
      // Create new with barcode
      setFormData({ barcode: result.content })
    }
  }
}
```

**Features:**
- Scan barcode to add ingredient
- Scan to update stock
- Scan to create purchase
- Barcode database
- Generate QR codes for custom items
- Batch scanning mode

---

## 📋 Implementation Priority

### Phase 1 (High Priority) - 2-3 Weeks
1. ✅ HPP History & Trends
2. ✅ Ingredient Price Alerts
3. ✅ Smart Reorder System
4. ✅ Supplier Management
5. ✅ Expiry Date Tracking

### Phase 2 (Medium Priority) - 3-4 Weeks
6. ✅ Bulk HPP Calculation
7. ✅ Cost Optimization Suggestions
8. ✅ Recipe Profitability Dashboard
9. ✅ Ingredient Usage Analytics
10. ✅ Ingredient Categories & Tags

### Phase 3 (Nice to Have) - 4-5 Weeks
11. ✅ Target HPP & Margin Goals
12. ✅ Batch Cost Calculation
13. ✅ Batch Purchase Discounts
14. ✅ Ingredient Substitution Matrix
15. ✅ Mobile Barcode Scanner

---

## 🛠️ Technical Implementation

### Database Schema Changes

```sql
-- Suppliers
CREATE TABLE suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  name TEXT NOT NULL,
  contact_person TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  rating NUMERIC(2,1) CHECK (rating >= 1 AND rating <= 5),
  payment_terms TEXT,
  delivery_time_days INT,
  minimum_order NUMERIC,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Supplier Ingredients (Price comparison)
CREATE TABLE supplier_ingredients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  ingredient_id UUID NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
  price_per_unit NUMERIC NOT NULL,
  is_preferred BOOLEAN DEFAULT false,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(supplier_id, ingredient_id)
);

-- Ingredient Price History
CREATE TABLE ingredient_price_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ingredient_id UUID NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
  price NUMERIC NOT NULL,
  change_percentage NUMERIC,
  source TEXT, -- 'purchase' | 'manual_update' | 'supplier_update'
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_price_history_ingredient ON ingredient_price_history(ingredient_id, recorded_at DESC);

-- Ingredient Batches (FIFO tracking)
CREATE TABLE ingredient_batches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ingredient_id UUID NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
  purchase_id UUID REFERENCES ingredient_purchases(id),
  quantity NUMERIC NOT NULL,
  remaining_quantity NUMERIC NOT NULL,
  purchase_date DATE NOT NULL,
  expiry_date DATE,
  batch_number TEXT,
  status TEXT DEFAULT 'ACTIVE', -- ACTIVE, EXPIRED, DEPLETED
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_batches_expiry ON ingredient_batches(expiry_date) WHERE status = 'ACTIVE';

-- Reorder Rules
CREATE TABLE ingredient_reorder_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ingredient_id UUID NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
  reorder_point NUMERIC NOT NULL,
  reorder_quantity NUMERIC NOT NULL,
  lead_time_days INT DEFAULT 7,
  safety_stock NUMERIC DEFAULT 0,
  auto_order BOOLEAN DEFAULT false,
  preferred_supplier_id UUID REFERENCES suppliers(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(ingredient_id)
);

-- HPP Goals
CREATE TABLE hpp_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  target_hpp NUMERIC NOT NULL,
  target_margin NUMERIC NOT NULL,
  target_selling_price NUMERIC NOT NULL,
  deadline DATE,
  status TEXT DEFAULT 'IN_PROGRESS', -- IN_PROGRESS, ACHIEVED, FAILED
  achieved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ingredient Substitutions
CREATE TABLE ingredient_substitutions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  original_ingredient_id UUID NOT NULL REFERENCES ingredients(id),
  substitute_ingredient_id UUID NOT NULL REFERENCES ingredients(id),
  conversion_ratio NUMERIC DEFAULT 1.0,
  quality_impact TEXT, -- 'none' | 'minor' | 'significant'
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, original_ingredient_id, substitute_ingredient_id)
);

-- Add columns to existing tables
ALTER TABLE ingredients 
  ADD COLUMN IF NOT EXISTS category TEXT,
  ADD COLUMN IF NOT EXISTS tags TEXT[],
  ADD COLUMN IF NOT EXISTS barcode TEXT,
  ADD COLUMN IF NOT EXISTS expiry_date DATE,
  ADD COLUMN IF NOT EXISTS usage_rate NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS lead_time_days INT DEFAULT 7;

CREATE INDEX idx_ingredients_category ON ingredients(category);
CREATE INDEX idx_ingredients_barcode ON ingredients(barcode) WHERE barcode IS NOT NULL;
```

### API Endpoints to Add

```typescript
// Suppliers
GET /api/suppliers
POST /api/suppliers
PUT /api/suppliers/:id
DELETE /api/suppliers/:id
GET /api/suppliers/:id/ingredients

// Supplier Ingredients
GET /api/ingredients/:id/suppliers
POST /api/ingredients/:id/suppliers
PUT /api/supplier-ingredients/:id

// Price History
GET /api/ingredients/:id/price-history
POST /api/ingredients/:id/price-history

// Batches
GET /api/ingredients/:id/batches
POST /api/ingredients/:id/batches
PUT /api/batches/:id
GET /api/batches/expiring

// Reorder
GET /api/ingredients/reorder-rules
POST /api/ingredients/:id/reorder-rule
PUT /api/reorder-rules/:id
POST /api/reorder/auto-generate-po

// HPP Goals
GET /api/hpp/goals
POST /api/hpp/goals
PUT /api/hpp/goals/:id
DELETE /api/hpp/goals/:id

// HPP Bulk
POST /api/hpp/bulk-calculate
  body: { recipe_ids: string[] }

// Analytics
GET /api/ingredients/usage-analytics
GET /api/hpp/profitability-matrix
GET /api/hpp/cost-optimization-suggestions
```

---

## 💡 Quick Wins (Can Implement Today)

### 1. Add Category Filter to Ingredients
```typescript
const [categoryFilter, setCategoryFilter] = useState<string>('all')

const filteredIngredients = ingredients.filter(i => 
  categoryFilter === 'all' || i.category === categoryFilter
)
```

### 2. Show HPP Change Indicator
```typescript
const hppChange = recipe.current_hpp - recipe.previous_hpp
const changePercentage = (hppChange / recipe.previous_hpp) * 100

<Badge variant={hppChange > 0 ? 'destructive' : 'success'}>
  {hppChange > 0 ? '↑' : '↓'} {Math.abs(changePercentage).toFixed(1)}%
</Badge>
```

### 3. Add "Days Until Expiry" Badge
```typescript
const daysUntilExpiry = differenceInDays(ingredient.expiry_date, new Date())

{daysUntilExpiry <= 7 && (
  <Badge variant="warning">
    Expires in {daysUntilExpiry} days
  </Badge>
)}
```

### 4. Quick Reorder Button
```typescript
<Button 
  size="sm" 
  onClick={() => createPurchaseOrder(ingredient)}
  disabled={ingredient.current_stock > ingredient.min_stock}
>
  Quick Reorder
</Button>
```

---

## 🎯 Success Metrics

1. **HPP Accuracy**
   - % of recipes with up-to-date HPP
   - Average time to calculate HPP
   - HPP calculation errors

2. **Inventory Efficiency**
   - Stock-out frequency
   - Waste percentage
   - Inventory turnover ratio
   - Days of inventory on hand

3. **Cost Savings**
   - Savings from bulk purchases
   - Savings from substitutions
   - Waste reduction savings

4. **User Engagement**
   - HPP calculations per day
   - Reorder alerts acted upon
   - Supplier comparisons made

---

## 🎯 Conclusion

**Top 5 Priorities untuk HPP & Ingredients:**

1. **HPP History & Trends** - Track perubahan biaya
2. **Smart Reorder System** - Prevent stock-outs
3. **Supplier Management** - Compare prices, save money
4. **Expiry Date Tracking** - Reduce waste
5. **Ingredient Price Alerts** - React to price changes

Dengan improvements ini, user bisa:
- ✅ Track HPP changes over time
- ✅ Optimize costs proactively
- ✅ Never run out of stock
- ✅ Reduce waste significantly
- ✅ Make data-driven decisions

Mau saya implement salah satu improvement ini sekarang? 🚀
