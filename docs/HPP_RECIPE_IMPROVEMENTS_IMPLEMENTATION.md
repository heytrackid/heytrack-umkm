# HPP Calculator & Recipe Management - Implementation Guide

## 🎉 Improvements Implemented

### 1. HPP Calculator Enhancements

#### A. Interactive HPP Breakdown (`HppBreakdownVisual.tsx`)

**Features:**
- ✅ **Visual Cost Composition**: Progress bar showing ingredient vs operational costs
- ✅ **Expandable Sections**: Click to expand/collapse ingredient and operational details
- ✅ **Category Grouping**: Ingredients grouped by category with percentage breakdown
- ✅ **Detailed Tooltips**: Hover untuk lihat detail perhitungan per item
- ✅ **Profit Analysis**: Real-time profit calculation dengan break-even point
- ✅ **Export to PDF**: Button untuk export HPP report (ready for implementation)

**Key Metrics Displayed:**
- Bahan Baku cost & percentage
- Operational costs breakdown (Labor, Utilities, Packaging, Overhead)
- Total HPP dengan visual representation
- Margin percentage dengan health indicator
- Break-even calculations
- Target harian untuk profit goals

**Usage:**
```tsx
import { HppBreakdownVisual } from '@/modules/hpp/components/HppBreakdownVisual'

<HppBreakdownVisual 
  recipe={recipe}
  operationalCosts={{
    labor: 5000,
    utilities: 1500,
    packaging: 2500,
    overhead: 3500
  }}
/>
```

---

#### B. Scenario Planning Tool (`HppScenarioPlanner.tsx`)

**Features:**
- ✅ **What-If Simulations**: Test impact of price/quantity changes
- ✅ **Quick Scenarios**: Pre-built scenarios (Inflasi 5%, 10%, 15%, Efisiensi -10%)
- ✅ **Custom Scenarios**: Build custom scenarios per ingredient
- ✅ **Impact Analysis**: See cost diff, margin impact, new HPP
- ✅ **Multiple Scenarios**: Compare multiple scenarios side-by-side
- ✅ **Visual Indicators**: Color-coded positive/negative impacts
- ✅ **Margin Warnings**: Alert when margin drops below safe threshold

**Scenario Types:**
1. **Price Changes**: Simulate ingredient price increases/decreases
2. **Quantity Changes**: Simulate efficiency improvements or waste reduction
3. **Bulk Changes**: Apply changes to all ingredients at once

**Usage:**
```tsx
import { HppScenarioPlanner } from '@/modules/hpp/components/HppScenarioPlanner'

<HppScenarioPlanner recipe={recipe} />
```

**Example Scenarios:**
- "Tepung harga +15%" → See impact on total cost and margin
- "Semua bahan harga +10%" → Simulate inflation impact
- "Gula quantity -10%" → Test efficiency improvement

---

### 2. Recipe Management Enhancements

#### A. Recipe Editor (`RecipeEditor.tsx`)

**Features:**
- ✅ **Complete Recipe Builder**: Name, description, category, servings, timing
- ✅ **Ingredient Management**: Add/remove ingredients with real-time cost calculation
- ✅ **Step-by-Step Instructions**: Add, reorder, remove cooking steps
- ✅ **Duration Tracking**: Optional duration per step
- ✅ **Real-time HPP**: Live calculation of total cost as you add ingredients
- ✅ **Percentage Breakdown**: See each ingredient's contribution to total cost
- ✅ **Notes Section**: Additional tips and variations
- ✅ **Validation**: Ensure required fields before saving

**Key Features:**
- Drag-to-reorder steps (↑↓ buttons)
- Auto-calculate ingredient costs from database
- Visual progress indicators (ingredients count, steps, time, cost)
- Category selection with Indonesian labels
- Unit flexibility per ingredient

**Usage:**
```tsx
import { RecipeEditor } from '@/modules/recipes/components/RecipeEditor'

<RecipeEditor
  initialData={existingRecipe} // optional for edit mode
  availableIngredients={ingredients}
  onSave={async (data) => {
    await saveRecipe(data)
  }}
  onCancel={() => router.back()}
/>
```

---

#### B. Batch Scaler (`RecipeBatchScaler.tsx`)

**Features:**
- ✅ **Quick Scale Buttons**: 2x, 5x, 10x, 20x instant scaling
- ✅ **Custom Scaling**: Set custom servings and batch count
- ✅ **Real-time Calculations**: Auto-calculate all ingredient quantities
- ✅ **Stock Availability Check**: Warn if ingredients insufficient
- ✅ **Cost Breakdown**: Total cost and per-serving cost
- ✅ **Shopping List Export**: Export scaled ingredient list (ready for implementation)
- ✅ **Production Tips**: Helpful tips for batch production

**Key Metrics:**
- Original recipe servings
- Target production quantity
- Scale factor (e.g., 5.0x)
- Total cost for scaled batch
- Cost per serving
- Stock status per ingredient

**Usage:**
```tsx
import { RecipeBatchScaler } from '@/modules/recipes/components/RecipeBatchScaler'

<RecipeBatchScaler recipe={recipe} />
```

**Example Use Cases:**
- Scale recipe from 10 to 100 servings for catering order
- Calculate ingredients needed for daily production
- Check if current stock can handle large order
- Generate shopping list for bulk production

---

## 🎨 UI/UX Improvements

### Visual Enhancements

1. **Color-Coded Indicators**
   - 🔵 Blue: Ingredient costs
   - 🟠 Orange: Operational costs
   - 🟢 Green: Profit/positive impacts
   - 🔴 Red: Warnings/negative impacts
   - 🟣 Purple: AI features

2. **Progress Bars**
   - Visual representation of cost composition
   - Category-wise ingredient breakdown
   - Margin percentage visualization

3. **Badges & Status**
   - Health indicators (Sehat/Perlu Review)
   - Stock status (Cukup/Kurang)
   - Percentage contributions
   - Quick stats

4. **Interactive Elements**
   - Expandable/collapsible sections
   - Hover tooltips for details
   - Click-to-expand breakdowns
   - Drag-to-reorder steps

### Responsive Design

- ✅ Mobile-optimized layouts
- ✅ Grid adapts to screen size (2 cols mobile, 4 cols desktop)
- ✅ Touch-friendly buttons (minimum 44x44px)
- ✅ Readable text sizes
- ✅ Proper spacing and padding

---

## 📊 Integration with Existing System

### HPP Page Integration

The `UnifiedHppPage.tsx` now includes tabs:

```tsx
<Tabs defaultValue="calculator">
  <TabsList>
    <TabsTrigger value="calculator">Kalkulator HPP</TabsTrigger>
    <TabsTrigger value="breakdown">Detail Breakdown</TabsTrigger>
    <TabsTrigger value="scenario">Scenario Planning</TabsTrigger>
  </TabsList>

  <TabsContent value="calculator">
    {/* Existing calculator components */}
  </TabsContent>

  <TabsContent value="breakdown">
    <HppBreakdownVisual recipe={recipe} />
  </TabsContent>

  <TabsContent value="scenario">
    <HppScenarioPlanner recipe={recipe} />
  </TabsContent>
</Tabs>
```

### Recipe Pages Integration

Add these components to recipe detail pages:

```tsx
// In recipe detail page
import { RecipeEditor } from '@/modules/recipes/components/RecipeEditor'
import { RecipeBatchScaler } from '@/modules/recipes/components/RecipeBatchScaler'

// Edit mode
<RecipeEditor 
  initialData={recipe}
  availableIngredients={ingredients}
  onSave={handleSave}
  onCancel={handleCancel}
/>

// View mode with scaler
<RecipeBatchScaler recipe={recipe} />
```

---

## 🚀 Next Steps & Future Enhancements

### Ready for Implementation

1. **PDF Export**
   - HPP breakdown report
   - Shopping list export
   - Recipe cards

2. **Historical Tracking**
   - HPP history chart
   - Price trend analysis
   - Cost optimization suggestions

3. **AI Recommendations**
   - Cost optimization tips
   - Ingredient substitution suggestions
   - Pricing recommendations

### API Endpoints Needed

```typescript
// HPP Scenarios
POST /api/hpp/scenarios
GET /api/hpp/scenarios/:recipeId

// Recipe Batch Scaling
POST /api/recipes/:id/scale
GET /api/recipes/:id/stock-check

// Export Functions
GET /api/hpp/:id/export-pdf
GET /api/recipes/:id/shopping-list
```

---

## 💡 Usage Examples

### Example 1: Calculate HPP with Breakdown

```tsx
// User flow:
1. Select recipe from dropdown
2. Click "Detail Breakdown" tab
3. See visual cost composition
4. Expand "Bahan Baku" section
5. Review ingredient costs by category
6. Check profit analysis
7. Export to PDF for stakeholders
```

### Example 2: Scenario Planning

```tsx
// User flow:
1. Select recipe
2. Click "Scenario Planning" tab
3. Click "Inflasi 10%" quick scenario
4. See impact: HPP +10%, Margin -5%
5. Add custom scenario: "Tepung +20%"
6. Compare multiple scenarios
7. Make informed pricing decisions
```

### Example 3: Batch Production

```tsx
// User flow:
1. Open recipe detail
2. Click "Batch Scaler" tab
3. Click "10x" quick scale
4. Review scaled ingredients
5. Check stock availability
6. See warning: "Tepung kurang 2kg"
7. Export shopping list
8. Create purchase order
```

### Example 4: Recipe Editing

```tsx
// User flow:
1. Click "Edit Recipe"
2. Update ingredient quantities
3. See real-time HPP update
4. Add new cooking step
5. Reorder steps with ↑↓ buttons
6. Add production notes
7. Save changes
```

---

## 🎯 Key Benefits

### For Business Owners

1. **Better Cost Visibility**: Understand exactly where money goes
2. **Informed Pricing**: Make data-driven pricing decisions
3. **Risk Management**: Anticipate cost changes with scenarios
4. **Production Planning**: Scale recipes confidently for large orders
5. **Profit Optimization**: Identify cost-saving opportunities

### For Operations

1. **Accurate Scaling**: No more manual calculations for batch production
2. **Stock Management**: Know what to order before production
3. **Time Savings**: Quick scenario testing vs manual spreadsheets
4. **Error Reduction**: Automated calculations reduce mistakes
5. **Professional Reports**: Export-ready HPP reports

### For Users

1. **Intuitive Interface**: Easy to understand visual breakdowns
2. **Quick Actions**: One-click quick scales and scenarios
3. **Real-time Feedback**: Instant calculations as you type
4. **Mobile Friendly**: Works great on phones and tablets
5. **Helpful Tips**: Contextual guidance throughout

---

## 📝 Technical Notes

### Dependencies

All components use existing dependencies:
- `@/components/ui/*` - shadcn/ui components
- `@/hooks/useCurrency` - Currency formatting
- `lucide-react` - Icons
- React hooks (useState, useEffect, etc.)

### Performance

- Memoized calculations where appropriate
- Lazy loading for heavy components
- Optimistic UI updates
- Debounced inputs for real-time calculations

### Accessibility

- Proper ARIA labels
- Keyboard navigation support
- Screen reader friendly
- High contrast mode compatible
- Touch-friendly targets (44x44px minimum)

---

## 🐛 Known Limitations

1. **PDF Export**: Button present but implementation pending
2. **Shopping List Export**: Button present but implementation pending
3. **Stock Integration**: Requires real stock data from database
4. **Historical Data**: Scenario history not persisted yet
5. **Batch Scheduling**: No calendar integration yet

---

## 📚 Related Documentation

- [UI/UX Improvement Opportunities](./UI_UX_IMPROVEMENT_OPPORTUNITIES.md)
- [Recipe UI/UX Improvements](./RECIPES_UI_UX_IMPROVEMENTS.md)
- [Tutorial Fitur Lengkap](./TUTORIAL_FITUR_LENGKAP.md)

---

*Last Updated: October 28, 2025*
*Version: 1.0.0*
