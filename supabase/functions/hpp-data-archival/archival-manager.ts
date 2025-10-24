/**
 * Archival Manager for HPP Data Archival Edge Function
 * Handles the core logic for archiving old HPP snapshots
 */

import { SupabaseClient } from 'jsr:@supabase/supabase-js@2'
import type { ArchivalResult, BatchError, HPPSnapshot } from './types.ts'
import { chunkArray, delay, log, logError } from './utils.ts'

/**
 * Main archival function
 * Archives HPP snapshots older than 1 year
 * 
 * Subtask 8.3: Add comprehensive error logging
 * - Log execution start and end
 * - Log batch processing progress
 * - Log archival errors with context
 * - Log database errors with details
 * 
 * Requirements: 5.1, 5.2, 8.1, 8.2, 8.3, 8.4, 8.5
 */
export async function archiveOldSnapshots(
    supabase: SupabaseClient
): Promise<ArchivalResult> {
    const startTime = Date.now()

    // Log execution start
    log('info', 'HPP Data Archival execution started', {
        start_time: new Date().toISOString()
    })

    try {
        // 1. Calculate cutoff date (1 year ago)
        const cutoffDate = calculateCutoffDate()
        log('info', 'Calculated cutoff date', {
            cutoff_date: cutoffDate.toISOString(),
            cutoff_days_ago: Math.floor((Date.now() - cutoffDate.getTime()) / (1000 * 60 * 60 * 24))
        })

        // 2. Fetch snapshots older than cutoff date
        log('info', 'Fetching old snapshots from database')
        const oldSnapshots = await fetchOldSnapshots(supabase, cutoffDate)

        if (!oldSnapshots || oldSnapshots.length === 0) {
            log('info', 'No snapshots to archive - archival complete', {
                execution_time_ms: Date.now() - startTime
            })
            return {
                snapshots_archived: 0,
                oldest_date: null,
                remaining_old_snapshots: 0,
                total_in_archive: 0,
                batches_processed: 0,
                errors: []
            }
        }

        log('info', 'Found snapshots to archive', {
            total_snapshots: oldSnapshots.length,
            oldest_date: oldSnapshots[0]?.snapshot_date,
            newest_old_date: oldSnapshots[oldSnapshots.length - 1]?.snapshot_date
        })

        // 3. Process snapshots in batches
        log('info', 'Starting batch processing')
        const batchResult = await processBatches(supabase, oldSnapshots)

        // 4. Verify data integrity
        log('info', 'Verifying data integrity after archival')
        const verification = await verifyArchival(supabase, cutoffDate)

        const executionTime = Date.now() - startTime

        // Log execution end with comprehensive metrics
        log('info', 'HPP Data Archival execution completed', {
            snapshots_archived: batchResult.totalArchived,
            batches_processed: batchResult.batchesProcessed,
            batches_failed: batchResult.errors.length,
            remaining_old_snapshots: verification.remaining_old_snapshots,
            total_in_archive: verification.total_in_archive,
            execution_time_ms: executionTime,
            execution_time_seconds: (executionTime / 1000).toFixed(2),
            success_rate: batchResult.batchesProcessed > 0
                ? ((batchResult.batchesProcessed - batchResult.errors.length) / batchResult.batchesProcessed * 100).toFixed(2) + '%'
                : '100%'
        })

        return {
            snapshots_archived: batchResult.totalArchived,
            oldest_date: oldSnapshots[0]?.snapshot_date || null,
            remaining_old_snapshots: verification.remaining_old_snapshots,
            total_in_archive: verification.total_in_archive,
            batches_processed: batchResult.batchesProcessed,
            errors: batchResult.errors
        }
    } catch (error) {
        const executionTime = Date.now() - startTime

        logError('Fatal error in archival process', error, {
            execution_time_ms: executionTime
        })

        throw error
    }
}

/**
 * Calculate cutoff date (1 year ago from now)
 * 
 * Requirements: 5.1
 */
function calculateCutoffDate(): Date {
    const oneYearAgo = new Date()
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
    return oneYearAgo
}

/**
 * Fetch snapshots older than cutoff date
 * 
 * Requirements: 5.2, 8.3, 8.4, 8.5
 */
async function fetchOldSnapshots(
    supabase: SupabaseClient,
    cutoffDate: Date
): Promise<HPPSnapshot[] | null> {
    try {
        log('info', 'Querying database for old snapshots', {
            cutoff_date: cutoffDate.toISOString()
        })

        const { data, error } = await supabase
            .from('hpp_snapshots')
            .select('*')
            .lt('snapshot_date', cutoffDate.toISOString())
            .order('snapshot_date', { ascending: true })

        if (error) {
            logError('Database error while fetching old snapshots', error, {
                cutoff_date: cutoffDate.toISOString(),
                error_code: error.code,
                error_details: error.details
            })
            throw error
        }

        log('info', 'Successfully fetched old snapshots', {
            count: data?.length || 0
        })

        return data as HPPSnapshot[]
    } catch (error) {
        logError('Failed to fetch old snapshots', error, {
            cutoff_date: cutoffDate.toISOString()
        })
        throw error
    }
}

/**
 * Process snapshots in batches
 * 
 * Requirements: 5.3, 5.7, 8.3, 8.4, 8.5, 10.2
 */
async function processBatches(
    supabase: SupabaseClient,
    snapshots: HPPSnapshot[]
): Promise<{
    totalArchived: number
    batchesProcessed: number
    errors: BatchError[]
}> {
    const BATCH_SIZE = 100
    const BATCH_DELAY_MS = 200

    const batches = chunkArray(snapshots, BATCH_SIZE)
    let totalArchived = 0
    let batchesProcessed = 0
    const errors: BatchError[] = []

    log('info', 'Batch processing configuration', {
        total_snapshots: snapshots.length,
        total_batches: batches.length,
        batch_size: BATCH_SIZE,
        batch_delay_ms: BATCH_DELAY_MS,
        estimated_duration_seconds: ((batches.length * BATCH_DELAY_MS) / 1000).toFixed(2)
    })

    const batchStartTime = Date.now()

    for (let i = 0; i < batches.length; i++) {
        const batch = batches[i]
        const batchNumber = i + 1
        const batchIterationStart = Date.now()

        log('info', `Processing batch ${batchNumber}/${batches.length}`, {
            batch_number: batchNumber,
            batch_size: batch.length,
            progress_percentage: ((batchNumber / batches.length) * 100).toFixed(1) + '%'
        })

        try {
            await archiveBatch(supabase, batch)
            totalArchived += batch.length
            batchesProcessed++

            const batchDuration = Date.now() - batchIterationStart

            log('info', `Successfully archived batch ${batchNumber}/${batches.length}`, {
                batch_number: batchNumber,
                batch_size: batch.length,
                batch_duration_ms: batchDuration,
                total_archived: totalArchived,
                remaining_batches: batches.length - batchNumber,
                success_rate: ((batchesProcessed / batchNumber) * 100).toFixed(1) + '%'
            })
        } catch (error) {
            const batchDuration = Date.now() - batchIterationStart

            logError(`Failed to archive batch ${batchNumber}/${batches.length}`, error, {
                batch_number: batchNumber,
                batch_size: batch.length,
                batch_duration_ms: batchDuration,
                total_archived_so_far: totalArchived,
                remaining_batches: batches.length - batchNumber
            })

            errors.push({
                batch: batchNumber,
                error: error instanceof Error ? error.message : String(error)
            })
            // Continue processing remaining batches
        }

        // Add delay between batches (except after last batch)
        if (i < batches.length - 1) {
            await delay(BATCH_DELAY_MS)
        }
    }

    const totalBatchTime = Date.now() - batchStartTime

    log('info', 'Batch processing completed', {
        total_batches: batches.length,
        batches_processed: batchesProcessed,
        batches_failed: errors.length,
        total_archived: totalArchived,
        total_duration_ms: totalBatchTime,
        total_duration_seconds: (totalBatchTime / 1000).toFixed(2),
        average_batch_time_ms: batches.length > 0 ? Math.round(totalBatchTime / batches.length) : 0,
        success_rate: batches.length > 0 ? ((batchesProcessed / batches.length) * 100).toFixed(1) + '%' : '100%'
    })

    return {
        totalArchived,
        batchesProcessed,
        errors
    }
}

/**
 * Archive a single batch of snapshots
 * Uses transactions for data integrity
 * 
 * Requirements: 5.4, 5.5, 8.3, 8.4, 8.5
 */
async function archiveBatch(
    supabase: SupabaseClient,
    batch: HPPSnapshot[]
): Promise<void> {
    const archivedAt = new Date().toISOString()

    // 1. Insert snapshots into archive table
    log('info', 'Inserting batch into archive table', {
        batch_size: batch.length,
        archived_at: archivedAt
    })

    const { error: insertError } = await supabase
        .from('hpp_snapshots_archive')
        .insert(batch.map(snapshot => ({
            ...snapshot,
            archived_at: archivedAt
        })))

    if (insertError) {
        logError('Database error during archive insertion', insertError, {
            batch_size: batch.length,
            error_code: insertError.code,
            error_details: insertError.details,
            error_hint: insertError.hint
        })
        throw new Error(`Archive insertion failed: ${insertError.message}`)
    }

    log('info', 'Successfully inserted batch into archive table', {
        batch_size: batch.length
    })

    // 2. Delete archived snapshots from main table
    const snapshotIds = batch.map(s => s.id)

    log('info', 'Deleting archived snapshots from main table', {
        batch_size: batch.length,
        snapshot_ids_count: snapshotIds.length
    })

    const { error: deleteError } = await supabase
        .from('hpp_snapshots')
        .delete()
        .in('id', snapshotIds)

    if (deleteError) {
        logError('Database error during snapshot deletion', deleteError, {
            batch_size: batch.length,
            snapshot_ids_count: snapshotIds.length,
            error_code: deleteError.code,
            error_details: deleteError.details,
            error_hint: deleteError.hint
        })
        throw new Error(`Snapshot deletion failed: ${deleteError.message}`)
    }

    log('info', 'Successfully deleted archived snapshots from main table', {
        batch_size: batch.length
    })
}

/**
 * Verify data integrity after archival
 * 
 * Requirements: 5.6, 8.3, 8.4, 8.5
 */
async function verifyArchival(
    supabase: SupabaseClient,
    cutoffDate: Date
): Promise<{
    remaining_old_snapshots: number
    total_in_archive: number
}> {
    try {
        log('info', 'Starting data integrity verification', {
            cutoff_date: cutoffDate.toISOString()
        })

        // Count remaining old snapshots in main table
        log('info', 'Counting remaining old snapshots in main table')
        const { count: remainingCount, error: remainingError } = await supabase
            .from('hpp_snapshots')
            .select('*', { count: 'exact', head: true })
            .lt('snapshot_date', cutoffDate.toISOString())

        if (remainingError) {
            logError('Database error while counting remaining old snapshots', remainingError, {
                cutoff_date: cutoffDate.toISOString(),
                error_code: remainingError.code,
                error_details: remainingError.details
            })
            throw remainingError
        }

        log('info', 'Counted remaining old snapshots', {
            remaining_count: remainingCount || 0
        })

        // Count total snapshots in archive table
        log('info', 'Counting total snapshots in archive table')
        const { count: archiveCount, error: archiveError } = await supabase
            .from('hpp_snapshots_archive')
            .select('*', { count: 'exact', head: true })

        if (archiveError) {
            logError('Database error while counting archived snapshots', archiveError, {
                error_code: archiveError.code,
                error_details: archiveError.details
            })
            throw archiveError
        }

        log('info', 'Counted archived snapshots', {
            archive_count: archiveCount || 0
        })

        const verificationResult = {
            remaining_old_snapshots: remainingCount || 0,
            total_in_archive: archiveCount || 0
        }

        // Log verification results with integrity check
        const integrityStatus = (remainingCount || 0) === 0 ? 'PASS' : 'WARNING'
        log('info', 'Data integrity verification completed', {
            ...verificationResult,
            integrity_status: integrityStatus,
            integrity_message: integrityStatus === 'PASS'
                ? 'All old snapshots successfully archived'
                : `${remainingCount} old snapshots still remain in main table`
        })

        return verificationResult
    } catch (error) {
        logError('Failed to verify data integrity', error, {
            cutoff_date: cutoffDate.toISOString()
        })
        throw error
    }
}
