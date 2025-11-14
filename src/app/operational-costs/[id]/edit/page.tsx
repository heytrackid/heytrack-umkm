'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface EditOperationalCostPageProps {
    params: {
        id: string
    }
}

const EditOperationalCostPage = ({ params }: EditOperationalCostPageProps): JSX.Element => {
    const router = useRouter()
    
    useEffect(() => {
        // Redirect to main page - form is handled via dialog
        router.push('/operational-costs')
    }, [router, params])
    
    return null as unknown as React.ReactElement
}

export default EditOperationalCostPage