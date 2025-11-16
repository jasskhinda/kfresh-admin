require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function deleteDuplicates() {
  console.log('🗑️  Deleting duplicate products...\n')

  // Read the duplicates file
  const duplicatesData = JSON.parse(fs.readFileSync('duplicates-to-delete.json', 'utf8'))

  console.log(`Total duplicates to delete: ${duplicatesData.toDelete.length}\n`)

  let deleted = 0
  let errors = 0

  // Delete variants first (they reference products)
  for (const productId of duplicatesData.toDelete) {
    // Delete variants first
    const { error: varError } = await supabase
      .from('product_variants')
      .delete()
      .eq('product_id', productId)

    if (varError) {
      console.log(`⚠️  Error deleting variants for ${productId}:`, varError.message)
    }

    // Delete product
    const { error: prodError } = await supabase
      .from('products')
      .delete()
      .eq('id', productId)

    if (prodError) {
      console.log(`❌ Error deleting product ${productId}:`, prodError.message)
      errors++
    } else {
      deleted++
      if (deleted % 5 === 0) {
        console.log(`   Deleted ${deleted}/${duplicatesData.toDelete.length}...`)
      }
    }
  }

  console.log('\n' + '=' .repeat(80))
  console.log('✨ CLEANUP COMPLETE!')
  console.log('=' .repeat(80))
  console.log(`✅ Deleted: ${deleted} duplicate products`)
  console.log(`❌ Errors: ${errors}`)
  console.log(`\n📊 Unique products remaining: ${duplicatesData.summary.uniqueProducts}`)

  // Verify final count
  const { data: finalCount } = await supabase.from('products').select('count')
  console.log(`📊 Actual database count: ${finalCount[0].count}`)
}

deleteDuplicates()
