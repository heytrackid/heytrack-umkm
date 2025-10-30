'use client'

import { useEffect, useState } from 'react'

/**
 * Hook to defer loading of non-critical features
 */
export function useDeferredLoad(delay = 1000) {
    const [isReady, setIsReady] = useState(false)

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsReady(true)
        }, delay)

        return () => clearTimeout(timer)
    }, [delay])

    return isReady
}

/**
 * Hook to load script only when needed
 */
export function useIdleCallback(callback: () => void, timeout = 2000) {
    useEffect(() => {
        if ('requestIdleCallback' in window) {
            const id = window.requestIdleCallback(callback, { timeout })
            return () => window.cancelIdleCallback(id)
        } 
            const timer = setTimeout(callback, timeout)
            return () => clearTimeout(timer)
        
    }, [callback, timeout])
}

/**
 * Component to defer rendering of non-critical content
 */
export const DeferredContent = ({
    children,
    delay = 1000,
    fallback = null
}: {
    children: React.ReactNode
    delay?: number
    fallback?: React.ReactNode
}) => {
    const isReady = useDeferredLoad(delay)

    if (!isReady) {
        return <>{fallback}</>
    }

    return <>{children}</>
}

/**
 * Hook to detect if user is idle
 */
export function useUserIdle(timeout = 5000) {
    const [isIdle, setIsIdle] = useState(false)

    useEffect(() => {
        let timer: NodeJS.Timeout

        const resetTimer = () => {
            setIsIdle(false)
            clearTimeout(timer)
            timer = setTimeout(() => setIsIdle(true), timeout)
        }

        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart']
        events.forEach(event => {
            document.addEventListener(event, resetTimer, true)
        })

        resetTimer()

        return () => {
            clearTimeout(timer)
            events.forEach(event => {
                document.removeEventListener(event, resetTimer, true)
            })
        }
    }, [timeout])

    return isIdle
}

/**
 * Preload resource when user is idle
 */
export function useIdlePreload(urls: string[]) {
    const isIdle = useUserIdle()

    useEffect(() => {
        if (!isIdle) {return}

        urls.forEach(url => {
            const link = document.createElement('link')
            link.rel = 'prefetch'
            link.href = url
            document.head.appendChild(link)
        })
    }, [isIdle, urls])
}
