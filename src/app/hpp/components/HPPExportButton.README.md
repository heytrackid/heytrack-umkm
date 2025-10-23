# HPPExportButton Component

## Overview

The `HPPExportButton` component provides Excel export functionality for HPP (Harga Pokok Produksi) historical data. It integrates with the `/api/hpp/export` endpoint to generate formatted Excel files with comprehensive HPP analysis data.

## Features

- ✅ One-click Excel export
- ✅ Loading state with spinner animation
- ✅ Automatic file download
- ✅ Error handling with toast notifications
- ✅ Success feedback
- ✅ Customizable styling
- ✅ Mobile responsive
- ✅ Disabled state support

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `recipeId` | `string` | Yes | - | UUID of the recipe to export |
| `recipeName` | `string` | Yes | - | Name of the recipe (used in filename) |
| `period` | `TimePeriod` | Yes | - | Time period for data ('7d', '30d', '90d', '1y') |
| `variant` | `'default' \| 'outline' \| 'ghost' \| 'secondary'` | No | `'outline'` | Button style variant |
| `size` | `'default' \| 'sm' \| 'lg' \| 'icon'` | No | `'default'` | Button size |
| `className` | `string` | No | `''` | Additional CSS classes |
| `disabled` | `boolean` | No | `false` | Disable the button |

## Usage

### Basic Usage

```tsx
import HPPExportButton from '@/app/hpp/components/HPPExportButton'

function MyComponent() {
  return (
    <HPPExportButton
      recipeId="abc-123-def-456"
      recipeName="Kue Brownies"
      period="30d"
    />
  )
}
```

### With Custom Styling

```tsx
<HPPExportButton
  recipeId="abc-123-def-456"
  recipeName="Kue Brownies"
  period="30d"
  variant="default"
  size="lg"
  className="w-full md:w-auto"
/>
```

### In a Card Header

```tsx
<Card>
  <CardHeader className="flex flex-row items-center justify-between">
    <div>
      <CardTitle>HPP Historical Data</CardTitle>
      <CardDescription>Tren HPP 30 hari terakhir</CardDescription>
    </div>
    <HPPExportButton
      recipeId={recipeId}
      recipeName={recipeName}
      period="30d"
    />
  </CardHeader>
  <CardContent>
    {/* Chart or data display */}
  </CardContent>
</Card>
```

## Excel File Structure

The exported Excel file contains 4 sheets:

### 1. HPP History
- **Columns**: Tanggal, HPP, Biaya Bahan, Biaya Operasional, Harga Jual, Margin (%)
- **Format**: Indonesian Rupiah currency, percentage formatting
- **Styling**: Blue header, borders, proper alignment

### 2. Ringkasan (Summary)
- Product information (name, period, date range)
- Statistical summary (min, max, average HPP)
- Trend analysis (up/down/stable)
- Total change (absolute and percentage)

### 3. Rincian Biaya (Cost Breakdown)
- Latest snapshot cost breakdown
- Ingredients section with individual costs and percentages
- Operational costs section with categories and percentages
- Total HPP row

### 4. Data Grafik (Chart Data)
- Simplified data format for creating charts in Excel
- Columns: Tanggal, HPP, Biaya Bahan, Biaya Operasional
- Numeric format (no currency symbols) for easy charting

## File Naming Convention

Files are automatically named using the pattern:
```
HPP_History_{RecipeName}_{Date}.xlsx
```

Example: `HPP_History_Kue_Brownies_2025-01-22.xlsx`

## Error Handling

The component handles various error scenarios:

1. **Network Errors**: Shows toast with error message
2. **API Errors**: Displays specific error from server
3. **No Data**: API returns 404 if no snapshots exist
4. **Invalid Parameters**: API validates recipe_id and period

## Loading States

- **Idle**: Shows "Export to Excel" with download icon
- **Loading**: Shows "Mengekspor..." with spinning loader icon
- **Disabled**: Button is disabled during export and when `disabled` prop is true

## Toast Notifications

### Success
```
Title: Export Berhasil
Description: Data HPP {recipeName} berhasil diekspor ke Excel
```

### Error
```
Title: Export Gagal
Description: {error message}
Variant: destructive
```

## API Integration

The component calls the `/api/hpp/export` endpoint:

```
GET /api/hpp/export?recipe_id={recipeId}&period={period}
```

Response: Excel file (binary stream)

## Requirements Satisfied

This component satisfies the following requirements from the spec:

- ✅ **Requirement 5.1**: Export button with icon
- ✅ **Requirement 5.2**: Loading state during export
- ✅ **Requirement 5.3**: Formatted dates in user's locale (Indonesian)
- ✅ **Requirement 5.4**: Formatted currency values (Rupiah)
- ✅ **Requirement 5.5**: Automatic file download on success

## Dependencies

- `@/components/ui/button` - Button component
- `@/hooks/use-toast` - Toast notifications
- `@/types/hpp-tracking` - TypeScript types
- `lucide-react` - Icons (Download, Loader2)

## Browser Compatibility

The component uses modern browser APIs:
- `Blob` API for file handling
- `URL.createObjectURL` for download links
- Works in all modern browsers (Chrome, Firefox, Safari, Edge)

## Mobile Responsiveness

The button is fully responsive:
- Can be made full-width on mobile with `className="w-full"`
- Touch-friendly button size
- Proper loading state for mobile users

## Accessibility

- Semantic button element
- Disabled state properly communicated
- Loading state with visual indicator
- Clear button text

## Performance

- Lazy loading of export functionality
- Efficient blob handling
- Automatic cleanup of object URLs
- No memory leaks

## Future Enhancements

Possible future improvements:
- [ ] Add chart images to Excel file
- [ ] Support multiple recipe export
- [ ] Custom date range selection
- [ ] PDF export option
- [ ] Email export functionality
