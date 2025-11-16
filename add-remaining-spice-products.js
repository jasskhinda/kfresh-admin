require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const spiceProducts = [
  {
    title: 'Slap Ya Mama Cajun Seasoning',
    short_description: 'Authentic Louisiana Cajun spice blend - premium quality ingredients.',
    description: 'Slap Ya Mama Cajun Seasoning brings authentic Louisiana flavor to your kitchen. This premium spice blend combines traditional Cajun spices in perfect proportions to enhance any dish. Whether you\'re cooking seafood, chicken, vegetables, or rice, Slap Ya Mama delivers that authentic Cajun kick. Choose from Original Blend for classic flavor, Hot for extra spice, or Low Sodium for health-conscious cooking. A little goes a long way!',
    brand: 'Slap Ya Mama',
    variants: [
      { size_name: 'Original Blend (227g)', price: 12.00, sku: 'SLAPMAMA-ORIG-227G', is_default: true },
      { size_name: 'Hot Cajun Seasoning (227g)', price: 12.99, sku: 'SLAPMAMA-HOT-227G', is_default: false },
      { size_name: 'Low Sodium Cajun Seasoning (170g)', price: 12.99, sku: 'SLAPMAMA-LOWSOD-170G', is_default: false }
    ]
  },
  {
    title: 'Maggi Crayfish (6pcs)',
    price: 3.99,
    short_description: 'Authentic crayfish flavor cubes - perfect for soups and stews.',
    description: 'Maggi Crayfish Flavour Cubes bring authentic seafood taste to your cooking in convenient cube form. These seasoning cubes provide rich crayfish flavor that enhances soups, stews, rice dishes, and sauces. Simply crumble a cube into your cooking for instant depth of flavor. Essential for African cuisine and beloved by home cooks. Pack of 6 cubes.',
    brand: 'Maggi'
  },
  {
    title: 'Maggi Chicken (6pcs)',
    price: 3.99,
    short_description: 'Rich chicken flavor cubes - essential African seasoning.',
    description: 'Maggi Chicken Flavour Cubes are an essential seasoning in African cooking. These convenient cubes provide rich, savory chicken flavor that enhances any dish. Perfect for rice, soups, stews, sauces, and vegetables. Simply dissolve a cube in your cooking for instant flavor boost. A pantry staple that makes cooking easier and tastier. Pack of 6 cubes.',
    brand: 'Maggi'
  },
  {
    title: 'Suya Spice/Pepper 125g',
    price: 8.25,
    short_description: 'Authentic West African grilling spice blend with peanuts and ginger.',
    description: 'Suya Spice is the authentic West African spice blend used for Nigeria\'s famous suya (grilled meat). This aromatic blend contains ground peanuts, ginger, cayenne pepper, and traditional spices. Perfect for grilling beef, chicken, or fish - simply coat your meat with the spice and grill for authentic flavor. Also great as a dry rub or seasoning. The 125g package provides plenty for multiple grilling sessions.',
    brand: null
  },
  {
    title: 'Chilli Pepper Ground',
    price: 6.99,
    short_description: 'Fiery hot ground pepper - add intense heat to any dish.',
    description: 'Ground Chilli Pepper is an essential spice for those who love heat! This fiery powder adds intense spiciness to soups, stews, sauces, and any dish that needs a kick. Made from quality dried peppers and finely ground for easy use. A little goes a long way, so use according to your heat preference. Essential for authentic African and Caribbean cooking.',
    brand: null
  },
  {
    title: 'Egusi Ground',
    price: 8.99,
    short_description: 'Finely ground melon seeds - essential for Nigerian egusi soup.',
    description: 'Ground Egusi (melon seeds) is an essential ingredient for authentic Nigerian egusi soup, one of West Africa\'s most beloved dishes. These premium melon seeds are finely ground for convenience. The seeds add rich, nutty flavor and create the signature thick texture of egusi soup. Also used in other traditional dishes. Premium quality ensures authentic taste and texture.',
    brand: null
  }
]

async function addRemainingSpiceProducts() {
  console.log('🌶️  Adding remaining spice products...\n')

  // Get the correct spice category
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', 'spices-herbs-seasonings')
    .single()

  if (!categories) {
    console.log('❌ Spices category not found!')
    return
  }

  console.log(`✅ Using category: ${categories.name}\n`)

  let added = 0
  let variantsAdded = 0

  for (const product of spiceProducts) {
    const slug = product.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Math.random().toString(36).substring(7)

    const basePrice = product.price || Math.min(...product.variants.map(v => v.price))

    const productData = {
      name: product.title,
      slug: slug,
      short_description: product.short_description,
      description: product.description,
      price: basePrice,
      category_id: categories.id,
      brand: product.brand,
      stock_quantity: 100,
      is_featured: false,
      is_available: true
    }

    const { data: newProduct, error } = await supabase
      .from('products')
      .insert([productData])
      .select()
      .single()

    if (error) {
      console.log(`❌ Error adding ${product.title}:`, error.message)
      continue
    }

    console.log(`✅ ${product.title} - $${basePrice}`)
    added++

    // Add variants if they exist
    if (product.variants) {
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

        if (!varError) {
          console.log(`   ↳ ${variant.size_name} - $${variant.price}`)
          variantsAdded++
        }
      }
    }
  }

  console.log('\n' + '='.repeat(80))
  console.log('✨ COMPLETE!')
  console.log('='.repeat(80))
  console.log(`✅ Products added: ${added}`)
  console.log(`✅ Variants added: ${variantsAdded}`)

  const { data: finalCount } = await supabase.from('products').select('count')
  console.log(`\n📊 Total products in database: ${finalCount[0].count}`)
}

addRemainingSpiceProducts()
