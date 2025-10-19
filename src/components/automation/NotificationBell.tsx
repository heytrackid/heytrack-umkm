'use client'

interface SmartNotification {
  id: string
  type: 'critical' | 'warning' | 'info' | 'success'
  category: 'inventory' | 'production' | 'financial' | 'order'
  title: string
  message: string
  action?: string
  priority: 'high' | 'medium' | 'low'
  timestamp: Date
  read: boolean
  data?: any
}

interface NotificationBellProps {
  unreadCount: number
  highPriorityCount: number
  onClick: () => void
}

export default function NotificationBell({ unreadCount, highPriorityCount, onClick }: NotificationBellProps) {
  return (
    <button
      onClick={onClick}
      className="relative p-2 rounded-md hover:bg-accent transition-colors"
      aria-label="Notifications"
    >
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5-5V9a7 7 0 0114 0v3l-5 5zM15 17v2a2 2 0 01-2 2H9a2 2 0 01-2-2v-2m6 0H9" />
      </svg>
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
      {highPriorityCount > 0 && (
        <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-600 rounded-full animate-pulse" />
      )}
    </button>
  )
}
