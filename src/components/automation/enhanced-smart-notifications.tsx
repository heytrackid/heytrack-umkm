'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Bell, 
  AlertTriangle, 
  TrendingUp, 
  Package, 
  DollarSign,
  Settings,
  CheckCircle,
  X,
  BarChart3,
  Lightbulb,
  Target,
  Clock,
  Zap
} from 'lucide-react'
import { enhancedAutomationEngine } from '@/lib/enhanced-automation-engine'

interface SmartAlert {
  id: string
  type: 'CRITICAL' | 'WARNING' | 'INFO'
  category: 'INVENTORY' | 'PRODUCTION' | 'FINANCIAL' | 'QUALITY'
  title: string
  message: string
  priority_score: number
  context: {
    affected_recipes: string[]
    financial_impact: number
    urgency_timeline: string
    recommended_actions: string[]
  }
  smart_suggestions: string[]
  timestamp: Date
  acknowledged: boolean
}

interface TrendAlert {
  trend_type: 'DEMAND' | 'COST' | 'EFFICIENCY' | 'QUALITY'
  trend_direction: 'UP' | 'DOWN' | 'VOLATILE'
  confidence: number
  impact_prediction: string
  proactive_recommendations: string[]
}

interface BusinessInsight {
  key_metrics_status: 'HEALTHY' | 'CONCERNING' | 'CRITICAL'
  growth_opportunities: string[]
  risk_factors: string[]
  strategic_recommendations: string[]
}

export default function EnhancedSmartNotifications() {
  const [alerts, setAlerts] = useState<SmartAlert[]>([])
  const [trendAlerts, setTrendAlerts] = useState<TrendAlert[]>([])
  const [businessInsights, setBusinessInsights] = useState<BusinessInsight | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('priority')
  const [showSettings, setShowSettings] = useState(false)

  useEffect(() => {
    loadEnhancedNotifications()
    // Set up real-time updates every 5 minutes
    const interval = setInterval(loadEnhancedNotifications, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const loadEnhancedNotifications = async () => {
    try {
      setLoading(true)
      const contextualAlerts = await enhancedAutomationEngine.generateContextualAlerts()
      
      // Transform to UI format
      const formattedAlerts: SmartAlert[] = contextualAlerts.priority_alerts.map(alert => ({
        ...alert,
        timestamp: new Date(),
        acknowledged: false
      }))

      setAlerts(formattedAlerts)
      setTrendAlerts(contextualAlerts.trend_alerts)
      setBusinessInsights(contextualAlerts.business_insights)
    } catch (error) {
      console.error('Error loading enhanced notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      )
    )
  }

  const dismissAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId))
  }

  const getAlertIcon = (type: string, category: string) => {
    switch (category) {
      case 'INVENTORY': return Package
      case 'FINANCIAL': return DollarSign
      case 'PRODUCTION': return Settings
      case 'QUALITY': return CheckCircle
      default: return AlertTriangle
    }
  }

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'CRITICAL': return 'destructive'
      case 'WARNING': return 'outline'
      case 'INFO': return 'secondary'
      default: return 'secondary'
    }
  }

  const getTrendIcon = (trendType: string) => {
    switch (trendType) {
      case 'DEMAND': return TrendingUp
      case 'COST': return DollarSign
      case 'EFFICIENCY': return BarChart3
      case 'QUALITY': return CheckCircle
      default: return TrendingUp
    }
  }

  const criticalAlerts = alerts.filter(a => a.type === 'CRITICAL' && !a.acknowledged)
  const unacknowledgedCount = alerts.filter(a => !a.acknowledged).length

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Smart Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Smart Notifications
            {unacknowledgedCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unacknowledgedCount}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={loadEnhancedNotifications}
            >
              <Bell className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="priority" className="text-xs sm:text-sm">
              Priority
              {criticalAlerts.length > 0 && (
                <Badge variant="destructive" className="ml-1 h-4 w-4 p-0 text-xs">
                  {criticalAlerts.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="trends" className="text-xs sm:text-sm">
              Trends
            </TabsTrigger>
            <TabsTrigger value="insights" className="text-xs sm:text-sm">
              Insights
            </TabsTrigger>
            <TabsTrigger value="all" className="text-xs sm:text-sm">
              All ({alerts.length})
            </TabsTrigger>
          </TabsList>

          {/* Priority Alerts Tab */}
          <TabsContent value="priority" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">High Priority Alerts</h3>
              <Badge variant="outline">
                {criticalAlerts.length + alerts.filter(a => a.type === 'WARNING' && !a.acknowledged).length} active
              </Badge>
            </div>

            <ScrollArea className="h-80">
              <div className="space-y-3">
                {alerts
                  .filter(a => (a.type === 'CRITICAL' || a.type === 'WARNING') && !a.acknowledged)
                  .sort((a, b) => b.priority_score - a.priority_score)
                  .map((alert) => {
                    const Icon = getAlertIcon(alert.type, alert.category)
                    return (
                      <Card key={alert.id} className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <div className={`p-2 rounded-full ${
                              alert.type === 'CRITICAL' ? 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400' :
                              alert.type === 'WARNING' ? 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400' :
                              'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                            }`}>
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium text-sm">{alert.title}</h4>
                                <Badge variant={getAlertColor(alert.type)} className="text-xs">
                                  {alert.type}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {alert.message}
                              </p>
                              
                              {/* Context Information */}
                              <div className="space-y-2">
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <DollarSign className="h-3 w-3" />
                                    Impact: Rp {alert.context.financial_impact.toLocaleString()}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {alert.context.urgency_timeline}
                                  </span>
                                </div>
                                
                                {/* Smart Suggestions */}
                                {alert.smart_suggestions.length > 0 && (
                                  <div className="bg-gray-100 dark:bg-gray-800 border border-blue-200 rounded p-2">
                                    <div className="flex items-center gap-1 mb-1">
                                      <Lightbulb className="h-3 w-3 text-gray-600 dark:text-gray-400" />
                                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Smart Suggestions:</span>
                                    </div>
                                    {alert.smart_suggestions.slice(0, 2).map((suggestion, idx) => (
                                      <p key={idx} className="text-xs text-blue-700">
                                        • {suggestion}
                                      </p>
                                    ))}
                                  </div>
                                )}

                                {/* Recommended Actions */}
                                {alert.context.recommended_actions.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {alert.context.recommended_actions.slice(0, 2).map((action, idx) => (
                                      <Button
                                        key={idx}
                                        variant="outline"
                                        size="sm"
                                        className="text-xs h-6"
                                      >
                                        <Zap className="h-3 w-3 mr-1" />
                                        {action}
                                      </Button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-1 ml-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => acknowledgeAler""}
                              className="h-6 w-6 p-0"
                            >
                              <CheckCircle className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => dismissAler""}
                              className="h-6 w-6 p-0"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    )
                  })}

                {criticalAlerts.length === 0 && alerts.filter(a => a.type === 'WARNING' && !a.acknowledged).length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-gray-600 dark:text-gray-400" />
                    <p className="font-medium">All clear! 🎉</p>
                    <p className="text-sm">No high-priority alerts at the moment</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Trends Tab */}
          <TabsContent value="trends" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Predictive Trend Analysis</h3>
              <Badge variant="outline">
                {trendAlerts.length} trends detected
              </Badge>
            </div>

            <ScrollArea className="h-80">
              <div className="space-y-3">
                {trendAlerts.map((trend, idx) => {
                  const Icon = getTrendIcon(trend.trend_type)
                  return (
                    <Card key={idx} className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-sm">
                              {trend.trend_type} Trend
                            </h4>
                            <Badge variant={
                              trend.trend_direction === 'UP' ? 'default' :
                              trend.trend_direction === 'DOWN' ? 'destructive' :
                              'outline'
                            }>
                              {trend.trend_direction}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {(trend.confidence * 100).toFixed(0)}% confidence
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {trend.impact_prediction}
                          </p>
                          {trend.proactive_recommendations.length > 0 && (
                            <div className="space-y-1">
                              <span className="text-xs font-medium text-green-700">Proactive Actions:</span>
                              {trend.proactive_recommendations.map((rec, ridx) => (
                                <p key={ridx} className="text-xs text-gray-600 dark:text-gray-400">• {rec}</p>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  )
                })}

                {trendAlerts.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                    <p className="font-medium">Analyzing trends...</p>
                    <p className="text-sm">Predictive insights will appear here</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Business Insights Tab */}
          <TabsContent value="insights" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Business Intelligence</h3>
              {businessInsights && (
                <Badge variant={
                  businessInsights.key_metrics_status === 'HEALTHY' ? 'default' :
                  businessInsights.key_metrics_status === 'CONCERNING' ? 'outline' :
                  'destructive'
                }>
                  {businessInsights.key_metrics_status}
                </Badge>
              )}
            </div>

            <ScrollArea className="h-80">
              {businessInsights ? (
                <div className="space-y-4">
                  {/* Growth Opportunities */}
                  {businessInsights.growth_opportunities.length > 0 && (
                    <Card className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Target className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                        <h4 className="font-medium text-sm">Growth Opportunities</h4>
                      </div>
                      <div className="space-y-1">
                        {businessInsights.growth_opportunities.map((opportunity, idx) => (
                          <p key={idx} className="text-sm text-green-700">• {opportunity}</p>
                        ))}
                      </div>
                    </Card>
                  )}

                  {/* Risk Factors */}
                  {businessInsights.risk_factors.length > 0 && (
                    <Card className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                        <h4 className="font-medium text-sm">Risk Factors</h4>
                      </div>
                      <div className="space-y-1">
                        {businessInsights.risk_factors.map((risk, idx) => (
                          <p key={idx} className="text-sm text-red-700">• {risk}</p>
                        ))}
                      </div>
                    </Card>
                  )}

                  {/* Strategic Recommendations */}
                  {businessInsights.strategic_recommendations.length > 0 && (
                    <Card className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Lightbulb className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                        <h4 className="font-medium text-sm">Strategic Recommendations</h4>
                      </div>
                      <div className="space-y-1">
                        {businessInsights.strategic_recommendations.map((rec, idx) => (
                          <p key={idx} className="text-sm text-blue-700">• {rec}</p>
                        ))}
                      </div>
                    </Card>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Lightbulb className="h-12 w-12 mx-auto mb-4" />
                  <p className="font-medium">Generating insights...</p>
                  <p className="text-sm">Business intelligence will appear here</p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          {/* All Alerts Tab */}
          <TabsContent value="all" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">All Notifications</h3>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAlerts(prev => 
                    prev.map(alert => ({ ...alert, acknowledged: true }))
                  )}
                >
                  Mark All Read
                </Button>
              </div>
            </div>

            <ScrollArea className="h-80">
              <div className="space-y-2">
                {alerts.map((alert) => {
                  const Icon = getAlertIcon(alert.type, alert.category)
                  return (
                    <div
                      key={alert.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border ${
                        alert.acknowledged ? 'bg-muted/50' : 'bg-background'
                      }`}
                    >
                      <Icon className={`h-4 w-4 ${
                        alert.type === 'CRITICAL' ? 'text-gray-600 dark:text-gray-400' :
                        alert.type === 'WARNING' ? 'text-gray-600 dark:text-gray-400' :
                        'text-gray-600 dark:text-gray-400'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium text-sm ${alert.acknowledged ? 'text-muted-foreground' : ''}`}>
                          {alert.title}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {alert.message}
                        </p>
                      </div>
                      <Badge variant={getAlertColor(alert.type)} className="text-xs">
                        {alert.category}
                      </Badge>
                    </div>
                  )
                })}

                {alerts.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Bell className="h-12 w-12 mx-auto mb-4" />
                    <p className="font-medium">No notifications</p>
                    <p className="text-sm">All systems operating normally</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}