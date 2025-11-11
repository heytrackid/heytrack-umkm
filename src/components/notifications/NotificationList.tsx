'use client'

import { useVirtualizer } from '@tanstack/react-virtual'
import { formatDistanceToNow } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import {
    AlertCircle,
    AlertTriangle,
    Check,
    CheckCircle,
    DollarSign,
    Factory,
    Info,
    Package,
    RefreshCw,
    Settings,
    ShoppingCart,
    X,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

import type { Notification } from '@/types/domain/notifications'

// import { Separator } from '@/components/ui/separator'

interface NotificationListProps {
    notifications: Notification[]
    isLoading: boolean
    onMarkAllRead: () => void
    onNotificationUpdate: (id: string, updates: { is_read?: boolean; is_dismissed?: boolean }) => void
    onRefresh: () => void
}

const typeIcons = {
    info: Info,
    warning: AlertTriangle,
    error: AlertCircle,
    success: CheckCircle,
    alert: AlertCircle,
}

const categoryIcons = {
    inventory: Package,
    orders: ShoppingCart,
    production: Factory,
    finance: DollarSign,
    system: Settings,
}

const typeColors = {
    info: 'text-muted-foreground',
    warning: 'text-yellow-500',
    error: 'text-red-500',
    success: 'text-muted-foreground',
    alert: 'text-orange-500',
}

const priorityColors = {
    low: 'border-l-gray-300',
    normal: 'border-l-blue-400',
    high: 'border-l-orange-400',
    urgent: 'border-l-red-500',
}

export const NotificationList = ({
    notifications,
    isLoading,
    onMarkAllRead,
    onNotificationUpdate,
    onRefresh,
}: NotificationListProps) => {
    const router = useRouter()
    const [filter, setFilter] = useState<'all' | 'unread'>('all')
    const parentRef = useRef<HTMLDivElement>(null)

    const filteredNotifications = notifications.filter((n) => {
        if (filter === 'unread') {
            return !n.is_read && !n.is_dismissed
        }
        return !n.is_dismissed
    })

    const unreadCount = notifications.filter((n) => !n.is_read && !n.is_dismissed).length

    // Use virtual scrolling for large notification lists (>30 items)
    const useVirtualScrolling = filteredNotifications.length > 30

    const virtualizer = useVirtualizer({
        count: filteredNotifications.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 100, // Estimated height per notification
        overscan: 5,
    })

    const handleNotificationClick = useCallback((notification: Notification) => {
        if (!notification.is_read) {
            onNotificationUpdate(notification['id'], { is_read: true })
        }

        if (notification.action_url) {
            if (notification.action_url.startsWith('/')) {
                router.push(notification.action_url)
            } else {
                window.location.href = notification.action_url
            }
        }
    }, [onNotificationUpdate, router])

    const handleDismiss = useCallback((e: React.MouseEvent, notificationId: string) => {
        e.stopPropagation()
        onNotificationUpdate(notificationId, { is_dismissed: true })
    }, [onNotificationUpdate])

    const handleMarkAsRead = useCallback((e: React.MouseEvent, notificationId: string) => {
        e.stopPropagation()
        onNotificationUpdate(notificationId, { is_read: true })
    }, [onNotificationUpdate])

    return (
        <div className="flex flex-col h-[500px]">
            {/* Header */}
            <div className="p-4 border-b">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-lg">Notifikasi</h3>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onRefresh}
                        disabled={isLoading}
                    >
                        <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
                    </Button>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant={filter === 'all' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilter('all')}
                    >
                        Semua
                    </Button>
                    <Button
                        variant={filter === 'unread' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilter('unread')}
                    >
                        Belum Dibaca ({unreadCount})
                    </Button>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onMarkAllRead}
                            className="ml-auto"
                        >
                            Tandai Semua Dibaca
                        </Button>
                    )}
                </div>
            </div>

            {/* Notification List */}
            <ScrollArea className="flex-1">
                {isLoading && filteredNotifications.length === 0 && (
                    <div className="flex items-center justify-center h-32 text-muted-foreground">
                        <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                        Memuat...
                    </div>
                )}

                {!isLoading && filteredNotifications.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                        <Bell className="h-8 w-8 mb-2 opacity-50" />
                        <p className="text-sm">
                            {filter === 'unread' ? 'Tidak ada notifikasi baru' : 'Tidak ada notifikasi'}
                        </p>
                    </div>
                )}

                {filteredNotifications.length > 0 && (
                    useVirtualScrolling ? (
                        // Virtual scrolling for large lists
                        <div
                            ref={parentRef}
                            className="h-full overflow-auto"
                            style={{ contain: 'strict' }}
                        >
                            <div
                                style={{
                                    height: `${virtualizer.getTotalSize()}px`,
                                    width: '100%',
                                    position: 'relative',
                                }}
                            >
                                {virtualizer.getVirtualItems().map((virtualItem) => {
                                    const notification = filteredNotifications[virtualItem.index]
                                    if (!notification) {return null}
                                    const TypeIcon = typeIcons[notification['type'] as keyof typeof typeIcons] || Info
                                    const CategoryIcon = categoryIcons[notification.category as keyof typeof categoryIcons] || Settings
                                    const typeColor = typeColors[notification['type'] as keyof typeof typeColors] || 'text-muted-foreground'
                                    const priorityColor = priorityColors[(notification.priority ?? 'normal') as keyof typeof priorityColors] ?? 'border-l-blue-400'

                                    return (
                                        <div
                                            key={notification['id']}
                                            style={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                width: '100%',
                                                height: `${virtualItem.size}px`,
                                                transform: `translateY(${virtualItem.start}px)`,
                                            }}
                                        >
                                            <div
                                                className={cn(
                                                    'p-4 hover:bg-muted/50 cursor-pointer transition-colors border-l-4',
                                                    !notification.is_read && 'bg-muted/30',
                                                    priorityColor
                                                )}
                                                onClick={() => handleNotificationClick(notification)}
                                                onKeyDown={(e) => {
                                                  if (e.key === 'Enter' || e.key === ' ') {
                                                    handleNotificationClick(notification)
                                                  }
                                                }}
                                                role="button"
                                                tabIndex={0}
                                            >
                                                <div className="flex gap-3">
                                                    {/* Icon */}
                                                    <div className="flex-shrink-0">
                                                        <div className={cn('p-2 rounded-full bg-muted', typeColor)}>
                                                            <TypeIcon className="h-4 w-4" />
                                                        </div>
                                                    </div>

                                                    {/* Content */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-start justify-between gap-2 mb-1">
                                                            <div className="flex items-center gap-2">
                                                                <CategoryIcon className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                                                                <h4 className={cn(
                                                                    'font-medium text-sm text-wrap-mobile',
                                                                    !notification.is_read && 'font-semibold'
                                                                )}>
                                                                    {notification.title}
                                                                </h4>
                                                            </div>
                                                            <span className="text-xs text-muted-foreground flex-shrink-0">
                                                                {formatDistanceToNow(new Date(notification.created_at ?? new Date()), {
                                                                    addSuffix: true,
                                                                    locale: idLocale
                                                                })}
                                                            </span>
                                                        </div>

                                                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                                                            {notification.message}
                                                        </p>

                                                        {/* Action buttons */}
                                                        <div className="flex items-center gap-2">
                                                            {!notification.is_read && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleMarkAsRead(e, notification['id'])}
                                                                    className="h-6 px-2 text-xs"
                                                                >
                                                                    <Check className="h-3 w-3 mr-1" />
                                                                    Tandai Dibaca
                                                                </Button>
                                                            )}
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleDismiss(e, notification['id'])}
                                                                className="h-6 px-2 text-xs text-red-600 hover:text-red-700"
                                                            >
                                                                <X className="h-3 w-3 mr-1" />
                                                                Tutup
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    ) : (
                        // Regular rendering for small lists
                        <div className="divide-y">
                            {filteredNotifications.map((notification) => {
                            const TypeIcon = typeIcons[notification['type'] as keyof typeof typeIcons] || Info
                            const CategoryIcon = categoryIcons[notification.category as keyof typeof categoryIcons] || Settings
                            const typeColor = typeColors[notification['type'] as keyof typeof typeColors] || 'text-muted-foreground'
                            const priorityColor = priorityColors[(notification.priority ?? 'normal') as keyof typeof priorityColors] ?? 'border-l-blue-400'

                            return (
                                <div
                                    key={notification['id']}
                                    className={cn(
                                        'p-4 hover:bg-muted/50 cursor-pointer transition-colors border-l-4',
                                        !notification.is_read && 'bg-muted/30',
                                        priorityColor
                                    )}
                                    onClick={() => handleNotificationClick(notification)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter' || e.key === ' ') {
                                        handleNotificationClick(notification)
                                      }
                                    }}
                                    role="button"
                                    tabIndex={0}
                                >
                                    <div className="flex gap-3">
                                        {/* Icon */}
                                        <div className="flex-shrink-0">
                                            <div className={cn('p-2 rounded-full bg-muted', typeColor)}>
                                                <TypeIcon className="h-4 w-4" />
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2 mb-1">
                                                <div className="flex items-center gap-2">
                                                    <CategoryIcon className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                                                    <h4 className={cn(
                                                        'font-medium text-sm text-wrap-mobile',
                                                        !notification.is_read && 'font-semibold'
                                                    )}>
                                                        {notification.title}
                                                    </h4>
                                                </div>
                                                {!notification.is_read && (
                                                    <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                                                )}
                                            </div>

                                            <p className="text-sm text-muted-foreground mb-2 text-wrap-mobile">
                                                {notification.message}
                                            </p>

                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-muted-foreground">
                                                    {formatDistanceToNow(new Date(notification.created_at ?? new Date()), {
                                                        addSuffix: true,
                                                        locale: idLocale,
                                                    })}
                                                </span>

                                                <div className="flex items-center gap-1">
                                                    {!notification.is_read && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-7 w-7"
                                                            onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleMarkAsRead(e, notification['id'])}
                                                        >
                                                            <Check className="h-3.5 w-3.5" />
                                                        </Button>
                                                    )}
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7"
                                                        onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleDismiss(e, notification['id'])}
                                                    >
                                                        <X className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                        </div>
                    )
                )}
            </ScrollArea>
        </div>
    )
}

const Bell = ({ className }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
)
