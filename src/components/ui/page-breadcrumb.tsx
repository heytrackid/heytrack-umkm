import { Fragment } from 'react'
import { PrefetchLink } from '@/components/ui/prefetch-link'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'

/**
 * Shared Page Breadcrumb Component
 * Standardized breadcrumb navigation for pages
 */

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
export const PageBreadcrumb = ({ items, className }: PageBreadcrumbProps) => (
  <Breadcrumb className={className}>
    <BreadcrumbList>
      {items.map((item, index) => (
        <Fragment key={item.label}>
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
        </Fragment>
      ))}
    </BreadcrumbList>
  </Breadcrumb>
)

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
    { label: 'Resep', href: '/recipes' }
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

  suppliers: [
    { label: 'Dashboard', href: '/' },
    { label: 'Supplier', href: '/suppliers' }
  ],

  supplierNew: [
    { label: 'Dashboard', href: '/' },
    { label: 'Supplier', href: '/suppliers' },
    { label: 'Tambah Supplier' }
  ],
}
