/**
 * Base Mobile Chart Component
 * Shared chart container with mobile optimizations
 */

import { type ReactNode,  useState } from 'react'
import { useResponsive } from '@/hooks/useResponsive'
import { cn } from '@/lib/utils'
import { Maximize2, Minimize2, Download, Share2, TrendingDown, TrendingUp } from 'lucide-react'
import { Badge } from '../badge'
import { Button } from '../button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../card'
import type { BaseMobileChartProps } from './types'

const BaseMobileChart = ({
  data,
  title,
  description,
  height = 300,
  showFullscreen = false,
  showDownload = false,
  showShare = false,
  actions,
  trend,
  children
}: BaseMobileChartProps & { children: ReactNode }) => {
  const { isMobile } = useResponsive()
  const [isFullscreen, setIsFullscreen] = useState(false)

  const handleFullscreen = () => {
    void setIsFullscreen(!isFullscreen)
  }

  const getTrendColor = () => {
    if (!trend) {return 'secondary'}
    return trend.value > 0 ? 'default' : 'destructive'
  }

  const getTrendIcon = () => {
    if (!trend) {return null}
    return trend.value > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />
  }

  const chartHeight = isFullscreen ? '70vh' : (isMobile ? Math.min(height, 250) : height)

  return (
    <Card className={cn(
      "transition-all duration-200",
      isFullscreen && "fixed inset-4 z-50"
    )}>
      <CardHeader className={cn(
       "flex flex-row items-start justify-between space-y-0 pb-2",
        isMobile ?"p-4" :"p-6"
      )}>
        <div className="space-y-1 flex-1">
          {title && (
            <CardTitle className={cn(
             "flex items-center gap-2",
              isMobile ?"text-base" :"text-lg"
            )}>
              {title}
              {trend && (
                <Badge
                  variant={getTrendColor()}
                  className="flex items-center gap-1 text-xs"
                >
                  {getTrendIcon()}
                  {trend.value > 0 ? '+' : ''}{trend.value}%
                  {trend.label && <span className="ml-1">({trend.label})</span>}
                </Badge>
              )}
            </CardTitle>
          )}
          {description && (
            <CardDescription className={cn(
              isMobile ?"text-sm" :"text-sm"
            )}>
              {description}
            </CardDescription>
          )}
        </div>

        <div className="flex items-center gap-2">
          {actions}

          {(showFullscreen || showDownload || showShare) && (
            <div className="flex items-center gap-1">
              {showShare && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {/* Handle share */}}
                  className="h-8 w-8 p-0"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              )}
              {showDownload && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {/* Handle download */}}
                  className="h-8 w-8 p-0"
                >
                  <Download className="h-4 w-4" />
                </Button>
              )}
              {showFullscreen && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleFullscreen}
                  className="h-8 w-8 p-0"
                >
                  {isFullscreen ? (
                    <Minimize2 className="h-4 w-4" />
                  ) : (
                    <Maximize2 className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className={cn(
        isMobile ?"p-4 pt-0" :"p-6 pt-0"
      )}>
        <div style={{ height: chartHeight }}>
          {children}
        </div>
      </CardContent>
    </Card>
  )
}

export { BaseMobileChart }