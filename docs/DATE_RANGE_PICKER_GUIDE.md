# Date Range Picker Guide

## Overview

Komponen `DateRangePicker` adalah komponen reusable untuk memilih rentang tanggal dengan fitur preset dan custom range selection. Dibangun dengan Radix UI dan react-day-picker untuk pengalaman yang accessible dan mobile-friendly.

## Features

- ✅ **Preset Ranges** - Quick select untuk rentang tanggal umum
- ✅ **Custom Range** - Manual selection dengan dual calendar
- ✅ **Mobile Responsive** - Optimized untuk mobile dan desktop
- ✅ **Type-Safe** - Full TypeScript support
- ✅ **Accessible** - Built dengan Radix UI primitives
- ✅ **Localized** - Bahasa Indonesia support
- ✅ **Min/Max Date** - Restrict date selection
- ✅ **Customizable** - Flexible styling dan behavior

## Installation

Dependencies sudah terinstall:
- `react-day-picker` - Calendar component
- `date-fns` - Date manipulation
- `@radix-ui/react-popover` - Popover primitive

## Basic Usage

```tsx
'use client'

import { useState } from 'react'
import { type DateRange } from 'react-day-picker'
import { DateRangePicker } from '@/components/ui/date-range-picker'

export function MyComponent() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date()
  })

  return (
    <DateRangePicker
      date={dateRange}
      onDateChange={setDateRange}
    />
  )
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `date` | `DateRange \| undefined` | - | Selected date range |
| `onDateChange` | `(date: DateRange \| undefined) => void` | - | Callback when date changes |
| `className` | `string` | - | Additional CSS classes |
| `placeholder` | `string` | `'Pilih rentang tanggal'` | Placeholder text |
| `disabled` | `boolean` | `false` | Disable the picker |
| `align` | `'start' \| 'center' \| 'end'` | `'start'` | Popover alignment |
| `showPresets` | `boolean` | `true` | Show preset buttons |
| `minDate` | `Date` | - | Minimum selectable date |
| `maxDate` | `Date` | - | Maximum selectable date |

## Available Presets

1. **Hari Ini** - Today only
2. **7 Hari Terakhir** - Last 7 days
3. **30 Hari Terakhir** - Last 30 days
4. **90 Hari Terakhir** - Last 90 days
5. **Bulan Ini** - Current month
6. **Bulan Lalu** - Previous month

## Advanced Examples

### With Min/Max Date Restrictions

```tsx
import { addDays } from 'date-fns'

export function RestrictedDatePicker() {
  const [dateRange, setDateRange] = useState<DateRange>()

  return (
    <DateRangePicker
      date={dateRange}
      onDateChange={setDateRange}
      minDate={addDays(new Date(), -90)} // Max 90 days ago
      maxDate={new Date()} // Cannot select future dates
    />
  )
}
```

### Without Presets

```tsx
export function SimpleRangePicker() {
  const [dateRange, setDateRange] = useState<DateRange>()

  return (
    <DateRangePicker
      date={dateRange}
      onDateChange={setDateRange}
      showPresets={false}
    />
  )
}
```

### With Form Integration

```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const formSchema = z.object({
  dateRange: z.object({
    from: z.date(),
    to: z.date()
  }).optional()
})

export function FormWithDateRange() {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dateRange: {
        from: new Date(),
        to: new Date()
      }
    }
  })

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <DateRangePicker
        date={form.watch('dateRange')}
        onDateChange={(date) => form.setValue('dateRange', date)}
      />
    </form>
  )
}
```

### With API Integration

```tsx
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'

export function DataWithDateFilter() {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(),
    to: new Date()
  })

  const { data, isLoading } = useQuery({
    queryKey: ['data', dateRange],
    queryFn: async () => {
      if (!dateRange?.from || !dateRange?.to) return null

      const params = new URLSearchParams({
        startDate: format(dateRange.from, 'yyyy-MM-dd'),
        endDate: format(dateRange.to, 'yyyy-MM-dd')
      })

      const response = await fetch(`/api/data?${params}`)
      return response.json()
    },
    enabled: !!dateRange?.from && !!dateRange?.to
  })

  return (
    <div>
      <DateRangePicker
        date={dateRange}
        onDateChange={setDateRange}
      />
      {isLoading ? 'Loading...' : JSON.stringify(data)}
    </div>
  )
}
```

### Custom Styling

```tsx
export function StyledDatePicker() {
  const [dateRange, setDateRange] = useState<DateRange>()

  return (
    <DateRangePicker
      date={dateRange}
      onDateChange={setDateRange}
      className="w-full md:w-auto"
      placeholder="Pilih periode laporan"
      align="end"
    />
  )
}
```

## Date Format Utilities

```tsx
import { format } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'

// Format untuk display
const displayDate = format(date, 'dd MMMM yyyy', { locale: idLocale })
// Output: "15 November 2025"

// Format untuk API
const apiDate = format(date, 'yyyy-MM-dd')
// Output: "2025-11-15"

// Format untuk database
const dbDate = date.toISOString()
// Output: "2025-11-15T00:00:00.000Z"
```

## Best Practices

### 1. Always Handle Undefined State

```tsx
const [dateRange, setDateRange] = useState<DateRange | undefined>()

// ✅ Good - Check before using
if (dateRange?.from && dateRange?.to) {
  fetchData(dateRange.from, dateRange.to)
}

// ❌ Bad - May cause errors
fetchData(dateRange.from, dateRange.to)
```

### 2. Use Proper Date Formatting

```tsx
// ✅ Good - Use date-fns for formatting
import { format } from 'date-fns'
const formatted = format(date, 'yyyy-MM-dd')

// ❌ Bad - Manual string manipulation
const formatted = date.toISOString().split('T')[0]
```

### 3. Validate Date Ranges

```tsx
const validateDateRange = (range: DateRange | undefined): boolean => {
  if (!range?.from || !range?.to) return false
  if (range.from > range.to) return false
  
  // Max 90 days range
  const diffDays = Math.ceil((range.to.getTime() - range.from.getTime()) / (1000 * 60 * 60 * 24))
  return diffDays <= 90
}
```

### 4. Persist User Preferences

```tsx
import { useEffect } from 'react'

export function PersistentDatePicker() {
  const [dateRange, setDateRange] = useState<DateRange>(() => {
    const saved = localStorage.getItem('dateRange')
    if (saved) {
      const parsed = JSON.parse(saved)
      return {
        from: new Date(parsed.from),
        to: new Date(parsed.to)
      }
    }
    return { from: new Date(), to: new Date() }
  })

  useEffect(() => {
    if (dateRange?.from && dateRange?.to) {
      localStorage.setItem('dateRange', JSON.stringify({
        from: dateRange.from.toISOString(),
        to: dateRange.to.toISOString()
      }))
    }
  }, [dateRange])

  return (
    <DateRangePicker
      date={dateRange}
      onDateChange={setDateRange}
    />
  )
}
```

## Common Use Cases

### 1. Reports & Analytics

```tsx
// HPP Reports, Financial Reports, Sales Reports
<DateRangePicker
  date={reportDateRange}
  onDateChange={setReportDateRange}
  showPresets={true}
  maxDate={new Date()} // Cannot select future dates
/>
```

### 2. Data Filtering

```tsx
// Order list, Transaction history, Inventory logs
<DateRangePicker
  date={filterDateRange}
  onDateChange={setFilterDateRange}
  placeholder="Filter berdasarkan tanggal"
  align="end"
/>
```

### 3. Booking/Scheduling

```tsx
// Production planning, Delivery scheduling
<DateRangePicker
  date={scheduleRange}
  onDateChange={setScheduleRange}
  minDate={new Date()} // Cannot select past dates
  showPresets={false}
/>
```

## Troubleshooting

### Issue: Date not updating

**Solution**: Make sure you're using controlled component pattern:

```tsx
// ✅ Correct
const [date, setDate] = useState<DateRange>()
<DateRangePicker date={date} onDateChange={setDate} />

// ❌ Wrong - Missing state
<DateRangePicker onDateChange={setDate} />
```

### Issue: Popover not showing

**Solution**: Ensure Popover component is properly imported and styled:

```tsx
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
```

### Issue: Date format incorrect

**Solution**: Use date-fns with proper locale:

```tsx
import { format } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'

format(date, 'dd MMMM yyyy', { locale: idLocale })
```

## Migration from Old Date Inputs

### Before (Old Pattern)

```tsx
<div className="grid grid-cols-2 gap-4">
  <div>
    <Label>Start Date</Label>
    <Input
      type="date"
      value={startDate}
      onChange={(e) => setStartDate(e.target.value)}
    />
  </div>
  <div>
    <Label>End Date</Label>
    <Input
      type="date"
      value={endDate}
      onChange={(e) => setEndDate(e.target.value)}
    />
  </div>
</div>
```

### After (New Pattern)

```tsx
<div>
  <Label>Rentang Tanggal</Label>
  <DateRangePicker
    date={dateRange}
    onDateChange={setDateRange}
  />
</div>
```

## Related Components

- `Calendar` - Base calendar component
- `Popover` - Popover primitive
- `Button` - Trigger button

## Resources

- [react-day-picker docs](https://react-day-picker.js.org/)
- [date-fns docs](https://date-fns.org/)
- [Radix UI Popover](https://www.radix-ui.com/docs/primitives/components/popover)
