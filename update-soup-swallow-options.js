const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: './.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

// Soup items that need "Choice of Swallow" as a required free selection
const SOUP_ITEMS = [
  'Light Soup',
  'Palm Soup',
  'Peanut Soup'
]

// Free swallow options - customer must choose ONE
const SWALLOW_OPTIONS = {
  name: 'Choice of Swallow',
  required: true,
  maxSelect: 1,
  options: [
    { name: 'Fufu', price: 0 },
    { name: 'Rice Balls', price: 0 },
    { name: 'Banku', price: 0 },
    { name: 'Eba', price: 0 }
  ]
}

async function updateSoupItems() {
  console.log('=' .repeat(60))
  console.log('UPDATING SOUP ITEMS WITH SWALLOW OPTIONS')
  console.log('=' .repeat(60))
  console.log('')

  for (const soupName of SOUP_ITEMS) {
    console.log(`\nUpdating: ${soupName}`)

    // Find the soup product
    const { data: products, error: findError } = await supabase
      .from('products')
      .select('id, name, metadata')
      .ilike('name', `%${soupName}%`)
      .eq('is_cooked', true)

    if (findError) {
      console.log(`  ❌ Error finding ${soupName}:`, findError.message)
      continue
    }

    if (!products || products.length === 0) {
      console.log(`  ⚠️  Not found: ${soupName}`)
      continue
    }

    for (const product of products) {
      // Get existing metadata
      const existingMetadata = product.metadata || {}
      const existingExtras = existingMetadata.extras || []

      // Add swallow_options to metadata
      const updatedMetadata = {
        ...existingMetadata,
        extras: existingExtras,
        swallow_options: SWALLOW_OPTIONS
      }

      // Update the product
      const { error: updateError } = await supabase
        .from('products')
        .update({ metadata: updatedMetadata })
        .eq('id', product.id)

      if (updateError) {
        console.log(`  ❌ Error updating ${product.name}:`, updateError.message)
      } else {
        console.log(`  ✅ Updated: ${product.name}`)
        console.log(`     Added: Choice of Swallow (Fufu, Rice Balls, Banku, Eba) - FREE`)
      }
    }
  }

  console.log('')
  console.log('=' .repeat(60))
  console.log('✅ DONE!')
  console.log('=' .repeat(60))
}

updateSoupItems()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Fatal error:', err)
    process.exit(1)
  })
