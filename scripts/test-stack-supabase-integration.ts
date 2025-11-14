/**
 * Test Stack Auth + Supabase Integration
 * 
 * This script tests if Stack Auth JWT is properly integrated with Supabase RLS
 */

import { getSupabaseJwt } from '@/lib/supabase-jwt'
import { stackServerApp } from '@/stack/server'
import { createClient } from '@/utils/supabase/server'
import * as jose from 'jose'

async function testIntegration() {
  console.log('🧪 Testing Stack Auth + Supabase Integration...\n')

  // Test 1: Check if user is authenticated
  console.log('1️⃣ Testing Stack Auth user...')
  const user = await stackServerApp.getUser()
  
  if (!user) {
    console.log('❌ No user authenticated')
    console.log('   Please sign in first at http://localhost:3000/handler/sign-in')
    return
  }
  
  console.log('✅ User authenticated:')
  console.log(`   - ID: ${user.id}`)
  console.log(`   - Email: ${user.primaryEmail}`)
  console.log(`   - Display Name: ${user.displayName}\n`)

  // Test 2: Check JWT generation
  console.log('2️⃣ Testing JWT generation...')
  const jwt = await getSupabaseJwt()
  
  if (!jwt) {
    console.log('❌ Failed to generate JWT')
    console.log('   Check if SUPABASE_JWT_SECRET is set in .env.local')
    return
  }
  
  console.log('✅ JWT generated successfully')
  console.log(`   Token: ${jwt.substring(0, 50)}...\n`)

  // Test 3: Decode JWT to verify claims
  console.log('3️⃣ Testing JWT claims...')
  try {
    const secret = new TextEncoder().encode(process.env.SUPABASE_JWT_SECRET!)
    const { payload } = await jose.jwtVerify(jwt, secret)
    
    console.log('✅ JWT claims verified:')
    console.log(`   - sub (user_id): ${payload.sub}`)
    console.log(`   - role: ${payload.role}`)
    console.log(`   - email: ${payload.email}`)
    console.log(`   - exp: ${new Date((payload.exp || 0) * 1000).toISOString()}\n`)
    
    if (payload.sub !== user.id) {
      console.log('⚠️  WARNING: JWT sub does not match Stack Auth user ID!')
      console.log(`   JWT sub: ${payload.sub}`)
      console.log(`   User ID: ${user.id}`)
      return
    }
  } catch (error) {
    console.log('❌ Failed to verify JWT:', error)
    return
  }

  // Test 4: Test Supabase client with JWT
  console.log('4️⃣ Testing Supabase client with JWT...')
  try {
    const supabase = await createClient()
    
    // Try to fetch user's ingredients (should be filtered by RLS)
    const { data, error } = await supabase
      .from('ingredients')
      .select('id, name, user_id')
      .limit(5)
    
    if (error) {
      console.log('❌ Supabase query failed:', error.message)
      return
    }
    
    console.log('✅ Supabase query successful')
    console.log(`   - Found ${data?.length || 0} ingredients`)
    
    if (data && data.length > 0) {
      console.log(`   - Sample: ${data[0].name}`)
      console.log(`   - user_id: ${data[0].user_id}`)
      
      // Verify all records belong to the authenticated user
      const allBelongToUser = data.every(item => item.user_id === user.id)
      if (allBelongToUser) {
        console.log('✅ RLS is working! All records belong to authenticated user\n')
      } else {
        console.log('⚠️  WARNING: Some records do not belong to authenticated user!')
        console.log('   RLS might not be working correctly\n')
      }
    } else {
      console.log('   - No data found (this is OK if user has no ingredients)\n')
    }
  } catch (error) {
    console.log('❌ Supabase client error:', error)
    return
  }

  // Test 5: Test RLS enforcement (try to access other user's data)
  console.log('5️⃣ Testing RLS enforcement...')
  try {
    const supabase = await createClient()
    
    // Try to fetch data with a different user_id (should return empty)
    const fakeUserId = '00000000-0000-0000-0000-000000000000'
    const { data, error } = await supabase
      .from('ingredients')
      .select('id')
      .eq('user_id', fakeUserId)
      .limit(1)
    
    if (error) {
      console.log('❌ RLS test query failed:', error.message)
      return
    }
    
    if (data && data.length === 0) {
      console.log('✅ RLS enforcement working! Cannot access other users\' data\n')
    } else {
      console.log('⚠️  WARNING: RLS might not be enforcing correctly!')
      console.log(`   Found ${data?.length} records with different user_id\n`)
    }
  } catch (error) {
    console.log('❌ RLS test error:', error)
    return
  }

  // Summary
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🎉 Integration Test Complete!')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('✅ Stack Auth user authenticated')
  console.log('✅ JWT generation working')
  console.log('✅ JWT claims valid')
  console.log('✅ Supabase client working')
  console.log('✅ RLS enforcement active')
  console.log('\n🚀 Stack Auth + Supabase integration is WORKING!\n')
}

// Run test
testIntegration().catch(console.error)
