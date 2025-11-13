import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkRecipesIssue() {
  console.log('🔍 Checking recipes issue...\n')

  // Get all active recipes
  const { data: recipes, error: recipesError } = await supabase
    .from('recipes')
    .select('id, name, user_id, is_active')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (recipesError) {
    console.error('❌ Error fetching recipes:', recipesError)
    return
  }

  console.log(`📊 Found ${recipes.length} active recipes`)
  console.log('\nRecipes user_id distribution:')
  
  const userIdCounts = {}
  recipes.forEach(recipe => {
    userIdCounts[recipe.user_id] = (userIdCounts[recipe.user_id] || 0) + 1
  })

  Object.entries(userIdCounts).forEach(([userId, count]) => {
    console.log(`  - ${userId}: ${count} recipes`)
  })

  // Get all users
  const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers()

  if (usersError) {
    console.error('❌ Error fetching users:', usersError)
    return
  }

  console.log(`\n👥 Found ${users.length} users in auth:`)
  users.forEach(user => {
    console.log(`  - ${user.id}: ${user.email}`)
  })

  // Check if there's a mismatch
  console.log('\n🔍 Analysis:')
  const recipeUserIds = Object.keys(userIdCounts)
  const authUserIds = users.map(u => u.id)

  recipeUserIds.forEach(recipeUserId => {
    if (!authUserIds.includes(recipeUserId)) {
      console.log(`⚠️  Recipes have user_id ${recipeUserId} but this user doesn't exist in auth!`)
    }
  })

  authUserIds.forEach(authUserId => {
    if (!recipeUserIds.includes(authUserId)) {
      console.log(`ℹ️  User ${authUserId} exists but has no recipes`)
    }
  })
}

checkRecipesIssue().catch(console.error)
