/**
 * Admin & Performance Monitoring Page
 * Protected route - Admin only
 */

import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { isAdmin } from '@/lib/auth/admin-check'
import AdminDashboard from '@/components/admin/AdminDashboard'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle } from 'lucide-react'

export const metadata = {
    title: 'Admin & Performance Monitor | HeyTrack',
    description: 'System administration and performance monitoring'
}

export default async function AdminPage() {
    const supabase = await createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        redirect('/auth/login?redirect=/admin')
    }

    // Check if user is admin
    const hasAdminAccess = await isAdmin(user.id)

    if (!hasAdminAccess) {
        return (
            <div className="container mx-auto py-12">
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                        You do not have permission to access this page. Admin access required.
                    </AlertDescription>
                </Alert>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Admin & Performance Monitor</h1>
                    <p className="text-muted-foreground">
                        System monitoring, performance metrics, and administration
                    </p>
                </div>
            </div>

            <AdminDashboard userId={user.id} />
        </div>
    )
}
