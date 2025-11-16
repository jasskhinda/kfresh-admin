const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: './.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

async function uploadTakeoutMenu() {
  console.log('🍽️ Uploading Takeout Menu Items...\n')

  // Get the Fresh Meals & Takeout category ID
  const { data: category } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', 'fresh-meals-takeout')
    .single()

  if (!category) {
    console.error('❌ Fresh Meals & Takeout category not found!')
    return
  }

  const categoryId = category.id
  console.log(`✅ Using category ID: ${categoryId}\n`)

  // All takeout items from the PDF
  const takeoutItems = [
    // COMBO MEALS
    {
      name: 'Jollof Rice (Combo)',
      price: 20.00,
      description: 'Choice of Goat, Beef, Chicken, or Fish. Served with fried plantains and coleslaw.',
      slug: 'jollof-rice-combo',
      unit: 'combo',
      stock_quantity: 100
    },
    {
      name: 'Waakye (Combo)',
      price: 22.00,
      description: 'Choice of Goat, Beef, Chicken, or Fish. Served with fried plantains, coleslaw, gari, and spaghetti.',
      slug: 'waakye-combo',
      unit: 'combo',
      stock_quantity: 100
    },
    {
      name: 'Jerk Chicken (Combo)',
      price: 20.00,
      description: 'Served with fried plantain, coleslaw, and rice & peas.',
      slug: 'jerk-chicken-combo',
      unit: 'combo',
      stock_quantity: 100
    },
    {
      name: 'Oxtail with Rice & Peas',
      price: 20.00,
      description: 'Served with coleslaw, fried ripe plantains, and gravy.',
      slug: 'oxtail-rice-peas',
      unit: 'combo',
      stock_quantity: 100
    },
    {
      name: 'Curry Goat with Rice & Peas',
      price: 20.00,
      description: 'Tender curry goat served with rice & peas.',
      slug: 'curry-goat-rice-peas',
      unit: 'combo',
      stock_quantity: 100
    },
    {
      name: 'Kenkey (Fresh & Hot)',
      price: 20.00,
      description: 'Served with fried fish, hot pepper, KFresh Shito (Regular or Extra Spicy), slice onions, and slice tomato.',
      slug: 'kenkey-fresh-hot',
      unit: 'meal',
      stock_quantity: 100
    },

    // ROTI & DOUBLES
    {
      name: 'Fresh Roti (2 big pcs)',
      price: 8.00,
      description: 'Two large pieces of freshly made roti.',
      slug: 'fresh-roti-2pcs',
      unit: 'piece',
      stock_quantity: 100
    },
    {
      name: 'Fresh Dhal Puri (2 big pcs)',
      price: 7.50,
      description: 'Two large pieces of fresh dhal puri.',
      slug: 'fresh-dhal-puri-2pcs',
      unit: 'piece',
      stock_quantity: 100
    },
    {
      name: 'Fresh Doubles (Regular Spicy)',
      price: 8.00,
      description: 'Fresh doubles with regular spice level.',
      slug: 'fresh-doubles-regular',
      unit: 'piece',
      stock_quantity: 100
    },
    {
      name: 'Fresh Doubles (Extra Spicy)',
      price: 8.00,
      description: 'Fresh doubles with extra spice.',
      slug: 'fresh-doubles-extra-spicy',
      unit: 'piece',
      stock_quantity: 100
    },

    // MEAT DISHES
    {
      name: 'Beef (in stew)',
      price: 15.00,
      description: 'Tender beef in flavorful stew.',
      slug: 'beef-in-stew',
      unit: 'portion',
      stock_quantity: 100
    },
    {
      name: 'Goat (in stew)',
      price: 15.00,
      description: 'Tender goat meat in flavorful stew.',
      slug: 'goat-in-stew',
      unit: 'portion',
      stock_quantity: 100
    },
    {
      name: 'Oxtail',
      price: 15.00,
      description: 'Tender braised oxtail.',
      slug: 'oxtail',
      unit: 'portion',
      stock_quantity: 100
    },
    {
      name: 'Curry Goat',
      price: 15.00,
      description: 'Tender goat meat in curry sauce.',
      slug: 'curry-goat',
      unit: 'portion',
      stock_quantity: 100
    },
    {
      name: 'Jerk Chicken',
      price: 15.00,
      description: 'Authentic Jamaican jerk chicken.',
      slug: 'jerk-chicken',
      unit: 'portion',
      stock_quantity: 100
    },
    {
      name: 'Fried Chicken',
      price: 15.00,
      description: 'Crispy fried chicken.',
      slug: 'fried-chicken',
      unit: 'portion',
      stock_quantity: 100
    },
    {
      name: 'Grilled Tilapia',
      price: 15.00,
      description: 'Fresh grilled tilapia fish.',
      slug: 'grilled-tilapia',
      unit: 'portion',
      stock_quantity: 100
    },
    {
      name: 'Rasta Paster',
      price: 15.00,
      description: 'Flavorful rasta paster dish.',
      slug: 'rasta-paster',
      unit: 'portion',
      stock_quantity: 100
    },

    // SOUPS
    {
      name: 'Peanut Soup',
      price: 15.00,
      description: 'Rich peanut soup with assorted meat (Hard Chicken, Beef, & Smoked Catfish).',
      slug: 'peanut-soup',
      unit: 'bowl',
      stock_quantity: 100
    },
    {
      name: 'Light Soup',
      price: 15.00,
      description: 'Light soup with assorted meat & fish (Goat, tripe, Mackerel, & Smoked Catfish).',
      slug: 'light-soup',
      unit: 'bowl',
      stock_quantity: 100
    },
    {
      name: 'Palm Soup',
      price: 15.00,
      description: 'Palm soup with assorted meat & fish (Goat, Cow Foot, Mackerel & Smoked Catfish).',
      slug: 'palm-soup',
      unit: 'bowl',
      stock_quantity: 100
    },

    // SIDES & STAPLES
    {
      name: 'Rice & Peas',
      price: 15.00,
      description: 'Traditional rice and peas.',
      slug: 'rice-and-peas',
      unit: 'portion',
      stock_quantity: 100
    },
    {
      name: 'Fufu',
      price: 8.99,
      description: 'Traditional West African fufu.',
      slug: 'fufu',
      unit: 'piece',
      stock_quantity: 100
    },
    {
      name: 'Rice Balls / Omotuo',
      price: 8.99,
      description: 'Traditional rice balls (Omotuo).',
      slug: 'rice-balls-omotuo',
      unit: 'piece',
      stock_quantity: 100
    },
    {
      name: 'Banku',
      price: 8.99,
      description: 'Traditional fermented corn dough.',
      slug: 'banku',
      unit: 'piece',
      stock_quantity: 100
    },

    // GOBE DISHES
    {
      name: 'Gobe in leaves rap',
      price: 22.00,
      description: 'Beans/blackeye peas, gari, fried ripe plantains & palm oil/zomi wrapped in leaves.',
      slug: 'gobe-in-leaves-rap',
      unit: 'meal',
      stock_quantity: 100
    },
    {
      name: 'Gobe',
      price: 20.25,
      description: 'Beans/blackeye peas, fried ripe plantains & palm oil/zomi.',
      slug: 'gobe',
      unit: 'meal',
      stock_quantity: 100
    },

    // VEGETARIAN
    {
      name: 'Roti Rap with Curry Potatoes & Chickpeas',
      price: 16.50,
      description: 'Vegetarian roti wrap with curry potatoes and chickpeas.',
      slug: 'roti-rap-curry-potatoes-chickpeas',
      unit: 'piece',
      stock_quantity: 100
    },

    // EXTRAS - Jollof Combo Extras
    {
      name: 'Egg (boiled)',
      price: 2.70,
      description: 'Boiled egg.',
      slug: 'boiled-egg',
      unit: 'piece',
      stock_quantity: 100
    },
    {
      name: 'KFresh Shito Regular Spicy',
      price: 4.00,
      description: 'KFresh regular spicy shito sauce.',
      slug: 'kfresh-shito-regular-spicy-extra',
      unit: 'portion',
      stock_quantity: 100
    },
    {
      name: 'KFresh Shito Extra Spicy',
      price: 4.00,
      description: 'KFresh extra spicy shito sauce.',
      slug: 'kfresh-shito-extra-spicy-extra',
      unit: 'portion',
      stock_quantity: 100
    },
    {
      name: 'Jollof Stew',
      price: 3.50,
      description: 'Extra jollof stew.',
      slug: 'jollof-stew',
      unit: 'portion',
      stock_quantity: 100
    },
    {
      name: 'Fried Ripe Plantains',
      price: 7.00,
      description: 'Sweet fried ripe plantains.',
      slug: 'fried-ripe-plantains',
      unit: 'portion',
      stock_quantity: 100
    },
    {
      name: 'Jollof',
      price: 12.00,
      description: 'Jollof rice only.',
      slug: 'jollof-rice-only',
      unit: 'portion',
      stock_quantity: 100
    },
    {
      name: 'Coleslaw',
      price: 7.00,
      description: 'Fresh coleslaw.',
      slug: 'coleslaw',
      unit: 'portion',
      stock_quantity: 100
    },

    // Oxtail Extras
    {
      name: 'Avocado',
      price: 3.50,
      description: 'Fresh avocado.',
      slug: 'avocado-extra',
      unit: 'piece',
      stock_quantity: 100
    },
    {
      name: 'Oxtail (portion)',
      price: 5.50,
      description: 'Extra portion of oxtail.',
      slug: 'oxtail-portion',
      unit: 'portion',
      stock_quantity: 100
    },
    {
      name: 'Oxtail Gravy',
      price: 2.50,
      description: 'Extra oxtail gravy.',
      slug: 'oxtail-gravy',
      unit: 'portion',
      stock_quantity: 100
    },
    {
      name: 'Hot Pepper',
      price: 2.50,
      description: 'Hot pepper sauce.',
      slug: 'hot-pepper',
      unit: 'portion',
      stock_quantity: 100
    },

    // Waakye Extras
    {
      name: 'Waakye Stew',
      price: 3.50,
      description: 'Extra waakye stew.',
      slug: 'waakye-stew',
      unit: 'portion',
      stock_quantity: 100
    },
    {
      name: 'Waakye',
      price: 12.00,
      description: 'Waakye rice only.',
      slug: 'waakye-rice-only',
      unit: 'portion',
      stock_quantity: 100
    },
    {
      name: 'Gari',
      price: 2.50,
      description: 'Gari (cassava flakes).',
      slug: 'gari',
      unit: 'portion',
      stock_quantity: 100
    },
    {
      name: 'Spaghetti',
      price: 3.50,
      description: 'Side of spaghetti.',
      slug: 'spaghetti',
      unit: 'portion',
      stock_quantity: 100
    },
    {
      name: 'Waakye in Leaves Rap',
      price: 3.50,
      description: 'Waakye wrapped in leaves.',
      slug: 'waakye-in-leaves-rap',
      unit: 'portion',
      stock_quantity: 100
    },

    // Soup Extras
    {
      name: 'Hot Pepper Sauce',
      price: 2.50,
      description: 'Hot pepper sauce.',
      slug: 'hot-pepper-sauce',
      unit: 'portion',
      stock_quantity: 100
    },
    {
      name: 'Okro',
      price: 2.50,
      description: 'Okro side.',
      slug: 'okro',
      unit: 'portion',
      stock_quantity: 100
    },

    // Jerk Chicken Extras
    {
      name: 'Curry Goat Gravy',
      price: 2.50,
      description: 'Extra curry goat gravy.',
      slug: 'curry-goat-gravy',
      unit: 'portion',
      stock_quantity: 100
    },

    // Curry Goat Extras
    {
      name: 'Curry Goat (portion)',
      price: 5.50,
      description: 'Extra portion of curry goat.',
      slug: 'curry-goat-portion',
      unit: 'portion',
      stock_quantity: 100
    },

    // KFRESH SHITO BOTTLES
    {
      name: 'KFresh Shito 5L',
      price: 150.00,
      description: '5 liter bottle of KFresh Shito.',
      slug: 'kfresh-shito-5l',
      unit: 'bottle',
      stock_quantity: 50
    },
    {
      name: 'KFresh Shito 2.5L',
      price: 75.00,
      description: '2.5 liter bottle of KFresh Shito.',
      slug: 'kfresh-shito-2-5l',
      unit: 'bottle',
      stock_quantity: 50
    },
    {
      name: 'KFresh Shito 500ml',
      price: 16.99,
      description: '500ml bottle of KFresh Shito.',
      slug: 'kfresh-shito-500ml',
      unit: 'bottle',
      stock_quantity: 100
    },
    {
      name: 'KFresh Shito 250ml',
      price: 8.99,
      description: '250ml bottle of KFresh Shito.',
      slug: 'kfresh-shito-250ml',
      unit: 'bottle',
      stock_quantity: 100
    },

    // PARTY TRAYS / PLATTERS
    {
      name: 'Jerk Chicken (Party Tray)',
      price: 100.00,
      description: 'Party tray of jerk chicken.',
      slug: 'jerk-chicken-party-tray',
      unit: 'tray',
      stock_quantity: 50
    },
    {
      name: 'Grilled Tilapia (Party Tray)',
      price: 150.00,
      description: 'Party tray of grilled tilapia.',
      slug: 'grilled-tilapia-party-tray',
      unit: 'tray',
      stock_quantity: 50
    },
    {
      name: 'Curry Goat (Party Tray)',
      price: 150.00,
      description: 'Party tray of curry goat.',
      slug: 'curry-goat-party-tray',
      unit: 'tray',
      stock_quantity: 50
    },
    {
      name: 'Jollof (Party Tray)',
      price: 100.00,
      description: 'Party tray of jollof rice.',
      slug: 'jollof-party-tray',
      unit: 'tray',
      stock_quantity: 50
    },
    {
      name: 'Waakye (Party Tray)',
      price: 100.00,
      description: 'Party tray of waakye.',
      slug: 'waakye-party-tray',
      unit: 'tray',
      stock_quantity: 50
    },
    {
      name: 'Oxtail (Party Tray)',
      price: 150.00,
      description: 'Party tray of oxtail.',
      slug: 'oxtail-party-tray',
      unit: 'tray',
      stock_quantity: 50
    },
    {
      name: 'Rice & Peas (Party Tray)',
      price: 100.00,
      description: 'Party tray of rice & peas.',
      slug: 'rice-peas-party-tray',
      unit: 'tray',
      stock_quantity: 50
    },
    {
      name: 'Fried Chicken (Party Tray)',
      price: 100.00,
      description: 'Party tray of fried chicken.',
      slug: 'fried-chicken-party-tray',
      unit: 'tray',
      stock_quantity: 50
    },
    {
      name: 'Fried Ripe Plantain (Party Tray)',
      price: 50.00,
      description: 'Party tray of fried ripe plantains.',
      slug: 'fried-ripe-plantain-party-tray',
      unit: 'tray',
      stock_quantity: 50
    },
    {
      name: 'Gobe in leaves rap (Party Tray)',
      price: 52.00,
      description: 'Party tray of gobe in leaves rap.',
      slug: 'gobe-leaves-rap-party-tray',
      unit: 'tray',
      stock_quantity: 50
    },
    {
      name: 'Gobe (Party Tray)',
      price: 50.25,
      description: 'Party tray of gobe.',
      slug: 'gobe-party-tray',
      unit: 'tray',
      stock_quantity: 50
    },

    // BIG CONTAINER SOUPS
    {
      name: 'Peanut Soup (Big Container)',
      price: 100.00,
      description: 'Large container of peanut soup.',
      slug: 'peanut-soup-big-container',
      unit: 'container',
      stock_quantity: 50
    },
    {
      name: 'Light Soup (Big Container)',
      price: 100.00,
      description: 'Large container of light soup.',
      slug: 'light-soup-big-container',
      unit: 'container',
      stock_quantity: 50
    },
    {
      name: 'Palm Soup (Big Container)',
      price: 100.00,
      description: 'Large container of palm soup.',
      slug: 'palm-soup-big-container',
      unit: 'container',
      stock_quantity: 50
    }
  ]

  console.log(`📦 Preparing to upload ${takeoutItems.length} items...\n`)

  let successCount = 0
  let errorCount = 0

  for (const item of takeoutItems) {
    try {
      const productData = {
        name: item.name,
        slug: item.slug,
        description: item.description,
        price: item.price,
        category_id: categoryId,
        unit: item.unit,
        stock_quantity: item.stock_quantity,
        is_available: true,
        is_cooked: true, // ✅ Mark as Fresh Meal Item
        delivery_type: 'fresh_meals', // ✅ Fresh Meals & Cooked Foods (Pickup Only)
        requires_shipping: false,
        track_inventory: true,
        low_stock_threshold: 5,
        images: [],
        compare_price: null,
        cost_price: null,
        sku: null,
        barcode: null,
        brand: 'KFresh',
        weight: null,
        is_featured: false,
        tax_exempt: false,
        metadata: {},
        seo_title: item.name,
        seo_description: item.description,
        ingredients: null,
        nutrition_info: null,
        short_description: null,
        uber_eats_url: null,
        doordash_url: null
      }

      const { data, error } = await supabase
        .from('products')
        .insert([productData])
        .select()
        .single()

      if (error) {
        console.error(`❌ Error uploading "${item.name}":`, error.message)
        errorCount++
      } else {
        console.log(`✅ Uploaded: ${item.name} ($${item.price})`)
        successCount++
      }
    } catch (err) {
      console.error(`❌ Exception uploading "${item.name}":`, err.message)
      errorCount++
    }
  }

  console.log('\n' + '='.repeat(50))
  console.log(`✅ Successfully uploaded: ${successCount} items`)
  console.log(`❌ Failed: ${errorCount} items`)
  console.log('='.repeat(50))
  console.log('\n🎉 All takeout menu items have been uploaded!')
  console.log('\n📋 Configuration for all items:')
  console.log('   ✅ is_cooked = true (Mark as Fresh Meal Item)')
  console.log('   ✅ delivery_type = "fresh_meals" (Pickup Only)')
  console.log('   ✅ category = "Fresh Meals & Takeout"')
}

uploadTakeoutMenu()
