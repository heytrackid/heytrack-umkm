'use client'

import { useUser as useClerkUser } from '@clerk/nextjs'
import { useSupabase } from '@/providers/SupabaseProvider'
import { useEffect, useState } from 'react'

export function useUser() {
  const { user: clerkUser, isLoaded: clerkLoaded, isSignedIn } = useClerkUser()
  const { supabase } = useSupabase()
  const [profileData, setProfileData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      if (!clerkUser || !isSignedIn) {
        setProfileData(null)
        setLoading(false)
        return
      }

      try {
        // You can fetch additional profile data from Supabase if needed
        // For now, we'll use Clerk user data
        setProfileData({
          id: clerkUser.id,
          email: clerkUser.emailAddresses[0]?.emailAddress,
          firstName: clerkUser.firstName,
          lastName: clerkUser.lastName,
          fullName: clerkUser.fullName,
          imageUrl: clerkUser.imageUrl,
          createdAt: clerkUser.createdAt,
        })
      } catch (error) {
        console.error('Error fetching profile:', error)
      } finally {
        setLoading(false)
      }
    }

    if (clerkLoaded) {
      fetchProfile()
    }
  }, [clerkUser, isSignedIn, clerkLoaded, supabase])

  return {
    user: profileData,
    clerkUser,
    isSignedIn,
    isLoaded: clerkLoaded,
    loading,
  }
}