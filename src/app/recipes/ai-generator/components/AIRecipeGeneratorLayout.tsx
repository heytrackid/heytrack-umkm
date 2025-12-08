'use client'

import { ChefHat } from '@/components/icons'
import { AppLayout } from '@/components/layout/app-layout'
import { PageHeader } from '@/components/layout/PageHeader'

import { SimpleRecipeGenerator } from './SimpleRecipeGenerator'

/**
 * AI Recipe Generator Page - Simplified Version
 * 
 * User cukup ketik apa yang mereka mau, AI akan generate resep lengkap.
 * Template prompts disediakan untuk membantu user yang bingung.
 */

const AIRecipeGeneratorPage = () => {
  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* Header */}
          <PageHeader
            title={
              <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                AI Resep Generator
              </span>
            }
            description="✨ Tulis apa yang ingin kamu buat, AI akan buatkan resep lengkap dengan HPP"
            icon={
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                <ChefHat className="h-7 w-7 text-white" />
              </div>
            }
          />

          {/* Simple Generator */}
          <SimpleRecipeGenerator />
        </div>
      </div>
    </AppLayout>
  )
}

export { AIRecipeGeneratorPage }
