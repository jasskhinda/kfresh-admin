const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: './.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

async function checkCategories() {
  console.log('📋 Checking current categories...\n')

  const { data: categories, error } = await supabase
    .from('categories')
    .select('id, name, slug, is_fresh_meals')
    .eq('is_active', true)
    .order('name')

  if (error) {
    console.error('Error:', error)
    return
  }

  console.log('Available categories:')
  categories.forEach(cat => {
    console.log(`  - ${cat.name} (${cat.slug})${cat.is_fresh_meals ? ' [FRESH MEALS]' : ''}`)
  })

  console.log('\n\n🔍 Looking for takeout/fresh meals category...')
  const takeoutCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes('takeout') ||
    cat.name.toLowerCase().includes('fresh meal') ||
    cat.name.toLowerCase().includes('cooked') ||
    cat.slug.includes('takeout') ||
    cat.slug.includes('fresh-meal')
  )

  if (takeoutCategories.length > 0) {
    console.log('\n✅ Found possible takeout/fresh meals categories:')
    takeoutCategories.forEach(cat => {
      console.log(`  ID: ${cat.id}`)
      console.log(`  Name: ${cat.name}`)
      console.log(`  Slug: ${cat.slug}`)
      console.log(`  Is Fresh Meals: ${cat.is_fresh_meals}`)
      console.log()
    })
  } else {
    console.log('\n❌ No takeout/fresh meals category found.')
    console.log('💡 We should create one!')
  }
}

checkCategories()
