import { useEffect, useRef } from 'react'
import { createClientLogger } from '@/lib/client-logger'

const logger = createClientLogger('Hook')

/**
 * Safely manage Web Worker message listeners with automatic cleanup
 * Prevents memory leaks from orphaned event listeners
 */
export function useWorkerMessage<TMessage = MessageEvent>(
  worker: Worker | null,
  handler: (event: TMessage) => void,
  deps: React.DependencyList = []
): void {
  const handlerRef = useRef(handler)

  // Update handler ref when it changes
  useEffect(() => {
    handlerRef.current = handler
  }, [handler])

  useEffect(() => {
    if (!worker) return

    const eventHandler = (event: MessageEvent): void => {
      handlerRef.current(event as TMessage)
    }

    worker.addEventListener('message', eventHandler)

    return () => {
      worker.removeEventListener('message', eventHandler)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [worker, ...deps])
}

/**
 * Hook for creating a Web Worker with guaranteed cleanup
 * Returns getters instead of direct values to avoid ref access during render
 */
export function useWorker(
  workerFactory: () => Worker,
  onReady?: () => void,
  onError?: (error: ErrorEvent) => void
): {
  getWorker: () => Worker | null
  getIsReady: () => boolean
  terminate: () => void
} {
  const workerRef = useRef<Worker | null>(null)
  const isReadyRef = useRef(false)
  const onReadyRef = useRef(onReady)
  const onErrorRef = useRef(onError)
  const workerFactoryRef = useRef(workerFactory)

  // Update refs when callbacks change
  useEffect(() => {
    onReadyRef.current = onReady
  }, [onReady])

  useEffect(() => {
    onErrorRef.current = onError
  }, [onError])

  useEffect(() => {
    workerFactoryRef.current = workerFactory
  }, [workerFactory])

  useEffect(() => {
    if (typeof Worker === 'undefined') {
      logger.warn({}, 'Web Workers not supported in this browser')
      return
    }

    try {
      workerRef.current = workerFactoryRef.current()

      const handleReady = (e: MessageEvent): void => {
        if (e.data?.type === 'READY') {
          isReadyRef.current = true
          onReadyRef.current?.()
        }
      }

      const handleError = (error: ErrorEvent): void => {
        onErrorRef.current?.(error)
      }

      workerRef.current.addEventListener('message', handleReady)
      workerRef.current.addEventListener('error', handleError)

      return () => {
        if (workerRef.current) {
          workerRef.current.removeEventListener('message', handleReady)
          workerRef.current.removeEventListener('error', handleError)
          workerRef.current.terminate()
          workerRef.current = null
        }
        isReadyRef.current = false
      }
    } catch (error) {
      logger.error({ error }, 'Failed to initialize worker')
      return
    }
  }, [])

  const terminate = (): void => {
    if (workerRef.current) {
      workerRef.current.terminate()
      workerRef.current = null
      isReadyRef.current = false
    }
  }

  const getWorker = (): Worker | null => workerRef.current
  const getIsReady = (): boolean => isReadyRef.current

  return {
    getWorker,
    getIsReady,
    terminate
  }
}
