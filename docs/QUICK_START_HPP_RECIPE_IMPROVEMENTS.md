# Quick Start: HPP & Recipe Improvements

## 🚀 What's New?

Kami telah mengimplementasikan improvements untuk **HPP Calculator** dan **Recipe Management** sesuai dengan [UI/UX Improvement Opportunities](./UI_UX_IMPROVEMENT_OPPORTUNITIES.md).

---

## 📦 New Components

### 1. HPP Calculator Improvements

#### `HppBreakdownVisual.tsx`
**Interactive HPP breakdown dengan visual yang jelas**

```tsx
import { HppBreakdownVisual } from '@/modules/hpp/components/HppBreakdownVisual'

<HppBreakdownVisual recipe={recipe} />
```

**Features:**
- 📊 Visual cost composition (Bahan vs Operasional)
- 🔽 Expandable sections untuk detail
- 📈 Profit analysis dengan break-even point
- 💰 Cost breakdown per kategori
- 📄 Export to PDF (ready)

---

#### `HppScenarioPlanner.tsx`
**"What-If" scenario planning tool**

```tsx
import { HppScenarioPlanner } from '@/modules/hpp/components/HppScenarioPlanner'

<HppScenarioPlanner recipe={recipe} />
```

**Features:**
- 🎯 Quick scenarios (Inflasi 5%, 10%, 15%)
- 🔧 Custom scenarios per ingredient
- 📊 Impact analysis (cost, margin)
- ⚠️ Margin warnings
- 🔄 Compare multiple scenarios

---

### 2. Recipe Management Improvements

#### `RecipeEditor.tsx`
**Complete recipe builder/editor**

```tsx
import { RecipeEditor } from '@/modules/recipes/components/RecipeEditor'

<RecipeEditor
  initialData={recipe} // optional
  availableIngredients={ingredients}
  onSave={handleSave}
  onCancel={handleCancel}
/>
```

**Features:**
- ✏️ Full recipe editing (ingredients, steps, notes)
- 💵 Real-time HPP calculation
- 🔢 Step reordering (↑↓)
- ⏱️ Duration tracking per step
- 📊 Percentage breakdown per ingredient

---

#### `RecipeBatchScaler.tsx`
**Scale recipes for batch production**

```tsx
import { RecipeBatchScaler } from '@/modules/recipes/components/RecipeBatchScaler'

<RecipeBatchScaler recipe={recipe} />
```

**Features:**
- ⚡ Quick scale (2x, 5x, 10x, 20x)
- 🎛️ Custom scaling (servings × batches)
- 📦 Stock availability check
- 💰 Cost calculation per batch
- 📋 Shopping list export (ready)

---

## 🎯 How to Use

### HPP Page (Already Integrated!)

File: `src/modules/hpp/components/UnifiedHppPage.tsx`

Sekarang ada 3 tabs:
1. **Kalkulator HPP** - Existing calculator
2. **Detail Breakdown** - NEW! Visual breakdown
3. **Scenario Planning** - NEW! What-if scenarios

```tsx
// Already integrated in UnifiedHppPage.tsx
<Tabs defaultValue="calculator">
  <TabsList>
    <TabsTrigger value="calculator">Kalkulator HPP</TabsTrigger>
    <TabsTrigger value="breakdown">Detail Breakdown</TabsTrigger>
    <TabsTrigger value="scenario">Scenario Planning</TabsTrigger>
  </TabsList>
  {/* ... */}
</Tabs>
```

---

### Recipe Pages (Need Integration)

Add to your recipe detail/edit pages:

```tsx
// In recipe detail page
import { RecipeBatchScaler } from '@/modules/recipes/components/RecipeBatchScaler'

export default function RecipeDetailPage({ recipe }) {
  return (
    <div>
      {/* Existing recipe info */}
      
      {/* NEW: Add batch scaler */}
      <RecipeBatchScaler recipe={recipe} />
    </div>
  )
}
```

```tsx
// In recipe edit page
import { RecipeEditor } from '@/modules/recipes/components/RecipeEditor'

export default function RecipeEditPage({ recipe, ingredients }) {
  return (
    <RecipeEditor
      initialData={recipe}
      availableIngredients={ingredients}
      onSave={async (data) => {
        await updateRecipe(data)
        router.push('/recipes')
      }}
      onCancel={() => router.back()}
    />
  )
}
```

---

## 🎨 Visual Highlights

### HPP Breakdown
```
┌─────────────────────────────────────┐
│ 📊 Ringkasan HPP                    │
├─────────────────────────────────────┤
│ Bahan Baku    Operasional  Total    │
│ Rp 50.000     Rp 12.500    Rp 62.500│
│ (80%)         (20%)        (100%)   │
├─────────────────────────────────────┤
│ [████████████░░░░] 80% | 20%        │
└─────────────────────────────────────┘
```

### Scenario Planning
```
┌─────────────────────────────────────┐
│ 🎯 Scenario: Inflasi 10%            │
├─────────────────────────────────────┤
│ HPP Baru:     Rp 68.750 (+10%)      │
│ Margin Baru:  52% (-5%)             │
│ Impact:       🔴 Negative            │
│                                     │
│ ⚠️ Margin turun! Pertimbangkan      │
│    naikkan harga jual               │
└─────────────────────────────────────┘
```

### Batch Scaler
```
┌─────────────────────────────────────┐
│ ⚖️ Batch Scaler                     │
├─────────────────────────────────────┤
│ Resep Asli:   10 porsi              │
│ Target:       100 porsi (10x)       │
│ Total Biaya:  Rp 625.000            │
│ Per Porsi:    Rp 6.250              │
├─────────────────────────────────────┤
│ Tepung:       5kg → 50kg ✓ Cukup    │
│ Gula:         2kg → 20kg ✗ Kurang   │
└─────────────────────────────────────┘
```

---

## 🔥 Quick Demo Scenarios

### Scenario 1: Check HPP Breakdown
1. Go to `/hpp`
2. Select a recipe
3. Click **"Detail Breakdown"** tab
4. Expand "Bahan Baku" section
5. See cost per ingredient with percentages
6. Check profit analysis at bottom

### Scenario 2: Test Price Increase
1. Go to `/hpp`
2. Select a recipe
3. Click **"Scenario Planning"** tab
4. Click **"Inflasi 10%"** button
5. See impact on HPP and margin
6. Decide if need to adjust selling price

### Scenario 3: Scale for Large Order
1. Go to recipe detail page
2. Open **"Batch Scaler"** section
3. Click **"10x"** quick scale
4. Review ingredient requirements
5. Check stock availability
6. Export shopping list if needed

### Scenario 4: Edit Recipe
1. Go to recipe edit page
2. Add/remove ingredients
3. See real-time HPP update
4. Reorder cooking steps
5. Add production notes
6. Save changes

---

## 📊 Key Metrics Displayed

### HPP Breakdown
- ✅ Ingredient cost & percentage
- ✅ Operational costs breakdown
- ✅ Total HPP
- ✅ Margin percentage
- ✅ Profit per unit
- ✅ Break-even point

### Scenario Planning
- ✅ Current HPP
- ✅ New HPP after changes
- ✅ Cost difference (Rp & %)
- ✅ Margin impact
- ✅ Risk indicators

### Batch Scaler
- ✅ Scale factor
- ✅ Total production quantity
- ✅ Total cost
- ✅ Cost per serving
- ✅ Stock availability per ingredient

---

## 🎯 Benefits

### For Business Owners
- 💰 Better cost visibility
- 📈 Data-driven pricing decisions
- 🎯 Risk management with scenarios
- 📊 Professional HPP reports

### For Operations
- ⚡ Quick batch calculations
- 📦 Stock planning
- ⏱️ Time savings
- ✅ Error reduction

### For Users
- 🎨 Beautiful, intuitive UI
- 📱 Mobile-friendly
- ⚡ Real-time calculations
- 💡 Helpful tips & guidance

---

## 🚧 What's Next?

### Ready for Implementation
- [ ] PDF export functionality
- [ ] Shopping list export
- [ ] Historical HPP tracking
- [ ] AI cost optimization tips

### Future Enhancements
- [ ] Recipe versioning
- [ ] Batch scheduling calendar
- [ ] Supplier price comparison
- [ ] Automated reorder suggestions

---

## 📚 Full Documentation

For complete details, see:
- [HPP & Recipe Improvements Implementation](./HPP_RECIPE_IMPROVEMENTS_IMPLEMENTATION.md)
- [UI/UX Improvement Opportunities](./UI_UX_IMPROVEMENT_OPPORTUNITIES.md)

---

## 🆘 Need Help?

All components are fully typed and include:
- ✅ TypeScript interfaces
- ✅ Prop validation
- ✅ Error handling
- ✅ Loading states
- ✅ Responsive design

Check the implementation file for detailed usage examples and API integration guides.

---

*Ready to use! No additional dependencies needed.* ✨
