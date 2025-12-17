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
    .replace(/[()\/]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// All menu categories and items from the hardcoded data
const menuData = {
  africanRiceMeals: {
    title: 'African Rice Meals',
    displayOrder: 1,
    items: [
      {
        name: 'Nigerian Jollof Rice',
        price: 20,
        bulletPoints: [
          'Goat stew or Beef stew or grilled Chicken or Fish (fried whiting fish)',
          'Fried Plantains',
          'Coleslaw'
        ],
        extras: [
          { name: '2 Eggs (boiled)', price: 2.70 },
          { name: 'KFresh Shito Regular Spicy', price: 4.00 },
          { name: 'KFresh Shito Extra Spicy', price: 4.00 },
          { name: 'Jollof Stew (no meat)', price: 3.50 },
          { name: 'Jollof Stew (with meat)', price: 5.00 },
          { name: 'Fried Ripe Plantains', price: 7.00 },
          { name: 'Coleslaw', price: 4.50 }
        ]
      },
      {
        name: 'Ghanaian Jollof Rice',
        price: 20,
        bulletPoints: [
          'Goat stew or Beef stew or grilled Chicken or Fish (fried whiting fish)',
          'Fried Plantains',
          'Coleslaw'
        ],
        extras: [
          { name: '2 Eggs (boiled)', price: 2.70 },
          { name: 'KFresh Shito Regular Spicy', price: 4.00 },
          { name: 'KFresh Shito Extra Spicy', price: 4.00 },
          { name: 'Jollof Stew (no meat)', price: 3.50 },
          { name: 'Jollof Stew (with meat)', price: 5.00 },
          { name: 'Fried Ripe Plantains', price: 7.00 },
          { name: 'Coleslaw', price: 4.50 }
        ]
      },
      {
        name: 'Waakye',
        price: 22,
        bulletPoints: [
          'Goat stew or Beef stew or grilled Chicken or Fish (fried whiting fish)',
          'Fried Plantains',
          'Coleslaw',
          'Gari',
          'Spaghetti'
        ],
        extras: [
          { name: '2 Eggs (boiled)', price: 2.70 },
          { name: 'KFresh Shito Regular Spicy', price: 4.00 },
          { name: 'KFresh Shito Extra Spicy', price: 4.00 },
          { name: 'Waakye Stew (no meat)', price: 3.50 },
          { name: 'Waakye Stew (with meat)', price: 5.00 },
          { name: 'Fried Ripe Plantains', price: 7.00 },
          { name: 'Coleslaw', price: 4.50 },
          { name: 'Gari', price: 2.50 },
          { name: 'Spaghetti', price: 3.50 },
          { name: 'Waakye in Leaf wrap', price: 3.50 }
        ]
      }
    ]
  },
  individualSideOrders: {
    title: 'Individual Side Orders',
    displayOrder: 2,
    items: [
      { name: 'Beef (in stew)', price: 20 },
      { name: 'Goat (in stew)', price: 20 },
      { name: 'Oxtail', price: 25 },
      { name: 'Curry Goat', price: 25 },
      { name: 'Rice & Peas', price: 12 },
      { name: 'Jollof Rice', price: 12 },
      { name: 'Waakye Rice', price: 12 },
      { name: 'Grilled Tilapia', price: 15 },
      { name: 'Jerk Chicken', price: 12 },
      { name: 'Curry Chicken', price: 15 },
      { name: 'Roti Wrap (with boneless chicken)', price: 16.50 },
      { name: 'Roti Wrap (with boneless goat)', price: 16.50 },
      {
        name: 'Nigerian Egusi Soup',
        price: 15,
        bulletPoints: ['Assorted Meat (Cow Tripe, Cow Skin, & Goat Meat)'],
        extras: [{ name: 'Hot Pepper Sauce', price: 2.50 }]
      },
      {
        name: 'Peanut Soup',
        price: 15,
        bulletPoints: ['Assorted meat (Hard Chicken, Beef, & Smoked Catfish)'],
        extras: [
          { name: 'Hot Pepper Sauce', price: 2.50 },
          { name: 'Okra', price: 2.50 }
        ]
      },
      {
        name: 'Light Soup',
        price: 15,
        bulletPoints: ['Assorted Meat & Fish (Goat, Tripe, Mackerel, & Smoked Catfish)'],
        extras: [
          { name: 'Hot Pepper Sauce', price: 2.50 },
          { name: 'Okra', price: 2.50 }
        ]
      },
      {
        name: 'Palm Soup',
        price: 15,
        bulletPoints: ['Assorted Meat & Fish (Goat, Cow Foot, Mackerel & Smoked Catfish)'],
        extras: [
          { name: 'Hot Pepper Sauce', price: 2.50 },
          { name: 'Okra', price: 2.50 }
        ]
      }
    ]
  },
  caribbeanRiceMeals: {
    title: 'Caribbean Rice Meals',
    displayOrder: 3,
    items: [
      {
        name: 'Oxtail with Rice & Peas',
        price: 25,
        bulletPoints: ['Coleslaw', 'Fried Ripe Plantains'],
        extras: [
          { name: 'Avocado', price: 3.50 },
          { name: 'Oxtail (portion)', price: 5.50 },
          { name: 'Oxtail Gravy', price: 2.50 },
          { name: 'Curry Goat (stew only)', price: 2.50 },
          { name: 'Hot Pepper Sauce', price: 2.50 }
        ]
      },
      {
        name: 'Jerk Chicken with Rice & Peas',
        price: 20,
        bulletPoints: ['Coleslaw', 'Fried Ripe Plantains'],
        extras: [
          { name: '2 piece jerk chicken', price: 8.50 },
          { name: 'Oxtail Gravy', price: 2.50 },
          { name: 'Curry Goat (Stew only)', price: 2.50 },
          { name: 'Hot Pepper Sauce', price: 2.50 }
        ]
      },
      {
        name: 'Curry Goat with Rice & Peas',
        price: 25,
        bulletPoints: ['Coleslaw', 'Fried Ripe Plantains'],
        extras: [
          { name: 'Avocado', price: 3.50 },
          { name: 'Curry Goat (portion)', price: 5.50 },
          { name: 'Curry Goat (Stew only)', price: 2.50 },
          { name: 'Oxtail Gravy', price: 2.50 },
          { name: 'Hot Pepper Sauce', price: 2.50 }
        ]
      },
      {
        name: 'Curry Chicken with Rice & Peas',
        price: 20,
        bulletPoints: ['Coleslaw', 'Fried Ripe Plantains'],
        extras: [
          { name: 'Avocado', price: 3.50 },
          { name: 'Curry Chicken (portion)', price: 5.50 },
          { name: 'Curry Chicken (Stew only)', price: 2.50 },
          { name: 'Oxtail Gravy', price: 2.50 },
          { name: 'Hot Pepper Sauce', price: 2.50 }
        ]
      }
    ]
  },
  jamaicanPatties: {
    title: 'Jamaican Patties',
    displayOrder: 4,
    items: [
      { name: 'Regular Spicy (dozen/box)', price: 16.99 },
      { name: 'Extra Spicy (dozen/box)', price: 16.99 },
      { name: 'Vegetarian (dozen/box)', price: 16.99 },
      { name: 'Chicken Extra Spicy (dozen/box)', price: 16.99 }
    ]
  },
  soupMeals: {
    title: 'Soup Meals',
    displayOrder: 5,
    items: [
      {
        name: 'Nigerian Egusi Soup (Full Meal)',
        price: 20,
        bulletPoints: [
          'Assorted Meat (Cow Tripe, Cow Skin, & Goat Meat)',
          'Choice of swallow: Fufu or Rice Balls or Banku or Eba'
        ],
        extras: [{ name: 'Hot Pepper Sauce', price: 2.50 }]
      },
      {
        name: 'Peanut Soup (Full Meal)',
        price: 20,
        bulletPoints: [
          'Assorted Meat (Hard Chicken, Beef, & Smoked Catfish)',
          'Choice of swallow: Fufu or Rice Balls or Banku or Eba'
        ],
        extras: [
          { name: 'Hot Pepper Sauce', price: 2.50 },
          { name: 'Okra', price: 2.50 }
        ]
      },
      {
        name: 'Light Soup (Full Meal)',
        price: 20,
        bulletPoints: [
          'Assorted Meat & Fish (Goat, Tripe, Mackerel, & Smoked Catfish)',
          'Choice of swallow: Fufu or Rice Balls or Banku or Eba'
        ],
        extras: [
          { name: 'Hot Pepper Sauce', price: 2.50 },
          { name: 'Okra', price: 2.50 }
        ]
      },
      {
        name: 'Palm Soup (Full Meal)',
        price: 20,
        bulletPoints: [
          'Assorted Meat & Fish (Goat, Cow Foot, Mackerel & Smoked Catfish)',
          'Choice of swallow: Fufu or Rice Balls or Banku or Eba'
        ],
        extras: [
          { name: 'Hot Pepper Sauce', price: 2.50 },
          { name: 'Okra', price: 2.50 }
        ]
      }
    ]
  },
  individualSwallows: {
    title: 'Individual Swallows',
    displayOrder: 6,
    items: [
      { name: 'Fufu', price: 8.99 },
      { name: 'Rice Balls / Omotuo', price: 8.99 },
      { name: 'Banku', price: 8.99 }
    ]
  },
  ghanaianSpecials: {
    title: 'Ghanaian Specials',
    displayOrder: 7,
    items: [
      {
        name: 'Kenkey (Fresh & Hot) (2 Kenkey)',
        price: 20,
        bulletPoints: [
          'Fried Fish (whiting fish)',
          'Hot Pepper',
          'KFresh Shito Regular Spicy OR Extra Spicy',
          'Slice Onions',
          'Slice Tomato'
        ]
      },
      {
        name: 'Gobe/Red Red in leaf wrap',
        price: 22,
        bulletPoints: [
          'Beans/blackeye peas',
          'Gari',
          'Fried ripe plantains',
          'Palm oil/zomi'
        ],
        extras: [
          { name: 'Egg (boiled)', price: 2.70 },
          { name: 'Hot Pepper Sauce', price: 2.50 }
        ]
      },
      {
        name: 'Gobe/Red Red',
        price: 20.25,
        bulletPoints: [
          'Beans/blackeye peas',
          'Fried ripe plantains',
          'Palm oil/zomi'
        ],
        extras: [
          { name: 'Egg (boiled)', price: 2.70 },
          { name: 'Hot Pepper Sauce', price: 2.50 }
        ]
      }
    ]
  },
  kfreshShito: {
    title: 'KFresh Shito',
    displayOrder: 8,
    items: [
      { name: 'KFresh Shito 5L', price: 150 },
      { name: 'KFresh Shito 2.5L', price: 75 },
      { name: 'KFresh Shito 500ml', price: 16.99 },
      { name: 'KFresh Shito 250ml', price: 8.99 }
    ]
  },
  vegetarianMeals: {
    title: 'Vegetarian Meals',
    displayOrder: 9,
    items: [
      { name: 'Roti Wrap with Curry Potatoes & Chickpeas', price: 13.50 },
      {
        name: 'Gobe/Red Red in leaf wrap (Vegetarian)',
        price: 22,
        bulletPoints: [
          'Beans/Blackeye Peas',
          'Gari',
          'Fried ripe plantains',
          'Palm oil/zomi'
        ]
      },
      {
        name: 'Gobe/Red Red (Vegetarian)',
        price: 20.25,
        bulletPoints: [
          'Beans/blackeye Peas',
          'Fried ripe plantains',
          'Palm oil/zomi'
        ]
      },
      { name: 'Jollof Rice (Vegetarian)', price: 0, comingSoon: true },
      { name: 'Waakye (Vegetarian)', price: 0, comingSoon: true }
    ]
  },
  plattersPartyTrays: {
    title: 'Platters / Party Trays',
    displayOrder: 10,
    items: [
      { name: 'Jerk Chicken (Platter)', price: 100 },
      { name: 'Grilled Tilapia (Platter)', price: 150 },
      { name: 'Curry Goat (Platter)', price: 150 },
      { name: 'Jollof (Platter)', price: 50 },
      { name: 'Waakye (Platter)', price: 65 },
      { name: 'Oxtail (Platter)', price: 150 },
      { name: 'Rice & Peas (Platter)', price: 50 },
      { name: 'Curry Chicken (Platter)', price: 100 },
      { name: 'Fried Ripe Plantain (Platter)', price: 50 },
      { name: 'Gobe/Red Red in leaf wrap (Platter)', price: 52, bulletPoints: ['beans, gari, fried ripe plantains & palm oil/zomi'] },
      { name: 'Gobe/Red Red (Platter)', price: 50.25, bulletPoints: ['beans, fried ripe plantains & palm oil/zomi'] },
      { name: 'Meat Pie (Chicken/Beef/Vege.) (10 pcs)', price: 35 },
      { name: 'Chin Chin (Platter)', price: 59.90 },
      { name: 'Puff Puff (80 pcs)', price: 70 }
    ]
  },
  largeSoupContainers: {
    title: 'Large Container of Soup',
    displayOrder: 11,
    items: [
      { name: 'Nigerian Egusi Soup (Large)', price: 100 },
      { name: 'Peanut Soup (Large)', price: 100 },
      { name: 'Light Soup (Large)', price: 100 },
      { name: 'Palm Soup (Large)', price: 100 }
    ]
  }
}

async function createCategory(name, slug, displayOrder) {
  // Check if exists
  const { data: existing } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', slug)
    .single()

  if (existing) {
    console.log(`  ✓ Category exists: ${name}`)
    return existing.id
  }

  const { data, error } = await supabase
    .from('categories')
    .insert({
      name,
      slug,
      description: `${name} - Fresh Meals & Takeout`,
      is_active: true,
      is_fresh_meals: true,
      display_order: displayOrder
    })
    .select('id')
    .single()

  if (error) {
    console.error(`  ✗ Error creating category ${name}:`, error.message)
    return null
  }

  console.log(`  ✓ Created category: ${name}`)
  return data.id
}

async function createProduct(item, categoryId, displayOrder) {
  const slug = generateSlug(item.name)

  // Check if exists
  const { data: existing } = await supabase
    .from('products')
    .select('id')
    .eq('slug', slug)
    .single()

  if (existing) {
    // Update existing product with fresh meals data
    const { error } = await supabase
      .from('products')
      .update({
        price: item.price,
        is_cooked: true,
        delivery_type: 'pickup',
        is_available: !item.comingSoon,
        metadata: {
          bullet_points: item.bulletPoints || [],
          extras: item.extras || [],
          coming_soon: item.comingSoon || false,
          display_order: displayOrder,
          fresh_meals: true
        }
      })
      .eq('id', existing.id)

    if (error) {
      console.log(`    ✗ Error updating ${item.name}: ${error.message}`)
    } else {
      console.log(`    ↻ Updated: ${item.name}`)
    }
    return
  }

  const productData = {
    name: item.name,
    slug,
    description: item.bulletPoints ? item.bulletPoints.join('. ') : item.name,
    short_description: item.bulletPoints ? item.bulletPoints[0] : item.name,
    price: item.price,
    category_id: categoryId,
    is_available: !item.comingSoon,
    is_featured: false,
    is_cooked: true,
    delivery_type: 'pickup',
    track_inventory: false,
    images: [],
    metadata: {
      bullet_points: item.bulletPoints || [],
      extras: item.extras || [],
      coming_soon: item.comingSoon || false,
      display_order: displayOrder,
      fresh_meals: true
    }
  }

  const { error } = await supabase
    .from('products')
    .insert(productData)

  if (error) {
    console.log(`    ✗ Error: ${item.name} - ${error.message}`)
  } else {
    console.log(`    ✓ Added: ${item.name} - $${item.price}`)
  }
}

async function migrate() {
  console.log('=' .repeat(60))
  console.log('🍽️  FRESH MEALS DATABASE MIGRATION')
  console.log('=' .repeat(60))
  console.log('')

  let totalProducts = 0

  for (const [key, section] of Object.entries(menuData)) {
    console.log(`\n📂 ${section.title}`)

    // Create category
    const slug = generateSlug(section.title)
    const categoryId = await createCategory(section.title, slug, section.displayOrder)

    if (!categoryId) continue

    // Create products
    for (let i = 0; i < section.items.length; i++) {
      await createProduct(section.items[i], categoryId, i + 1)
      totalProducts++
      // Small delay
      await new Promise(r => setTimeout(r, 50))
    }
  }

  console.log('\n' + '=' .repeat(60))
  console.log('📊 MIGRATION COMPLETE')
  console.log('=' .repeat(60))
  console.log(`Total categories: ${Object.keys(menuData).length}`)
  console.log(`Total products: ${totalProducts}`)
  console.log('')
  console.log('Next: Update Fresh Meals page to fetch from database')
  console.log('=' .repeat(60))
}

migrate()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Fatal error:', err)
    process.exit(1)
  })
