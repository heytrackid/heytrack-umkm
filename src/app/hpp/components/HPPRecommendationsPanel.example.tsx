/**
 * HPPRecommendationsPanel Component - Example Usage
 * 
 * This file demonstrates various ways to use the HPPRecommendationsPanel component
 * in different scenarios.
 */

import { HPPRecommendationsPanel } from './HPPRecommendationsPanel'

import { apiLogger } from '@/lib/logger'
// ============================================================================
// Example 1: Basic Usage - Show all recommendations
// ============================================================================
export function Example1_BasicUsage() {
    return (
        <div className="container mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">Rekomendasi Optimasi HPP</h1>
            <HPPRecommendationsPanel />
        </div>
    )
}

// ============================================================================
// Example 2: Filter by Recipe - Show recommendations for specific recipe
// ============================================================================
export function Example2_FilterByRecipe() {
    const recipeId = 'recipe-uuid-here'

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">Rekomendasi untuk Produk Tertentu</h1>
            <HPPRecommendationsPanel recipeId={recipeId} />
        </div>
    )
}

// ============================================================================
// Example 3: Integrated with Other HPP Components
// ============================================================================
export function Example3_IntegratedDashboard() {
    const recipeId = 'recipe-uuid-here'

    return (
        <div className="container mx-auto p-6 space-y-6">
            <h1 className="text-2xl font-bold">Dashboard HPP Lanjutan</h1>

            {/* Top Section: Chart and Comparison */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* HPP Historical Chart would go here */}
                <div className="border rounded-lg p-4">
                    <p className="text-muted-foreground">HPP Historical Chart</p>
                </div>

                {/* HPP Comparison Card would go here */}
                <div className="border rounded-lg p-4">
                    <p className="text-muted-foreground">HPP Comparison Card</p>
                </div>
            </div>

            {/* Middle Section: Cost Breakdown */}
            <div className="border rounded-lg p-4">
                <p className="text-muted-foreground">Cost Breakdown Chart</p>
            </div>

            {/* Bottom Section: Alerts and Recommendations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* HPP Alerts List would go here */}
                <div className="border rounded-lg p-4">
                    <p className="text-muted-foreground">HPP Alerts List</p>
                </div>

                {/* Recommendations Panel */}
                <HPPRecommendationsPanel recipeId={recipeId} />
            </div>
        </div>
    )
}

// ============================================================================
// Example 4: Mobile-Optimized Layout
// ============================================================================
export function Example4_MobileLayout() {
    const recipeId = 'recipe-uuid-here'

    return (
        <div className="container mx-auto p-4 space-y-4">
            <h1 className="text-xl font-bold">Rekomendasi HPP</h1>

            {/* Stack vertically on mobile */}
            <div className="space-y-4">
                <HPPRecommendationsPanel recipeId={recipeId} />
            </div>
        </div>
    )
}

// ============================================================================
// Example 5: With Custom Styling
// ============================================================================
export function Example5_CustomStyling() {
    return (
        <div className="container mx-auto p-6">
            <div className="max-w-4xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold mb-2">Optimasi HPP</h1>
                    <p className="text-muted-foreground">
                        Rekomendasi berbasis AI untuk meningkatkan efisiensi dan profitabilitas
                    </p>
                </div>

                {/* Custom container styling */}
                <div className="shadow-lg rounded-xl overflow-hidden">
                    <HPPRecommendationsPanel />
                </div>
            </div>
        </div>
    )
}

// ============================================================================
// Example 6: With Loading State Handling
// ============================================================================
export function Example6_WithLoadingState() {
    const recipeId = 'recipe-uuid-here'

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">Rekomendasi HPP</h1>

            {/* The component handles loading states internally */}
            <HPPRecommendationsPanel recipeId={recipeId} />

            {/* Additional info below */}
            <div className="mt-4 p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                    💡 Tip: Rekomendasi diperbarui otomatis setiap 5 menit berdasarkan data HPP terbaru.
                </p>
            </div>
        </div>
    )
}

// ============================================================================
// Example 7: In a Tabbed Interface
// ============================================================================
export function Example7_TabbedInterface() {
    const recipeId = 'recipe-uuid-here'

    return (
        <div className="container mx-auto p-6">
            {/* Tabs would be implemented here */}
            <div className="border-b mb-6">
                <div className="flex gap-4">
                    <button className="px-4 py-2 border-b-2 border-transparent">
                        Grafik Tren
                    </button>
                    <button className="px-4 py-2 border-b-2 border-transparent">
                        Perbandingan
                    </button>
                    <button className="px-4 py-2 border-b-2 border-primary">
                        Rekomendasi
                    </button>
                </div>
            </div>

            {/* Tab content */}
            <HPPRecommendationsPanel recipeId={recipeId} />
        </div>
    )
}

// ============================================================================
// Example 8: With Action Buttons
// ============================================================================
export function Example8_WithActionButtons() {
    const handleExport = () => {
        apiLogger.info('Exporting recommendations...')
        // Implementation would go here
    }

    const handleRefresh = () => {
        apiLogger.info('Refreshing recommendations...')
        // Implementation would go here
    }

    return (
        <div className="container mx-auto p-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Rekomendasi Optimasi</h1>
                <div className="flex gap-2">
                    <button
                        onClick={handleRefresh}
                        className="px-4 py-2 border rounded-lg hover:bg-accent"
                    >
                        Refresh
                    </button>
                    <button
                        onClick={handleExport}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
                    >
                        Export PDF
                    </button>
                </div>
            </div>

            <HPPRecommendationsPanel />
        </div>
    )
}

// ============================================================================
// Example 9: With Summary Statistics
// ============================================================================
export function Example9_WithSummaryStats() {
    return (
        <div className="container mx-auto p-6 space-y-6">
            <h1 className="text-2xl font-bold">Rekomendasi & Statistik</h1>

            {/* Summary cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Total Rekomendasi</p>
                    <p className="text-2xl font-bold">8</p>
                </div>
                <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Prioritas Tinggi</p>
                    <p className="text-2xl font-bold text-red-600">3</p>
                </div>
                <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Potensi Penghematan</p>
                    <p className="text-2xl font-bold text-green-600">Rp 2.5M</p>
                </div>
            </div>

            {/* Recommendations panel */}
            <HPPRecommendationsPanel />
        </div>
    )
}

// ============================================================================
// Example 10: Responsive Grid Layout
// ============================================================================
export function Example10_ResponsiveGrid() {
    const recipes = [
        { id: 'recipe-1', name: 'Produk A' },
        { id: 'recipe-2', name: 'Produk B' },
        { id: 'recipe-3', name: 'Produk C' }
    ]

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">Rekomendasi per Produk</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {recipes.map(recipe => (
                    <div key={recipe.id}>
                        <h2 className="text-lg font-semibold mb-3">{recipe.name}</h2>
                        <HPPRecommendationsPanel recipeId={recipe.id} />
                    </div>
                ))}
            </div>
        </div>
    )
}

// ============================================================================
// Usage Notes:
// ============================================================================
/*

1. Basic Integration:
   - Import the component
   - Add it to your page/component
   - Optionally pass recipeId to filter

2. Styling:
   - Component uses Tailwind CSS
   - Inherits theme from parent
   - Supports dark mode automatically

3. Data Requirements:
   - Requires HPP snapshots in database
   - Needs at least 5 snapshots for 30-day analysis
   - Works best with complete cost breakdown data

4. Performance:
   - Uses TanStack Query for caching
   - Auto-refetches every 5 minutes
   - Optimized for large datasets

5. Customization:
   - Wrap in custom container for styling
   - Combine with other HPP components
   - Add custom actions/buttons around it

*/
