import { isAdmin } from '@/lib/admin/auth'
import { redirect } from 'next/navigation'
import { AdminDashboard } from './components/AdminDashboard'

export default async function AdminPage() {
  const admin = await isAdmin()

  if (!admin) {
    redirect('/')
  }

  return <AdminDashboard />
}
