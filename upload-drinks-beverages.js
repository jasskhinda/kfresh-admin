const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: './.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[()]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

async function createDrinksCategory() {
  console.log('🍹 Creating Drinks & Beverages Category...\n')

  // Check if category already exists
  const { data: existing } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', 'drinks-beverages')
    .single()

  if (existing) {
    console.log('✅ Category already exists with ID:', existing.id)
    return existing.id
  }

  // Create new category - marked as Fresh Meals category
  const { data: category, error } = await supabase
    .from('categories')
    .insert({
      name: 'Drinks & Beverages',
      slug: 'drinks-beverages',
      description: 'Caribbean drinks, tropical juices, sodas, and refreshing beverages to complement your meal.',
      is_active: true,
      is_fresh_meals: true,  // This makes it show on Fresh Meals/Takeout page
      display_order: 100
    })
    .select('id')
    .single()

  if (error) {
    console.error('❌ Error creating category:', error.message)
    return null
  }

  console.log('✅ Category created with ID:', category.id)
  return category.id
}

async function uploadDrinks(categoryId) {
  console.log('\n🥤 Adding Drink Products...\n')

  const drinks = [
    // Caribbean & Tropical Drinks
    {
      name: 'Grace Island Soda (Cream Soda)',
      price: 3.00,
      description: 'Classic Caribbean cream soda with smooth vanilla flavor.',
      volume: '355ml'
    },
    {
      name: 'Grace Island Soda (Pineapple)',
      price: 3.00,
      description: 'Refreshing pineapple-flavored Caribbean soda.',
      volume: '355ml'
    },
    {
      name: 'Grace Island Soda (Gingerbeer)',
      price: 3.00,
      description: 'Authentic Caribbean ginger beer with bold ginger flavor.',
      volume: '355ml'
    },
    {
      name: 'Zobo / Sorrel Drink',
      price: 7.00,
      description: 'Traditional West African/Caribbean hibiscus drink, refreshing and naturally sweet.',
      volume: '500ml'
    },
    {
      name: 'Tiger Malt',
      price: 3.99,
      description: 'Non-alcoholic malt beverage, rich in vitamins and minerals.',
      volume: '341ml'
    },
    {
      name: 'Creole Malt',
      price: 3.99,
      description: 'Premium Caribbean malt drink with smooth, rich flavor.',
      volume: '355ml'
    },
    {
      name: 'Ting',
      price: 3.99,
      description: 'Iconic Jamaican grapefruit soda, crisp and refreshing.',
      volume: '300ml'
    },
    {
      name: 'Grace Fruit Punch',
      price: 3.99,
      description: 'Tropical fruit punch blend with authentic Caribbean taste.',
      volume: '473ml'
    },
    {
      name: 'Grace Coconut Water',
      price: 2.99,
      description: 'Pure, refreshing coconut water straight from the tropics.',
      volume: '310ml'
    },
    // Cool Running Nectars
    {
      name: 'Cool Running Mango Nectar',
      price: 3.99,
      description: 'Sweet and smooth mango nectar made from ripe tropical mangoes.',
      volume: '473ml'
    },
    {
      name: 'Cool Running Mango Carrot',
      price: 3.99,
      description: 'Delicious blend of mango and carrot for a nutritious refreshment.',
      volume: '473ml'
    },
    {
      name: 'Cool Running Pineapple Ginger Nectar',
      price: 3.99,
      description: 'Tropical pineapple with a spicy ginger kick.',
      volume: '473ml'
    },
    {
      name: 'Cool Running Soursop Nectar',
      price: 3.99,
      description: 'Creamy, exotic soursop nectar with tropical sweetness.',
      volume: '473ml'
    },
    // Classic Beverages
    {
      name: 'Bottled Water',
      price: 2.50,
      description: 'Pure, refreshing bottled water.',
      volume: '500ml'
    },
    {
      name: 'Apple Juice',
      price: 3.99,
      description: 'Fresh, crisp apple juice.',
      volume: '355ml'
    },
    {
      name: 'Orange Juice',
      price: 3.99,
      description: 'Fresh-squeezed style orange juice.',
      volume: '355ml'
    },
    // Soft Drinks
    {
      name: 'Canada Dry',
      price: 3.00,
      description: 'Classic ginger ale, perfect with any meal.',
      volume: '355ml'
    },
    {
      name: 'Coca Cola',
      price: 3.00,
      description: 'The classic cola refreshment.',
      volume: '355ml'
    },
    {
      name: 'Fanta',
      price: 3.00,
      description: 'Bright and bubbly orange soda.',
      volume: '355ml'
    },
    {
      name: 'Coke Diet',
      price: 3.00,
      description: 'Zero sugar cola with great taste.',
      volume: '355ml'
    },
    {
      name: 'Sprite',
      price: 3.00,
      description: 'Crisp lemon-lime soda.',
      volume: '355ml'
    },
    {
      name: '7UP',
      price: 3.00,
      description: 'Refreshing lemon-lime flavor.',
      volume: '355ml'
    }
  ]

  let added = 0
  let skipped = 0

  for (const drink of drinks) {
    // Check if already exists
    const { data: existing } = await supabase
      .from('products')
      .select('id')
      .ilike('name', drink.name)
      .limit(1)

    if (existing && existing.length > 0) {
      console.log(`⏭️  SKIP: ${drink.name} (already exists)`)
      skipped++
      continue
    }

    const productData = {
      name: drink.name,
      slug: generateSlug(drink.name),
      description: drink.description,
      short_description: drink.description.substring(0, 100),
      price: drink.price,
      category_id: categoryId,
      is_available: true,
      is_featured: false,
      is_cooked: true,           // This marks it as Fresh Meal item
      delivery_type: 'pickup',   // Fresh meals are pickup only
      track_inventory: false,
      images: [],
      metadata: {
        volume: drink.volume,
        product_type: 'beverage',
        added_date: new Date().toISOString()
      }
    }

    const { error } = await supabase
      .from('products')
      .insert(productData)

    if (error) {
      console.log(`❌ ERROR: ${drink.name} - ${error.message}`)
    } else {
      console.log(`✅ ADDED: ${drink.name} - $${drink.price}`)
      added++
    }

    // Small delay
    await new Promise(resolve => setTimeout(resolve, 50))
  }

  return { added, skipped }
}

async function main() {
  console.log('=' .repeat(60))
  console.log('🍹 DRINKS & BEVERAGES UPLOAD')
  console.log('=' .repeat(60))

  // Step 1: Create category
  const categoryId = await createDrinksCategory()

  if (!categoryId) {
    console.error('❌ Failed to create/get category. Aborting.')
    process.exit(1)
  }

  // Step 2: Upload drinks
  const { added, skipped } = await uploadDrinks(categoryId)

  console.log('\n' + '=' .repeat(60))
  console.log('📊 UPLOAD SUMMARY')
  console.log('=' .repeat(60))
  console.log(`✅ Products Added: ${added}`)
  console.log(`⏭️  Products Skipped: ${skipped}`)
  console.log(`📦 Total: ${added + skipped}`)
  console.log('\n✅ All drinks marked as Fresh Meal items (pickup only)')
  console.log('=' .repeat(60))
}

main()
  .then(() => {
    console.log('\n✨ Done!')
    process.exit(0)
  })
  .catch(err => {
    console.error('❌ Fatal error:', err)
    process.exit(1)
  })
