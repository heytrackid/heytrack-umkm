'use client'

import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import {
    AlertCircle,
    AlertTriangle,
    CheckCircle,
    Info,
    Package,
    ShoppingCart,
    Factory,
    DollarSign,
    Settings,
    X,
    Check,
    RefreshCw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import type { Notification } from '@/types/domain/notifications'

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
    success: 'text-green-500',
    alert: 'text-orange-500',
}

const priorityColors = {
    low: 'border-l-gray-300',
    normal: 'border-l-blue-400',
    high: 'border-l-orange-400',
    urgent: 'border-l-red-500',
}

export function NotificationList({
    notifications,
    isLoading,
    onMarkAllRead,
    onNotificationUpdate,
    onRefresh,
}: NotificationListProps) {
    const [filter, setFilter] = useState<'all' | 'unread'>('all')

    const filteredNotifications = notifications.filter((n) => {
        if (filter === 'unread') {
            return !n.is_read && !n.is_dismissed
        }
        return !n.is_dismissed
    })

    const unreadCount = notifications.filter((n) => !n.is_read && !n.is_dismissed).length

    const handleNotificationClick = (notification: Notification) => {
        if (!notification.is_read) {
            onNotificationUpdate(notification.id, { is_read: true })
        }

        if (notification.action_url) {
            window.location.href = notification.action_url
        }
    }

    const handleDismiss = (e: React.MouseEvent, notificationId: string) => {
        e.stopPropagation()
        onNotificationUpdate(notificationId, { is_dismissed: true })
    }

    const handleMarkAsRead = (e: React.MouseEvent, notificationId: string) => {
        e.stopPropagation()
        onNotificationUpdate(notificationId, { is_read: true })
    }

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
                {isLoading && filteredNotifications.length === 0 ? (
                    <div className="flex items-center justify-center h-32 text-muted-foreground">
                        <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                        Memuat...
                    </div>
                ) : filteredNotifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                        <Bell className="h-8 w-8 mb-2 opacity-50" />
                        <p className="text-sm">
                            {filter === 'unread' ? 'Tidak ada notifikasi baru' : 'Tidak ada notifikasi'}
                        </p>
                    </div>
                ) : (
                    <div className="divide-y">
                        {filteredNotifications.map((notification) => {
                            const TypeIcon = typeIcons[notification.type]
                            const CategoryIcon = categoryIcons[notification.category]
                            const typeColor = typeColors[notification.type]
                            const priorityColor = priorityColors[notification.priority || 'normal']

                            return (
                                <div
                                    key={notification.id}
                                    className={cn(
                                        'p-4 hover:bg-muted/50 cursor-pointer transition-colors border-l-4',
                                        !notification.is_read && 'bg-blue-50/50',
                                        priorityColor
                                    )}
                                    onClick={() => handleNotificationClick(notification)}
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
                                                    <div className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0" />
                                                )}
                                            </div>

                                            <p className="text-sm text-muted-foreground mb-2 text-wrap-mobile">
                                                {notification.message}
                                            </p>

                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-muted-foreground">
                                                    {formatDistanceToNow(new Date(notification.created_at), {
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
                                                            onClick={(e) => handleMarkAsRead(e, notification.id)}
                                                        >
                                                            <Check className="h-3.5 w-3.5" />
                                                        </Button>
                                                    )}
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7"
                                                        onClick={(e) => handleDismiss(e, notification.id)}
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
                )}
            </ScrollArea>
        </div>
    )
}

function Bell({ className }: { className?: string }) {
    return (
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
}
