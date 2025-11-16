require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')
const XLSX = require('xlsx')
const path = require('path')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Category mapping to match database category IDs
const categoryMapping = {
  'FROZEN GOODS': 'frozen-foods',
  'FROZEN FOODS': 'frozen-foods',
  'CANNED & PACKAGE GOODS': 'canned-package-goods',
  'COOKING OILS': 'cooking-oils',
  'SPICES, SEASONING & HERBS': 'spices-herbs-seasonings',
  'SAUCES': 'sauces',
  'BAKED GOODS': 'baked-goods',
  'DRINKS': 'drinks-beverages',
  'DRINKS/BEVERAGES': 'drinks-beverages',
  'FRESH PRODUCE': 'fresh-produce',
  'Uncategorized': 'canned-package-goods'
}

async function addMissingProducts() {
  console.log('🚀 Starting to add missing FERMA products...\n')

  // Read Excel file
  const excelPath = path.join(__dirname, '..', '3-4ferma_grocery_products_cleaned.xlsx')
  const workbook = XLSX.readFile(excelPath)
  const sheetName = workbook.SheetNames[0]
  const sheet = workbook.Sheets[sheetName]
  const data = XLSX.utils.sheet_to_json(sheet)

  // Fetch all existing products
  const { data: allProducts, error: fetchError } = await supabase
    .from('products')
    .select('*')

  if (fetchError) {
    console.error('Error fetching products:', fetchError)
    return
  }

  // Fetch all categories
  const { data: categories, error: catError } = await supabase
    .from('categories')
    .select('*')

  if (catError) {
    console.error('Error fetching categories:', catError)
    return
  }

  const missingProducts = []
  const priceUpdateProducts = []

  // Check each product from Excel
  for (const row of data) {
    const productName = row['Product Name'] || row['product_name'] || row['name'] || row['Name'] || ''
    const price = parseFloat(row['Price'] || row['price'] || 0)
    const category = row['Category'] || row['category'] || 'Uncategorized'
    const description = row['Description'] || row['description'] || ''
    const brand = row['Brand'] || row['brand'] || ''
    const packSize = row['Pack Size'] || row['pack_size'] || ''
    const unit = row['Unit'] || row['unit'] || ''

    if (!productName) continue

    // Clean product name
    const cleanName = productName.toLowerCase().replace(/\s+/g, ' ').replace(/[`']/g, '').trim()

    // Find existing product
    let found = allProducts.find(p => {
      const dbName = p.name.toLowerCase().replace(/\s+/g, ' ').trim()
      return dbName === cleanName || dbName.includes(cleanName) || cleanName.includes(dbName)
    })

    if (!found) {
      const searchTerms = cleanName.split(/[\s-/()]+/).filter(term => term.length > 3)
      if (searchTerms.length > 0) {
        found = allProducts.find(p => {
          const productNameLower = p.name.toLowerCase()
          const matchCount = searchTerms.filter(term => productNameLower.includes(term)).length
          return matchCount >= Math.min(2, searchTerms.length)
        })
      }
    }

    if (!found && price > 0) {
      // Product is missing and has a valid price
      missingProducts.push({
        name: productName.replace(/\\/g, '').trim(),
        price: price,
        category: category,
        description: description || `${productName}${brand ? ` by ${brand}` : ''}${packSize ? ` - ${packSize}` : ''}`,
        brand: brand,
        packSize: packSize,
        unit: unit
      })
    } else if (found && price > 0 && Math.abs(found.price - price) > 0.1) {
      // Product exists but price is different
      priceUpdateProducts.push({
        id: found.id,
        name: found.name,
        oldPrice: found.price,
        newPrice: price
      })
    }
  }

  console.log(`\n📊 Analysis Complete:`)
  console.log(`   Missing products to add: ${missingProducts.length}`)
  console.log(`   Products needing price updates: ${priceUpdateProducts.length}`)

  // Add missing products
  if (missingProducts.length > 0) {
    console.log('\n' + '='.repeat(80))
    console.log('➕ ADDING MISSING PRODUCTS')
    console.log('='.repeat(80))

    for (const product of missingProducts) {
      // Find category ID
      const categorySlug = categoryMapping[product.category.toUpperCase()] || 'canned-package-goods'
      const categoryObj = categories.find(c => c.slug === categorySlug)

      if (!categoryObj) {
        console.log(`❌ Category not found for: ${product.name} (${product.category})`)
        continue
      }

      // Create slug from product name
      const slug = product.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')

      // Prepare product data
      const productData = {
        name: product.name,
        slug: slug,
        description: product.description,
        price: product.price,
        compare_price: null,
        category_id: categoryObj.id,
        stock_quantity: 100,
        is_featured: false,
        origin: product.brand || null,
        delivery_info: 'Standard delivery available',
        storage_instructions: product.category.includes('FROZEN') ? 'Keep frozen' : 'Store in a cool, dry place',
        brand: product.brand || null,
        pack_size: product.packSize || null,
        unit: product.unit || null
      }

      // Insert product
      const { data: newProduct, error: insertError } = await supabase
        .from('products')
        .insert([productData])
        .select()
        .single()

      if (insertError) {
        console.log(`❌ Error adding ${product.name}:`, insertError.message)
      } else {
        console.log(`✅ Added: ${product.name} - $${product.price} (${product.category})`)
      }
    }
  }

  // Update prices
  if (priceUpdateProducts.length > 0) {
    console.log('\n' + '='.repeat(80))
    console.log('💰 UPDATING PRICES')
    console.log('='.repeat(80))

    for (const product of priceUpdateProducts) {
      const { error: updateError } = await supabase
        .from('products')
        .update({ price: product.newPrice })
        .eq('id', product.id)

      if (updateError) {
        console.log(`❌ Error updating ${product.name}:`, updateError.message)
      } else {
        console.log(`✅ Updated: ${product.name} - $${product.oldPrice} → $${product.newPrice}`)
      }
    }
  }

  console.log('\n' + '='.repeat(80))
  console.log('✨ COMPLETE!')
  console.log('='.repeat(80))
  console.log(`✅ Added ${missingProducts.length} new products`)
  console.log(`✅ Updated prices for ${priceUpdateProducts.length} products`)

  // Final verification
  console.log('\n🔍 Running final verification...')
  const { data: finalProducts, error: finalError } = await supabase
    .from('products')
    .select('count')

  if (!finalError && finalProducts) {
    console.log(`\n📊 Total products in database: ${finalProducts[0].count}`)
  }
}

addMissingProducts()
