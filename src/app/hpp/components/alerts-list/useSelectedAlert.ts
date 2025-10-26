'use client'

import { useState } from 'react'
import type { HPPAlert } from '@/types/hpp-tracking'

type AlertWithRecipe = HPPAlert & { recipes?: { name: string } }

interface UseSelectedAlertReturn {
    selectedAlert: AlertWithRecipe | null
    setSelectedAlert: (alert: AlertWithRecipe | null) => void
}

export function useSelectedAlert(): UseSelectedAlertReturn {
    const [selectedAlert, setSelectedAlert] = useState<AlertWithRecipe | null>(null)

    return {
        selectedAlert,
        setSelectedAlert
    }
}
