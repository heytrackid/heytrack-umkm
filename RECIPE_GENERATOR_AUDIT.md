# 🔍 AI Recipe Generator - Comprehensive Audit

**Date:** 25 Oktober 2025  
**Status:** ✅ FUNCTIONAL - Needs Enhancements  
**Priority:** MEDIUM

---

## 📊 Current Implementation Status

### ✅ What's Working:

1. **API Endpoint** (`src/app/api/ai/generate-recipe/route.ts`)
   - ✅ OpenRouter AI integration
   - ✅ Fallback model support
   - ✅ Request validation with Zod
   - ✅ HPP calculation
   - ✅ Edge runtime
   - ✅ Error handling

2. **UI Components**
   - ✅ Lazy-loaded components for performance
   - ✅ Form validation
   - ✅ Loading states
   - ✅ Recipe display
   - ✅ Save to database functionality

3. **Features**
   - ✅ Generate recipes based on available ingredients
   - ✅ Calculate HPP automatically
   - ✅ Dietary restrictions support
   - ✅ Target price consideration
   - ✅ Professional recipe format

---

## ⚠️ Issues & Improvements Needed

### 1. **Authentication Issues** ⚠️

**Current Problem:**
```typescript
// In route.ts
const userId = (validatedData as any).userId || 'default-user'
```

**Issues:**
- Using `'default-user'` as fallback is dangerous
- No proper auth check in API route
- Type casting with `any`

**Fix:**
```typescript
// Get authenticated user properly
const supabase = await createClient()
const { data: { user }, error: authError } = await supabase.auth.getUser()

if (authError || !user) {
  return NextResponse.json(
    { error: 'Unauthorized' },
    { status: 401 }
  )
}

const userId = user.id
```

### 2. **Missing User ID in Ingredients Query** ⚠️

**Current Problem:**
```typescript
const { data: ingredients } = await supabase
  .from('ingredients')
  .select('*')
  .eq('user_id', userId)  // ← userId might be 'default-user'!
```

**Impact:**
- Wrong ingredients fetched
- Security risk
- Data leakage

### 3. **Incomplete HPP Calculation** ⚠️

**Current:**
```typescript
const estimatedOperationalCost = totalMaterialCost * 0.3 // 30% hardcoded
```

**Issues:**
- Operational cost is hardcoded
- Should fetch from `operational_costs` table
- No electricity, gas, labor costs

**Better Approach:**
```typescript
// Fetch actual operational costs
const { data: opCosts } = await supabase
  .from('operational_costs')
  .select('*')
  .eq('user_id', userId)

const dailyOpCost = opCosts.reduce((sum, cost) => sum + cost.amount, 0)
const estimatedOpCostPerUnit = (dailyOpCost / estimatedDailyProduction) * servings
```

### 4. **No Recipe Validation Before Save** ⚠️

**Current:**
```typescript
// Directly saves without checking duplicates
const { data: recipe } = await supabase
  .from('recipes')
  .insert({ ... })
```

**Issues:**
- No duplicate check
- No name validation
- Could create multiple identical recipes

**Fix:**
```typescript
// Check for duplicates
const { data: existing } = await supabase
  .from('recipes')
  .select('id')
  .eq('name', generatedRecipe.name)
  .eq('user_id', user.id)
  .single()

if (existing) {
  // Ask user if they want to overwrite or create new version
}
```

### 5. **Missing Ingredient Matching** ⚠️

**Current:**
```typescript
const ingredient = availableIngredients.find(
  i => i.name.toLowerCase() === ing.name.toLowerCase()
)
```

**Issues:**
- Exact match only
- No fuzzy matching
- AI might use slightly different names

**Better:**
```typescript
// Fuzzy matching
function findIngredient(name: string, ingredients: Ingredient[]) {
  // Try exact match first
  let match = ingredients.find(i => 
    i.name.toLowerCase() === name.toLowerCase()
  )
  
  if (!match) {
    // Try partial match
    match = ingredients.find(i => 
      i.name.toLowerCase().includes(name.toLowerCase()) ||
      name.toLowerCase().includes(i.name.toLowerCase())
    )
  }
  
  return match
}
```

### 6. **No Error Recovery** ⚠️

**Current:**
- If AI fails, user sees error
- No retry mechanism
- No partial results

**Better:**
- Implement retry logic (3 attempts)
- Save partial results
- Offer manual editing

### 7. **Missing Features** ⚠️

**Not Implemented:**
- ❌ Recipe versioning
- ❌ Recipe editing after generation
- ❌ Recipe sharing
- ❌ Recipe rating/feedback
- ❌ Recipe history
- ❌ Batch generation
- ❌ Recipe templates
- ❌ Ingredient substitutions

---

## 🎯 Priority Fixes

### HIGH Priority (Fix Now):

1. **Fix Authentication**
   - Remove 'default-user' fallback
   - Add proper auth check
   - Use server-side auth

2. **Fix User ID in Queries**
   - Always use authenticated user ID
   - Add RLS policy checks

3. **Add Duplicate Check**
   - Check before saving
   - Offer versioning

### MEDIUM Priority (Fix Soon):

4. **Improve HPP Calculation**
   - Fetch real operational costs
   - Add labor costs
   - Add utility costs

5. **Add Fuzzy Ingredient Matching**
   - Handle name variations
   - Suggest alternatives

6. **Add Error Recovery**
   - Retry failed generations
   - Save partial results

### LOW Priority (Nice to Have):

7. **Add Recipe Versioning**
8. **Add Recipe Editing**
9. **Add Recipe Sharing**
10. **Add Batch Generation**

---

## 🚀 Implementation Plan

### Phase 1: Critical Fixes (1-2 hours)

#### Fix 1: Proper Authentication
```typescript
// src/app/api/ai/generate-recipe/route.ts

export async function POST(request: NextRequest) {
  try {
    // 1. Get authenticated user
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // 2. Validate request
    const validatedData = await validateRequestOrRespond(request, AIRecipeGenerationSchema)
    if (validatedData instanceof NextResponse) return validatedData
    
    // 3. Use authenticated user ID
    const userId = user.id
    
    // ... rest of the code
  } catch (error) {
    // ...
  }
}
```

#### Fix 2: Duplicate Check
```typescript
// Before saving recipe
const { data: existingRecipe } = await supabase
  .from('recipes')
  .select('id, name')
  .eq('name', generatedRecipe.name)
  .eq('user_id', user.id)
  .maybeSingle()

if (existingRecipe) {
  return NextResponse.json({
    success: false,
    error: 'duplicate',
    message: 'Resep dengan nama ini sudah ada',
    existingRecipe
  }, { status: 409 })
}
```

#### Fix 3: Better Error Messages
```typescript
// Add user-friendly error messages
const ERROR_MESSAGES = {
  'unauthorized': 'Anda harus login terlebih dahulu',
  'invalid_input': 'Data yang Anda masukkan tidak valid',
  'ai_failed': 'AI gagal generate resep. Silakan coba lagi',
  'duplicate': 'Resep dengan nama ini sudah ada',
  'save_failed': 'Gagal menyimpan resep ke database'
}
```

### Phase 2: Enhancements (2-3 hours)

#### Enhancement 1: Improved HPP Calculation
```typescript
async function calculateRecipeHPP(
  recipe: Recipe, 
  availableIngredients: Ingredient[],
  userId: string
) {
  // 1. Calculate material cost (existing)
  const materialCost = calculateMaterialCost(recipe, availableIngredients)
  
  // 2. Fetch operational costs
  const { data: opCosts } = await supabase
    .from('operational_costs')
    .select('*')
    .eq('user_id', userId)
    .eq('date', new Date().toISOString().split('T')[0])
  
  const dailyOpCost = opCosts?.reduce((sum, cost) => sum + cost.amount, 0) || 0
  
  // 3. Estimate per-unit operational cost
  const estimatedDailyProduction = 50 // Can be configured
  const opCostPerUnit = (dailyOpCost / estimatedDailyProduction) * recipe.servings
  
  // 4. Calculate total HPP
  const totalHPP = materialCost + opCostPerUnit
  const hppPerUnit = totalHPP / recipe.servings
  
  return {
    materialCost,
    operationalCost: opCostPerUnit,
    totalHPP,
    hppPerUnit,
    servings: recipe.servings,
    breakdown: {
      materials: materialCost,
      operational: opCostPerUnit,
      labor: opCostPerUnit * 0.4, // 40% of op cost
      utilities: opCostPerUnit * 0.3, // 30% of op cost
      overhead: opCostPerUnit * 0.3 // 30% of op cost
    }
  }
}
```

#### Enhancement 2: Fuzzy Ingredient Matching
```typescript
function findBestIngredientMatch(
  searchName: string,
  ingredients: Ingredient[]
): Ingredient | null {
  const search = searchName.toLowerCase().trim()
  
  // 1. Exact match
  let match = ingredients.find(i => 
    i.name.toLowerCase() === search
  )
  if (match) return match
  
  // 2. Contains match
  match = ingredients.find(i => 
    i.name.toLowerCase().includes(search) ||
    search.includes(i.name.toLowerCase())
  )
  if (match) return match
  
  // 3. Levenshtein distance (fuzzy)
  const matches = ingredients.map(i => ({
    ingredient: i,
    distance: levenshteinDistance(search, i.name.toLowerCase())
  }))
  
  matches.sort((a, b) => a.distance - b.distance)
  
  // Return if distance is reasonable (< 3)
  if (matches[0] && matches[0].distance < 3) {
    return matches[0].ingredient
  }
  
  return null
}

function levenshteinDistance(a: string, b: string): number {
  const matrix = []
  
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i]
  }
  
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j
  }
  
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        )
      }
    }
  }
  
  return matrix[b.length][a.length]
}
```

#### Enhancement 3: Retry Logic
```typescript
async function callAIServiceWithRetry(
  prompt: string,
  maxRetries: number = 3
): Promise<string> {
  let lastError: Error | null = null
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      apiLogger.info({ attempt }, 'Calling AI service')
      const result = await callAIService(prompt)
      return result
    } catch (error) {
      lastError = error as Error
      apiLogger.warn({ attempt, error }, 'AI service call failed')
      
      if (attempt < maxRetries) {
        // Wait before retry (exponential backoff)
        await new Promise(resolve => 
          setTimeout(resolve, Math.pow(2, attempt) * 1000)
        )
      }
    }
  }
  
  throw new Error(
    `AI service failed after ${maxRetries} attempts: ${lastError?.message}`
  )
}
```

### Phase 3: New Features (3-4 hours)

#### Feature 1: Recipe Versioning
```typescript
// Add version field to recipes table
// Migration:
ALTER TABLE recipes ADD COLUMN version INTEGER DEFAULT 1;
ALTER TABLE recipes ADD COLUMN parent_recipe_id UUID REFERENCES recipes(id);

// When saving new version:
const { data: latestVersion } = await supabase
  .from('recipes')
  .select('version')
  .eq('name', recipeName)
  .eq('user_id', userId)
  .order('version', { ascending: false })
  .limit(1)
  .single()

const newVersion = (latestVersion?.version || 0) + 1
```

#### Feature 2: Recipe Templates
```typescript
// Pre-defined templates for common products
const RECIPE_TEMPLATES = {
  'roti-tawar': {
    baseIngredients: ['tepung', 'ragi', 'gula', 'garam', 'mentega', 'susu'],
    ratios: {
      flour: 1.0,
      yeast: 0.02,
      sugar: 0.06,
      salt: 0.02,
      butter: 0.08,
      milk: 0.65
    }
  },
  'donat': {
    baseIngredients: ['tepung', 'ragi', 'gula', 'telur', 'mentega', 'susu'],
    ratios: {
      flour: 1.0,
      yeast: 0.025,
      sugar: 0.15,
      eggs: 0.20,
      butter: 0.15,
      milk: 0.50
    }
  }
}
```

---

## 📊 Testing Checklist

### Unit Tests:
- [ ] Test authentication
- [ ] Test ingredient matching
- [ ] Test HPP calculation
- [ ] Test duplicate detection
- [ ] Test error handling

### Integration Tests:
- [ ] Test full recipe generation flow
- [ ] Test save to database
- [ ] Test with missing ingredients
- [ ] Test with invalid input

### E2E Tests:
- [ ] Test UI form submission
- [ ] Test recipe display
- [ ] Test save functionality
- [ ] Test error states

---

## 🎯 Success Metrics

### Performance:
- Recipe generation: < 30 seconds
- Save to database: < 2 seconds
- Page load: < 3 seconds

### Quality:
- Recipe accuracy: > 90%
- Ingredient matching: > 95%
- HPP accuracy: ± 5%

### User Experience:
- Success rate: > 95%
- User satisfaction: > 4/5
- Retry rate: < 10%

---

## ✅ Recommendations

### Immediate Actions:
1. ✅ Fix authentication (HIGH)
2. ✅ Add duplicate check (HIGH)
3. ✅ Improve error messages (HIGH)

### Short-term:
4. ⚠️ Improve HPP calculation (MEDIUM)
5. ⚠️ Add fuzzy matching (MEDIUM)
6. ⚠️ Add retry logic (MEDIUM)

### Long-term:
7. ⚠️ Add versioning (LOW)
8. ⚠️ Add templates (LOW)
9. ⚠️ Add sharing (LOW)

---

**Audit Completed:** 25 Oktober 2025  
**Status:** ✅ FUNCTIONAL - Needs Improvements  
**Priority:** Fix authentication and duplicate check ASAP  
**Estimated Fix Time:** 2-3 hours for critical fixes
