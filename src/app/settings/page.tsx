'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { toast } from 'react-hot-toast'
import dynamic from 'next/dynamic'
import AppLayout from '@/components/layout/app-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useSettings, currencies, languages } from '@/contexts/settings-context'
import { useLoading } from '@/hooks/useLoading'
import { FormFieldSkeleton } from '@/components/ui/skeletons/form-skeletons'
import { StatsCardSkeleton } from '@/components/ui/skeletons/dashboard-skeletons'

// Breadcrumb components
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'

// Tabs components
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Icons
import { Settings, RotateCcw, Save } from 'lucide-react'
// Dynamic import to reduce bundle size
const ExcelExportButton = dynamic(() => import('@/components/ui/ExcelExportButton'), {
  ssr: false,
  loading: () => <div className="h-10 w-32 bg-gray-200 animate-pulse rounded" />
})

// Extracted components
import { SettingsQuickLinks } from './components/SettingsQuickLinks'
import { BusinessInfoSettings } from './components/BusinessInfoSettings'
import { RegionalSettings } from './components/RegionalSettings'
import { ProfileSettings } from './components/ProfileSettings'
import { SecuritySettings } from './components/SecuritySettings'
import { NotificationSettings } from './components/NotificationSettings'
import { BackupSettings } from './components/BackupSettings'
import { BusinessSettings } from './components/BusinessSettings'
import { DangerZone } from './components/DangerZone'
import { UIThemeSettings } from './components/UIThemeSettings'
import { DateTimeSettings } from './components/DateTimeSettings'
import { NumberCurrencySettings } from './components/NumberCurrencySettings'
import { UnsavedChangesPrompt } from './components/UnsavedChangesPrompt'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

const LOADING_KEYS = {
  LOAD_SETTINGS: 'loadSettings',
  SAVE_SETTINGS: 'saveSettings'
} as const

export default function SettingsPage() {
  const { settings: globalSettings, updateCurrency, updateLanguage, formatCurrency } = useSettings()
  const { startLoading, stopLoading, isLoading: isSkeletonLoading } = useLoading()
  const [activeTab, setActiveTab] = useState('general')
  const [showPassword, setShowPassword] = useState(false)
  const [isUnsavedChanges, setIsUnsavedChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Settings state
  const [settings, setSettings] = useState({
    // General Settings
    general: {
      businessName: 'Toko Kue Bahagia',
      businessType: 'bakery',
      address: 'Jl. Raya Mawar No. 123, Jakarta Selatan',
      phone: '021-12345678',
      email: 'info@tokekuebahagia.com',
      website: 'www.tokekuebahagia.com',
      taxNumber: '12.345.678.9-012.000',
      currency: 'IDR',
      timezone: 'Asia/Jakarta'
    },
    
    // User Profile
    user: {
      fullName: 'Budi Santoso',
      email: 'budi@tokekuebahagia.com',
      phone: '08123456789',
      role: 'Owner',
      avatar: null
    },
    
    // Notifications
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      lowStockAlert: true,
      orderUpdates: true,
      dailyReports: true,
      weeklyReports: false,
      monthlyReports: true
    },
    
    // System Preferences
    system: {
      autoBackup: true,
      backupFrequency: 'daily',
      dataRetention: '365',
      defaultTax: '11',
      lowStockThreshold: '10'
    },
    
    // UI Preferences
    ui: {
      theme: 'system',
      language: 'id',
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '24h',
      currency: 'IDR',
      numberFormat: '1.234.567,89'
    }
  })

  // Load settings from database on component mount
  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      startLoading(LOADING_KEYS.LOAD_SETTINGS)
      
      // Simulate loading delay for demo
      await new Promise(resolve => setTimeou"")
      
      const { data, error } = await supabase
        .from('app_settings')
        .selec"Placeholder"
        .eq('user_id', 'default')
        .single()
      
      if (error) {
        console.error('Error loading settings:', error)
        toast.error("Placeholder")
        return
      }
      
      if (data?.settings_data) {
        setSettings(data.settings_data)
        console.log('✅ Settings loaded successfully:', data.settings_data)
      }
      
    } catch (error) {
      console.error('Error loading settings:', error)
      toast.error("Placeholder")
    } finally {
      stopLoading(LOADING_KEYS.LOAD_SETTINGS)
    }
  }

  const handleSettingChange = (category: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [key]: value
      }
    }))
    setIsUnsavedChanges(true)
  }

  const handleSave = async () => {
    setIsSaving(true)
    
    try {
      // Create or update settings in Supabase
      const settingsData = {
        user_id: 'default', // In real app, get from auth context
        settings_data: settings,
        updated_at: new Date().toISOString()
      }
      
      const { data, error } = await supabase
        .from('app_settings')
        .upsert(settingsData, {
          onConflict: 'user_id'
        })
        .selec""
      
      if (error) {
        throw error
      }
      
      console.log('✅ Settings saved successfully:', data)
      setIsUnsavedChanges(false)
      toast.success("Placeholder")
      
    } catch (error) {
      console.error('❌ Error saving settings:', error)
      toast.error("Placeholder")
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    // Reset to default values
    setIsUnsavedChanges(false)
    // Show reset confirmation
  }


  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">{"Placeholder"}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{"Placeholder"}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">{"Placeholder"}</h1>
            <p className="text-sm md:text-base text-muted-foreground">{"Placeholder"}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <ExcelExportButton variant="outline" className="hidden sm:inline-flex" />
            {isUnsavedChanges && (
              <Badge variant="outline" className="text-orange-600 border-orange-600 text-xs md:text-sm">
                {"Placeholder"}
              </Badge>
            )}
            <Button variant="outline" onClick={handleReset} size="sm" className="flex-1 sm:flex-none">
              <RotateCcw className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">{"Placeholder"}</span>
            </Button>
            <Button onClick={handleSave} disabled={isSaving} size="sm" className="flex-1 sm:flex-none">
              <Save className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">{isSaving ? "Placeholder" : "Placeholder"}</span>
              <span className="sm:hidden">{isSaving ? 'Saving...' : 'Save'}</span>
            </Button>
          </div>
        </div>

        {isSkeletonLoading(LOADING_KEYS.LOAD_SETTINGS) ? (
          <div className="space-y-4">
            {/* Quick Links Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }, (_, i) => (
                <StatsCardSkeleton key={i} />
              ))}
            </div>

            {/* Tabs Skeleton */}
            <Card>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Tab headers skeleton */}
                  <div className="flex space-x-2">
                    {Array.from({ length: 5 }, (_, i) => (
                      <div key={i} className="h-9 w-20 bg-gray-200 rounded-md animate-pulse"></div>
                    ))}
                  </div>
                  
                  {/* Form fields skeleton */}
                  <div className="space-y-6">
                    {Array.from({ length: 6 }, (_, i) => (
                      <FormFieldSkeleton key={i} />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <>
            <SettingsQuickLinks />

            {/* Settings Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-1">
                <TabsTrigger value="general" className="text-xs sm:text-sm">{"Placeholder"}</TabsTrigger>
                <TabsTrigger value="profile" className="text-xs sm:text-sm">{"Placeholder"}</TabsTrigger>
                <TabsTrigger value="notifications" className="text-xs sm:text-sm">{"Placeholder"}</TabsTrigger>
                <TabsTrigger value="system" className="text-xs sm:text-sm">{"Placeholder"}</TabsTrigger>
                <TabsTrigger value="ui" className="text-xs sm:text-sm">{"Placeholder"}</TabsTrigger>
              </TabsList>

              {/* General Settings */}
              <TabsContent value="general" className="space-y-6">
                <BusinessInfoSettings settings={settings} onSettingChange={handleSettingChange} />
                <RegionalSettings settings={settings} onSettingChange={handleSettingChange} />
              </TabsContent>

              {/* Profile Settings */}
              <TabsContent value="profile" className="space-y-6">
                <ProfileSettings settings={settings} onSettingChange={handleSettingChange} />
                <SecuritySettings />
              </TabsContent>

              {/* Notifications Settings */}
              <TabsContent value="notifications" className="space-y-6">
                <NotificationSettings settings={settings} onSettingChange={handleSettingChange} />
              </TabsContent>

              {/* System Settings */}
              <TabsContent value="system" className="space-y-6">
                <BackupSettings settings={settings} onSettingChange={handleSettingChange} />
                <BusinessSettings settings={settings} onSettingChange={handleSettingChange} />
                <DangerZone />
              </TabsContent>

              {/* UI Settings */}
              <TabsContent value="ui" className="space-y-6">
                <UIThemeSettings settings={settings} onSettingChange={handleSettingChange} />
                <DateTimeSettings settings={settings} onSettingChange={handleSettingChange} />
                <NumberCurrencySettings settings={settings} onSettingChange={handleSettingChange} />
              </TabsContent>
            </Tabs>
          </>
        )}

        <UnsavedChangesPrompt
          isUnsavedChanges={isUnsavedChanges}
          onReset={() => setIsUnsavedChanges(false)}
          onSave={handleSave}
          isSaving={isSaving}
        />
      </div>
    </AppLayout>
  )
}