const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: './.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

async function checkIrieProducts() {
  console.log('🔍 Checking existing IRIE products...\n')

  const { data, error } = await supabase
    .from('products')
    .select('id, name, price, weight, unit, brand, category_id')
    .ilike('name', '%irie%')
    .order('name')

  if (error) {
    console.error('Error:', error)
    return
  }

  if (data && data.length > 0) {
    console.log(`Found ${data.length} existing IRIE products:\n`)
    data.forEach(p => {
      const weightInfo = p.weight ? `(${p.weight}${p.unit})` : ''
      console.log(`- ${p.name} ${weightInfo} - $${p.price}`)
    })
  } else {
    console.log('No IRIE products found.')
  }

  // Also check categories
  console.log('\n\n📁 Checking Spices/Seasonings categories...\n')
  const { data: cats } = await supabase
    .from('categories')
    .select('id, name, slug')
    .or('name.ilike.%spice%,name.ilike.%season%')
    .order('name')

  if (cats && cats.length > 0) {
    cats.forEach(c => {
      console.log(`- ${c.name} (${c.slug})`)
      console.log(`  ID: ${c.id}`)
    })
  }
}

checkIrieProducts()
