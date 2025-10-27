import type { ComponentProps } from 'react'
import { Slot } from"@radix-ui/react-slot"
import { ChevronRight, MoreHorizontal } from"lucide-react"

import { cn } from"@/lib/utils"

const Breadcrumb = ({ ...props }: ComponentProps<'nav'>) => <nav aria-label="breadcrumb" data-slot="breadcrumb" {...props} />

const BreadcrumbList = ({ className, ...props }: ComponentProps<'ol'>) => (
    <ol
      data-slot="breadcrumb-list"
      className={cn(
       "text-muted-foreground flex flex-wrap items-center gap-1.5 text-sm break-words sm:gap-2.5",
        className
      )}
      {...props}
    />
  )

const BreadcrumbItem = ({ className, ...props }: ComponentProps<'li'>) => (
    <li
      data-slot="breadcrumb-item"
      className={cn("inline-flex items-center gap-1.5", className)}
      {...props}
    />
  )

const BreadcrumbLink = ({
  asChild,
  className,
  ...props
}: ComponentProps<'a'> & {
  asChild?: boolean
}) => {
  const Comp = asChild ? Slot :"a"

  return (
    <Comp
      data-slot="breadcrumb-link"
      className={cn("hover:text-foreground transition-colors", className)}
      {...props}
    />
  )
}

const BreadcrumbPage = ({ className, ...props }: ComponentProps<'span'>) => (
    <span
      data-slot="breadcrumb-page"
      role="link"
      aria-disabled="true"
      aria-current="page"
      className={cn("text-foreground font-normal", className)}
      {...props}
    />
  )

const BreadcrumbSeparator = ({
  children,
  className,
  ...props
}: ComponentProps<'li'>) => (
    <li
      data-slot="breadcrumb-separator"
      role="presentation"
      aria-hidden="true"
      className={cn("[&>svg]:size-3.5", className)}
      {...props}
    >
      {children ?? <ChevronRight />}
    </li>
  )

const BreadcrumbEllipsis = ({
  className,
  ...props
}: ComponentProps<'span'>) => (
    <span
      data-slot="breadcrumb-ellipsis"
      role="presentation"
      aria-hidden="true"
      className={cn("flex size-9 items-center justify-center", className)}
      {...props}
    >
      <MoreHorizontal className="size-4" />
      <span className="sr-only">More</span>
    </span>
  )

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
}
