'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import {
  Bell,
  Calendar,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Building,
  Users,
  Car,
  Phone,
  Wrench,
  Receipt,
  DollarSign,
  Target,
  BarChart3,
  Plus
} from 'lucide-react'
import { formatCurrency } from '@/shared/utils/currency'

interface AutomationRule {
  id: string
  name: string
  type: 'recurring' | 'budget_alert' | 'payment_reminder' | 'cost_optimization'
  category: string
  isActive: boolean
  config: any
  lastTriggered?: string
  nextTrigger?: string
}

interface ExpenseAlert {
  id: string
  type: 'overdue' | 'budget_exceeded' | 'recurring_due' | 'cost_spike'
  category: string
  title: string
  description: string
  amount?: number
  priority: 'high' | 'medium' | 'low'
  createdAt: string
}

const categoryIcons: Record<string, any> = {
  rent: Building,
  utilities: Zap,
  salary: Users,
  maintenance: Wrench,
  transport: Car,
  communication: Phone,
  other: Receipt
}

const sampleAutomationRules: AutomationRule[] = [
  {
    id: '1',
    name: 'Auto-generate Sewa Bulanan',
    type: 'recurring',
    category: 'rent',
    isActive: true,
    config: {
      amount: 5000000,
      schedule: 'monthly',
      day: 1,
      vendor: 'Tuan Tanah'
    },
    nextTrigger: '2024-02-01'
  },
  {
    id: '2',
    name: 'Alert Tagihan Listrik',
    type: 'payment_reminder',
    category: 'utilities',
    isActive: true,
    config: {
      reminderDays: 3,
      budgetLimit: 1000000
    },
    nextTrigger: '2024-01-28'
  },
  {
    id: '3',
    name: 'Budget Alert - Maintenance',
    type: 'budget_alert',
    category: 'maintenance',
    isActive: true,
    config: {
      monthlyBudget: 1500000,
      alertThreshold: 80
    },
    lastTriggered: '2024-01-25'
  },
  {
    id: '4',
    name: 'Optimize Transport Cost',
    type: 'cost_optimization',
    category: 'transport',
    isActive: true,
    config: {
      targetReduction: 15,
      analysisWindow: 30
    }
  },
  {
    id: '5',
    name: 'Weekly Salary Processing',
    type: 'recurring',
    category: 'salary',
    isActive: true,
    config: {
      amount: 2500000,
      schedule: 'weekly',
      day: 'friday'
    },
    nextTrigger: '2024-01-26'
  }
]

const sampleAlerts: ExpenseAlert[] = [
  {
    id: '1',
    type: 'recurring_due',
    category: 'rent',
    title: 'Sewa Bulanan Jatuh Tempo',
    description: 'Pembayaran sewa toko untuk bulan Februari akan jatuh tempo dalam 2 hari',
    amount: 5000000,
    priority: 'high',
    createdAt: '2024-01-30T08:00:00Z'
  },
  {
    id: '2',
    type: 'budget_exceeded',
    category: 'maintenance',
    title: 'Budget Maintenance Terlampaui',
    description: 'Biaya maintenance bulan ini sudah mencapai 120% dari budget yang ditetapkan',
    amount: 1800000,
    priority: 'high',
    createdAt: '2024-01-29T14:30:00Z'
  },
  {
    id: '3',
    type: 'cost_spike',
    category: 'utilities',
    title: 'Kenaikan Biaya Listrik',
    description: 'Tagihan listrik bulan ini naik 35% dibanding rata-rata 3 bulan terakhir',
    amount: 850000,
    priority: 'medium',
    createdAt: '2024-01-28T10:15:00Z'
  },
  {
    id: '4',
    type: 'overdue',
    category: 'communication',
    title: 'Tagihan Telpon Overdue',
    description: 'Pembayaran tagihan telpon sudah lewat 5 hari dari due date',
    amount: 150000,
    priority: 'medium',
    createdAt: '2024-01-27T16:45:00Z'
  }
]

export default function SmartExpenseAutomation() {
  const [automationRules, setAutomationRules] = useState(sampleAutomationRules)
  const [alerts, setAlerts] = useState(sampleAlerts)
  const [automationStats, setAutomationStats] = useState({
    totalRules: 5,
    activeRules: 4,
    alertsToday: 3,
    costSaved: 2500000,
    automatedPayments: 8
  })

  const toggleRule = (ruleId: string) => {
    setAutomationRules(prev =>
      prev.map(rule =>
        rule.id === ruleId ? { ...rule, isActive: !rule.isActive } : rule
      )
    )
  }

  const dismissAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId))
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-red-200'
      case 'medium': return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-yellow-200'
      case 'low': return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'recurring': return Calendar
      case 'budget_alert': return Target
      case 'payment_reminder': return Bell
      case 'cost_optimization': return TrendingUp
      default: return CheckCircle
    }
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'overdue': return AlertTriangle
      case 'budget_exceeded': return Target
      case 'recurring_due': return Calendar
      case 'cost_spike': return TrendingUp
      default: return Bell
    }
  }

  return (
    <div className="space-y-6">
      {/* Automation Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-orange-600" />
            Smart Expense Automation
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Otomatisasi biaya operasional dan alert cerdas untuk efisiensi maksimal
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">{automationStats.totalRules}</div>
              <p className="text-xs text-muted-foreground">Total Rules</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">{automationStats.activeRules}</div>
              <p className="text-xs text-muted-foreground">Active Rules</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{automationStats.alertsToday}</div>
              <p className="text-xs text-muted-foreground">Alerts Today</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                {formatCurrency(automationStats.costSaved)}
              </div>
              <p className="text-xs text-muted-foreground">Cost Saved</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">{automationStats.automatedPayments}</div>
              <p className="text-xs text-muted-foreground">Auto Payments</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Smart Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            Smart Alerts & Notifications
            <Badge variant="destructive" className="ml-auto">{alerts.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {alerts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-2 text-gray-600 dark:text-gray-400" />
                <p>Semua alert sudah ditangani! 🎉</p>
              </div>
            ) : (
              alerts.map((alert) => {
                const AlertIcon = getAlertIcon(alert.type)
                const CategoryIcon = categoryIcons[alert.category] || Receipt
                
                return (
                  <Alert key={alert.id} className={getPriorityColor(alert.priority)}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <AlertIcon className="h-5 w-5 mt-0.5" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{alert.title}</h4>
                            <Badge variant="outline" className="text-xs">
                              <CategoryIcon className="h-3 w-3 mr-1" />
                              {alert.category}
                            </Badge>
                            {alert.amount && (
                              <Badge variant="secondary" className="text-xs">
                                {formatCurrency(alert.amount)}
                              </Badge>
                            )}
                          </div>
                          <AlertDescription className="text-sm">
                            {alert.description}
                          </AlertDescription>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(alert.createdAt).toLocaleDateString('id-ID')} • 
                            Priority: {alert.priority.toUpperCase()}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => dismissAlert(alert.id)}
                        className="ml-2 shrink-0"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </Alert>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Automation Rules */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            Automation Rules
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Atur dan kelola aturan otomatisasi biaya operasional
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {automationRules.map((rule) => {
              const TypeIcon = getTypeIcon(rule.type)
              const CategoryIcon = categoryIcons[rule.category] || Receipt
              
              return (
                <div key={rule.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-full ${rule.isActive ? 'bg-gray-100 dark:bg-gray-800' : 'bg-gray-100'}`}>
                      <CategoryIcon className={`h-4 w-4 ${rule.isActive ? 'text-gray-600 dark:text-gray-400' : 'text-gray-500'}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{rule.name}</h4>
                        <Badge variant="outline" className="text-xs">
                          <TypeIcon className="h-3 w-3 mr-1" />
                          {rule.type.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Category: {rule.category}</span>
                        {rule.nextTrigger && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Next: {new Date(rule.nextTrigger).toLocaleDateString('id-ID')}
                          </span>
                        )}
                        {rule.config.amount && (
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            {formatCurrency(rule.config.amount)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={rule.isActive}
                      onCheckedChange={() => toggleRule(rule.id)}
                    />
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
          
          <div className="mt-6 pt-4 border-t">
            <Button className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Tambah Automation Rule Baru
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Budget Tracking */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            Budget Progress Tracking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(categoryIcons).map(([category, Icon]) => {
              const spent = Math.floor(Math.random() * 2000000) + 500000
              const budget = 2000000
              const percentage = Math.min((spent / budget) * 100, 100)
              
              return (
                <div key={category} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-gray-600" />
                      <span className="font-medium capitalize">{category}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatCurrency(spent)} / {formatCurrency(budget)}
                    </div>
                  </div>
                  <Progress 
                    value={percentage} 
                    className={`h-2 ${
                      percentage > 90 ? 'bg-gray-100 dark:bg-gray-800' : 
                      percentage > 70 ? 'bg-gray-100 dark:bg-gray-800' : 'bg-gray-100 dark:bg-gray-800'
                    }`}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{percentage.toFixed(1)}% used</span>
                    <span className={`${
                      percentage > 90 ? 'text-gray-600 dark:text-gray-400' : 
                      percentage > 70 ? 'text-gray-600 dark:text-gray-400' : 'text-gray-600 dark:text-gray-400'
                    }`}>
                      {percentage > 90 ? 'Over Budget' : 
                       percentage > 70 ? 'High Usage' : 'On Track'}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}