/**
 * HPPExportButton Component - Usage Examples
 * 
 * This component provides Excel export functionality for HPP historical data.
 * It handles the export process, loading states, and error handling automatically.
 */

import { useState } from 'react'
import HPPExportButton from './HPPExportButton'
import type { TimePeriod } from '@/types/hpp-tracking'

// Example 1: Basic usage with default styling
export function BasicExportExample() {
    return (
        <HPPExportButton
            recipeId="recipe-uuid-123"
            recipeName="Kue Brownies"
            period="30d"
        />
    )
}

// Example 2: Custom styling with different variants
export function CustomStyledExportExample() {
    return (
        <div className="flex gap-2">
            <HPPExportButton
                recipeId="recipe-uuid-123"
                recipeName="Kue Brownies"
                period="7d"
                variant="default"
                size="sm"
            />

            <HPPExportButton
                recipeId="recipe-uuid-123"
                recipeName="Kue Brownies"
                period="30d"
                variant="outline"
                size="default"
            />

            <HPPExportButton
                recipeId="recipe-uuid-123"
                recipeName="Kue Brownies"
                period="90d"
                variant="secondary"
                size="lg"
            />
        </div>
    )
}

// Example 3: Disabled state
export function DisabledExportExample() {
    return (
        <HPPExportButton
            recipeId="recipe-uuid-123"
            recipeName="Kue Brownies"
            period="30d"
            disabled={true}
        />
    )
}

// Example 4: Integration with HPP Historical Chart
export function IntegratedExportExample() {
    const selectedRecipeId = "recipe-uuid-123"
    const selectedRecipeName = "Kue Brownies"
    const selectedPeriod = "30d"

    return (
        <div className="space-y-4">
            {/* Chart Header with Export Button */}
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-semibold">Tren HPP - {selectedRecipeName}</h3>
                    <p className="text-sm text-muted-foreground">
                        Data 30 hari terakhir
                    </p>
                </div>

                <HPPExportButton
                    recipeId={selectedRecipeId}
                    recipeName={selectedRecipeName}
                    period={selectedPeriod}
                    variant="outline"
                />
            </div>

            {/* Chart Component */}
            <div className="border rounded-lg p-4">
                {/* HPPHistoricalChart would go here */}
            </div>
        </div>
    )
}

// Example 5: Mobile responsive layout
export function MobileResponsiveExportExample() {
    const isMobile = true // from useResponsive hook

    return (
        <div className={`flex ${isMobile ? 'flex-col' : 'justify-between items-center'} gap-4`}>
            <h3 className="text-lg font-semibold">HPP Historical Data</h3>

            <HPPExportButton
                recipeId="recipe-uuid-123"
                recipeName="Kue Brownies"
                period="30d"
                className={isMobile ? 'w-full' : ''}
            />
        </div>
    )
}

// Example 6: With dynamic period selection
export function DynamicPeriodExportExample() {
    const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('30d')

    return (
        <div className="space-y-4">
            {/* Period selector */}
            <div className="flex gap-2">
                {(['7d', '30d', '90d', '1y'] as TimePeriod[]).map(period => (
                    <button
                        key={period}
                        onClick={() => setSelectedPeriod(period)}
                        className={selectedPeriod === period ? 'font-bold' : ''}
                    >
                        {period}
                    </button>
                ))}
            </div>

            {/* Export button with selected period */}
            <HPPExportButton
                recipeId="recipe-uuid-123"
                recipeName="Kue Brownies"
                period={selectedPeriod}
            />
        </div>
    )
}

/**
 * Export Data Format
 * 
 * The exported Excel file contains 4 sheets:
 * 
 * 1. HPP History
 *    - Date, HPP, Material Cost, Operational Cost, Selling Price, Margin %
 *    - Formatted with Indonesian Rupiah currency
 *    - Includes borders and styling
 * 
 * 2. Ringkasan (Summary)
 *    - Product name, period, date range
 *    - Min, Max, Average HPP
 *    - Trend and total change
 * 
 * 3. Rincian Biaya (Cost Breakdown)
 *    - Latest snapshot cost breakdown
 *    - Ingredients with costs and percentages
 *    - Operational costs with costs and percentages
 *    - Total HPP
 * 
 * 4. Data Grafik (Chart Data)
 *    - Simplified data for creating charts in Excel
 *    - Date, HPP, Material Cost, Operational Cost
 */

/**
 * Error Handling
 * 
 * The component handles errors automatically:
 * - Shows loading state during export
 * - Displays error toast if export fails
 * - Shows success toast when export completes
 * - Handles network errors and API errors
 */

/**
 * Requirements Satisfied
 * 
 * ✓ 5.1 - Export button with icon
 * ✓ 5.2 - Loading state during export
 * ✓ 5.3 - Formatted dates in Indonesian locale
 * ✓ 5.4 - Formatted currency values (Rupiah)
 * ✓ 5.5 - Automatic file download on success
 * ✓ Error handling with toast notifications
 * ✓ Summary statistics sheet included
 * ✓ Chart data sheet for visualization
 */
