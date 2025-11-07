'use client'

import { Bell } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { createClientLogger } from '@/lib/client-logger'
import { playNotificationSound, playUrgentNotificationSound, setSoundEnabled, setSoundVolume } from '@/lib/notifications/sound'
import { useSupabase } from '@/providers/SupabaseProvider'

import { NotificationList } from './NotificationList'

import type { NotificationPreferences } from '@/types/domain/notification-preferences'
import type { Notification } from '@/types/domain/notifications'


const logger = createClientLogger('NotificationBell')

export const NotificationBell = () => {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [preferences, setPreferences] = useState<NotificationPreferences | null>(null)
    const lastNotificationIdRef = useRef<string | null>(null)
    const { supabase } = useSupabase()

    // Fetch user preferences
    const fetchPreferences = useCallback(async () => {
        try {
            const response = await fetch('/api/notifications/preferences', {
                credentials: 'include', // Include cookies for authentication
            })
            if (response.ok) {
                const prefs = await response.json() as NotificationPreferences
                setPreferences(prefs)

                // Update sound settings
                setSoundEnabled(prefs.sound_enabled ?? false)
                setSoundVolume(prefs.sound_volume ?? 50)
            }
        } catch (error: unknown) {
            // Silent fail - preferences are non-critical
            if (process['env'].NODE_ENV === 'development') {
                logger.error({ error }, 'Failed to fetch preferences')
            }
        }
    }, [])

    const fetchNotifications = useCallback(async () => {
        try {
            setIsLoading(true)
            const response = await fetch('/api/notifications?limit=20', {
                credentials: 'include', // Include cookies for authentication
            })
            if (response.ok) {
                const _data = await response.json() as { notifications?: Notification[]; unread_count?: number }
                const newNotifications = _data.notifications ?? []

                // Check for new notification and play sound
                if (newNotifications.length > 0 && preferences) {
                    const latestNotif = newNotifications[0]!

                    // Only play sound if it's a new notification
                    if (latestNotif.id !== lastNotificationIdRef.current) {
                        lastNotificationIdRef.current = latestNotif.id

                        // Check if we should play sound based on preferences
                        const shouldPlaySound = preferences.sound_enabled &&
                            !latestNotif.is_read &&
                            (!preferences.sound_for_urgent_only || latestNotif.priority === 'urgent')

                        if (shouldPlaySound) {
                            if (latestNotif.priority === 'urgent') {
                                playUrgentNotificationSound(preferences.sound_volume ?? undefined)
                            } else {
                                playNotificationSound(preferences.sound_volume ?? undefined)
                            }
                        }
                    }
                }

                setNotifications(newNotifications)
                setUnreadCount(_data.unread_count ?? 0)
            }
        } catch (error: unknown) {
            // Silent fail - will retry on next fetch
            if (process['env'].NODE_ENV === 'development') {
                logger.error({ error }, 'Failed to fetch notifications')
            }
        } finally {
            setIsLoading(false)
        }
    }, [preferences])

    useEffect(() => {
        void fetchPreferences()
    }, [fetchPreferences])

    useEffect(() => {
        if (!preferences) { return }

        void fetchNotifications()

        // Set up real-time subscription
        const channel = supabase
            .channel('notifications')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'notifications',
                },
                () => {
                    void fetchNotifications()
                }
            )
            .subscribe((status) => {
                // Suppress WebSocket errors in console - they're handled by Supabase internally
                if (status === 'CHANNEL_ERROR') {
                    // Silently handle channel errors without logging to console
                    // The subscription will automatically retry
                }
            })

        return () => {
            void supabase.removeChannel(channel)
        }
    }, [preferences, fetchNotifications, supabase])

    const handleMarkAllRead = async () => {
        try {
            const response = await fetch('/api/notifications/mark-all-read', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({}),
                credentials: 'include', // Include cookies for authentication
            })

            if (response.ok) {
                await fetchNotifications()
            }
        } catch (error: unknown) {
            // Silent fail - user can retry
            if (process['env'].NODE_ENV === 'development') {
                logger.error({ error }, 'Failed to mark all as read')
            }
        }
    }

    const handleNotificationUpdate = async (id: string, updates: { is_read?: boolean; is_dismissed?: boolean }) => {
        try {
            const response = await fetch(`/api/notifications/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates),
                credentials: 'include', // Include cookies for authentication
            })

            if (response.ok) {
                await fetchNotifications()
            }
        } catch (error: unknown) {
            // Silent fail - user can retry
            if (process['env'].NODE_ENV === 'development') {
                logger.error({ error }, 'Failed to update notification')
            }
        }
    }

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative"
                    aria-label="Notifications"
                >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                        >
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </Badge>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className="w-[95vw] sm:w-[380px] p-0"
                align="end"
                sideOffset={8}
            >
                <NotificationList
                    notifications={notifications}
                    isLoading={isLoading}
                    onMarkAllRead={handleMarkAllRead}
                    onNotificationUpdate={handleNotificationUpdate}
                    onRefresh={fetchNotifications}
                />
            </PopoverContent>
        </Popover>
    )
}
