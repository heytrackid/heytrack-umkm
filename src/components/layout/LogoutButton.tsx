'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { toast } from 'sonner'
import { uiLogger } from '@/lib/logger'



interface LogoutButtonProps {
    collapsed?: boolean
}

export const LogoutButton = ({ collapsed = false }: LogoutButtonProps = {}) => {
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
        } catch (error: unknown) {
            // Silent fail - user can retry
            if (process.env.NODE_ENV === 'development') {
                uiLogger.error({ error }, 'Logout error')
            }
            toast.error('Logout gagal. Silakan coba lagi.')
            setIsLoggingOut(false)
        }
    }

    const getButtonTitle = () => {
        if (!collapsed) {return undefined}
        return isLoggingOut ? 'Logging out...' : 'Logout'
    }

    const getButtonText = () => {
        if (collapsed) {return null}
        return isLoggingOut ? 'Logging out...' : 'Logout'
    }

    return (
        <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-all duration-200 hover:bg-destructive/10 hover:text-destructive hover:scale-105 text-muted-foreground disabled:opacity-50 disabled:cursor-not-allowed ${collapsed ? 'w-auto justify-center' : 'w-full'}`}
            title={getButtonTitle()}
        >
            <LogOut className="h-4 w-4 flex-shrink-0" />
            {!collapsed && <span>{getButtonText()}</span>}
        </button>
    )
}
