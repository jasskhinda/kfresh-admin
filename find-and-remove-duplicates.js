require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function findAndRemoveDuplicates() {
  console.log('🔍 Finding duplicate products...\n')

  // Fetch all products
  const { data: allProducts, error } = await supabase
    .from('products')
    .select('*')
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching products:', error)
    return
  }

  console.log(`Total products: ${allProducts.length}\n`)

  // Group by name to find duplicates
  const productsByName = {}

  allProducts.forEach(product => {
    const nameKey = product.name.toLowerCase().trim()
    if (!productsByName[nameKey]) {
      productsByName[nameKey] = []
    }
    productsByName[nameKey].push(product)
  })

  // Find duplicates
  const duplicates = []

  Object.entries(productsByName).forEach(([name, products]) => {
    if (products.length > 1) {
      duplicates.push({
        name: products[0].name,
        count: products.length,
        products: products
      })
    }
  })

  console.log('=' .repeat(80))
  console.log(`Found ${duplicates.length} product names with duplicates`)
  console.log('=' .repeat(80) + '\n')

  const toDelete = []

  for (const dup of duplicates) {
    console.log(`\n📦 ${dup.name} (${dup.count} duplicates)`)

    // Sort by created_at to keep the oldest one
    dup.products.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))

    // Keep the first one (oldest), mark the rest for deletion
    const keep = dup.products[0]
    const remove = dup.products.slice(1)

    console.log(`   ✅ KEEP: ID ${keep.id} (created: ${new Date(keep.created_at).toLocaleString()})`)
    console.log(`      Price: $${keep.price}, Category: ${keep.category_id}`)

    for (const product of remove) {
      console.log(`   ❌ DELETE: ID ${product.id} (created: ${new Date(product.created_at).toLocaleString()})`)
      console.log(`      Price: $${product.price}, Category: ${product.category_id}`)
      toDelete.push(product.id)
    }
  }

  console.log('\n' + '=' .repeat(80))
  console.log('SUMMARY')
  console.log('=' .repeat(80))
  console.log(`Total duplicate entries to delete: ${toDelete.length}`)
  console.log(`Products to keep: ${duplicates.length}`)
  console.log(`Unique products after cleanup: ${allProducts.length - toDelete.length}`)

  // Ask for confirmation before deleting
  console.log('\n⚠️  Ready to delete duplicates. Type YES to confirm:')

  // For automation, let's create a separate confirm script
  const fs = require('fs')
  fs.writeFileSync('duplicates-to-delete.json', JSON.stringify({
    toDelete: toDelete,
    duplicates: duplicates.map(d => ({
      name: d.name,
      count: d.count,
      keepId: d.products[0].id,
      deleteIds: d.products.slice(1).map(p => p.id)
    })),
    summary: {
      totalToDelete: toDelete.length,
      uniqueProducts: allProducts.length - toDelete.length
    }
  }, null, 2))

  console.log('\n✅ Duplicate analysis saved to: duplicates-to-delete.json')
  console.log('📝 Run "node delete-duplicates-confirmed.js" to proceed with deletion')
}

findAndRemoveDuplicates()
