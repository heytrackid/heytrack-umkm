'use client'

import { useState } from 'react'

interface UseExpandedStateReturn {
    expandedIds: Set<string>
    toggleExpanded: (id: string) => void
}

export function useExpandedState(): UseExpandedStateReturn {
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

    const toggleExpanded = (id: string) => {
        setExpandedIds(prev => {
            const newSet = new Set(prev)
            if (newSet.has(id)) {
                newSet.delete(id)
            } else {
                newSet.add(id)
            }
            return newSet
        })
    }

    return {
        expandedIds,
        toggleExpanded
    }
}
