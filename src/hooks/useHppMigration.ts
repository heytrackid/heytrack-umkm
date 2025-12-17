import { useToast } from '@/hooks/use-toast'
import { useEffect, useState } from 'react'

/**
 * Hook to handle one-time HPP recalculation migration
 * Automatically recalculates all HPP with improved accuracy formula
 * on first app load after deployment
 */
export function useHppMigration() {
  const { toast } = useToast()
  const [isRecalculating, setIsRecalculating] = useState(false)
  const MIGRATION_KEY = 'hpp_accuracy_migration_v1'

  useEffect(() => {
    const runMigration = async () => {
      // Check if migration already completed
      const migrationCompleted = localStorage.getItem(MIGRATION_KEY)
      if (migrationCompleted === 'true') {
        return
      }

      // Check if already running
      if (isRecalculating) {
        return
      }

      try {
        setIsRecalculating(true)

        // Show initial toast
        toast({
          title: '✨ Updating HPP Calculations',
          description: 'Applying improved accuracy formula in the background...',
        })

        // Trigger background recalculation
        const response = await fetch('/api/hpp/calculate', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          throw new Error('Failed to recalculate HPP')
        }

        const result = await response.json()

        // Mark migration as completed
        localStorage.setItem(MIGRATION_KEY, 'true')

        // Show success toast
        toast({
          title: '✅ HPP Calculations Updated',
          description: `${result.calculated || result.results?.length || 0} recipes updated with improved accuracy formula`,
        })
      } catch (error) {
        // Don't show error to user, will retry on next load
        // Remove flag so it retries
        localStorage.removeItem(MIGRATION_KEY)
      } finally {
        setIsRecalculating(false)
      }
    }

    // Run migration after a short delay to not block initial render
    const timer = setTimeout(() => {
      runMigration()
    }, 2000)

    return () => clearTimeout(timer)
  }, [toast, isRecalculating])

  return { isRecalculating }
}
