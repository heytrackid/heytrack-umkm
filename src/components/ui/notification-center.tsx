'use client'

import { useState, useEffect } from 'react'
import { Button } from './button'
import { Badge } from './badge'
import { ScrollArea } from './scroll-area'
import { cn } from '@/lib/utils'
import { Bell, X, Check, ExternalLink } from 'lucide-react'
import type { Notification, NotificationPriority } from '@/lib/notifications/notification-types'
import { animations } from '@/lib/animations'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

interface NotificationCenterProps {
  notifications: Notification[]
  onMarkAsRead: (id: string) => void
  onMarkAllAsRead: () => void
  onClearAll: () => void
  onNotificationClick?: (notification: Notification) => void
  className?: string
}

export const NotificationCenter = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAll,
  onNotificationClick,
  className
}: NotificationCenterProps) => {
  const [filterPriority, setFilterPriority] = useState<NotificationPriority | 'all'>('all')
  const [open, setOpen] = useState(false)

  const unreadCount = notifications.filter(n => !n.read).length
  
  const filteredNotifications = notifications.filter(n => {
    if (filterPriority === 'all') {return true}
    return n.priority === filterPriority
  })

  const handleNotificationClick = (notification: Notification) => {
    onMarkAsRead(notification.id)
    onNotificationClick?.(notification)
    
    // Navigate if has action URL
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn('relative', className)}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs animate-pulse"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-96 p-0" align="end">
        {/* Header */}
        <div className="p-4 border-b space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">Notifikasi</h3>
            <div className="flex items-center gap-2">
              {notifications.length > 0 && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onMarkAllAsRead}
                    className="h-8 text-xs"
                  >
                    <Check className="h-3 w-3 mr-1" />
                    Tandai Semua
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClearAll}
                    className="h-8 text-xs"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Hapus Semua
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Filter */}
          <div className="flex gap-2">
            {(['all', 'critical', 'high', 'medium', 'low'] as const).map((priority) => (
              <Button
                key={priority}
                variant={filterPriority === priority ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterPriority(priority)}
                className="h-7 text-xs"
              >
                {priority === 'all' ? 'Semua' : priority.charAt(0).toUpperCase() + priority.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {/* Notifications List */}
        <ScrollArea className="h-[400px]">
          {filteredNotifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p className="text-sm">Tidak ada notifikasi</p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredNotifications.map((notification, index) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onClick={() => handleNotificationClick(notification)}
                  onMarkAsRead={() => onMarkAsRead(notification.id)}
                  index={index}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}

// Individual notification item
interface NotificationItemProps {
  notification: Notification
  onClick: () => void
  onMarkAsRead: () => void
  index: number
}

const NotificationItem = ({ notification, onClick, onMarkAsRead, index }: NotificationItemProps) => {
  const priorityColors = {
    critical: 'border-l-red-500 bg-red-50 dark:bg-red-950/20',
    high: 'border-l-orange-500 bg-orange-50 dark:bg-orange-950/20',
    medium: 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950/20',
    low: 'border-l-blue-500 bg-blue-50 dark:bg-blue-950/20'
  }

  const timeAgo = getTimeAgo(notification.timestamp)

  return (
    <div
      className={cn(
        'p-4 border-l-4 cursor-pointer transition-all hover:bg-muted/50',
        animations.fadeInUp,
        !notification.read && 'bg-primary/5',
        priorityColors[notification.priority]
      )}
      style={animations.stagger(index, 30)}
      onClick={onClick}
    >
      <div className="flex gap-3">
        {/* Icon */}
        <div className="text-2xl flex-shrink-0 mt-1">
          {notification.icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-semibold text-sm">{notification.title}</h4>
            {!notification.read && (
              <Badge variant="default" className="h-2 w-2 p-0 rounded-full" />
            )}
          </div>
          
          <p className="text-sm text-muted-foreground line-clamp-2">
            {notification.message}
          </p>

          <div className="flex items-center gap-2 pt-1">
            <span className="text-xs text-muted-foreground">{timeAgo}</span>
            
            {notification.actionLabel && (
              <Button
                variant="link"
                size="sm"
                className="h-auto p-0 text-xs"
                onClick={(e) => {
                  e.stopPropagation()
                  onClick()
                }}
              >
                {notification.actionLabel}
                <ExternalLink className="h-3 w-3 ml-1" />
              </Button>
            )}
          </div>
        </div>

        {/* Mark as read button */}
        {!notification.read && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 flex-shrink-0"
            onClick={(e) => {
              e.stopPropagation()
              onMarkAsRead()
            }}
          >
            <Check className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}

// Time ago helper
function getTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
  
  if (seconds < 60) {return 'Baru saja'}
  if (seconds < 3600) {return `${Math.floor(seconds / 60)} menit lalu`}
  if (seconds < 86400) {return `${Math.floor(seconds / 3600)} jam lalu`}
  if (seconds < 604800) {return `${Math.floor(seconds / 86400)} hari lalu`}
  
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
}

// Simple notification badge (for nav)
export const NotificationBadge = ({ count, className }: { count: number; className?: string }) => {
  if (count === 0) {return null}

  return (
    <Badge 
      variant="destructive" 
      className={cn(
        'h-5 px-2 text-xs font-semibold animate-pulse',
        className
      )}
    >
      {count > 99 ? '99+' : count}
    </Badge>
  )
}
