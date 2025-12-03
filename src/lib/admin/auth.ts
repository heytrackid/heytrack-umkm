import { stackServerApp } from '@/stack/server'

export async function isAdmin(): Promise<boolean> {
  const user = await stackServerApp.getUser()
  if (!user) return false

  // TODO: Implement proper admin role check
  // For now, check if user email is in admin list
  const adminEmails = process.env['ADMIN_EMAILS']?.split(',') || []
  return adminEmails.includes(user.primaryEmail || '')
}

export async function requireAdmin() {
  const admin = await isAdmin()
  if (!admin) {
    throw new Error('Unauthorized: Admin access required')
  }
}
