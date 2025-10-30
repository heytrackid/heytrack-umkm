'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { NotificationList } from './NotificationList'
import { createClient } from '@/utils/supabase/client'
import type { Notification } from '@/types/domain/notifications'
import type { NotificationPreferences } from '@/types/domain/notification-preferences'
import { playNotificationSound, playUrgentNotificationSound, setSoundEnabled, setSoundVolume } from '@/lib/notifications/sound'

export function NotificationBell() {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [preferences, setPreferences] = useState<NotificationPreferences | null>(null)
    const lastNotificationIdRef = useRef<string | null>(null)

    // Fetch user preferences
    const fetchPreferences = useCallback(async () => {
        try {
            const response = await fetch('/api/notifications/preferences')
            if (response.ok) {
                const prefs = await response.json()
                setPreferences(prefs)

                // Update sound settings
                setSoundEnabled(prefs.sound_enabled)
                setSoundVolume(prefs.sound_volume)
            }
        } catch (error) {
            console.error('Failed to fetch preferences:', error)
        }
    }, [])

    const fetchNotifications = useCallback(async () => {
        try {
            setIsLoading(true)
            const response = await fetch('/api/notifications?limit=20')
            if (response.ok) {
                const data = await response.json()
                const newNotifications = data.notifications || []

                // Check for new notification and play sound
                if (newNotifications.length > 0 && preferences) {
                    const latestNotif = newNotifications[0]

                    // Only play sound if it's a new notification
                    if (latestNotif.id !== lastNotificationIdRef.current) {
                        lastNotificationIdRef.current = latestNotif.id

                        // Check if we should play sound based on preferences
                        const shouldPlaySound = preferences.sound_enabled &&
                            !latestNotif.is_read &&
                            (!preferences.sound_for_urgent_only || latestNotif.priority === 'urgent')

                        if (shouldPlaySound) {
                            if (latestNotif.priority === 'urgent') {
                                playUrgentNotificationSound(preferences.sound_volume)
                            } else {
                                playNotificationSound(preferences.sound_volume)
                            }
                        }
                    }
                }

                setNotifications(newNotifications)
                setUnreadCount(data.unread_count || 0)
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error)
        } finally {
            setIsLoading(false)
        }
    }, [preferences])

    useEffect(() => {
        fetchPreferences()
    }, [fetchPreferences])

    useEffect(() => {
        if (!preferences) return

        fetchNotifications()

        // Set up real-time subscription
        const supabase = createClient()

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
                    fetchNotifications()
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [preferences, fetchNotifications])

    const handleMarkAllRead = async () => {
        try {
            const response = await fetch('/api/notifications/mark-all-read', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({}),
            })

            if (response.ok) {
                await fetchNotifications()
            }
        } catch (error) {
            console.error('Failed to mark all as read:', error)
        }
    }

    const handleNotificationUpdate = async (id: string, updates: { is_read?: boolean; is_dismissed?: boolean }) => {
        try {
            const response = await fetch(`/api/notifications/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates),
            })

            if (response.ok) {
                await fetchNotifications()
            }
        } catch (error) {
            console.error('Failed to update notification:', error)
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
                    preferences={preferences}
                />
            </PopoverContent>
        </Popover>
    )
}
