/**
 * Shared Page Breadcrumb Component
 * Standardized breadcrumb navigation for pages
 */

import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { PrefetchLink } from '@/components/ui/prefetch-link'

export interface BreadcrumbItem {
  label: string
  href?: string
}

interface PageBreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
}

/**
 * Standardized breadcrumb component for all pages
 */
export function PageBreadcrumb({ items, className }: PageBreadcrumbProps) {
  return (
    <Breadcrumb className={className}>
      <BreadcrumbList>
        {items.map((item, index) => (
          <React.Fragment key={item.label}>
            <BreadcrumbItem>
              {item.href ? (
                <BreadcrumbLink asChild>
                  <PrefetchLink href={item.href}>
                    {item.label}
                  </PrefetchLink>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
            {index < items.length - 1 && <BreadcrumbSeparator />}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}

/**
 * Predefined breadcrumb patterns for common pages
 */
export const BreadcrumbPatterns = {
  dashboard: [
    { label: 'Dashboard' }
  ],

  ingredients: [
    { label: 'Dashboard', href: '/' },
    { label: 'Bahan Baku', href: '/ingredients' }
  ],

  ingredientNew: [
    { label: 'Dashboard', href: '/' },
    { label: 'Bahan Baku', href: '/ingredients' },
    { label: 'Tambah Bahan Baku' }
  ],

  recipes: [
    { label: 'Dashboard', href: '/' },
    { label: 'Resep', href: '/resep' }
  ],

  orders: [
    { label: 'Dashboard', href: '/' },
    { label: 'Pesanan', href: '/orders' }
  ],

  customers: [
    { label: 'Dashboard', href: '/' },
    { label: 'Pelanggan', href: '/customers' }
  ],

  hpp: [
    { label: 'Dashboard', href: '/' },
    { label: 'HPP & Pricing', href: '/hpp' }
  ],
}

// Import React for Fragment
import * as React from 'react'
