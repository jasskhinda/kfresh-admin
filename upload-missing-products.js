const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: './.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

// Category IDs from existing database
const SPICES_CATEGORY_ID = 'd9fe0ea0-f88d-4dfe-88bb-c899f3d3fb17'

async function getCategories() {
  console.log('📁 Fetching category IDs...\n')

  const { data: sauces } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', 'sauces-condiments')
    .single()

  const { data: baking } = await supabase
    .from('categories')
    .select('id')
    .ilike('name', '%baking%')
    .limit(1)
    .single()

  return {
    spices: SPICES_CATEGORY_ID,
    sauces: sauces?.id || SPICES_CATEGORY_ID,
    baking: baking?.id || SPICES_CATEGORY_ID
  }
}

function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[()]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

async function checkExisting(productName) {
  const { data } = await supabase
    .from('products')
    .select('id')
    .ilike('name', `%${productName}%`)
    .limit(1)

  return data && data.length > 0
}

async function uploadMissingProducts() {
  console.log('🚀 Starting Missing Products Upload...\n')
  console.log('=' .repeat(60))

  const categories = await getCategories()
  console.log('📂 Categories loaded:', categories, '\n')

  // ============================================
  // IRIE SMALL PACKET SPICES (Missing)
  // ============================================
  const irieSmallSpices = [
    {
      name: 'Irie Maple Pepper Seasoning (50g)',
      shortDescription: 'Sweet maple and pepper blend',
      description: 'A unique blend of sweet maple and black pepper, perfect for glazed meats, roasted vegetables, and adding a sweet-savory touch to any dish. Great for pork chops, chicken, and fall-inspired recipes.',
      weight: '50g',
      brand: 'Irie'
    },
    {
      name: 'Irie Miracle Seasoning (40g)',
      shortDescription: 'All-in-one flavor enhancer',
      description: 'The ultimate all-in-one seasoning that works miracles on any dish. A carefully balanced blend of herbs and spices that enhances the natural flavors of meats, vegetables, soups, and stews.',
      weight: '40g',
      brand: 'Irie'
    },
    {
      name: 'Irie Pork Chop Seasoning (40g)',
      shortDescription: 'Perfect blend for pork',
      description: 'Specially crafted seasoning for juicy, flavorful pork chops. A savory blend of herbs and spices that brings out the best in pork, perfect for grilling, frying, or baking.',
      weight: '40g',
      brand: 'Irie'
    },
    {
      name: 'Irie Smoky Chipotle Seasoning (50g)',
      shortDescription: 'Smoky chipotle heat',
      description: 'Rich, smoky chipotle flavor with a pleasant kick of heat. Ideal for Mexican-inspired dishes, grilled meats, tacos, burritos, and adding a smoky depth to any recipe.',
      weight: '50g',
      brand: 'Irie'
    },
    {
      name: 'Irie Three Pepper Spice (40g)',
      shortDescription: 'Triple pepper blend',
      description: 'A bold combination of three premium peppers for layered heat and flavor. Perfect for those who love pepper but want more complexity than single-pepper seasonings.',
      weight: '40g',
      brand: 'Irie'
    }
  ]

  // ============================================
  // GEETA SMALL PACKET SPICES (50g)
  // ============================================
  const geetaSmallSpices = [
    {
      name: 'Geeta Amchar Masala (50g)',
      shortDescription: 'Tangy mango pickle spice',
      description: 'Traditional Indian spice blend used for making authentic amchar (mango pickle). A tangy, aromatic mix that adds authentic South Asian flavor to pickles, chutneys, and savory dishes.',
      weight: '50g',
      brand: 'Geeta'
    },
    {
      name: 'Geeta Black Mangriel Whole (40g)',
      shortDescription: 'Whole black onion seeds',
      description: 'Also known as kalonji or nigella seeds. These aromatic black seeds have a slightly bitter, peppery flavor. Essential for Indian breads, pickles, and Bengali five-spice blend.',
      weight: '40g',
      brand: 'Geeta'
    },
    {
      name: 'Geeta Black Mangriel Ground (40g)',
      shortDescription: 'Ground black onion seeds',
      description: 'Finely ground kalonji (nigella) seeds for easy incorporation into curries, vegetable dishes, and spice blends. Adds a distinctive onion-like flavor with earthy undertones.',
      weight: '40g',
      brand: 'Geeta'
    },
    {
      name: 'Geeta Fennel Ground (50g)',
      shortDescription: 'Sweet aromatic fennel',
      description: 'Finely ground fennel seeds with a sweet, anise-like flavor. Perfect for Indian curries, Italian sausages, baked goods, and as a digestive after meals.',
      weight: '50g',
      brand: 'Geeta'
    },
    {
      name: 'Geeta Fennel Whole (50g)',
      shortDescription: 'Whole fennel seeds',
      description: 'Premium whole fennel seeds with sweet, licorice-like aroma. Use in spice blends, teas, curries, and as a mouth freshener. Toast before grinding for enhanced flavor.',
      weight: '50g',
      brand: 'Geeta'
    },
    {
      name: 'Geeta Fenugreek Ground (50g)',
      shortDescription: 'Aromatic ground methi',
      description: 'Ground fenugreek (methi) with its distinctive maple-curry aroma. Essential for Indian curries, spice blends, and Ethiopian cuisine. Use sparingly as the flavor is potent.',
      weight: '50g',
      brand: 'Geeta'
    },
    {
      name: 'Geeta Fenugreek Whole (50g)',
      shortDescription: 'Whole fenugreek seeds',
      description: 'Whole fenugreek seeds for tempering, pickling, and grinding fresh. Key ingredient in panch phoron and curry powders. Adds a distinctive bitter-sweet flavor.',
      weight: '50g',
      brand: 'Geeta'
    },
    {
      name: 'Geeta Garam Masala Roasted (50g)',
      shortDescription: 'Premium roasted spice blend',
      description: 'Aromatic blend of roasted whole spices including cinnamon, cardamom, cloves, and cumin. The roasting intensifies flavors for rich, warming curries and rice dishes.',
      weight: '50g',
      brand: 'Geeta'
    },
    {
      name: 'Geeta Green Cardamom Ground (15g)',
      shortDescription: 'Fragrant ground elaichi',
      description: 'Finely ground green cardamom with intense, aromatic sweetness. Essential for Indian desserts, chai tea, biryani, and Scandinavian baking. A little goes a long way.',
      weight: '15g',
      brand: 'Geeta'
    },
    {
      name: 'Geeta Green Cardamom Whole (15g)',
      shortDescription: 'Whole green cardamom pods',
      description: 'Premium whole green cardamom pods with fragrant seeds inside. Crush before using in rice dishes, curries, desserts, and hot beverages for maximum aroma.',
      weight: '15g',
      brand: 'Geeta'
    },
    {
      name: 'Geeta Mustard Seed Brown (50g)',
      shortDescription: 'Pungent brown mustard',
      description: 'Brown mustard seeds with stronger, more pungent flavor than yellow. Essential for Indian tempering (tadka), pickles, and Bengali cuisine. Pop in hot oil to release nutty flavor.',
      weight: '50g',
      brand: 'Geeta'
    },
    {
      name: 'Geeta Mustard Yellow Ground (50g)',
      shortDescription: 'Ground yellow mustard',
      description: 'Mild, ground yellow mustard powder perfect for making homemade mustard, salad dressings, marinades, and adding to cheese sauces and curries.',
      weight: '50g',
      brand: 'Geeta'
    },
    {
      name: 'Geeta Mustard Seed Yellow (50g)',
      shortDescription: 'Mild yellow mustard seeds',
      description: 'Whole yellow mustard seeds with mild, slightly sweet flavor. Use for pickling, making whole grain mustard, Indian tempering, and spice blends.',
      weight: '50g',
      brand: 'Geeta'
    }
  ]

  // ============================================
  // GEETA LARGE SPICES (Bulk sizes)
  // ============================================
  const geetaLargeSpices = [
    {
      name: 'Geeta Amchar Masala (454g)',
      shortDescription: 'Bulk tangy pickle spice',
      description: 'Large size traditional amchar masala for making authentic mango pickles and chutneys. Perfect for families who love homemade Indian pickles or food service use.',
      weight: '454g',
      brand: 'Geeta'
    },
    {
      name: 'Geeta Coriander Whole (300g)',
      shortDescription: 'Bulk whole coriander',
      description: 'Premium whole coriander seeds in bulk size. Toast and grind fresh for the most aromatic curries, or use whole in pickling brines and slow-cooked dishes.',
      weight: '300g',
      brand: 'Geeta'
    },
    {
      name: 'Geeta Cumin Whole (454g)',
      shortDescription: 'Bulk whole cumin seeds',
      description: 'Large pack of premium whole cumin seeds. Essential for Indian, Mexican, and Middle Eastern cooking. Toast before grinding for intensified earthy, nutty flavor.',
      weight: '454g',
      brand: 'Geeta'
    },
    {
      name: 'Geeta Garam Masala Ground Roasted (340g)',
      shortDescription: 'Bulk roasted garam masala',
      description: 'Premium roasted garam masala in bulk size. A warming blend of cinnamon, cardamom, cloves, cumin, and coriander. Perfect for frequent cooking or food service.',
      weight: '340g',
      brand: 'Geeta'
    },
    {
      name: 'Geeta Garlic Powder (454g)',
      shortDescription: 'Bulk garlic powder',
      description: 'Pure garlic powder in large size for everyday cooking. Adds instant garlic flavor to marinades, rubs, sauces, soups, and any dish that needs a savory boost.',
      weight: '454g',
      brand: 'Geeta'
    },
    {
      name: 'Geeta Roasted Cumin Ground (340g)',
      shortDescription: 'Bulk roasted cumin powder',
      description: 'Pre-roasted ground cumin with deep, smoky flavor. The roasting process brings out nutty, earthy notes. Ready to use in curries, chaat, raita, and spice blends.',
      weight: '340g',
      brand: 'Geeta'
    },
    {
      name: 'Geeta Roasted Cumin Whole (454g)',
      shortDescription: 'Bulk roasted whole cumin',
      description: 'Whole cumin seeds that have been roasted for enhanced flavor. Grind fresh as needed or use whole as a finishing spice. Popular in Indian chaat and raita.',
      weight: '454g',
      brand: 'Geeta'
    },
    {
      name: 'Geeta Turmeric Powder (350g)',
      shortDescription: 'Bulk golden turmeric',
      description: 'Vibrant golden turmeric powder in bulk size. Essential for curries, rice dishes, and golden milk. Known for its earthy flavor and numerous health benefits.',
      weight: '350g',
      brand: 'Geeta'
    }
  ]

  // ============================================
  // GREEN SEASONING / CHADON BENI
  // ============================================
  const greenSeasonings = [
    {
      name: 'Geeta Green Seasoning (12oz)',
      shortDescription: 'Fresh Caribbean green seasoning',
      description: 'Authentic Caribbean green seasoning made with fresh herbs including chadon beni, thyme, garlic, and peppers. The essential marinade for jerk chicken, curries, and all Caribbean cooking.',
      weight: '12oz',
      brand: 'Geeta'
    },
    {
      name: 'Chadon Beni Seasoning (946ml)',
      shortDescription: 'Large chadon beni blend',
      description: 'Large size traditional chadon beni (culantro) seasoning. This intensely flavored herb paste is stronger than cilantro and essential for authentic Trinidad and Caribbean dishes.',
      weight: '946ml',
      brand: 'Chadon Beni'
    },
    {
      name: 'Chadon Beni Seasoning (350ml)',
      shortDescription: 'Caribbean herb seasoning',
      description: 'Traditional chadon beni seasoning in convenient size. Made from culantro leaves, this aromatic paste adds authentic Caribbean flavor to meats, seafood, and rice dishes.',
      weight: '350ml',
      brand: 'Chadon Beni'
    },
    {
      name: 'Chadon Beni Hot Pepper Sauce (350ml)',
      shortDescription: 'Spicy chadon beni sauce',
      description: 'Fiery hot pepper sauce infused with chadon beni herbs. Perfect balance of heat and herbal flavor for those who like their Caribbean food with a serious kick.',
      weight: '350ml',
      brand: 'Chadon Beni'
    }
  ]

  // ============================================
  // GEETA SPICE MIXES
  // ============================================
  const geetaSpiceMixes = [
    {
      name: 'Geeta Goat & Duck Curry (340g)',
      shortDescription: 'Specialty curry powder',
      description: 'Traditional curry powder blend specially formulated for goat and duck curries. A robust mix of spices that stands up to strong-flavored meats and creates authentic Caribbean curries.',
      weight: '340g',
      brand: 'Geeta'
    }
  ]

  // ============================================
  // ESTATE BRANDS
  // ============================================
  const estateBrands = [
    {
      name: 'Barbados Hot Sauce (350ml)',
      shortDescription: 'Authentic Bajan pepper sauce',
      description: 'Traditional Barbadian hot sauce with Caribbean scotch bonnet peppers, mustard, and local spices. A tangy, fiery sauce perfect for fish, chicken, and adding island heat to any dish.',
      weight: '350ml',
      brand: 'Estate'
    },
    {
      name: 'Estate Cumin Roasted Ground (60g)',
      shortDescription: 'Roasted ground cumin',
      description: 'Premium roasted ground cumin with intensified smoky, nutty flavor. Ready to use in curries, chili, tacos, hummus, and Middle Eastern dishes.',
      weight: '60g',
      brand: 'Estate'
    },
    {
      name: 'Estate Cumin Roasted Ground (500g)',
      shortDescription: 'Bulk roasted cumin powder',
      description: 'Large size roasted ground cumin for frequent cooking. Pre-roasted for convenience with deep, earthy flavor perfect for professional and home kitchens.',
      weight: '500g',
      brand: 'Estate'
    }
  ]

  // Combine all products with their categories
  const allProducts = [
    ...irieSmallSpices.map(p => ({ ...p, category_id: categories.spices })),
    ...geetaSmallSpices.map(p => ({ ...p, category_id: categories.spices })),
    ...geetaLargeSpices.map(p => ({ ...p, category_id: categories.spices })),
    ...greenSeasonings.map(p => ({ ...p, category_id: categories.sauces })),
    ...geetaSpiceMixes.map(p => ({ ...p, category_id: categories.spices })),
    ...estateBrands.map(p => ({ ...p, category_id: categories.sauces }))
  ]

  console.log(`\n📦 Total products to check: ${allProducts.length}\n`)

  let added = 0
  let skipped = 0

  for (const product of allProducts) {
    // Check if product already exists
    const exists = await checkExisting(product.name.split('(')[0].trim())

    if (exists) {
      console.log(`⏭️  SKIP: ${product.name} (already exists)`)
      skipped++
      continue
    }

    // Extract numeric weight from string like "50g" or "350ml"
    const weightMatch = product.weight.match(/(\d+)/)
    const numericWeight = weightMatch ? parseInt(weightMatch[1]) : null

    const productData = {
      name: product.name,
      slug: generateSlug(product.name),
      short_description: product.shortDescription,
      description: product.description,
      price: 10.00,  // Placeholder price - client will update
      brand: product.brand,
      weight: numericWeight,
      unit: product.weight.replace(/\d+/g, '').trim() || 'g',
      category_id: product.category_id,
      is_available: true,
      is_featured: false,
      track_inventory: true,
      stock_quantity: 50,
      images: [],
      metadata: {
        placeholder_price: true,
        added_date: new Date().toISOString(),
        source: 'Irie/Geeta Price List',
        weight_display: product.weight
      }
    }

    const { error } = await supabase
      .from('products')
      .insert(productData)

    if (error) {
      console.log(`❌ ERROR: ${product.name} - ${error.message}`)
    } else {
      console.log(`✅ ADDED: ${product.name}`)
      added++
    }

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  console.log('\n' + '=' .repeat(60))
  console.log('📊 UPLOAD SUMMARY')
  console.log('=' .repeat(60))
  console.log(`✅ Products Added: ${added}`)
  console.log(`⏭️  Products Skipped: ${skipped}`)
  console.log(`📦 Total Processed: ${allProducts.length}`)
  console.log('\n💰 All prices set to $10.00 (placeholder)')
  console.log('📝 Client should update prices in admin panel')
  console.log('=' .repeat(60))
}

uploadMissingProducts()
  .then(() => {
    console.log('\n✨ Upload complete!')
    process.exit(0)
  })
  .catch(err => {
    console.error('❌ Fatal error:', err)
    process.exit(1)
  })
