'use client';

import * as TabsPrimitive from"@radix-ui/react-tabs"

import { cn } from"@/lib/utils"

import type { ComponentProps } from 'react'




const Tabs = ({
  className,
  ...props
}: ComponentProps<typeof TabsPrimitive.Root>) => (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  )

const TabsList = ({
  className,
  ...props
}: ComponentProps<typeof TabsPrimitive.List>) => (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
       "bg-muted text-muted-foreground inline-flex h-10 w-fit items-center justify-center rounded-lg p-1 gap-1",
        className
      )}
      {...props}
    />
  )

const TabsTrigger = ({
  className,
  ...props
}: ComponentProps<typeof TabsPrimitive.Trigger>) => (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
       "inline-flex h-8 flex-1 items-center justify-center gap-2 rounded-md border border-transparent px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-all",
       "text-muted-foreground hover:text-foreground",
       "data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
       "dark:data-[state=active]:bg-gray-800 dark:text-gray-400 dark:hover:text-gray-200",
       "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
       "disabled:pointer-events-none disabled:opacity-50",
       "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:size-4",
        className
      )}
      {...props}
    />
  )

const TabsContent = ({
  className,
  ...props
}: ComponentProps<typeof TabsPrimitive.Content>) => (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  )

export { Tabs, TabsList, TabsTrigger, TabsContent }
