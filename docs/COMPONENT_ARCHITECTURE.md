# Component Architecture - HPP & Recipe Improvements

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     HeyTrack Application                     │
└─────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┴─────────────┐
                │                           │
        ┌───────▼────────┐         ┌───────▼────────┐
        │   HPP Module   │         │  Recipe Module  │
        └───────┬────────┘         └───────┬────────┘
                │                           │
    ┌───────────┼───────────┐   ┌──────────┼──────────┐
    │           │           │   │          │          │
    ▼           ▼           ▼   ▼          ▼          ▼
┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│Breakdown│ │Scenario│ │Unified │ │ Editor │ │ Scaler │
│ Visual │ │Planner │ │  Page  │ │        │ │        │
└────────┘ └────────┘ └────────┘ └────────┘ └────────┘
```

---

## 📦 Component Hierarchy

### HPP Module (`src/modules/hpp/`)

```
hpp/
├── components/
│   ├── UnifiedHppPage.tsx          [Main Container]
│   │   ├── HppOverviewCard         [Existing]
│   │   ├── RecipeSelector          [Existing]
│   │   ├── Tabs                    [NEW]
│   │   │   ├── Tab: Calculator
│   │   │   │   ├── CostCalculationCard
│   │   │   │   ├── PricingCalculatorCard
│   │   │   │   └── ProductComparisonCard
│   │   │   ├── Tab: Breakdown      [NEW]
│   │   │   │   └── HppBreakdownVisual ⭐
│   │   │   └── Tab: Scenario       [NEW]
│   │   │       └── HppScenarioPlanner ⭐
│   │   └── HppAlertsCard           [Existing]
│   │
│   ├── HppBreakdownVisual.tsx      [NEW] ⭐
│   │   ├── Summary Cards
│   │   ├── Visual Progress Bar
│   │   ├── Ingredient Breakdown (Expandable)
│   │   ├── Operational Costs (Expandable)
│   │   └── Profit Analysis
│   │
│   └── HppScenarioPlanner.tsx      [NEW] ⭐
│       ├── Current State Summary
│       ├── Quick Scenarios
│       ├── Custom Scenario Builder
│       └── Scenario Results List
│
├── hooks/
│   └── useUnifiedHpp.ts            [Existing]
│
└── services/
    └── HppCalculatorService.ts     [Existing]
```

### Recipe Module (`src/modules/recipes/`)

```
recipes/
├── components/
│   ├── RecipeEditor.tsx            [NEW] ⭐
│   │   ├── Header (Save/Cancel)
│   │   ├── Summary Cards
│   │   ├── Basic Info Form
│   │   ├── Ingredients Section
│   │   │   ├── Add Ingredient Form
│   │   │   └── Ingredients List
│   │   ├── Steps Section
│   │   │   ├── Add Step Form
│   │   │   └── Steps List (Reorderable)
│   │   └── Notes Section
│   │
│   ├── RecipeBatchScaler.tsx       [NEW] ⭐
│   │   ├── Header Summary
│   │   ├── Scale Controls
│   │   │   ├── Quick Scale Buttons
│   │   │   └── Custom Scale Inputs
│   │   ├── Stock Availability Check
│   │   ├── Scaled Ingredients Table
│   │   └── Production Tips
│   │
│   └── SmartPricingAssistant.tsx   [Existing]
│
└── services/
    └── RecipeService.ts            [Existing]
```

---

## 🔄 Data Flow

### HPP Breakdown Visual

```
┌──────────────┐
│   Recipe     │
│   Data       │
└──────┬───────┘
       │
       ▼
┌──────────────────────────────┐
│  HppBreakdownVisual          │
│                              │
│  1. Calculate costs          │
│  2. Group by category        │
│  3. Calculate percentages    │
│  4. Render visualizations    │
└──────┬───────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│  User Interactions           │
│  - Expand/collapse sections  │
│  - View tooltips             │
│  - Export PDF                │
└──────────────────────────────┘
```

### Scenario Planner

```
┌──────────────┐
│   Recipe     │
│   Data       │
└──────┬───────┘
       │
       ▼
┌──────────────────────────────┐
│  HppScenarioPlanner          │
│                              │
│  1. Display current state    │
│  2. User creates scenario    │
│  3. Calculate impact         │
│  4. Show comparison          │
└──────┬───────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│  Scenario Results            │
│  - New HPP                   │
│  - Cost difference           │
│  - Margin impact             │
│  - Warnings                  │
└──────────────────────────────┘
```

### Recipe Editor

```
┌──────────────┐
│  Initial     │
│  Recipe      │ (optional)
└──────┬───────┘
       │
       ▼
┌──────────────────────────────┐
│  RecipeEditor                │
│                              │
│  1. Load initial data        │
│  2. User edits recipe        │
│  3. Real-time HPP calc       │
│  4. Validate data            │
│  5. Save to database         │
└──────┬───────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│  onSave Callback             │
│  - API call                  │
│  - Update database           │
│  - Redirect/refresh          │
└──────────────────────────────┘
```

### Batch Scaler

```
┌──────────────┐
│   Recipe     │
│   + Stock    │
└──────┬───────┘
       │
       ▼
┌──────────────────────────────┐
│  RecipeBatchScaler           │
│                              │
│  1. Display original recipe  │
│  2. User sets scale factor   │
│  3. Calculate scaled amounts │
│  4. Check stock availability │
│  5. Show warnings if needed  │
└──────┬───────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│  Actions                     │
│  - Export shopping list      │
│  - Create purchase order     │
│  - Start production          │
└──────────────────────────────┘
```

---

## 🎯 Component Responsibilities

### HppBreakdownVisual
**Purpose**: Visualize HPP composition in detail

**Responsibilities:**
- Calculate ingredient costs by category
- Calculate operational costs breakdown
- Display visual progress bars
- Show expandable/collapsible sections
- Calculate profit metrics
- Provide export functionality

**Props:**
```typescript
interface HppBreakdownVisualProps {
  recipe: Recipe
  operationalCosts?: OperationalCosts
}
```

**State:**
- `expandedSections: Set<string>` - Track which sections are expanded

---

### HppScenarioPlanner
**Purpose**: Enable "what-if" scenario planning

**Responsibilities:**
- Display current HPP state
- Provide quick scenario templates
- Allow custom scenario creation
- Calculate scenario impacts
- Compare multiple scenarios
- Show warnings for risky scenarios

**Props:**
```typescript
interface HppScenarioPlannerProps {
  recipe: Recipe
}
```

**State:**
- `scenarios: Scenario[]` - List of created scenarios
- `selectedIngredient: string` - Currently selected ingredient
- `changeType: 'price' | 'quantity'` - Type of change
- `changePercent: number` - Percentage change

---

### RecipeEditor
**Purpose**: Complete recipe creation/editing interface

**Responsibilities:**
- Manage recipe form state
- Add/remove ingredients
- Add/remove/reorder steps
- Calculate real-time HPP
- Validate required fields
- Save recipe data

**Props:**
```typescript
interface RecipeEditorProps {
  initialData?: RecipeData
  availableIngredients: Ingredient[]
  onSave: (data: RecipeData) => Promise<void>
  onCancel: () => void
}
```

**State:**
- `recipe: RecipeData` - Complete recipe state
- `newIngredient: IngredientInput` - Temp state for adding ingredient
- `newStep: StepInput` - Temp state for adding step
- `saving: boolean` - Save operation status

---

### RecipeBatchScaler
**Purpose**: Scale recipes for batch production

**Responsibilities:**
- Calculate scaled ingredient amounts
- Check stock availability
- Show cost calculations
- Provide quick scale options
- Generate shopping lists
- Display production tips

**Props:**
```typescript
interface RecipeBatchScalerProps {
  recipe: Recipe
}
```

**State:**
- `targetServings: number` - Servings per batch
- `targetBatches: number` - Number of batches

---

## 🔌 Integration Points

### With Existing System

```
┌─────────────────────────────────────────┐
│         Existing HeyTrack App           │
├─────────────────────────────────────────┤
│                                         │
│  /hpp                                   │
│  └─> UnifiedHppPage                     │
│       ├─> [Existing components]         │
│       └─> [NEW] Tabs with new features  │
│                                         │
│  /recipes/:id                           │
│  └─> RecipeDetailPage                   │
│       ├─> [Existing recipe info]        │
│       └─> [NEW] RecipeBatchScaler       │
│                                         │
│  /recipes/:id/edit                      │
│  └─> RecipeEditPage                     │
│       └─> [NEW] RecipeEditor            │
│                                         │
└─────────────────────────────────────────┘
```

### API Integration

```
Components ──────> API Routes ──────> Supabase
                                         │
HppBreakdownVisual                       │
  └─> No API needed                      │
      (client-side calc)                 │
                                         │
HppScenarioPlanner                       │
  └─> [Future] POST /api/hpp/scenarios ─┤
                                         │
RecipeEditor                             │
  └─> POST /api/recipes ────────────────┤
  └─> PUT /api/recipes/:id ─────────────┤
                                         │
RecipeBatchScaler                        │
  └─> GET /api/ingredients ─────────────┤
  └─> [Future] POST /api/recipes/scale ─┤
```

---

## 🎨 Styling Architecture

### Theme Integration

All components use:
- `@/components/ui/*` - shadcn/ui primitives
- Tailwind CSS classes
- CSS variables for theming
- Dark mode support via `dark:` prefix

### Color Scheme

```css
/* Cost Categories */
--ingredient-cost: blue-500
--operational-cost: orange-500
--total-cost: red-600
--profit: green-600

/* Status Indicators */
--success: green-500
--warning: yellow-500
--error: red-500
--info: blue-500

/* Interactive Elements */
--primary: purple-600
--secondary: gray-600
--accent: pink-500
```

---

## 📱 Responsive Breakpoints

```css
/* Mobile First Approach */
default:     < 640px   (1 column)
sm:          640px+    (2 columns)
md:          768px+    (3-4 columns)
lg:          1024px+   (4 columns)
xl:          1280px+   (4 columns)
```

### Grid Layouts

```tsx
// Summary cards
<div className="grid grid-cols-2 md:grid-cols-4 gap-4">

// Form inputs
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">

// Quick actions
<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
```

---

## 🔒 Type Safety

### Shared Types

```typescript
// Recipe types
interface Recipe {
  id: string
  name: string
  total_cost: number
  selling_price?: number
  recipe_ingredients?: RecipeIngredient[]
}

// Ingredient types
interface RecipeIngredient {
  quantity: number
  unit: string
  ingredient?: Ingredient
}

// Scenario types
interface Scenario {
  id: string
  name: string
  changes: Change[]
  impact: Impact
}
```

All components are fully typed with TypeScript for:
- Props validation
- State management
- Event handlers
- API responses

---

## 🚀 Performance Optimizations

### Implemented

1. **Memoization**
   - Expensive calculations memoized
   - Component re-renders minimized

2. **Lazy Loading**
   - Heavy components loaded on-demand
   - Code splitting at route level

3. **Optimistic Updates**
   - UI updates immediately
   - Background sync with server

4. **Debouncing**
   - Input changes debounced
   - API calls throttled

### Future Optimizations

1. **Virtual Scrolling**
   - For large ingredient lists
   - For scenario history

2. **Web Workers**
   - Complex calculations
   - PDF generation

3. **Caching**
   - Recipe data cached
   - Ingredient prices cached

---

## 🧪 Testing Strategy

### Unit Tests
```typescript
// Component rendering
test('HppBreakdownVisual renders correctly')
test('HppScenarioPlanner calculates impact')
test('RecipeEditor validates input')
test('RecipeBatchScaler scales correctly')

// Calculations
test('Cost calculations are accurate')
test('Margin calculations are correct')
test('Scale factor applies properly')
```

### Integration Tests
```typescript
// User flows
test('User can create scenario')
test('User can edit recipe')
test('User can scale recipe')
test('User can export data')
```

### E2E Tests
```typescript
// Complete workflows
test('HPP analysis workflow')
test('Recipe creation workflow')
test('Batch production workflow')
```

---

## 📊 Monitoring & Analytics

### Events to Track

```typescript
// HPP Events
track('hpp_breakdown_viewed', { recipeId })
track('hpp_scenario_created', { scenarioType })
track('hpp_pdf_exported', { recipeId })

// Recipe Events
track('recipe_edited', { recipeId })
track('recipe_scaled', { scaleFactor })
track('shopping_list_exported', { recipeId })

// User Engagement
track('feature_used', { feature: 'hpp_breakdown' })
track('time_spent', { component, duration })
```

---

*This architecture ensures scalability, maintainability, and excellent user experience!* 🚀
