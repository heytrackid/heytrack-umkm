'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { toast } from 'sonner'

export const LogoutButton = () => {
    const [isLoggingOut, setIsLoggingOut] = useState(false)
    const router = useRouter()

    const handleLogout = async () => {
        try {
            setIsLoggingOut(true)

            const response = await fetch('/auth/signout', {
                method: 'POST',
            })

            if (response.ok) {
                toast.success('Berhasil logout')
                router.push('/auth/login')
                router.refresh()
            } else {
                throw new Error('Logout gagal')
            }
        } catch (error) {
            console.error('Logout error:', error)
            toast.error('Logout gagal. Silakan coba lagi.')
            setIsLoggingOut(false)
        }
    }

    return (
        <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors hover:bg-destructive/10 hover:text-destructive text-muted-foreground disabled:opacity-50 disabled:cursor-not-allowed"
        >
            <LogOut className="h-4 w-4 flex-shrink-0" />
            <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
        </button>
    )
}
