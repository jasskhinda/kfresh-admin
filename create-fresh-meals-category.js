const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: './.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

async function createFreshMealsCategory() {
  console.log('🍽️ Creating Fresh Meals & Takeout Category...\n')

  // First, check if it already exists
  const { data: existing } = await supabase
    .from('categories')
    .select('id, name')
    .or('slug.eq.fresh-meals-takeout,slug.eq.fresh-meals')
    .single()

  if (existing) {
    console.log('✅ Category already exists!')
    console.log(`   ID: ${existing.id}`)
    console.log(`   Name: ${existing.name}`)
    console.log('\nYou can use this category for your takeout items.')
    return existing.id
  }

  // Create the category
  const { data, error } = await supabase
    .from('categories')
    .insert([{
      name: 'Fresh Meals & Takeout',
      slug: 'fresh-meals-takeout',
      description: 'Ready-to-eat hot meals and takeout items - available for pickup',
      is_active: true,
      is_fresh_meals: true,
      display_order: 1 // Show it prominently
    }])
    .select()
    .single()

  if (error) {
    console.error('❌ Error creating category:', error)
    return null
  }

  console.log('✅ Successfully created Fresh Meals & Takeout category!')
  console.log(`   ID: ${data.id}`)
  console.log(`   Name: ${data.name}`)
  console.log(`   Slug: ${data.slug}`)
  console.log('\n📝 IMPORTANT INSTRUCTIONS FOR ADDING TAKEOUT ITEMS:\n')
  console.log('When adding products via https://kfresh-admin.vercel.app/products/new:\n')
  console.log('1. ✅ Check "Mark as Fresh Meal Item" in the Product Type section')
  console.log('2. 📁 Select "Fresh Meals & Takeout" as the Category')
  console.log('3. 🚚 In Delivery & Purchase Options, select:')
  console.log('   "🍽️ Fresh Meals & Cooked Foods (Pickup Only)"\n')
  console.log('This ensures the items:')
  console.log('  • Appear on the Fresh Meals page')
  console.log('  • Are marked as pickup only')
  console.log('  • Have the correct delivery type\n')

  return data.id
}

createFreshMealsCategory()
