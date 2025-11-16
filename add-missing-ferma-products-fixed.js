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
  'SPICES, SEASONING & HERBS': 'spices-seasonings',
  'SAUCES': 'sauces',
  'BAKED GOODS': 'bakery-snacks',  // Changed to existing category
  'BAKERY': 'bakery-snacks',
  'DRINKS': 'drinksbeverages',
  'DRINKS/BEVERAGES': 'drinksbeverages',
  'FRESH PRODUCE': 'fresh-fruits-vegetables',
  'Uncategorized': 'canned-package-goods'
}

async function addMissingProductsFixed() {
  console.log('🚀 Starting to add missing FERMA products (FIXED VERSION)...\n')

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

  console.log('\n📂 Available categories:')
  categories.forEach(cat => console.log(`   - ${cat.name} (${cat.slug})`))

  const missingProducts = []

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
    const cleanName = productName.toLowerCase().replace(/\s+/g, ' ').replace(/[`'~]/g, '').trim()

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
        name: productName.replace(/[\\~]/g, '').trim(),
        price: price,
        category: category,
        description: description || `${productName}${brand ? ` by ${brand}` : ''}${packSize ? ` - ${packSize}` : ''}`,
        brand: brand,
        packSize: packSize,
        unit: unit
      })
    }
  }

  console.log(`\n📊 Found ${missingProducts.length} missing products to add\n`)

  // Add missing products
  if (missingProducts.length > 0) {
    console.log('='.repeat(80))
    console.log('➕ ADDING MISSING PRODUCTS')
    console.log('='.repeat(80) + '\n')

    let addedCount = 0
    let failedCount = 0

    for (const product of missingProducts) {
      // Find category ID
      const categorySlug = categoryMapping[product.category.toUpperCase()] || 'canned-package-goods'
      const categoryObj = categories.find(c => c.slug === categorySlug)

      if (!categoryObj) {
        console.log(`❌ Category not found for: ${product.name} (${product.category}) - trying slug: ${categorySlug}`)
        failedCount++
        continue
      }

      // Create slug from product name
      const slug = product.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        + '-' + Math.random().toString(36).substring(7)  // Add random suffix to avoid conflicts

      // Prepare product data - only use columns that exist
      const productData = {
        name: product.name,
        slug: slug,
        description: product.description || `${product.name} - Premium quality product`,
        price: product.price,
        category_id: categoryObj.id,
        stock_quantity: 100,
        is_featured: false,
        is_available: true,
        origin: product.brand || null,
        brand: product.brand || null,
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
        failedCount++
      } else {
        console.log(`✅ Added: ${product.name} - $${product.price} (${categoryObj.name})`)
        addedCount++
      }
    }

    console.log('\n' + '='.repeat(80))
    console.log('✨ PRODUCT ADDITION COMPLETE!')
    console.log('='.repeat(80))
    console.log(`✅ Successfully added: ${addedCount} products`)
    console.log(`❌ Failed to add: ${failedCount} products`)
  }

  // Final verification
  console.log('\n🔍 Running final verification...')
  const { data: finalProducts, error: finalError } = await supabase
    .from('products')
    .select('count')

  if (!finalError && finalProducts) {
    console.log(`\n📊 Total products in database: ${finalProducts[0].count}`)
  }
}

addMissingProductsFixed()
