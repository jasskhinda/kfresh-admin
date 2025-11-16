require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Products with their variants
const productsWithVariants = [
  {
    name: 'Big Foot',
    category: 'snacks',
    description: 'Delicious Big Foot snacks - a popular Caribbean treat with bold flavors. Crunchy and satisfying, perfect for snacking anytime.',
    brand: 'Big Foot',
    variants: [
      { size_name: 'Spicy (25g)', price: 2.85, sku: 'BIGFOOT-SPICY-25G', is_default: true },
      { size_name: 'Regular (25g)', price: 2.85, sku: 'BIGFOOT-REG-25G', is_default: false }
    ]
  },
  {
    name: 'Tastees Jamaican Patties',
    category: 'frozen-foods',
    description: 'Authentic Jamaican patties with flaky golden crust and flavorful filling. Perfect for a quick meal or snack. Each box contains 1.2kg of delicious patties.',
    brand: 'Tastees',
    variants: [
      { size_name: 'Regular Spicy Beef (1.2kg box)', price: 16.99, sku: 'TASTEES-REG-BEEF', is_default: true },
      { size_name: 'Extra Spicy Beef (1.2kg box)', price: 16.99, sku: 'TASTEES-XSPICY-BEEF', is_default: false },
      { size_name: 'Vegetarian (1.2kg box)', price: 16.99, sku: 'TASTEES-VEG', is_default: false }
    ]
  },
  {
    name: 'Nestle Nido Milk Powder',
    category: 'canned-package-goods',
    description: 'Nestle Nido Instant Full Cream Milk Powder - Rich, creamy, and nutritious. Perfect for drinking, cooking, and baking. Fortified with vitamins and minerals for the whole family.',
    brand: 'Nestle Nido',
    variants: [
      { size_name: '400g', price: 14.99, sku: 'NIDO-400G', is_default: true },
      { size_name: '900g', price: 38.00, sku: 'NIDO-900G', is_default: false },
      { size_name: '2.5kg', price: 90.00, sku: 'NIDO-2500G', is_default: false }
    ]
  },
  {
    name: 'Peak Milk Powder',
    category: 'canned-package-goods',
    description: 'Peak Powdered Milk - Premium quality full cream milk powder. Rich in calcium and protein, perfect for the whole family. Great for drinking, cooking, and baking.',
    brand: 'Peak',
    variants: [
      { size_name: '400g', price: 14.99, sku: 'PEAK-400G', is_default: true },
      { size_name: '900g', price: 38.00, sku: 'PEAK-900G', is_default: false },
      { size_name: '2.5kg', price: 90.00, sku: 'PEAK-2500G', is_default: false }
    ]
  },
  {
    name: 'Bertie\'s Original Pepper Sauce',
    category: 'hot-pepper-sauce',
    description: 'Bertie\'s Original Pepper Sauce - Made with fresh Trinidad Moruga Red and Scotch Bonnet Yellow Peppers. Great flavour and heat that tastes just like homemade. Perfect for adding authentic Caribbean heat to any dish.',
    brand: 'Bertie\'s',
    variants: [
      { size_name: '150ml (5oz)', price: 8.99, sku: 'BERTIE-ORIG-150ML', is_default: true },
      { size_name: '300ml (10oz)', price: 12.99, sku: 'BERTIE-ORIG-300ML', is_default: false },
      { size_name: '500ml (17oz)', price: 14.99, sku: 'BERTIE-ORIG-500ML', is_default: false },
      { size_name: '750ml (25oz)', price: 24.99, sku: 'BERTIE-ORIG-750ML', is_default: false }
    ]
  },
  {
    name: 'Bertie\'s Pimento Pepper Sauce',
    category: 'hot-pepper-sauce',
    description: 'Bertie\'s Pimento Pepper Sauce - A unique blend featuring aromatic pimento peppers. Perfect balance of flavor and heat. Adds authentic Caribbean taste to your meals.',
    brand: 'Bertie\'s',
    basePrice: 12.99,
    variants: [
      { size_name: '300ml (10oz)', price: 12.99, sku: 'BERTIE-PIMENTO-300ML', is_default: true }
    ]
  },
  {
    name: 'Bertie\'s Scorpion Pepper Sauce',
    category: 'hot-pepper-sauce',
    description: 'Bertie\'s Scorpion Pepper Sauce - Extremely hot sauce made with Trinidad Scorpion peppers. For those who love intense heat! Handle with care.',
    brand: 'Bertie\'s',
    basePrice: 15.99,
    variants: [
      { size_name: '150ml (5oz)', price: 15.99, sku: 'BERTIE-SCORP-150ML', is_default: true }
    ]
  },
  {
    name: 'Matouk\'s Hot Pepper Sauce',
    category: 'hot-pepper-sauce',
    description: 'Matouk\'s Hot Pepper Sauce - Trinidad\'s favorite hot sauce. Bold, flavorful, and authentically Caribbean. Perfect heat level for everyday use.',
    brand: 'Matouk\'s',
    basePrice: 6.66,
    variants: [
      { size_name: '10oz', price: 6.66, sku: 'MATOUK-HOT-10OZ', is_default: true }
    ]
  },
  {
    name: 'Matouk\'s Calypso Hot Pepper Sauce',
    category: 'hot-pepper-sauce',
    description: 'Matouk\'s Calypso Hot Pepper Sauce - A Caribbean classic with medium heat and exceptional flavor. Perfect for adding zest to any dish.',
    brand: 'Matouk\'s',
    basePrice: 6.66,
    variants: [
      { size_name: '10oz', price: 6.66, sku: 'MATOUK-CALYP-10OZ', is_default: true }
    ]
  },
  {
    name: 'Matouk\'s Chadon Beni Hot Sauce',
    category: 'hot-pepper-sauce',
    description: 'Matouk\'s Chadon Beni Hot Sauce - Features the distinctive flavor of chadon beni (culantro). Aromatic and flavorful with moderate heat.',
    brand: 'Matouk\'s',
    basePrice: 6.66,
    variants: [
      { size_name: '5.3oz', price: 6.66, sku: 'MATOUK-CHADON-5OZ', is_default: true }
    ]
  },
  {
    name: 'Matouk\'s Trinidad Scorpion Pepper Sauce',
    category: 'hot-pepper-sauce',
    description: 'Matouk\'s Trinidad Scorpion Pepper Sauce - One of the world\'s hottest peppers! Extreme heat with authentic Caribbean flavor. Not for the faint of heart.',
    brand: 'Matouk\'s',
    basePrice: 10.99,
    variants: [
      { size_name: '10oz', price: 10.99, sku: 'MATOUK-SCORP-10OZ', is_default: true }
    ]
  },
  {
    name: 'Matouk\'s Tamarind Chutney',
    category: 'sauces',
    description: 'Matouk\'s Tamarind Chutney - Sweet and tangy tamarind sauce. Perfect accompaniment for doubles, samosas, and other Caribbean snacks.',
    brand: 'Matouk\'s',
    basePrice: 6.99,
    variants: [
      { size_name: '12oz', price: 6.99, sku: 'MATOUK-TAMAR-12OZ', is_default: true }
    ]
  },
  {
    name: 'Matouk\'s Soca Hot Sauce',
    category: 'hot-pepper-sauce',
    description: 'Matouk\'s Soca Hot Sauce - A lively, flavorful hot sauce with just the right amount of heat. Perfect for everyday use on all your favorite foods.',
    brand: 'Matouk\'s',
    basePrice: 6.66,
    variants: [
      { size_name: '10oz', price: 6.66, sku: 'MATOUK-SOCA-10OZ', is_default: true }
    ]
  },
  {
    name: 'Slap Ya Mama Cajun Seasoning',
    category: 'spices-seasonings',
    description: 'Slap Ya Mama Cajun Seasoning - Authentic Louisiana Cajun flavor. Perfect blend of spices to enhance any dish. Made with premium quality ingredients.',
    brand: 'Slap Ya Mama',
    variants: [
      { size_name: 'Original Blend (227g)', price: 12.00, sku: 'SLAPMAMA-ORIG-227G', is_default: true },
      { size_name: 'Hot (227g)', price: 12.99, sku: 'SLAPMAMA-HOT-227G', is_default: false },
      { size_name: 'Low Sodium (170g)', price: 12.99, sku: 'SLAPMAMA-LOWSOD-170G', is_default: false }
    ]
  },
  {
    name: 'KFresh Shito',
    category: 'sauces',
    description: 'KFresh Shito - Traditional Ghanaian hot pepper sauce made with shrimp, ginger, and spices. Rich, savory, and spicy. Perfect with rice, fufu, and more.',
    brand: 'KFresh',
    variants: [
      { size_name: '250ml', price: 8.00, sku: 'KFRESH-SHITO-250ML', is_default: true },
      { size_name: '500ml', price: 16.00, sku: 'KFRESH-SHITO-500ML', is_default: false },
      { size_name: '5L', price: 140.00, sku: 'KFRESH-SHITO-5L', is_default: false }
    ]
  },
  {
    name: 'White Gari',
    category: 'canned-package-goods',
    description: 'White Gari - Premium quality fermented cassava flour. Essential West African staple. Perfect for making eba or eating with soup and stew.',
    brand: null,
    variants: [
      { size_name: '3.5lbs', price: 7.50, sku: 'GARI-WHITE-3_5LBS', is_default: true },
      { size_name: '10lbs', price: 20.00, sku: 'GARI-WHITE-10LBS', is_default: false },
      { size_name: '16lbs', price: 32.00, sku: 'GARI-WHITE-16LBS', is_default: false }
    ]
  },
  {
    name: 'Ijebu Gari',
    category: 'canned-package-goods',
    description: 'Ijebu Gari - Premium fine-grain gari from Ijebu region. Smooth texture and excellent quality. Perfect for drinking with sugar and groundnut or making eba.',
    brand: null,
    variants: [
      { size_name: '4lbs', price: 8.00, sku: 'GARI-IJEBU-4LBS', is_default: true },
      { size_name: '10lbs', price: 20.00, sku: 'GARI-IJEBU-10LBS', is_default: false },
      { size_name: '16lbs', price: 32.00, sku: 'GARI-IJEBU-16LBS', is_default: false }
    ]
  },
  {
    name: 'Yellow Gari',
    category: 'canned-package-goods',
    description: 'Yellow Gari - Traditional fermented cassava with palm oil. Rich flavor and beautiful color. Perfect for all your favorite West African dishes.',
    brand: null,
    variants: [
      { size_name: '4lbs', price: 8.00, sku: 'GARI-YELLOW-4LBS', is_default: true },
      { size_name: '10lbs', price: 20.00, sku: 'GARI-YELLOW-10LBS', is_default: false },
      { size_name: '16lbs', price: 32.00, sku: 'GARI-YELLOW-16LBS', is_default: false }
    ]
  },
  {
    name: 'Vitamalt',
    category: 'drinksbeverages',
    description: 'Vitamalt - Non-alcoholic malt beverage packed with vitamins and minerals. Refreshing and nutritious. A Caribbean favorite! 6-pack.',
    brand: 'Vitamalt',
    variants: [
      { size_name: 'Classic (6-pack)', price: 15.00, sku: 'VITAMALT-CLASS-6PK', is_default: true },
      { size_name: 'Ginger (6-pack)', price: 15.00, sku: 'VITAMALT-GING-6PK', is_default: false },
      { size_name: 'Coconut & Hibiscus (6-pack)', price: 15.00, sku: 'VITAMALT-COCO-6PK', is_default: false }
    ]
  }
]

// Single products without variants
const singleProducts = [
  { name: 'Roasted Peanuts 510g', price: 9.99, category: 'snacks', description: 'Premium roasted peanuts - crunchy, flavorful, and freshly roasted. Perfect snack for any time of day. 510g package.', brand: null },
  { name: 'De Rica Tomato Paste 400g', price: 8.99, category: 'canned-package-goods', description: 'De Rica Tomato Paste 400g - Rich, concentrated tomato paste. Essential ingredient for stews, soups, and sauces. Premium quality.', brand: 'De Rica' },
  { name: 'De Rica Tomato Paste 210g', price: 4.99, category: 'canned-package-goods', description: 'De Rica Tomato Paste 210g - Rich, concentrated tomato paste. Perfect size for smaller meals. Premium quality.', brand: 'De Rica' },
  { name: 'Salted Pig Tail', price: 6.00, category: 'frozen-meats', description: 'Salted Pig Tail - Traditional Caribbean ingredient. Adds rich flavor to soups, stews, and rice dishes. Sold by the pound.', brand: null, unit: 'lb' },
  { name: 'Salted Pig Feet', price: 6.00, category: 'frozen-meats', description: 'Salted Pig Feet - Classic Caribbean cooking ingredient. Perfect for soups and stews. Adds depth and flavor. Sold by the pound.', brand: null, unit: 'lb' },
  { name: 'Salted Tilapia (Koobi)', price: 10.00, category: 'frozen-fish-seafood', description: 'Salted Tilapia (Koobi) - Traditional West African salted fish. Essential ingredient for authentic soups and stews. Rich umami flavor.', brand: null },
  { name: 'Mauby', price: 5.00, category: 'drinksbeverages', description: 'Mauby - Traditional Caribbean drink made from tree bark. Slightly bitter, refreshing taste. A cultural favorite! 500ml bottle.', brand: null, unit: '500ml' },
  { name: 'Matooki', price: 11.99, category: 'fresh-fruits-vegetables', description: 'Matooki (Green Cooking Bananas) - Essential East African ingredient. Perfect for steaming, boiling, or frying. 1kg package.', brand: null, unit: '1kg' },
  { name: 'Roasted Peanuts', price: 11.00, category: 'snacks', description: 'Premium Roasted Peanuts - Freshly roasted, crunchy, and delicious. Perfect for snacking or adding to dishes.', brand: null },
  { name: 'Kenkey', price: 3.99, category: 'canned-package-goods', description: 'Kenkey - Traditional Ghanaian fermented corn dough. Ready to eat with fish, pepper, and sauce. Authentic taste of home.', brand: null },
  { name: 'Momoni (Frozen)', price: 8.99, category: 'frozen-fish-seafood', description: 'Momoni - Traditional West African salted/smoked fish. Adds authentic flavor to soups and stews. Frozen for freshness.', brand: null },
  { name: 'Maggi Crayfish (6pcs)', price: 3.99, category: 'spices-seasonings', description: 'Maggi Crayfish Flavour Cubes - Authentic crayfish taste in convenient cubes. Perfect for soups, stews, and rice dishes. Pack of 6.', brand: 'Maggi' },
  { name: 'Maggi Chicken (6pcs)', price: 3.99, category: 'spices-seasonings', description: 'Maggi Chicken Flavour Cubes - Rich chicken flavor in convenient cubes. Essential seasoning for African cooking. Pack of 6.', brand: 'Maggi' },
  { name: 'Suya Spice 125g', price: 8.25, category: 'spices-seasonings', description: 'Suya Spice - Authentic West African spice blend. Perfect for grilling meats. Contains peanuts, ginger, and aromatic spices. 125g.', brand: null },
  { name: 'Chilli Pepper Ground', price: 6.99, category: 'spices-seasonings', description: 'Ground Chilli Pepper - Fiery hot ground pepper. Add heat to any dish. Essential African spice.', brand: null },
  { name: 'Egusi Ground', price: 8.99, category: 'spices-seasonings', description: 'Ground Egusi (Melon Seeds) - Essential ingredient for authentic Nigerian egusi soup. Premium quality, finely ground.', brand: null },
  { name: 'KFresh Body and Hair Cream', price: 19.99, category: 'pantry-essentials', description: 'KFresh Body and Hair Cream - Moisturizing cream for skin and hair. Natural ingredients. Keeps skin soft and hair healthy.', brand: 'KFresh' }
]

async function addProductsWithVariants() {
  console.log('🚀 Adding products with variants system...\n')

  const { data: categories } = await supabase.from('categories').select('*')

  let addedProducts = 0
  let addedVariants = 0
  let errors = []

  console.log('=' .repeat(80))
  console.log('➕ ADDING PRODUCTS WITH VARIANTS')
  console.log('=' .repeat(80) + '\n')

  // Add products with variants
  for (const product of productsWithVariants) {
    const category = categories.find(c => c.slug === product.category)
    if (!category) {
      errors.push(`Category not found: ${product.category} for ${product.name}`)
      continue
    }

    // Use the lowest price variant as the main product price
    const basePrice = product.basePrice || Math.min(...product.variants.map(v => v.price))

    const slug = product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Math.random().toString(36).substring(7)

    const productData = {
      name: product.name,
      slug: slug,
      description: product.description,
      price: basePrice,
      category_id: category.id,
      brand: product.brand,
      stock_quantity: 100,
      is_featured: false,
      is_available: true
    }

    const { data: newProduct, error: prodError } = await supabase
      .from('products')
      .insert([productData])
      .select()
      .single()

    if (prodError) {
      errors.push(`Error adding ${product.name}: ${prodError.message}`)
      continue
    }

    console.log(`✅ Added product: ${product.name} (base price: $${basePrice})`)
    addedProducts++

    // Add variants
    for (const variant of product.variants) {
      const variantData = {
        product_id: newProduct.id,
        size_name: variant.size_name,
        price: variant.price,
        compare_price: null,
        stock_quantity: 100,
        sku: variant.sku,
        is_default: variant.is_default
      }

      const { error: varError } = await supabase
        .from('product_variants')
        .insert([variantData])

      if (varError) {
        errors.push(`Error adding variant ${variant.size_name} for ${product.name}: ${varError.message}`)
      } else {
        console.log(`   ↳ Variant: ${variant.size_name} - $${variant.price}`)
        addedVariants++
      }
    }
  }

  console.log('\n' + '=' .repeat(80))
  console.log('➕ ADDING SINGLE PRODUCTS')
  console.log('=' .repeat(80) + '\n')

  // Add single products
  for (const product of singleProducts) {
    const category = categories.find(c => c.slug === product.category)
    if (!category) {
      errors.push(`Category not found: ${product.category} for ${product.name}`)
      continue
    }

    const slug = product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Math.random().toString(36).substring(7)

    const productData = {
      name: product.name,
      slug: slug,
      description: product.description,
      price: product.price,
      category_id: category.id,
      brand: product.brand,
      unit: product.unit || null,
      stock_quantity: 100,
      is_featured: false,
      is_available: true
    }

    const { error: prodError } = await supabase
      .from('products')
      .insert([productData])

    if (prodError) {
      errors.push(`Error adding ${product.name}: ${prodError.message}`)
    } else {
      console.log(`✅ Added: ${product.name} - $${product.price}`)
      addedProducts++
    }
  }

  console.log('\n' + '=' .repeat(80))
  console.log('✨ SUMMARY')
  console.log('=' .repeat(80))
  console.log(`✅ Products added: ${addedProducts}`)
  console.log(`✅ Variants added: ${addedVariants}`)
  console.log(`❌ Errors: ${errors.length}`)

  if (errors.length > 0) {
    console.log('\n⚠️  Errors encountered:')
    errors.forEach(err => console.log(`   - ${err}`))
  }

  const { data: finalCount } = await supabase.from('products').select('count')
  console.log(`\n📊 Total products in database: ${finalCount[0].count}`)
}

addProductsWithVariants()
