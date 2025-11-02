import type { ComponentType, ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Edit, Trash2, MoreHorizontal, Download, Share, Plus } from 'lucide-react'

/**
 * Shared Detail View Components
 * Reusable detail view layouts and patterns
 */


// Detail view header with back button and actions
interface DetailHeaderProps {
  title: string
  subtitle?: string
  onBack?: () => void
  backLabel?: string
  actions?: ReactNode
  status?: ReactNode
}

export const DetailHeader = ({
  title,
  subtitle,
  onBack,
  backLabel = "Kembali",
  actions,
  status
}: DetailHeaderProps) => (
  <div className="flex items-start justify-between mb-6">
    <div className="flex items-start gap-4">
      {onBack && (
        <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
          <ArrowLeft className="h-4 w-4 mr-2" />
          {backLabel}
        </Button>
      )}

      <div>
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-2xl font-bold">{title}</h1>
          {status}
        </div>
        {subtitle && (
          <p className="text-muted-foreground">{subtitle}</p>
        )}
      </div>
    </div>

    {actions && (
      <div className="flex gap-2">
        {actions}
      </div>
    )}
  </div>
)

// Detail section with title and content
interface DetailSectionProps {
  title: string
  children: ReactNode
  className?: string
  actions?: ReactNode
}

export const DetailSection = ({ title, children, className, actions }: DetailSectionProps) => (
  <Card className={className}>
    <CardHeader className="flex flex-row items-center justify-between">
      <CardTitle className="text-lg">{title}</CardTitle>
      {actions}
    </CardHeader>
    <CardContent>
      {children}
    </CardContent>
  </Card>
)

// Detail field for displaying key-value pairs
interface DetailFieldProps {
  label: string
  value: ReactNode
  className?: string
  copyable?: boolean
}

export const DetailField = ({ label, value, className, copyable: _copyable }: DetailFieldProps) => (
  <div className={`flex justify-between items-start py-2 ${className ?? ''}`}>
    <span className="text-sm font-medium text-gray-600 min-w-0 flex-1">
      {label}
    </span>
    <span className="text-sm text-gray-900 ml-4 text-right">
      {value}
    </span>
  </div>
)

// Detail grid for multiple fields
interface DetailGridProps {
  fields: Array<{
    label: string
    value: ReactNode
    span?: number // 1-4 columns
  }>
  columns?: 1 | 2 | 3 | 4
}

export const DetailGrid = ({ fields, columns = 2 }: DetailGridProps) => {
  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  }

  return (
    <div className={`grid gap-4 ${gridClasses[columns]}`}>
      {fields.map((field, index) => (
        <div
          key={index}
          className={`p-4 bg-gray-50 rounded-lg ${field.span ? `md:col-span-${field.span}` : ''}`}
        >
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
            {field.label}
          </div>
          <div className="text-sm font-semibold text-gray-900">
            {field.value}
          </div>
        </div>
      ))}
    </div>
  )
}

// Detail actions bar
interface DetailActionsProps {
  onEdit?: () => void
  onDelete?: () => void
  onDuplicate?: () => void
  onShare?: () => void
  onDownload?: () => void
  customActions?: ReactNode
}

export const DetailActions = ({
  onEdit,
  onDelete,
  onDuplicate,
  onShare,
  onDownload,
  customActions
}: DetailActionsProps) => (
  <div className="flex flex-wrap gap-2 pt-4 border-t">
    {onEdit && (
      <Button variant="outline" onClick={onEdit}>
        <Edit className="h-4 w-4 mr-2" />
        Edit
      </Button>
    )}

    {onDelete && (
      <Button variant="outline" onClick={onDelete} className="text-red-600 hover:text-red-700">
        <Trash2 className="h-4 w-4 mr-2" />
        Hapus
      </Button>
    )}

    {onDuplicate && (
      <Button variant="outline" onClick={onDuplicate}>
        <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        Duplikat
      </Button>
    )}

    {onShare && (
      <Button variant="outline" onClick={onShare}>
        <Share className="h-4 w-4 mr-2" />
        Bagikan
      </Button>
    )}

    {onDownload && (
      <Button variant="outline" onClick={onDownload}>
        <Download className="h-4 w-4 mr-2" />
        Download
      </Button>
    )}

    {customActions}
  </div>
)

// Detail tabs layout
interface DetailTabsProps {
  tabs: Array<{
    id: string
    label: string
    content: ReactNode
    badge?: string | number
  }>
  activeTab: string
  onTabChange: (tabId: string) => void
}

export const DetailTabs = ({ tabs, activeTab, onTabChange }: DetailTabsProps) => (
  <div className="space-y-6">
    {/* Tab Navigation */}
    <div className="border-b">
      <nav className="-mb-px flex space-x-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${activeTab === tab.id
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            {tab.label}
            {tab.badge && (
              <Badge variant="secondary" className="text-xs">
                {tab.badge}
              </Badge>
            )}
          </button>
        ))}
      </nav>
    </div>

    {/* Tab Content */}
    <div>
      {tabs.find(tab => tab.id === activeTab)?.content}
    </div>
  </div>
)

// Timeline component for activity/history
interface TimelineItem {
  id: string
  timestamp: string | Date
  title: string
  description?: string
  user?: string
  type?: 'create' | 'update' | 'delete' | 'status_change' | 'note'
  icon?: ComponentType<{ className?: string }>
}

interface DetailTimelineProps {
  items: TimelineItem[]
  title?: string
}

export const DetailTimeline = ({ items, title = "Riwayat Aktivitas" }: DetailTimelineProps) => {
  const getIcon = (type?: string) => {
    const icons = {
      create: Plus,
      update: Edit,
      delete: Trash2,
      status_change: MoreHorizontal,
      note: MoreHorizontal
    }
    return icons[type as keyof typeof icons] || MoreHorizontal
  }

  return (
    <DetailSection title={title}>
      <div className="space-y-4">
        {items.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">
            Belum ada aktivitas tercatat
          </p>
        ) : (
          items.map((item, index) => {
            const Icon = item.icon ?? getIcon(item.type)
            const isLast = index === items.length - 1

            return (
              <div key={item.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Icon className="w-4 h-4 text-blue-600" />
                  </div>
                  {!isLast && <div className="w-px h-8 bg-gray-200 mt-2" />}
                </div>

                <div className="flex-1 pb-8">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">
                        {item.title}
                      </h4>
                      {item.description && (
                        <p className="text-sm text-gray-600 mt-1">
                          {item.description}
                        </p>
                      )}
                    </div>
                    <time className="text-xs text-gray-500">
                      {new Date(item.timestamp).toLocaleString('id-ID')}
                    </time>
                  </div>
                  {item.user && (
                    <p className="text-xs text-gray-500 mt-1">
                      Oleh: {item.user}
                    </p>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </DetailSection>
  )
}

// Import React for types