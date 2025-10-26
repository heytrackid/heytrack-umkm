/**
 * Cron Scheduler Module
 * Core scheduling system for cron jobs
 */

import { cronLogger } from '@/lib/logger'
import type { CronJobInfo, JobSchedule } from './types'

export class CronScheduler {
  private static jobs: Map<string, JobSchedule> = new Map()

  /**
   * Register a cron job
   */
  static registerJob(name: string, schedule: string, handler: () => Promise<void>) {
    this.jobs.set(name, { name, schedule, handler })
    cronLogger.info({}, `Registered cron job: ${name} (${schedule})`)
  }

  /**
   * Run all scheduled jobs (simplified - in production, use a proper cron library)
   */
  static async runScheduledJobs() {
    const now = new Date()
    cronLogger.info({}, 'Starting scheduled job run')

    for (const [name, job] of this.jobs) {
      try {
        // Simple scheduling check (in production, use node-cron or similar)
        const shouldRun = this.shouldRunJob(name, job, now)

        if (shouldRun) {
          cronLogger.info({}, `Running job: ${name}`)
          await job.handler()
          job.lastRun = now
          cronLogger.info({}, `Completed job: ${name}`)
        }
      } catch (error) {
        cronLogger.error({ error: error instanceof Error ? error.message : String(error) }, `Error running job: ${name}`)
      }
    }
  }

  /**
   * Simple scheduling logic (replace with proper cron in production)
   */
  private static shouldRunJob(name: string, job: JobSchedule, now: Date): boolean {
    // This is a simplified implementation
    // In production, use a library like node-cron for proper scheduling

    if (!job.lastRun) return true

    const minutesSinceLastRun = (now.getTime() - job.lastRun.getTime()) / (1000 * 60)

    // Job schedules (simplified)
    switch (job.schedule) {
      case 'daily': return minutesSinceLastRun >= 1440 // 24 hours
      case 'hourly': return minutesSinceLastRun >= 60
      case 'every-5-minutes': return minutesSinceLastRun >= 5
      case 'weekly': return minutesSinceLastRun >= 10080 // 7 days
      default: return false
    }
  }

  /**
   * Get status of all jobs
   */
  static getJobStatus(): CronJobInfo[] {
    const status: CronJobInfo[] = []
    for (const [name, job] of this.jobs) {
      status.push({
        name,
        schedule: job.schedule,
        lastRun: job.lastRun?.toISOString(),
        status: job.lastRun ? 'active' : 'pending'
      })
    }
    return status
  }
}
