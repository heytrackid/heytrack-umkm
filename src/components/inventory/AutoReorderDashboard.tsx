'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  AlertTriangle,
  ShoppingCart,
  Clock,
  DollarSign,
  Package,
  Truck,
  Settings,
  Play,
  Pause,
  CheckCircle,
  XCircle,
  Eye,
  Plus,
  RefreshCw,
  BarChart3,
  TrendingUp,
  Calendar
} from 'lucide-react'

import { autoReorderService, ReorderSummary, ReorderAlert, PurchaseOrder, ReorderRule } from '@/services/inventory/AutoReorderService'
import { useResponsive } from '@/hooks/use-mobile'
import { useCurrency } from '@/hooks/useCurrency'

interface AutoReorderDashboardProps {
  onReorderTriggered?: () => void
}

export default function AutoReorderDashboard({ onReorderTriggered }: AutoReorderDashboardProps) {
  const { isMobile } = useResponsive()
  const { formatCurrency } = useCurrency()
  
  const [summary, setSummary] = useState<ReorderSummary | null>(null)
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [checking, setChecking] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [showRuleDialog, setShowRuleDialog] = useState(false)
  const [selectedAlert, setSelectedAlert] = useState<ReorderAlert | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [summaryData, poData] = await Promise.all([
        autoReorderService.checkReorderNeeds(),
        autoReorderService.getPurchaseOrders()
      ])
      
      setSummary(summaryData)
      setPurchaseOrders(poData)
    } catch (error) {
      console.error('Error loading reorder data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCheckReorderNeeds = async () => {
    try {
      setChecking(true)
      const newSummary = await autoReorderService.checkReorderNeeds()
      setSummary(newSummary)
      onReorderTriggered?.()
    } catch (error) {
      console.error('Error checking reorder needs:', error)
    } finally {
      setChecking(false)
    }
  }

  const getUrgencyColor = (urgency: ReorderAlert['urgency']) => {
    switch (urgency) {
      case 'critical': return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium': return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-yellow-200'
      case 'low': return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getUrgencyIcon = (urgency: ReorderAlert['urgency']) => {
    switch (urgency) {
      case 'critical': return <AlertTriangle className="h-4 w-4" />
      case 'high': return <AlertTriangle className="h-4 w-4" />
      case 'medium': return <Clock className="h-4 w-4" />
      case 'low': return <Package className="h-4 w-4" />
      default: return <Package className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: PurchaseOrder['status']) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'sent': return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
      case 'confirmed': return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
      case 'delivered': return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
      case 'cancelled': return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Loading reorder data...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Automated Inventory Reordering</h2>
          <p className="text-muted-foreground">Monitor stock levels and automate purchase orders</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={handleCheckReorderNeeds}
            disabled={checking}
            variant="outline"
          >
            {checking ? (
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Check Stock Levels
          </Button>
          <Dialog open={showRuleDialog} onOpenChange={setShowRuleDialog}>
            <DialogTrigger asChild>
              <Button>
                <Settings className="h-4 w-4 mr-2" />
                Reorder Rules
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Configure Reorder Rules</DialogTitle>
              </DialogHeader>
              <ReorderRulesForm onSave={() => {
                setShowRuleDialog(false)
                loadData()
              }} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className={`grid gap-4 ${isMobile ? 'grid-cols-2' : 'grid-cols-5'}`}>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Alerts</p>
                  <p className="text-2xl font-bold">{summary.total_alerts}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Critical Items</p>
                  <p className="text-2xl font-bold">{summary.critical_items}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Estimated Cost</p>
                  <p className="text-2xl font-bold">{formatCurrency(summary.total_estimated_cost)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Auto Orders</p>
                  <p className="text-2xl font-bold">{summary.auto_orders_generated}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Eye className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Manual Review</p>
                  <p className="text-2xl font-bold">{summary.manual_review_required}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="dashboard">Reorder Alerts</TabsTrigger>
          <TabsTrigger value="purchase-orders">Purchase Orders</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard">
          <Card>
            <CardHeader>
              <CardTitle>Active Reorder Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              {summary?.alerts && summary.alerts.length > 0 ? (
                <div className="space-y-4">
                  {summary.alerts.map((alert) => (
                    <div key={alert.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Badge className={`${getUrgencyColor(alert.urgency)} flex items-center space-x-1`}>
                            {getUrgencyIcon(alert.urgency)}
                            <span className="capitalize">{alert.urgency}</span>
                          </Badge>
                          <div>
                            <h4 className="font-semibold">{alert.ingredient_name}</h4>
                            <p className="text-sm text-muted-foreground">
                              Current: {alert.current_stock} | Minimum: {alert.min_stock} | 
                              Suggested: {alert.suggested_reorder_quantity}
                            </p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="font-semibold">{formatCurrency(alert.estimated_cost)}</p>
                          {alert.auto_reorder_enabled ? (
                            <Badge variant="secondary">Auto Enabled</Badge>
                          ) : (
                            <Button size="sm" variant="outline">
                              <ShoppingCart className="h-4 w-4 mr-1" />
                              Create PO
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      {alert.preferred_supplier && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-sm text-muted-foreground">
                            <Truck className="h-4 w-4 inline mr-1" />
                            Preferred Supplier: {alert.preferred_supplier.name}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-gray-600 dark:text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">All Stock Levels Good</h3>
                  <p className="text-muted-foreground">No reorder alerts at this time.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="purchase-orders">
          <Card>
            <CardHeader>
              <CardTitle>Recent Purchase Orders</CardTitle>
            </CardHeader>
            <CardContent>
              {purchaseOrders.length > 0 ? (
                <div className="space-y-4">
                  {purchaseOrders.slice(0, 10).map((po) => (
                    <div key={po.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold">{po.po_number}</h4>
                          <p className="text-sm text-muted-foreground">
                            {new Date(po.order_date).toLocaleDateString('id-ID')}
                          </p>
                        </div>
                        
                        <div className="text-right">
                          <Badge className={getStatusColor(po.status)}>
                            {po.status.toUpperCase()}
                          </Badge>
                          <p className="font-semibold mt-1">
                            {formatCurrency(po.total_amount)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <p className="text-sm text-muted-foreground">
                          {po.items?.length || 0} items | 
                          Expected delivery: {po.expected_delivery_date ? 
                            new Date(po.expected_delivery_date).toLocaleDateString('id-ID') : 
                            'TBD'}
                        </p>
                        {po.notes && (
                          <p className="text-sm text-muted-foreground mt-1">{po.notes}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Purchase Orders</h3>
                  <p className="text-muted-foreground">Purchase orders will appear here when generated.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analytics">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Reorder Frequency</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Analytics coming soon...</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Cost Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Cost analysis coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Reorder Rules Form Component
function ReorderRulesForm({ onSave }: { onSave: () => void }) {
  const [newRule, setNewRule] = useState<Partial<ReorderRule>>({
    ingredient_id: '',
    min_stock_threshold: 0,
    reorder_quantity: 0,
    auto_approve: false,
    is_active: true
  })
  
  const [ingredients, setIngredients] = useState<any[]>([])
  const [suppliers, setSuppliers] = useState<any[]>([])

  useEffect(() => {
    // Load ingredients and suppliers for dropdowns
    // This would typically fetch from your database
    setIngredients([])
    setSuppliers([])
  }, [])

  const handleSave = async () => {
    try {
      await autoReorderService.createReorderRule(newRule as any)
      onSave()
    } catch (error) {
      console.error('Error saving reorder rule:', error)
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        <div>
          <Label htmlFor="ingredient">Ingredient</Label>
          <Select
            value={newRule.ingredient_id}
            onValueChange={(value) => setNewRule({ ...newRule, ingredient_id: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select ingredient" />
            </SelectTrigger>
            <SelectContent>
              {ingredients.map((ingredient) => (
                <SelectItem key={ingredient.id} value={ingredient.id}>
                  {ingredient.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="threshold">Minimum Stock Threshold</Label>
          <Input
            id="threshold"
            type="number"
            value={newRule.min_stock_threshold}
            onChange={(e) => setNewRule({ ...newRule, min_stock_threshold: Number(e.target.value) })}
          />
        </div>
        
        <div>
          <Label htmlFor="quantity">Reorder Quantity</Label>
          <Input
            id="quantity"
            type="number"
            value={newRule.reorder_quantity}
            onChange={(e) => setNewRule({ ...newRule, reorder_quantity: Number(e.target.value) })}
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            checked={newRule.auto_approve}
            onCheckedChange={(checked) => setNewRule({ ...newRule, auto_approve: checked })}
          />
          <Label>Auto-approve purchase orders</Label>
        </div>
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onSave}>Cancel</Button>
        <Button onClick={handleSave}>Save Rule</Button>
      </div>
    </div>
  )
}