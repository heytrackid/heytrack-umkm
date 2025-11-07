import { dbLogger } from '@/lib/logger'


/* eslint-disable no-await-in-loop */
/**
 * Database Transaction Management
 * 
 * Provides transaction support for complex operations that need atomicity.
 * Uses Supabase RPC functions for transaction management.
 */


export interface TransactionOperation<T = unknown> {
  name: string
  execute: () => Promise<T>
  rollback?: () => Promise<void>
}

export interface TransactionResult<T = unknown> {
  success: boolean
  data?: T
  error?: Error
  completedOperations: string[]
  failedOperation?: string
}

/**
 * Execute multiple operations as a transaction with rollback support
 * 
 * Note: This is a client-side transaction simulation since Supabase doesn't
 * expose native PostgreSQL transactions. For true ACID transactions, use
 * Supabase Edge Functions with pg transactions.
 */
export async function executeTransaction<T = unknown>(
  operations: Array<TransactionOperation<T>>,
  options: {
    continueOnError?: boolean
    logProgress?: boolean
  } = {}
): Promise<TransactionResult<T[]>> {
  const { continueOnError = false, logProgress = true } = options
  
  const results: T[] = []
  const completedOperations: string[] = []
  let failedOperation: string | undefined

  try {
    if (logProgress) {
      dbLogger.info({ operationCount: operations.length }, 'Starting transaction')
    }

    // Execute operations sequentially
    for (const operation of operations) {
      try {
        if (logProgress) {
          dbLogger.debug({ operation: operation.name }, 'Executing operation')
        }

        const result = await operation.execute()
        results.push(result)
        completedOperations.push(operation.name)

        if (logProgress) {
          dbLogger.debug({ operation: operation.name }, 'Operation completed')
        }
      } catch (error) {
        failedOperation = operation.name
        
        dbLogger.error(
          { error, operation: operation.name, completedOperations },
          'Operation failed'
        )

        if (!continueOnError) {
          // Rollback completed operations in reverse order
          await rollbackOperations(operations, completedOperations)
          
          throw new Error(
            `Transaction failed at operation "${operation.name}": ${
              error instanceof Error ? error.message : 'Unknown error'
            }`
          )
        }
      }
    }

    if (logProgress) {
      dbLogger.info(
        { completedOperations: completedOperations.length },
        'Transaction completed successfully'
      )
    }

    return {
      success: true,
      data: results,
      completedOperations,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error : new Error('Unknown error'),
      completedOperations,
      failedOperation,
    }
  }
}

/**
 * Rollback completed operations
 */
async function rollbackOperations(
  operations: TransactionOperation[],
  completedOperations: string[]
): Promise<void> {
  dbLogger.warn(
    { operationsToRollback: completedOperations.length },
    'Starting rollback'
  )

  // Rollback in reverse order
  for (let i = completedOperations.length - 1; i >= 0; i--) {
    const operationName = completedOperations[i]
    const operation = operations.find(op => op.name === operationName)

    if (operation?.rollback) {
      try {
        await operation.rollback()
        dbLogger.debug({ operation: operationName }, 'Rollback completed')
      } catch (error) {
        // Log but don't throw - we want to attempt all rollbacks
        dbLogger.error(
          { error, operation: operationName },
          'Rollback failed'
        )
      }
    } else {
      dbLogger.warn(
        { operation: operationName },
        'No rollback function defined for operation'
      )
    }
  }

  dbLogger.warn('Rollback completed')
}

/**
 * Create a transaction operation
 */
export function createOperation<T>(
  name: string,
  execute: () => Promise<T>,
  rollback?: () => Promise<void>
): TransactionOperation<T> {
  return { name, execute, rollback }
}

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number
    initialDelay?: number
    maxDelay?: number
    backoffMultiplier?: number
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffMultiplier = 2,
  } = options

  let lastError: Error | undefined
  let delay = initialDelay

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return fn()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error')
      
      if (attempt < maxRetries) {
        dbLogger.warn(
          { attempt: attempt + 1, maxRetries, delay, error: lastError },
          'Operation failed, retrying'
        )
        
        await new Promise(resolve => setTimeout(resolve, delay))
        delay = Math.min(delay * backoffMultiplier, maxDelay)
      }
    }
  }

  throw lastError ?? new Error('Max retries exceeded')
}

/**
 * Execute operations in parallel with error handling
 */
export async function executeParallel<T>(
  operations: Array<() => Promise<T>>,
  options: {
    maxConcurrency?: number
    continueOnError?: boolean
  } = {}
): Promise<Array<{ success: boolean; data?: T; error?: Error }>> {
  const { maxConcurrency = 5, continueOnError = false } = options

  const results: Array<{ success: boolean; data?: T; error?: Error }> = []
  const executing: Array<Promise<void>> = []

  for (const operation of operations) {
    const promise = (async () => {
      try {
        const data = await operation()
        results.push({ success: true, data })
      } catch (operationError) {
        const normalizedError = operationError instanceof Error ? operationError : new Error('Unknown error')
        results.push({ success: false, error: normalizedError })
        
        if (!continueOnError) {
          throw normalizedError
        }
      }
    })()

    executing.push(promise)

    if (executing.length >= maxConcurrency) {
      await Promise.race(executing)
      const index = executing.findIndex(p => p === promise)
      void executing.splice(index, 1)
    }
  }

  await Promise.all(executing)
  return results
}
