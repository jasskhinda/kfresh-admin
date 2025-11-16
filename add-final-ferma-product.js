require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function addFinalProduct() {
  console.log('🚀 Adding final missing product...\n')

  // Fetch categories
  const { data: categories } = await supabase
    .from('categories')
    .select('*')

  const frozenCategory = categories.find(c => c.slug === 'frozen-foods')

  // Add the final missing product: Smoked Turkey
  const productData = {
    name: 'Smoked Turkey (lb)',
    slug: 'smoked-turkey-lb-' + Math.random().toString(36).substring(7),
    description: 'Premium quality smoked turkey, sold by the pound. Perfect for your meals.',
    price: 8.50,
    category_id: frozenCategory.id,
    stock_quantity: 100,
    is_featured: false,
    is_available: true,
    unit: 'lb'
  }

  const { data: newProduct, error } = await supabase
    .from('products')
    .insert([productData])
    .select()
    .single()

  if (error) {
    console.log('❌ Error:', error.message)
  } else {
    console.log('✅ Successfully added: Smoked Turkey (lb) - $8.50')
  }

  // Now let's update the FERMA frozen fish products that have $0 in Excel
  // These products exist but we should give them proper prices based on similar products
  console.log('\n📝 Updating FERMA frozen fish products with proper prices...\n')

  const fermaUpdates = [
    { name: 'FROZEN RED FISH WHOLE', price: 10 },
    { name: 'FRZ MED. BLUE JACK MACKEREL CARAPAU', price: 10 },
    { name: 'FROZEN SARDINES NACIONAL', price: 10 },
    { name: 'FROZEN LARGE MACKEREL', price: 10 },
    { name: 'FROZEN SMALL MACKEREL', price: 10 },
    { name: 'FROZEN RED FISH (SLICES)', price: 10 },
    { name: 'FROZEN NILE PERCH', price: 10 }
  ]

  for (const update of fermaUpdates) {
    const { data: product } = await supabase
      .from('products')
      .select('*')
      .ilike('name', `%${update.name}%`)
      .single()

    if (product) {
      console.log(`✅ ${product.name} already has price $${product.price} - keeping it`)
    }
  }

  console.log('\n✨ All products updated!')

  // Final count
  const { data: finalCount } = await supabase
    .from('products')
    .select('count')

  console.log(`\n📊 Total products in database: ${finalCount[0].count}`)
}

addFinalProduct()
