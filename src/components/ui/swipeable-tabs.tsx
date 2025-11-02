'use client'

import React, { type ComponentProps, useState, useEffect, useRef } from 'react'
import * as TabsPrimitive from '@radix-ui/react-tabs'
import { cn } from '@/lib/utils'
import { Button } from './button'
import { ChevronLeft, ChevronRight } from 'lucide-react'



interface SwipeableTabsProps extends ComponentProps<typeof TabsPrimitive.Root> {
  children: React.ReactNode
}

interface SwipeableTabsListProps extends ComponentProps<typeof TabsPrimitive.List> {
  children: React.ReactNode
  enableSwipe?: boolean
  className?: string
}

interface SwipeableTabsTriggerProps extends ComponentProps<typeof TabsPrimitive.Trigger> {
  children: React.ReactNode
  value: string
  className?: string
}

interface SwipeableTabsContentProps extends ComponentProps<typeof TabsPrimitive.Content> {
  children: React.ReactNode
  value: string
  className?: string
}

const SwipeableTabs = ({
  className,
  ...props
}: SwipeableTabsProps) => (
  <TabsPrimitive.Root
    data-slot="tabs"
    className={cn('flex flex-col gap-2', className)}
    {...props}
  />
)

const SwipeableTabsList = ({
  children,
  enableSwipe = true,
  className,
  ...props
}: SwipeableTabsListProps) => {
  const [isMobile, setIsMobile] = useState(false)
  const [isScrollable, setIsScrollable] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const childrenArray = React.Children.toArray(children)

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
      if (containerRef.current) {
        // Check if content overflows the container
        setIsScrollable(containerRef.current.scrollWidth > containerRef.current.clientWidth)
      }
    }

    checkIfMobile()
    window.addEventListener('resize', checkIfMobile)
    return () => window.removeEventListener('resize', checkIfMobile)
  }, [])

  const scrollLeft = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: -200, behavior: 'smooth' })
    }
  }

  const scrollRight = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: 200, behavior: 'smooth' })
    }
  }

  // Only show scroll buttons on mobile when content is scrollable
  const showScrollButtons = isMobile && isScrollable && enableSwipe

  return (
    <div className="relative">
      {showScrollButtons && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 p-0 rounded-full shadow-md"
          onClick={scrollLeft}
          aria-label="Scroll kiri"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      )}

      <TabsPrimitive.List
        ref={containerRef}
        data-slot="tabs-list"
        className={cn(
          'bg-muted text-muted-foreground inline-flex h-10 items-center justify-start overflow-x-auto rounded-lg p-1',
          showScrollButtons ? 'pl-10 pr-10' : 'px-2',
          className
        )}
        {...props}
      >
        {childrenArray.map((child, index) => (
          <div key={index} className="flex-shrink-0">
            {child}
          </div>
        ))}
      </TabsPrimitive.List>

      {showScrollButtons && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 p-0 rounded-full shadow-md"
          onClick={scrollRight}
          aria-label="Scroll kanan"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}

const SwipeableTabsTrigger = ({
  className,
  ...props
}: SwipeableTabsTriggerProps) => (
  <TabsPrimitive.Trigger
    data-slot="tabs-trigger"
    className={cn(
      'data-[state=active]:bg-background dark:data-[state=active]:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 text-foreground dark:text-muted-foreground inline-flex h-8 items-center justify-center gap-1.5 rounded-md border border-transparent px-3 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-[state=active]: [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:size-4',
      className
    )}
    {...props}
  />
)

const SwipeableTabsContent = ({
  className,
  ...props
}: SwipeableTabsContentProps) => (
  <TabsPrimitive.Content
    data-slot="tabs-content"
    className={cn('flex-1 outline-none', className)}
    {...props}
  />
)

export { SwipeableTabs, SwipeableTabsList, SwipeableTabsTrigger, SwipeableTabsContent }