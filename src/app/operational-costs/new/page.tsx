'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

const NewOperationalCostPage = (): JSX.Element => {
    const router = useRouter()
    
    useEffect(() => {
        // Redirect to main page - form is handled via dialog
        router.push('/operational-costs')
    }, [router])
    
    return null as unknown as React.ReactElement
}

export default NewOperationalCostPage