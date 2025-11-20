'use client'

import { Bell, CheckCheck } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useNotifications } from '@/contexts/notification-context'
import { cn } from '@/lib/utils'

export function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications()
  const [open, setOpen] = useState(false)

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-600 ring-2 ring-background" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-4 py-2">
          <h3 className="text-sm font-semibold">Notifikasi</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto px-2 text-xs text-muted-foreground hover:text-primary"
              onClick={(e) => {
                e.preventDefault()
                void markAllAsRead()
              }}
            >
              <CheckCheck className="mr-1 h-3 w-3" />
              Tandai semua dibaca
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[300px]">
          {notifications.length === 0 ? (
            <div className="flex h-20 items-center justify-center text-sm text-muted-foreground">
              Belum ada notifikasi
            </div>
          ) : (
            <div className="grid gap-1 p-1">
              {notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className={cn(
                    'flex flex-col items-start gap-1 rounded-md p-3 focus:bg-accent cursor-pointer',
                    !notification.read && 'bg-muted/50'
                  )}
                  onClick={() => {
                    if (!notification.read) {
                        void markAsRead(notification.id)
                    }
                  }}
                >
                  <div className="flex w-full items-start justify-between gap-2">
                    <span className="text-sm font-medium leading-none">
                      {notification.title}
                    </span>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {new Date(notification.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {notification.message}
                  </p>
                </DropdownMenuItem>
              ))}
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
