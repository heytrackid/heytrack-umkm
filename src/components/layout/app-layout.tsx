'use client'

import { ReactNode } from 'react'
import AppSidebar from './sidebar'
import { Search, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import SmartNotifications from '@/components/automation/smart-notifications'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'

interface AppLayoutProps {
  children: ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <div className="flex h-screen bg-background">
        <AppSidebar />
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <header className="flex h-16 items-center justify-between bg-card border-b border-border px-6">
          <div className="flex items-center space-x-4">
            <SidebarTrigger className="md:hidden" />
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Cari resep, bahan, pesanan..."
                className="w-64 pl-8"
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <SmartNotifications />
            <ThemeToggle />
            <Button variant="ghost" size="icon">
              <User className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6 bg-background">
          {children}
        </main>
      </div>
    </div>
    </SidebarProvider>
  )
}
