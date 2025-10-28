import { dbLogger } from '@/lib/logger'
import { createClient } from '@/utils/supabase/client'
import type { Database } from '@/types/supabase-generated'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { ZodType } from 'zod'

/**
 * Structured environment for agent execution
 */
export interface AgentContext {
  correlationId: string
  userId?: string
  sessionId?: string
  featureFlags: Record<string, boolean>
  cache: Map<string, unknown>
  telemetry: {
    startTime: Date
    events: Array<{
      event: string
      timestamp: Date
      data?: Record<string, unknown>
    }>
  }
  supabase: SupabaseClient<Database>
}

/**
 * Declarative description of work to perform
 */
export interface AgentTask {
  id: string
  type: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  data: Record<string, unknown>
  metadata?: {
    createdAt: Date
    timeoutMs?: number
    retryCount?: number
    maxRetries?: number
  }
}

/**
 * Standardized success/failure payload
 */
export interface AgentResult<T = unknown> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: unknown
  }
  metadata: {
    correlationId: string
    duration: number
    taskId: string
  }
}

/**
 * Domain-specific error classes
 */
export class AgentError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: unknown
  ) {
    super(message)
    this.name = 'AgentError'
  }
}

export class ValidationError extends AgentError {
  constructor(message: string, details?: unknown) {
    super(message, 'VALIDATION_ERROR', details)
    this.name = 'ValidationError'
  }
}

export class ProcessingError extends AgentError {
  constructor(message: string, details?: unknown) {
    super(message, 'PROCESSING_ERROR', details)
    this.name = 'ProcessingError'
  }
}

/**
 * Create a new agent context
 */
export function createAgentContext(
  correlationId: string,
  userId?: string,
  sessionId?: string
): AgentContext {
  return {
    correlationId,
    userId,
    sessionId,
    featureFlags: {}, // TODO: Load from feature flags service
    cache: new Map<string, unknown>(),
    telemetry: {
      startTime: new Date(),
      events: []
    },
    supabase: createClient()
  }
}

/**
 * Create a logger for agents
 */
export function createAgentLogger(agentName: string, correlationId: string) {
  // For now, use dbLogger with correlationId in context
  return {
    info: (message: string, data?: Record<string, unknown>) => dbLogger.info({ agent: agentName, correlationId, ...data }, message),
    error: (data: Record<string, unknown>, message?: string) => dbLogger.error({ agent: agentName, correlationId, ...data }, message),
    warn: (message: string, data?: Record<string, unknown>) => dbLogger.warn({ agent: agentName, correlationId, ...data }, message),
    debug: (message: string, data?: Record<string, unknown>) => dbLogger.debug({ agent: agentName, correlationId, ...data }, message)
  }
}

/**
 * Execute an agent task with standardized error handling and telemetry
 */
export async function executeAgentTask<T>(
  agentName: string,
  task: AgentTask,
  context: AgentContext,
  executor: (task: AgentTask, context: AgentContext) => Promise<T>
): Promise<AgentResult<T>> {
  const logger = createAgentLogger(agentName, context.correlationId)
  const startTime = Date.now()

  try {
    logger.info(`Starting agent task ${task.id} of type ${task.type}`)

    // Add task start telemetry
    context.telemetry.events.push({
      event: 'agent.task.start',
      timestamp: new Date(),
      data: { taskId: task.id, type: task.type }
    })

    const result = await executor(task, context)

    const duration = Date.now() - startTime

    // Add task completion telemetry
    context.telemetry.events.push({
      event: 'agent.task.complete',
      timestamp: new Date(),
      data: { taskId: task.id, duration }
    })

    logger.info(`Completed agent task ${task.id} in ${duration}ms`)

    return {
      success: true,
      data: result,
      metadata: {
        correlationId: context.correlationId,
        duration,
        taskId: task.id
      }
    }

  } catch (error: unknown) {
    const duration = Date.now() - startTime

    // Add task error telemetry
    context.telemetry.events.push({
      event: 'agent.task.error',
      timestamp: new Date(),
      data: {
        taskId: task.id,
        error: error instanceof Error ? error.message : String(error)
      }
    })

    logger.error({
      error,
      taskId: task.id,
      duration
    }, `Failed agent task ${task.id}`)

    return {
      success: false,
      error: {
        code: error instanceof AgentError ? error.code : 'UNKNOWN_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        details: error
      },
      metadata: {
        correlationId: context.correlationId,
        duration,
        taskId: task.id
      }
    }
  }
}

/**
 * Validate agent task input using Zod schemas
 */
export function validateTask<T>(
  task: AgentTask,
  schema: ZodType<T>
): T {
  const result = schema.safeParse(task.data)

  if (!result.success) {
    throw new ValidationError('Invalid task data', result.error.flatten())
  }

  return result.data
}
