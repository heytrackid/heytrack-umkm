'use client'
import * as React from 'react'

import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { LogOut } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'

// Dynamically import ExcelExportButton to reduce bundle size
const ExcelExportButton = dynamic(() => import('@/components/export/ExcelExportButton').then(mod => ({ default: mod.default })), {
  ssr: false,
  loading: () => <Skeleton className="w-full h-8" />
})

interface SidebarFooterProps {
  variant?: 'default' | 'mobile'
}

function SidebarFooter({ variant = 'default' }: SidebarFooterProps) {
  const { user, signOut, isLoading } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await signOut()
    router.push('/auth/login')
  }

  // Mobile footer is simplified or hidden
  if (variant === 'mobile') {
    return (
      <div className="flex-shrink-0 p-4 border-t border-border space-y-3">
        {user && (
          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs"
            onClick={handleLogout}
            disabled={isLoading}
          >
            <LogOut className="w-3 h-3 mr-2" />
            Logout
          </Button>
        )}
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            © 2025 HeyTrack
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-800 space-y-3">
      <Suspense fallback={<Skeleton className="w-full h-8" />}>
        <ExcelExportButton
          variant="outline"
          size="sm"
          className="w-full text-xs"
        />
      </Suspense>
      {user && (
        <Button
          variant="destructive"
          size="sm"
          className="w-full text-xs"
          onClick={handleLogout}
          disabled={isLoading}
        >
          <LogOut className="w-3 h-3 mr-2" />
          Logout
        </Button>
      )}
      <div className="mt-2 text-center">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          © 2025 HeyTrack
        </p>
      </div>
    </div>
  )
}


export default SidebarFooter
