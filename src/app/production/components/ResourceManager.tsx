'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Settings,
  Users,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Wrench,
  User,
  Plus,
  Search,
  Filter,
  Activity,
  Zap,
  Shield
} from "lucide-react"
import { 
  useProductionEquipment,
  useProductionStaff,
  useProductionCapacity 
} from '../hooks/use-production'
import { 
  PRODUCTION_STATUS_COLORS,
  DEFAULT_PRODUCTION_CONFIG 
} from '../config/production.config'
import type { 
  ProductionEquipment, 
  ProductionStaff,
  EquipmentStatus,
  EquipmentType,
  StaffRole 
} from '../types/production.types'

interface ResourceManagerProps {
  className?: string
}

export default function ResourceManager({ className }: ResourceManagerProps) {
  const [activeTab, setActiveTab] = useState('equipment')
  const [searchTerm, setSearchTerm] = useState('')
  const [equipmentFilter, setEquipmentFilter] = useState<EquipmentStatus | 'all'>('all')
  const [staffFilter, setStaffFilter] = useState<StaffRole | 'all'>('all')
  
  // Get current capacity for today
  const today = new Date().toISOString().split('T')[0]
  const { capacity } = useProductionCapacity(today)
  
  // Equipment data
  const { equipment, loading: equipmentLoading } = useProductionEquipment({
    status: equipmentFilter !== 'all' ? equipmentFilter : undefined
  })
  
  // Staff data
  const { staff, loading: staffLoading } = useProductionStaff({
    role: staffFilter !== 'all' ? staffFilter : undefined,
    active: true
  })

  // Mock data for demonstration
  const equipmentUtilization = [
    { id: 'oven-1', name: 'Main Oven #1', type: 'oven', utilization: 85, status: 'in_use' },
    { id: 'oven-2', name: 'Secondary Oven #2', type: 'oven', utilization: 65, status: 'available' },
    { id: 'mixer-1', name: 'Industrial Mixer', type: 'mixer', utilization: 75, status: 'in_use' },
    { id: 'proofer-1', name: 'Proofing Cabinet', type: 'proofer', utilization: 45, status: 'available' },
    { id: 'scale-1', name: 'Digital Scale', type: 'scale', utilization: 30, status: 'maintenance' }
  ]

  const staffWorkload = [
    { id: 'baker-1', name: 'Ahmad Bakri', role: 'head_baker', workload: 90, efficiency: 95, batches: 3 },
    { id: 'baker-2', name: 'Siti Nurhaliza', role: 'baker', workload: 75, efficiency: 88, batches: 2 },
    { id: 'assistant-1', name: 'Andi Pratama', role: 'assistant_baker', workload: 60, efficiency: 92, batches: 1 },
    { id: 'qc-1', name: 'Maya Sari', role: 'quality_inspector', workload: 40, efficiency: 97, batches: 0 }
  ]

  const maintenanceAlerts = [
    {
      id: 'maint-1',
      equipment: 'Main Oven #1',
      type: 'scheduled',
      dueDate: '2024-01-15',
      priority: 'medium',
      description: 'Quarterly deep cleaning and calibration'
    },
    {
      id: 'maint-2', 
      equipment: 'Industrial Mixer',
      type: 'urgent',
      dueDate: '2024-01-12',
      priority: 'high',
      description: 'Motor bearing replacement required'
    }
  ]

  const getStatusColor = (status: EquipmentStatus) => {
    switch (status) {
      case 'available': return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800'
      case 'in_use': return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800'
      case 'maintenance': return 'text-orange-600 bg-orange-100'
      case 'broken': return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800'
      case 'reserved': return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 90) return 'text-gray-600 dark:text-gray-400'
    if (utilization >= 70) return 'text-orange-600'
    if (utilization >= 50) return 'text-gray-600 dark:text-gray-400'
    return 'text-gray-600 dark:text-gray-400'
  }

  const getEquipmentIcon = (type: EquipmentType) => {
    switch (type) {
      case 'oven': return '🔥'
      case 'mixer': return '🥄'
      case 'proofer': return '📦'
      case 'refrigerator': return '❄️'
      case 'scale': return '⚖️'
      default: return '🔧'
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Resource Management
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Monitor equipment and staff utilization
          </p>
        </div>
      </div>

      {/* Resource overview cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Equipment Active
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {equipmentUtilization.filter(e => e.status === 'in_use').length}/{equipmentUtilization.length}
                </p>
              </div>
              <Settings className="h-8 w-8 text-gray-600 dark:text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Staff On Duty
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {staffWorkload.length}
                </p>
              </div>
              <Users className="h-8 w-8 text-gray-600 dark:text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Avg Utilization
                </p>
                <p className="text-2xl font-bold text-orange-600">
                  {Math.round(equipmentUtilization.reduce((sum, eq) => sum + eq.utilization, 0) / equipmentUtilization.length)}%
                </p>
              </div>
              <Activity className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Maintenance Due
                </p>
                <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                  {maintenanceAlerts.length}
                </p>
              </div>
              <Wrench className="h-8 w-8 text-gray-600 dark:text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Maintenance alerts */}
      {maintenanceAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <span>Maintenance Alerts</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {maintenanceAlerts.map(alert => (
                <div 
                  key={alert.id}
                  className={`flex items-center justify-between p-4 rounded-lg border-l-4 ${
                    alert.priority === 'high' 
                      ? 'border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 dark:bg-red-950'
                      : 'border-orange-500 bg-orange-50 dark:bg-orange-950'
                  }`}
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <Badge className={
                        alert.priority === 'high'
                          ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                          : 'bg-orange-100 text-orange-800'
                      }>
                        {alert.priority} priority
                      </Badge>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {alert.equipment}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {alert.description}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Due: {new Date(alert.dueDate).toLocaleDateString('id-ID')}
                    </p>
                    <Button variant="outline" size="sm" className="mt-2">
                      Schedule
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resource tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="equipment" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Equipment</span>
          </TabsTrigger>
          <TabsTrigger value="staff" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Staff</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="equipment" className="space-y-4">
          {/* Equipment filters */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Equipment Status & Utilization
            </h3>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search equipment..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              
              <Select value={equipmentFilter} onValueChange={(value) => setEquipmentFilter(value as EquipmentStatus | 'all')}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="in_use">In Use</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="broken">Broken</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Equipment list */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {equipmentUtilization.map(equipment => (
              <Card key={equipment.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{getEquipmentIcon(equipment.type as EquipmentType)}</span>
                      <CardTitle className="text-lg">
                        {equipment.name}
                      </CardTitle>
                    </div>
                    <Badge className={getStatusColor(equipment.status as EquipmentStatus)}>
                      {equipment.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Utilization */}
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-600 dark:text-gray-400">
                          Utilization
                        </span>
                        <span className={`font-medium ${getUtilizationColor(equipment.utilization)}`}>
                          {equipment.utilization}%
                        </span>
                      </div>
                      <Progress value={equipment.utilization} className="h-2" />
                    </div>

                    {/* Status details */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Current Status
                      </span>
                      {equipment.status === 'in_use' ? (
                        <Badge variant="outline" className="text-gray-600 dark:text-gray-400">
                          <Zap className="h-3 w-3 mr-1" />
                          Active
                        </Badge>
                      ) : equipment.status === 'maintenance' ? (
                        <Badge variant="outline" className="text-orange-600">
                          <Wrench className="h-3 w-3 mr-1" />
                          Maintenance
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-gray-600 dark:text-gray-400">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Available
                        </Badge>
                      )}
                    </div>

                    {/* Next maintenance */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Next Maintenance
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        Jan 15
                      </span>
                    </div>

                    <div className="pt-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Manage
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="staff" className="space-y-4">
          {/* Staff filters */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Staff Workload & Performance
            </h3>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search staff..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              
              <Select value={staffFilter} onValueChange={(value) => setStaffFilter(value as StaffRole | 'all')}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="head_baker">Head Baker</SelectItem>
                  <SelectItem value="baker">Baker</SelectItem>
                  <SelectItem value="assistant_baker">Assistant</SelectItem>
                  <SelectItem value="quality_inspector">QC Inspector</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Staff list */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {staffWorkload.map(staff => (
              <Card key={staff.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {staff.name}
                        </CardTitle>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {staff.role.replace('_', ' ')}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-gray-600 dark:text-gray-400">
                      <Shield className="h-3 w-3 mr-1" />
                      Active
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Workload */}
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-600 dark:text-gray-400">
                          Current Workload
                        </span>
                        <span className={`font-medium ${getUtilizationColor(staff.workload)}`}>
                          {staff.workload}%
                        </span>
                      </div>
                      <Progress value={staff.workload} className="h-2" />
                    </div>

                    {/* Efficiency */}
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-600 dark:text-gray-400">
                          Efficiency Score
                        </span>
                        <span className="font-medium text-gray-600 dark:text-gray-400">
                          {staff.efficiency}%
                        </span>
                      </div>
                      <Progress value={staff.efficiency} className="h-2" />
                    </div>

                    {/* Active batches */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Active Batches
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {staff.batches}
                      </span>
                    </div>

                    <div className="pt-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                      >
                        <User className="h-4 w-4 mr-2" />
                        View Profile
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}