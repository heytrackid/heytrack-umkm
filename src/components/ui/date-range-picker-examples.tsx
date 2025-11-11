'use client'

/**
 * Date Range Picker Examples
 * 
 * Collection of common use cases and patterns for DateRangePicker component
 */

import { addDays, format } from 'date-fns'
import { useState } from 'react'
import { type DateRange } from 'react-day-picker'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { Label } from '@/components/ui/label'

// Example 1: Basic Usage
export function BasicDateRangePicker() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date()
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Basic Usage</CardTitle>
        <CardDescription>Simple date range picker with presets</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Select Date Range</Label>
          <DateRangePicker
            date={dateRange}
            onDateChange={setDateRange}
          />
        </div>
        {dateRange?.from && (
          <div className="text-sm text-muted-foreground">
            Selected: {format(dateRange.from, 'dd MMM yyyy')}
            {dateRange.to && ` - ${format(dateRange.to, 'dd MMM yyyy')}`}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Example 2: With Min/Max Date Restrictions
export function RestrictedDateRangePicker() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Date Restrictions</CardTitle>
        <CardDescription>Cannot select dates older than 90 days or future dates</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Select Date Range</Label>
          <DateRangePicker
            date={dateRange}
            onDateChange={setDateRange}
            minDate={addDays(new Date(), -90)}
            maxDate={new Date()}
          />
        </div>
      </CardContent>
    </Card>
  )
}

// Example 3: Without Presets
export function SimpleRangePicker() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Without Presets</CardTitle>
        <CardDescription>Calendar only, no preset buttons</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Select Date Range</Label>
          <DateRangePicker
            date={dateRange}
            onDateChange={setDateRange}
            showPresets={false}
          />
        </div>
      </CardContent>
    </Card>
  )
}

// Example 4: Report Filter Pattern
export function ReportDateFilter() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date()
  })
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerateReport = async () => {
    if (!dateRange?.from || !dateRange?.to) return

    setIsGenerating(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsGenerating(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Report Filter</CardTitle>
        <CardDescription>Common pattern for report generation</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Periode Laporan</Label>
          <DateRangePicker
            date={dateRange}
            onDateChange={setDateRange}
            maxDate={new Date()}
          />
        </div>
        <Button
          onClick={handleGenerateReport}
          disabled={!dateRange?.from || !dateRange?.to || isGenerating}
          className="w-full"
        >
          {isGenerating ? 'Generating...' : 'Generate Report'}
        </Button>
      </CardContent>
    </Card>
  )
}

// Example 5: Multiple Date Ranges
export function MultipleDateRanges() {
  const [currentPeriod, setCurrentPeriod] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date()
  })
  const [comparisonPeriod, setComparisonPeriod] = useState<DateRange | undefined>({
    from: addDays(new Date(), -60),
    to: addDays(new Date(), -31)
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Period Comparison</CardTitle>
        <CardDescription>Compare two date ranges</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Current Period</Label>
          <DateRangePicker
            date={currentPeriod}
            onDateChange={setCurrentPeriod}
            maxDate={new Date()}
          />
        </div>
        <div className="space-y-2">
          <Label>Comparison Period</Label>
          <DateRangePicker
            date={comparisonPeriod}
            onDateChange={setComparisonPeriod}
            maxDate={currentPeriod?.from ? addDays(currentPeriod.from, -1) : new Date()}
          />
        </div>
      </CardContent>
    </Card>
  )
}

// Example 6: Responsive Alignment
export function ResponsiveDatePicker() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>()

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Align Start</CardTitle>
        </CardHeader>
        <CardContent>
          <DateRangePicker
            date={dateRange}
            onDateChange={setDateRange}
            align="start"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Align Center</CardTitle>
        </CardHeader>
        <CardContent>
          <DateRangePicker
            date={dateRange}
            onDateChange={setDateRange}
            align="center"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Align End</CardTitle>
        </CardHeader>
        <CardContent>
          <DateRangePicker
            date={dateRange}
            onDateChange={setDateRange}
            align="end"
          />
        </CardContent>
      </Card>
    </div>
  )
}

// Example 7: With Validation
export function ValidatedDateRangePicker() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [error, setError] = useState<string>('')

  const handleDateChange = (newRange: DateRange | undefined) => {
    setDateRange(newRange)
    setError('')

    if (!newRange?.from || !newRange?.to) {
      setError('Please select both start and end dates')
      return
    }

    const diffDays = Math.ceil((newRange.to.getTime() - newRange.from.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffDays > 90) {
      setError('Date range cannot exceed 90 days')
      return
    }

    if (diffDays < 1) {
      setError('End date must be after start date')
      return
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>With Validation</CardTitle>
        <CardDescription>Max 90 days range with error handling</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Select Date Range</Label>
          <DateRangePicker
            date={dateRange}
            onDateChange={handleDateChange}
          />
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Example 8: Disabled State
export function DisabledDateRangePicker() {
  const [dateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date()
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Disabled State</CardTitle>
        <CardDescription>Date picker in disabled state</CardDescription>
      </CardHeader>
      <CardContent>
        <DateRangePicker
          date={dateRange}
          disabled={true}
        />
      </CardContent>
    </Card>
  )
}

// All Examples Component
export function DateRangePickerExamples() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Date Range Picker Examples</h1>
        <p className="text-muted-foreground">
          Common patterns and use cases for the DateRangePicker component
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BasicDateRangePicker />
        <RestrictedDateRangePicker />
        <SimpleRangePicker />
        <ReportDateFilter />
        <DisabledDateRangePicker />
        <ValidatedDateRangePicker />
      </div>

      <MultipleDateRanges />
      <ResponsiveDatePicker />
    </div>
  )
}
