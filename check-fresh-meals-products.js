const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: './.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

async function checkFreshMealsProducts() {
  console.log('🔍 Checking Fresh Meals & Takeout products...\n')

  // First get the category ID
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

  // Get all products in this category
  const { data: products, error } = await supabase
    .from('products')
    .select('id, name, price, is_cooked, delivery_type')
    .eq('category_id', category.id)
    .order('name')

  if (error) {
    console.error('Error:', error)
    return
  }

  console.log(`📦 Found ${products.length} products in Fresh Meals & Takeout:\n`)

  products.forEach((p, i) => {
    console.log(`${i + 1}. ${p.name} - $${p.price}`)
  })

  console.log('\n' + '='.repeat(50))
  console.log(`Total: ${products.length} products`)
  console.log('='.repeat(50))

  console.log('\n⚠️  These products will be DELETED if you proceed.')
  console.log('Products in other categories will NOT be affected.')
}

checkFreshMealsProducts()
