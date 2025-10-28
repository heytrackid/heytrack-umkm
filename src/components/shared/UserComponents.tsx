// @ts-nocheck
'use client'

import { useState, type FormEvent } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  User,
  Settings,
  Shield,
  Key,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Edit,
  Save,
  X,
  Check,
  AlertTriangle,
  Eye,
  EyeOff,
  LogOut,
  UserPlus,
  Users
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/shared/utilities'
import { USER_ROLES } from '@/lib/shared/constants'

// User Profile Component
interface UserProfile {
  id: string
  name: string
  email: string
  phone?: string
  avatar?: string
  role: string
  status: 'active' | 'inactive' | 'pending'
  createdAt: Date
  lastLogin?: Date
  preferences?: {
    theme: 'light' | 'dark' | 'system'
    language: string
    notifications: boolean
  }
}

interface UserProfileCardProps {
  user: UserProfile
  isCurrentUser?: boolean
  onEdit?: () => void
  onChangePassword?: () => void
  onLogout?: () => void
  className?: string
}

export const UserProfileCard = ({
  user,
  isCurrentUser = false,
  onEdit,
  onChangePassword,
  onLogout,
  className = ""
}: UserProfileCardProps) => {
  const getStatusColor = (status: UserProfile['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'inactive':
        return 'bg-gray-100 text-gray-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  const getRoleLabel = (role: string) => USER_ROLES.find(r => r.value === role)?.label || role

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.avatar} />
              <AvatarFallback className="text-lg">
                {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div>
              <CardTitle className="text-xl">{user.name}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={getStatusColor(user.status)}>
                  {user.status.toUpperCase()}
                </Badge>
                <Badge variant="outline">
                  {getRoleLabel(user.role)}
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            {isCurrentUser && onEdit && (
              <Button variant="outline" size="sm" onClick={onEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}

            {isCurrentUser && onChangePassword && (
              <Button variant="outline" size="sm" onClick={onChangePassword}>
                <Key className="h-4 w-4 mr-2" />
                Password
              </Button>
            )}

            {isCurrentUser && onLogout && (
              <Button variant="outline" size="sm" onClick={onLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="text-sm font-medium">{user.email}</p>
            </div>
          </div>

          {user.phone && (
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="text-sm font-medium">{user.phone}</p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Joined</p>
              <p className="text-sm font-medium">{formatDate(user.createdAt)}</p>
            </div>
          </div>

          {user.lastLogin && (
            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Last Login</p>
                <p className="text-sm font-medium">{formatDate(user.lastLogin)}</p>
              </div>
            </div>
          )}
        </div>

        {user.preferences && (
          <div className="pt-4 border-t">
            <h4 className="font-medium mb-3">Preferences</h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Theme</p>
                <p className="font-medium capitalize">{user.preferences.theme}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Language</p>
                <p className="font-medium uppercase">{user.preferences.language}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Notifications</p>
                <p className="font-medium">{user.preferences.notifications ? 'On' : 'Off'}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// User Management Table Component
interface UserTableItem extends UserProfile {
  department?: string
  permissions?: string[]
}

interface UserManagementTableProps {
  users: UserTableItem[]
  onEditUser?: (user: UserTableItem) => void
  onDeleteUser?: (user: UserTableItem) => void
  onToggleStatus?: (user: UserTableItem) => void
  currentUserId?: string
  className?: string
}

export const UserManagementTable = ({
  users,
  onEditUser,
  onDeleteUser,
  onToggleStatus,
  currentUserId,
  className = ""
}: UserManagementTableProps) => (
  <div className={cn("space-y-4", className)}>
    {users.map((user) => (
      <Card key={user.id}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.avatar} />
                <AvatarFallback>
                  {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{user.name}</h3>
                  {user.id === currentUserId && (
                    <Badge variant="secondary" className="text-xs">You</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                {user.department && (
                  <p className="text-xs text-muted-foreground">{user.department}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Badge className={cn(
                user.status === 'active' ? 'bg-green-100 text-green-800' :
                  user.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                    'bg-yellow-100 text-yellow-800'
              )}>
                {user.status.toUpperCase()}
              </Badge>

              <Badge variant="outline">
                {USER_ROLES.find(r => r.value === user.role)?.label || user.role}
              </Badge>

              <div className="flex gap-1">
                {onEditUser && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEditUser(user)}
                    disabled={user.id === currentUserId}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}

                {onToggleStatus && user.id !== currentUserId && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onToggleStatus(user)}
                  >
                    {user.status === 'active' ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                )}

                {onDeleteUser && user.id !== currentUserId && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteUser(user)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
)

// Password Change Component
interface PasswordChangeProps {
  onSubmit: (data: { currentPassword: string; newPassword: string; confirmPassword: string }) => Promise<void>
  isLoading?: boolean
  className?: string
}

export const PasswordChange = ({
  onSubmit,
  isLoading = false,
  className = ""
}: PasswordChangeProps) => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    // Validation
    const newErrors: Record<string, string> = {}

    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required'
    }

    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required'
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters'
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password'
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    if (Object.keys(newErrors).length > 0) {
      void setErrors(newErrors)
      return
    }

    try {
      await onSubmit(formData)
      void setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      void setErrors({})
    } catch (err) {
      // Error is handled by parent
    }
  }

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }))
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          Change Password
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showPasswords.current ? "text" : "password"}
                value={formData.currentPassword}
                onChange={(e) => updateFormData('currentPassword', e.target.value)}
                className={cn(errors.currentPassword && "border-red-500")}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => togglePasswordVisibility('current')}
              >
                {showPasswords.current ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            {errors.currentPassword && (
              <p className="text-sm text-red-600">{errors.currentPassword}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showPasswords.new ? "text" : "password"}
                value={formData.newPassword}
                onChange={(e) => updateFormData('newPassword', e.target.value)}
                className={cn(errors.newPassword && "border-red-500")}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => togglePasswordVisibility('new')}
              >
                {showPasswords.new ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            {errors.newPassword && (
              <p className="text-sm text-red-600">{errors.newPassword}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showPasswords.confirm ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) => updateFormData('confirmPassword', e.target.value)}
                className={cn(errors.confirmPassword && "border-red-500")}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => togglePasswordVisibility('confirm')}
              >
                {showPasswords.confirm ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-red-600">{errors.confirmPassword}</p>
            )}
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? 'Updating...' : 'Update Password'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

// User Permissions Component
interface Permission {
  id: string
  name: string
  description: string
  category: string
}

interface UserPermissionsProps {
  userPermissions: string[]
  allPermissions: Permission[]
  onPermissionChange: (permissionId: string, hasPermission: boolean) => void
  readOnly?: boolean
  className?: string
}

export const UserPermissions = ({
  userPermissions,
  allPermissions,
  onPermissionChange,
  readOnly = false,
  className = ""
}: UserPermissionsProps) => {
  const permissionsByCategory = allPermissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = []
    }
    acc[permission.category].push(permission)
    return acc
  }, {} as Record<string, Permission[]>)

  return (
    <div className={cn("space-y-6", className)}>
      {Object.entries(permissionsByCategory).map(([category, permissions]) => (
        <div key={category}>
          <h3 className="font-medium text-lg mb-4 capitalize">{category}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {permissions.map((permission) => (
              <div
                key={permission.id}
                className="flex items-start gap-3 p-3 border rounded-lg"
              >
                <input
                  type="checkbox"
                  id={permission.id}
                  checked={userPermissions.includes(permission.id)}
                  onChange={(e) => onPermissionChange(permission.id, e.target.checked)}
                  disabled={readOnly}
                  className="mt-1"
                />
                <div className="flex-1">
                  <Label
                    htmlFor={permission.id}
                    className="font-medium cursor-pointer"
                  >
                    {permission.name}
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {permission.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// Role Management Component
interface RoleManagementProps {
  currentRole: string
  onRoleChange: (newRole: string) => void
  availableRoles?: typeof USER_ROLES
  canChangeRole?: boolean
  className?: string
}

export const RoleManagement = ({
  currentRole,
  onRoleChange,
  availableRoles = USER_ROLES,
  canChangeRole = false,
  className = ""
}: RoleManagementProps) => {
  const currentRoleData = availableRoles.find(role => role.value === currentRole)

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          User Role
        </CardTitle>
      </CardHeader>

      <CardContent>
        {canChangeRole ? (
          <div className="space-y-4">
            <div>
              <Label>Current Role</Label>
              <Select value={currentRole} onValueChange={onRoleChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableRoles.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {currentRoleData && (
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  <strong>{currentRoleData.label}</strong> - This role has specific permissions and access levels.
                </AlertDescription>
              </Alert>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="text-sm">
              {currentRoleData?.label || currentRole}
            </Badge>
            <span className="text-sm text-muted-foreground">
              Role cannot be changed from this interface
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
