'use client'

import React from 'react'
import AppLayout from '@/components/layout/app-layout'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { PrefetchLink } from '@/components/ui/prefetch-link'
import { RecipeGenerator } from './components/RecipeGenerator'

export default function RecipeGeneratorPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <PrefetchLink href="/dashboard">Dashboard</PrefetchLink>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <PrefetchLink href="/ai">AI Assistant</PrefetchLink>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>New Features</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Main Content */}
        <RecipeGenerator />
      </div>
    </AppLayout>
  )
}
