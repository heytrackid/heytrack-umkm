# HPP Export Button - Integration Guide

## Quick Start

The HPPExportButton component is ready to use. Here's how to integrate it into your HPP pages.

## Step 1: Import the Component

```tsx
import HPPExportButton from '@/app/hpp/components/HPPExportButton'
import { TimePeriod } from '@/types/hpp-tracking'
```

## Step 2: Add to Your Component

### Option A: In a Card Header (Recommended)

```tsx
function HPPHistoricalTab() {
  const [selectedRecipeId, setSelectedRecipeId] = useState<string>('')
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('30d')
  const [recipeName, setRecipeName] = useState<string>('')

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle>Tren HPP Historical</CardTitle>
          <CardDescription>
            Data HPP {recipeName} - {selectedPeriod}
          </CardDescription>
        </div>
        
        {/* Export Button */}
        <HPPExportButton
          recipeId={selectedRecipeId}
          recipeName={recipeName}
          period={selectedPeriod}
          variant="outline"
        />
      </CardHeader>
      
      <CardContent>
        {/* Your chart or data display */}
      </CardContent>
    </Card>
  )
}
```

### Option B: In a Toolbar

```tsx
function HPPDataToolbar() {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        {/* Period filters */}
        <Button variant="outline" size="sm">7d</Button>
        <Button variant="outline" size="sm">30d</Button>
        <Button variant="outline" size="sm">90d</Button>
        <Button variant="outline" size="sm">1y</Button>
      </div>
      
      <HPPExportButton
        recipeId={selectedRecipeId}
        recipeName={recipeName}
        period={selectedPeriod}
        size="sm"
      />
    </div>
  )
}
```

### Option C: Mobile Responsive Layout

```tsx
function MobileHPPExport() {
  const { isMobile } = useResponsive()
  
  return (
    <div className={`flex ${isMobile ? 'flex-col' : 'flex-row justify-between'} gap-4`}>
      <div>
        <h3 className="text-lg font-semibold">HPP Data</h3>
        <p className="text-sm text-muted-foreground">Export your data</p>
      </div>
      
      <HPPExportButton
        recipeId={selectedRecipeId}
        recipeName={recipeName}
        period={selectedPeriod}
        className={isMobile ? 'w-full' : ''}
      />
    </div>
  )
}
```

## Step 3: Handle Recipe Selection

You need to provide the recipe ID and name. Here's how to get them:

```tsx
function HPPExportIntegration() {
  // Get recipes from your data source
  const { data: recipes } = useQuery({
    queryKey: ['recipes'],
    queryFn: async () => {
      const response = await fetch('/api/recipes')
      return response.json()
    }
  })

  // Track selected recipe
  const [selectedRecipeId, setSelectedRecipeId] = useState<string>('')
  
  // Get recipe name from selected ID
  const selectedRecipe = recipes?.find(r => r.id === selectedRecipeId)
  const recipeName = selectedRecipe?.name || ''

  return (
    <div>
      {/* Recipe selector */}
      <Select value={selectedRecipeId} onValueChange={setSelectedRecipeId}>
        <SelectTrigger>
          <SelectValue placeholder="Pilih produk" />
        </SelectTrigger>
        <SelectContent>
          {recipes?.map(recipe => (
            <SelectItem key={recipe.id} value={recipe.id}>
              {recipe.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Export button - only show when recipe is selected */}
      {selectedRecipeId && (
        <HPPExportButton
          recipeId={selectedRecipeId}
          recipeName={recipeName}
          period="30d"
        />
      )}
    </div>
  )
}
```

## Step 4: Handle Period Selection

```tsx
function PeriodSelector() {
  const [period, setPeriod] = useState<TimePeriod>('30d')

  const periods: { value: TimePeriod; label: string }[] = [
    { value: '7d', label: '7 Hari' },
    { value: '30d', label: '30 Hari' },
    { value: '90d', label: '90 Hari' },
    { value: '1y', label: '1 Tahun' }
  ]

  return (
    <div className="space-y-4">
      {/* Period buttons */}
      <div className="flex gap-2">
        {periods.map(p => (
          <Button
            key={p.value}
            variant={period === p.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPeriod(p.value)}
          >
            {p.label}
          </Button>
        ))}
      </div>

      {/* Export with selected period */}
      <HPPExportButton
        recipeId={selectedRecipeId}
        recipeName={recipeName}
        period={period}
      />
    </div>
  )
}
```

## Complete Example: HPP Historical Tab

Here's a complete example integrating everything:

```tsx
'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import HPPExportButton from '@/app/hpp/components/HPPExportButton'
import HPPHistoricalChart from '@/app/hpp/components/HPPHistoricalChart'
import { TimePeriod } from '@/types/hpp-tracking'
import { useResponsive } from '@/hooks/use-mobile'

export default function HPPHistoricalTab() {
  const { isMobile } = useResponsive()
  const [selectedRecipeId, setSelectedRecipeId] = useState<string>('')
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('30d')

  // Fetch recipes
  const { data: recipes, isLoading } = useQuery({
    queryKey: ['recipes'],
    queryFn: async () => {
      const response = await fetch('/api/recipes')
      if (!response.ok) throw new Error('Failed to fetch recipes')
      const data = await response.json()
      return data.recipes || []
    }
  })

  // Get selected recipe details
  const selectedRecipe = recipes?.find(r => r.id === selectedRecipeId)
  const recipeName = selectedRecipe?.name || ''

  // Period options
  const periods: { value: TimePeriod; label: string }[] = [
    { value: '7d', label: '7 Hari' },
    { value: '30d', label: '30 Hari' },
    { value: '90d', label: '90 Hari' },
    { value: '1y', label: '1 Tahun' }
  ]

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      {/* Recipe Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Pilih Produk</CardTitle>
          <CardDescription>
            Pilih produk untuk melihat tren HPP historical
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedRecipeId} onValueChange={setSelectedRecipeId}>
            <SelectTrigger className={isMobile ? 'w-full' : 'w-[300px]'}>
              <SelectValue placeholder="Pilih produk" />
            </SelectTrigger>
            <SelectContent>
              {recipes?.map(recipe => (
                <SelectItem key={recipe.id} value={recipe.id}>
                  {recipe.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Chart and Export */}
      {selectedRecipeId && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <CardTitle>Tren HPP - {recipeName}</CardTitle>
              <CardDescription>
                Data {periods.find(p => p.value === selectedPeriod)?.label}
              </CardDescription>
            </div>
            
            {/* Export Button */}
            <HPPExportButton
              recipeId={selectedRecipeId}
              recipeName={recipeName}
              period={selectedPeriod}
              variant="outline"
              className={isMobile ? 'hidden' : ''}
            />
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Period Selector */}
            <div className={`flex ${isMobile ? 'flex-wrap' : ''} gap-2`}>
              {periods.map(p => (
                <Button
                  key={p.value}
                  variant={selectedPeriod === p.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedPeriod(p.value)}
                  className={isMobile ? 'flex-1' : ''}
                >
                  {p.label}
                </Button>
              ))}
            </div>

            {/* Chart */}
            <HPPHistoricalChart
              recipeId={selectedRecipeId}
              period={selectedPeriod}
            />

            {/* Mobile Export Button */}
            {isMobile && (
              <HPPExportButton
                recipeId={selectedRecipeId}
                recipeName={recipeName}
                period={selectedPeriod}
                className="w-full"
              />
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
```

## Styling Variants

### Default Button
```tsx
<HPPExportButton
  recipeId={id}
  recipeName={name}
  period="30d"
  variant="default"
/>
```

### Outline Button (Recommended)
```tsx
<HPPExportButton
  recipeId={id}
  recipeName={name}
  period="30d"
  variant="outline"
/>
```

### Ghost Button
```tsx
<HPPExportButton
  recipeId={id}
  recipeName={name}
  period="30d"
  variant="ghost"
/>
```

### Secondary Button
```tsx
<HPPExportButton
  recipeId={id}
  recipeName={name}
  period="30d"
  variant="secondary"
/>
```

## Size Variants

### Small
```tsx
<HPPExportButton
  recipeId={id}
  recipeName={name}
  period="30d"
  size="sm"
/>
```

### Default
```tsx
<HPPExportButton
  recipeId={id}
  recipeName={name}
  period="30d"
  size="default"
/>
```

### Large
```tsx
<HPPExportButton
  recipeId={id}
  recipeName={name}
  period="30d"
  size="lg"
/>
```

## Error Handling

The component handles errors automatically, but you can also check for specific scenarios:

```tsx
function ExportWithValidation() {
  const [selectedRecipeId, setSelectedRecipeId] = useState<string>('')
  
  // Check if recipe has data
  const { data: snapshots } = useQuery({
    queryKey: ['hpp-snapshots', selectedRecipeId],
    queryFn: async () => {
      const response = await fetch(`/api/hpp/snapshots?recipe_id=${selectedRecipeId}&period=30d`)
      return response.json()
    },
    enabled: !!selectedRecipeId
  })

  const hasData = snapshots?.data?.length > 0

  return (
    <div>
      <HPPExportButton
        recipeId={selectedRecipeId}
        recipeName={recipeName}
        period="30d"
        disabled={!hasData}
      />
      
      {!hasData && (
        <p className="text-sm text-muted-foreground mt-2">
          Tidak ada data untuk diekspor
        </p>
      )}
    </div>
  )
}
```

## Testing Checklist

Before deploying, test these scenarios:

- [ ] Export with 7d period
- [ ] Export with 30d period
- [ ] Export with 90d period
- [ ] Export with 1y period
- [ ] Export with recipe that has data
- [ ] Export with recipe that has no data (should show error)
- [ ] Test loading state
- [ ] Test success toast
- [ ] Test error toast
- [ ] Test on mobile device
- [ ] Test on desktop
- [ ] Verify Excel file opens correctly
- [ ] Verify all 4 sheets are present
- [ ] Verify data formatting (currency, dates, percentages)
- [ ] Verify filename is correct

## Troubleshooting

### Export button doesn't work
- Check that recipe_id is valid
- Check that period is one of: '7d', '30d', '90d', '1y'
- Check browser console for errors
- Verify API endpoint is accessible

### No data in Excel file
- Check that recipe has snapshots in the database
- Verify date range includes data
- Check API response in Network tab

### File doesn't download
- Check browser download settings
- Verify blob creation in console
- Check for popup blockers

### Formatting issues in Excel
- Verify ExcelJS is installed
- Check that number formats are applied
- Verify locale settings

## Next Steps

1. Add the component to your HPP Historical tab
2. Test with real data
3. Gather user feedback
4. Consider adding more export formats (PDF, CSV)

## Support

For issues or questions:
- Check the README: `HPPExportButton.README.md`
- Review examples: `HPPExportButton.example.tsx`
- Check implementation summary: `EXPORT_IMPLEMENTATION_SUMMARY.md`
