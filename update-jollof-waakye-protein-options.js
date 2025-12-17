const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: './.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

// Items that need "Choice of Protein" as a required free selection
const RICE_MEAL_ITEMS = [
  'Nigerian Jollof Rice',
  'Ghanaian Jollof Rice',
  'Waakye'
]

// Free protein options - customer must choose ONE
const PROTEIN_OPTIONS = {
  name: 'Choice of Protein',
  required: true,
  maxSelect: 1,
  options: [
    { name: 'Goat Stew', price: 0 },
    { name: 'Beef Stew', price: 0 },
    { name: 'Grilled Chicken', price: 0 },
    { name: 'Fried Whiting Fish', price: 0 }
  ]
}

async function updateRiceMealItems() {
  console.log('=' .repeat(60))
  console.log('UPDATING JOLLOF & WAAKYE WITH PROTEIN OPTIONS')
  console.log('=' .repeat(60))
  console.log('')

  for (const itemName of RICE_MEAL_ITEMS) {
    console.log(`\nUpdating: ${itemName}`)

    // Find the product
    const { data: products, error: findError } = await supabase
      .from('products')
      .select('id, name, metadata')
      .ilike('name', `%${itemName}%`)
      .eq('is_cooked', true)

    if (findError) {
      console.log(`  ❌ Error finding ${itemName}:`, findError.message)
      continue
    }

    if (!products || products.length === 0) {
      console.log(`  ⚠️  Not found: ${itemName}`)
      continue
    }

    for (const product of products) {
      // Get existing metadata
      const existingMetadata = product.metadata || {}
      const existingExtras = existingMetadata.extras || []
      const existingSwallow = existingMetadata.swallow_options || null

      // Add protein_options to metadata
      const updatedMetadata = {
        ...existingMetadata,
        extras: existingExtras,
        swallow_options: existingSwallow,
        protein_options: PROTEIN_OPTIONS
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
        console.log(`     Added: Choice of Protein (Goat Stew, Beef Stew, Grilled Chicken, Fried Whiting Fish) - FREE`)
      }
    }
  }

  console.log('')
  console.log('=' .repeat(60))
  console.log('✅ DONE!')
  console.log('=' .repeat(60))
}

updateRiceMealItems()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Fatal error:', err)
    process.exit(1)
  })
