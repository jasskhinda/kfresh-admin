const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: './.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

async function deleteFreshMealsCategory() {
  console.log('🗑️ Deleting the Fresh Meals & Takeout category I just created...\n')

  const { data, error } = await supabase
    .from('categories')
    .delete()
    .eq('slug', 'fresh-meals-takeout')
    .select()

  if (error) {
    console.error('❌ Error deleting category:', error)
    return
  }

  if (data && data.length > 0) {
    console.log('✅ Successfully deleted category:', data[0].name)
  } else {
    console.log('ℹ️ Category was not found or already deleted')
  }
}

deleteFreshMealsCategory()
