import { detectHPPAlerts, saveAlerts } from '@/lib/hpp-alert-detector'
import { createSnapshot } from '@/lib/hpp-snapshot-manager'
import { createServerSupabaseAdmin } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

// POST /api/hpp/snapshot - Create HPP snapshots (internal endpoint for cron jobs)
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { recipe_id, user_id } = body

        // Validate required user_id
        if (!user_id) {
            return NextResponse.json(
                { error: 'Missing required parameter: user_id' },
                { status: 400 }
            )
        }

        const supabase = createServerSupabaseAdmin()

        let recipeIds: string[] = []

        // If recipe_id provided, snapshot only that recipe
        if (recipe_id) {
            recipeIds = [recipe_id]
        } else {
            // Otherwise, snapshot all active recipes for the user
            const { data: recipes, error: recipesError } = await supabase
                .from('recipes')
                .select('id')
                .eq('user_id', user_id)
                .eq('is_active', true)

            if (recipesError) {
                console.error('Error fetching recipes:', recipesError)
                return NextResponse.json(
                    { error: 'Failed to fetch recipes', details: recipesError.message },
                    { status: 500 }
                )
            }

            if (!recipes || recipes.length === 0) {
                return NextResponse.json({
                    success: true,
                    data: {
                        snapshots_created: 0,
                        alerts_generated: 0,
                        message: 'No active recipes found'
                    }
                })
            }

            recipeIds = recipes.map(r => r.id)
        }

        // Process recipes in batches of 50
        const batchSize = 50
        let totalSnapshotsCreated = 0
        const errors: Array<{ recipe_id: string; error: string }> = []

        for (let i = 0; i < recipeIds.length; i += batchSize) {
            const batch = recipeIds.slice(i, i + batchSize)

            // Process batch
            for (const id of batch) {
                try {
                    // Get recipe selling price
                    const { data: recipe } = await supabase
                        .from('recipes')
                        .select('selling_price')
                        .eq('id', id)
                        .single()

                    const sellingPrice = recipe?.selling_price || undefined

                    // Create snapshot
                    await createSnapshot(id, user_id, sellingPrice)
                    totalSnapshotsCreated++

                } catch (error: any) {
                    console.error(`Error creating snapshot for recipe ${id}:`, error)
                    errors.push({
                        recipe_id: id,
                        error: error.message
                    })
                }
            }

            // Add small delay between batches to avoid overwhelming the database
            if (i + batchSize < recipeIds.length) {
                await new Promise(resolve => setTimeout(resolve, 100))
            }
        }

        // Trigger alert detection after snapshots are created
        let alertsGenerated = 0
        try {
            const alertResult = await detectHPPAlerts(user_id, recipe_id)

            // Save alerts to database
            if (alertResult.alerts.length > 0) {
                await saveAlerts(alertResult.alerts)
                alertsGenerated = alertResult.alerts.length
            }
        } catch (error: any) {
            console.error('Error detecting alerts:', error)
            // Don't fail the entire request if alert detection fails
        }

        return NextResponse.json({
            success: true,
            data: {
                snapshots_created: totalSnapshotsCreated,
                alerts_generated: alertsGenerated,
                total_recipes: recipeIds.length,
                errors: errors.length > 0 ? errors : undefined
            },
            meta: {
                timestamp: new Date().toISOString(),
                batch_size: batchSize
            }
        })

    } catch (error: any) {
        console.error('Error in snapshot endpoint:', error)
        return NextResponse.json(
            { error: 'Snapshot creation failed', details: error.message },
            { status: 500 }
        )
    }
}

// GET /api/hpp/snapshot - Get snapshot creation status (for monitoring)
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const userId = searchParams.get('user_id')

        if (!userId) {
            return NextResponse.json(
                { error: 'Missing required parameter: user_id' },
                { status: 400 }
            )
        }

        const supabase = createServerSupabaseAdmin()

        // Get latest snapshot date
        const { data: latestSnapshot } = await supabase
            .from('hpp_snapshots')
            .select('snapshot_date, recipe_id')
            .eq('user_id', userId)
            .order('snapshot_date', { ascending: false })
            .limit(1)
            .single()

        // Get total snapshot count
        const { count: totalSnapshots } = await supabase
            .from('hpp_snapshots')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)

        // Get snapshot count in last 24 hours
        const twentyFourHoursAgo = new Date()
        twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24)

        const { count: recentSnapshots } = await supabase
            .from('hpp_snapshots')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .gte('snapshot_date', twentyFourHoursAgo.toISOString())

        return NextResponse.json({
            success: true,
            data: {
                latest_snapshot_date: latestSnapshot?.snapshot_date || null,
                total_snapshots: totalSnapshots || 0,
                snapshots_last_24h: recentSnapshots || 0,
                status: latestSnapshot ? 'active' : 'no_data'
            }
        })

    } catch (error: any) {
        console.error('Error getting snapshot status:', error)
        return NextResponse.json(
            { error: 'Failed to get snapshot status', details: error.message },
            { status: 500 }
        )
    }
}
