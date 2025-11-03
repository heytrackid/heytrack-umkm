'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  BarChart3,
  Eye,
  EyeOff,
  Grid3X3,
  GripVertical,
  Plus,
  Settings
} from 'lucide-react'
import React, { useEffect, useState } from 'react'

interface DashboardWidget {
  id: string
  title: string
  icon: React.ReactNode
  component: React.ReactNode
  visible: boolean
  position: number
}

interface DashboardLayout {
  [key: string]: {
    visible: boolean
    position: number
  }
}

interface DashboardCustomizationProps {
  children: React.ReactNode
  widgets: DashboardWidget[]
  layoutKey?: string
}

export const DashboardCustomization = ({
  children,
  widgets,
  layoutKey = 'heytrack_dashboard_layout'
}: DashboardCustomizationProps) => {
  const [isCustomizing, setIsCustomizing] = useState(false)
  const [layout, setLayout] = useState<DashboardLayout>({})
  const [draggedWidget, setDraggedWidget] = useState<string | null>(null)

  // Load saved layout from localStorage
  useEffect(() => {
    const savedLayout = localStorage.getItem(layoutKey)
    if (savedLayout) {
      try {
        const parsed = JSON.parse(savedLayout)
        setLayout(parsed)
      } catch {
        // If parsing fails, use default layout
        const defaultLayout: DashboardLayout = {}
        widgets.forEach((widget, index) => {
          defaultLayout[widget.id] = {
            visible: true,
            position: index
          }
        })
        setLayout(defaultLayout)
      }
    } else {
      // Initialize with default layout
      const defaultLayout: DashboardLayout = {}
      widgets.forEach((widget, index) => {
        defaultLayout[widget.id] = {
          visible: true,
          position: index
        }
      })
      setLayout(defaultLayout)
    }
  }, [layoutKey, widgets])

  // Save layout to localStorage when it changes
  useEffect(() => {
    if (Object.keys(layout).length > 0) {
      localStorage.setItem(layoutKey, JSON.stringify(layout))
    }
  }, [layout, layoutKey])

  // Handle drag start
  const handleDragStart = (e: React.DragEvent, widgetId: string) => {
    e.dataTransfer.setData('text/plain', widgetId)
    setDraggedWidget(widgetId)
  }

  // Handle drag over
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  // Handle drop
  const handleDrop = (e: React.DragEvent, targetWidgetId: string) => {
    e.preventDefault()
    const draggedId = e.dataTransfer.getData('text/plain')
    
    if (draggedId && draggedId !== targetWidgetId) {
      // Swap positions
      const currentLayout = { ...layout }
      const draggedPos = currentLayout[draggedId]?.position
      const targetPos = currentLayout[targetWidgetId]?.position
      
      if (draggedPos !== undefined && targetPos !== undefined) {
        // Update positions
        Object.keys(currentLayout).forEach(key => {
          if (currentLayout[key].position === draggedPos) {
            currentLayout[key] = { ...currentLayout[key], position: targetPos }
          } else if (currentLayout[key].position === targetPos) {
            currentLayout[key] = { ...currentLayout[key], position: draggedPos }
          }
        })
        
        setLayout(currentLayout)
      }
    }
    
    setDraggedWidget(null)
  }

  // Toggle widget visibility
  const toggleWidgetVisibility = (widgetId: string) => {
    setLayout(prev => ({
      ...prev,
      [widgetId]: {
        ...prev[widgetId],
        visible: !prev[widgetId].visible
      }
    }))
  }

  // Reset to default layout
  const resetLayout = () => {
    const defaultLayout: DashboardLayout = {}
    widgets.forEach((widget, index) => {
      defaultLayout[widget.id] = {
        visible: true,
        position: index
      }
    })
    setLayout(defaultLayout)
  }

  // Add new widget (example - in real implementation you might have a different mechanism)
  const addWidget = (_widgetType: string) => {
    const newWidgetId = `widget-${Date.now()}`
    setLayout(prev => ({
      ...prev,
      [newWidgetId]: {
        visible: true,
        position: Object.keys(prev).length
      }
    }))
  }

  // Get visible widgets sorted by position
  const visibleWidgets = [...widgets]
    .filter(widget => layout[widget.id]?.visible)
    .sort((a, b) => (layout[a.id]?.position || 0) - (layout[b.id]?.position || 0))

  return (
    <div className="space-y-6">
      {/* Customization Header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            Dasbor
          </h2>
          <p className="text-muted-foreground mt-1">
            Atur tampilan dasbor sesuai kebutuhan Anda
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button
            variant={isCustomizing ? 'default' : 'outline'}
            size="sm"
            onClick={() => setIsCustomizing(!isCustomizing)}
          >
            <Settings className="h-4 w-4 mr-2" />
            {isCustomizing ? 'Simpan Tampilan' : 'Atur Tampilan'}
          </Button>
          
          {isCustomizing && (
            <Button variant="outline" size="sm" onClick={resetLayout}>
              Reset
            </Button>
          )}
        </div>
      </div>

      {isCustomizing && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Grid3X3 className="h-5 w-5" />
              Susunan Widget
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Seret dan letakkan widget untuk mengatur posisinya. Gunakan toggle untuk menyembunyikan/menampilkan widget.
              </p>
              
              <div className="space-y-3">
                {widgets
                  .sort((a, b) => (layout[a.id]?.position || 0) - (layout[b.id]?.position || 0))
                  .map((widget) => (
                    <div
                      key={widget.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border ${
                        draggedWidget === widget.id ? 'bg-primary/10 border-primary' : ''
                      }`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, widget.id)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, widget.id)}
                    >
                      <div className="cursor-move opacity-70">
                        <GripVertical className="h-5 w-5" />
                      </div>
                      
                      <div className="flex items-center gap-2 flex-1">
                        <div className="p-2 rounded-md bg-muted">
                          {widget.icon}
                        </div>
                        <span className="font-medium">{widget.title}</span>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Switch
                          id={`toggle-${widget.id}`}
                          checked={layout[widget.id]?.visible}
                          onCheckedChange={() => toggleWidgetVisibility(widget.id)}
                        />
                        <Label htmlFor={`toggle-${widget.id}`} className="sr-only">
                          Toggle visibility
                        </Label>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => toggleWidgetVisibility(widget.id)}
                        >
                          {layout[widget.id]?.visible ? (
                            <Eye className="h-4 w-4" />
                          ) : (
                            <EyeOff className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
              
              <div className="pt-4">
                <Button size="sm" onClick={() => addWidget('new')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Widget
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {visibleWidgets.map((widget) => (
          <div
            key={widget.id}
            className="transition-all duration-200"
          >
            {widget.component}
          </div>
        ))}
      </div>

      {/* Render children (other content) */}
      {children}
    </div>
  )
}

// Export helper types and components for easy usage
export type { DashboardLayout, DashboardWidget }
