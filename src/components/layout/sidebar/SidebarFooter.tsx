'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { LogOut } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'

// Dynamically import ExcelExportButton to reduce bundle size
const ExcelExportButton = dynamic(
  () => import(/* webpackChunkName: "excel-export-button" */ '@/components/export/ExcelExportButton'),
  {
    ssr: false,
    loading: () => <Skeleton className="w-full h-8" />
  }
)

interface SidebarFooterProps {
  variant?: 'default' | 'mobile'
}

const SidebarFooter = ({ variant = 'default' }: SidebarFooterProps) => {
  const { user, signOut, isLoading } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await signOut()
    void router.push('/auth/login')
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
    <div className="flex-shrink-0 p-4 border-t border-border space-y-3">
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
        <p className="text-xs text-muted-foreground">
          © 2025 HeyTrack
        </p>
      </div>
    </div>
  )
}


export default SidebarFooter
