const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: './.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

async function deleteFreshMealsProducts() {
  console.log('🗑️ Deleting Fresh Meals & Takeout products...\n')

  // Get the category ID
  const { data: category } = await supabase
    .from('categories')
    .select('id, name')
    .eq('slug', 'fresh-meals-takeout')
    .single()

  if (!category) {
    console.log('❌ Fresh Meals & Takeout category not found!')
    return
  }

  console.log(`📁 Category: ${category.name}`)
  console.log(`   ID: ${category.id}\n`)

  // Count products before deletion
  const { data: products } = await supabase
    .from('products')
    .select('id')
    .eq('category_id', category.id)

  const count = products?.length || 0
  console.log(`📦 Found ${count} products to delete...\n`)

  if (count === 0) {
    console.log('✅ No products to delete.')
    return
  }

  // Delete all products in this category
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('category_id', category.id)

  if (error) {
    console.error('❌ Error deleting products:', error)
    return
  }

  console.log('✅ Successfully deleted all Fresh Meals & Takeout products!')
  console.log(`   Deleted: ${count} products`)
  console.log('\n⚠️  Note: The category itself still exists (empty).')
  console.log('   Other categories and their products were NOT affected.')
}

deleteFreshMealsProducts()
