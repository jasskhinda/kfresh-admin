require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// All products from FERMA grocery PDF
const fermaGroceryProducts = [
  // FROZEN GOODS
  { name: 'Whiting Fish', price: 7.50, unit: 'lb', category: 'Frozen Foods' },
  { name: 'Tilapia Fish', price: 6.90, unit: 'lb', category: 'Frozen Foods' },
  { name: 'Mackerel Fish', price: 7.00, unit: 'lb', category: 'Frozen Foods' },
  { name: 'Smoked Mackerel', price: 7.00, unit: 'lb', category: 'Frozen Foods' },
  { name: 'Crocker Fish (headless)', price: 8.00, unit: 'lb', category: 'Frozen Foods' },
  { name: 'Soft chicken Drumstick (Halal)', price: 7.00, unit: 'lb', category: 'Frozen Foods' },
  { name: 'Chicken Feet', price: 5.00, unit: 'lb', category: 'Frozen Foods' },
  { name: 'Smoked Turkey Wings - Cut', price: 12.00, unit: 'lb', category: 'Frozen Foods' },
  { name: 'Smoked Turkey Wings - Split', price: 12.00, unit: 'lb', category: 'Frozen Foods' },
  { name: 'Smoked Turkey', price: 8.50, unit: 'lb', category: 'Frozen Foods' },
  { name: 'Smoked Turkey Drumstick', price: 12.00, unit: 'lb', category: 'Frozen Foods' },
  { name: 'Unsmoked Turkey Wings', price: 12.00, unit: 'lb', category: 'Frozen Foods' },
  { name: 'Ugwu Leaves', price: 5.50, unit: 'pack', category: 'Frozen Foods' },
  { name: 'Jute Leaves (Ewedu)', price: 5.55, unit: 'pack', category: 'Frozen Foods' },
  { name: 'Water Leaves', price: 5.50, unit: 'pack', category: 'Frozen Foods' },
  { name: 'Bitter Leaves', price: 5.55, unit: 'pack', category: 'Frozen Foods' },
  { name: 'Spinach', price: 3.65, unit: 'pack', category: 'Frozen Foods' },
  { name: 'CASII Sliced Okro', price: 3.70, unit: 'pack', category: 'Frozen Foods' },
  { name: 'CASII Chopped Okro', price: 3.70, unit: 'pack', category: 'Frozen Foods' },
  { name: 'Mixed Vegetables', price: 3.50, unit: 'pack', category: 'Frozen Foods' },
  { name: 'Cassava Leaves', price: 5.55, unit: 'pack', category: 'Frozen Foods' },
  { name: 'Ghana Fermented Corn Dough (10lbs)', price: 23.50, unit: 'pack', category: 'Frozen Foods' },
  { name: 'Ghana Fermented Corn Dough (4lbs)', price: 11.50, unit: 'pack', category: 'Frozen Foods' },
  { name: 'Ghana Fermented Corn Dough (2lbs)', price: 7.50, unit: 'pack', category: 'Frozen Foods' },
  { name: 'Ghana Fermented Grated Cassava (2lbs)', price: 7.50, unit: 'pack', category: 'Frozen Foods' },
  { name: 'Chicken Patty - Spicy', price: 12.00, category: 'Frozen Foods' },
  { name: 'Chicken Patty-Mild', price: 12.00, category: 'Frozen Foods' },
  { name: 'Beef Patty-Spicy', price: 12.00, category: 'Frozen Foods' },
  { name: 'Beef Patty-Mild', price: 12.00, category: 'Frozen Foods' },
  { name: 'Vegetable Patty-Spicy', price: 12.00, category: 'Frozen Foods' },
  { name: 'Vegetable Patty-Mild', price: 12.00, category: 'Frozen Foods' },
  { name: 'Yam Chips (2.5kg)', price: 21.50, category: 'Frozen Foods' },
  { name: 'Yam Chips (600g)', price: 8.20, category: 'Frozen Foods' },

  // CANNED & PACKAGE GOODS
  { name: 'Golden Mourn 900g', price: 13.99, category: 'Canned & Package Goods' },
  { name: 'Grandious Ogi White 500g', price: 8.00, category: 'Canned & Package Goods' },
  { name: 'Grandious Ogi Yellow 500g', price: 8.00, category: 'Canned & Package Goods' },
  { name: 'Ijebu Garri 4lbs', price: 8.00, category: 'Canned & Package Goods' },
  { name: 'Ijebu Garri 2lbs', price: 4.00, category: 'Canned & Package Goods' },
  { name: 'Yellow Gari 4lbs', price: 8.00, category: 'Canned & Package Goods' },
  { name: 'Yellow Gari 2lbs', price: 4.00, category: 'Canned & Package Goods' },
  { name: 'Peeled Beans 2lbs', price: 11.99, category: 'Canned & Package Goods' },
  { name: 'Honey Beans 2lbs', price: 10.99, category: 'Canned & Package Goods' },
  { name: 'Ofada Rice 4lbs', price: 12.00, category: 'Canned & Package Goods' },
  { name: 'Guyanese Pride Rice', price: 25.00, unit: '20lbs', category: 'Canned & Package Goods' },
  { name: 'Durum Semolina 1.8kg', price: 9.99, category: 'Canned & Package Goods' },
  { name: 'Unico Tomato Paste (156ml)', price: 1.29, category: 'Canned & Package Goods' },
  { name: 'Hereford Corned Beef (340g)', price: 4.99, category: 'Canned & Package Goods' },
  { name: 'Hereford Corned Beef -Halal (340g)', price: 4.99, category: 'Canned & Package Goods' },
  { name: 'Tropiway Plantain Fufu (700g)', price: 9.99, category: 'Canned & Package Goods' },
  { name: 'Tropiway Cocoyam Fufu (700g)', price: 9.99, category: 'Canned & Package Goods' },
  { name: 'Smoked Cat Fish Large', price: 9.90, category: 'Canned & Package Goods' },
  { name: 'Smoked Cat Fish Medium', price: 10.00, category: 'Canned & Package Goods' },
  { name: 'Peeled Large Herrings', price: 9.00, unit: 'pack', category: 'Canned & Package Goods' },
  { name: 'Koobi (salted Fish)', price: 7.00, category: 'Canned & Package Goods' },
  { name: 'Crayfish Whole 100g', price: 9.99, category: 'Canned & Package Goods' },
  { name: 'Crayfish Ground 100g', price: 9.99, category: 'Canned & Package Goods' },
  { name: 'Crayfish Ground 50g', price: 5.00, category: 'Canned & Package Goods' },
  { name: 'Fried Fish with Shrimps large', price: 12.50, category: 'Canned & Package Goods' },
  { name: 'Fried Fish with Shrimps medium', price: 8.00, category: 'Canned & Package Goods' },
  { name: 'Kivo 4in1 - Crispy White Gari Mixed with Sugar, Milk & Roasted Peanuts 125g', price: 4.55, category: 'Canned & Package Goods' },
  { name: 'Cassava Flour / Konkonte 3.5lbs', price: 8.00, category: 'Canned & Package Goods' },
  { name: 'Cassava Flour / Konkonte 7lbs', price: 16.00, category: 'Canned & Package Goods' },
  { name: 'Diehuo - Corn flour mixed with cassava flour 3.5lbs', price: 11.99, category: 'Canned & Package Goods' },
  { name: 'Egusi - Ground 200g', price: 5.00, category: 'Canned & Package Goods' },
  { name: 'Egusi - Whole 200g', price: 5.00, category: 'Canned & Package Goods' },
  { name: 'Peanut Butter 498g', price: 6.99, category: 'Canned & Package Goods' },
  { name: 'Prekese / Tetrapleura tetraptera - whole', price: 5.00, unit: 'pack', category: 'Canned & Package Goods' },
  { name: 'Wakye Leaves', price: 4.00, unit: 'pack', category: 'Canned & Package Goods' },
  { name: 'Akua`s Special Koose (Blended Peeled Beans with Pepper, Ginger, Onions & Spices) 438g', price: 8.00, category: 'Canned & Package Goods' },
  { name: 'Hausa Koko Flour', price: 11.99, category: 'Canned & Package Goods' },
  { name: 'Nkulenu Palm Soup Base 780g', price: 6.99, category: 'Canned & Package Goods' },
  { name: 'Nkulenu Palm Soup Base with Prekese & Abemuduro 780g', price: 6.99, category: 'Canned & Package Goods' },
  { name: 'Gino Tomato Paste 210g', price: 4.99, category: 'Canned & Package Goods' },
  { name: 'Derica Tomato Paste 210g', price: 4.99, category: 'Canned & Package Goods' },
  { name: 'Dry Okro', price: 5.99, category: 'Canned & Package Goods' },
  { name: 'Star Kist Tuna - Kpapko Shito 160g', price: 6.46, category: 'Canned & Package Goods' },
  { name: 'Star Kist Tuna - Flakes 160g', price: 6.46, category: 'Canned & Package Goods' },
  { name: 'Mama`s Choice Plantain Fufu 10lbs', price: 54.00, category: 'Canned & Package Goods' },
  { name: 'Mama`s Choice Plantain Fufu 4lbs', price: 24.00, category: 'Canned & Package Goods' },
  { name: 'OCASII Okro Sliced', price: 6.75, unit: 'pack', category: 'Canned & Package Goods' },
  { name: 'OCASII Chopped Okro', price: 6.75, unit: 'pack', category: 'Canned & Package Goods' },
  { name: 'Ola-Ola Poundo Yam (10lbs)', price: 90.00, category: 'Canned & Package Goods' },
  { name: 'Ola Ola Poundo Yam (4lbs)', price: 24.00, category: 'Canned & Package Goods' },
  { name: 'Ola Ola Poundu Yam (2lbs)', price: 11.00, category: 'Canned & Package Goods' },
  { name: 'Ayo-Ola Poundo Yam Flour (4lbs)', price: 24.00, category: 'Canned & Package Goods' },
  { name: '555 Basmati Rice 4.54kg', price: 17.99, category: 'Canned & Package Goods' },
  { name: 'Botan Calrose Rice 8kg', price: 20.00, category: 'Canned & Package Goods' },
  { name: 'Mekong Jasmine Scented Rice 8kg', price: 20.00, category: 'Canned & Package Goods' },
  { name: 'OX Head Fragrance Rice 8kg', price: 20.00, category: 'Canned & Package Goods' },
  { name: 'Rooster Scented Jasmine Rice 8kg', price: 20.00, category: 'Canned & Package Goods' },
  { name: 'Indomie Chicken (Box)', price: 22.50, category: 'Canned & Package Goods' },
  { name: 'Indomie Chicken (A Pack)', price: 0.95, category: 'Canned & Package Goods' },
  { name: 'Indomie Onion (Box)', price: 22.50, category: 'Canned & Package Goods' },
  { name: 'Indomie Onion (A Pack)', price: 0.95, category: 'Canned & Package Goods' },
  { name: 'Ghana Milo (400g)', price: 10.99, category: 'Drinks/Beverages' },
  { name: 'Nigeria Milo (400g)', price: 10.99, category: 'Drinks/Beverages' },
  { name: 'Primo Crushed Tomatoes (796ml)', price: 2.49, category: 'Canned & Package Goods' },
  { name: 'Primo Diced Tomato (796ml)', price: 2.49, category: 'Canned & Package Goods' },
  { name: 'Unico Crushed Tomatoes 796ml', price: 2.49, category: 'Canned & Package Goods' },
  { name: 'Shito (500ml)', price: 15.00, category: 'Sauces' },
  { name: 'Shito (250ml)', price: 8.00, category: 'Sauces' },
  { name: 'Wooden Stick - Eta', price: 7.00, category: 'Canned & Package Goods' },
  { name: 'Earthern Ware - apotowewa', price: 14.50, category: 'Canned & Package Goods' },
  { name: 'Turkey Berry / Kwahu Nkwasusua (700g)', price: 8.00, category: 'Canned & Package Goods' },
  { name: 'Titus Sardine in Soybean Oil (125g)', price: 2.00, category: 'Canned & Package Goods' },
  { name: 'Moi-Moi Plate', price: 2.00, category: 'Canned & Package Goods' },
  { name: 'Red Beans 2lbs', price: 9.00, category: 'Canned & Package Goods' },
  { name: 'CEDAR Chick Peas 907g', price: 3.99, category: 'Canned & Package Goods' },
  { name: 'CEDAR Black Eyed Beans 907g', price: 3.99, category: 'Canned & Package Goods' },
  { name: 'CEDAR Long Grain Parboiled Rice 1.81kg - 4lbs', price: 6.00, category: 'Canned & Package Goods' },
  { name: 'CEDAR Long Grain Parboiled Rice 4kg - 8.8lbs', price: 12.00, category: 'Canned & Package Goods' },
  { name: 'Carnation Evaporated Milk (354ml)', price: 2.49, category: 'Canned & Package Goods' },
  { name: 'Carnation Fat Free Evaporated Skim Milk (354ml)', price: 2.49, category: 'Canned & Package Goods' },
  { name: 'Honeywell Semolina 1.8kg', price: 10.00, category: 'Canned & Package Goods' },

  // COOKING OILS
  { name: 'Palm Oil - Regular (2L)', price: 16.83, category: 'Cooking Oils' },
  { name: 'Palm Oil - Regular (1L)', price: 8.99, category: 'Cooking Oils' },
  { name: 'Palm Oil - Regular (500ml)', price: 4.99, category: 'Cooking Oils' },
  { name: 'Palm Oil - Zomi (2L)', price: 16.83, category: 'Cooking Oils' },
  { name: 'Palm Oil - Zomi (1L)', price: 8.99, category: 'Cooking Oils' },
  { name: 'Palm Oil - Zomi (500ml)', price: 4.99, category: 'Cooking Oils' },
  { name: 'Palm Kernel Oil 1L', price: 11.00, category: 'Cooking Oils' },
  { name: 'Gallo Extra Virgin Olive Oil 1L', price: 12.00, category: 'Cooking Oils' },
  { name: 'Saporito Foods Vegetable Oil 3L', price: 9.78, category: 'Cooking Oils' },
  { name: 'Saporito Foods Canola Oil 3L', price: 9.78, category: 'Cooking Oils' },

  // SPICES, SEASONING & HERBS
  { name: 'Suya Spice/Pepper 125g', price: 8.25, category: 'Spices/Herbs/Seasonings' },
  { name: 'Maggi Chicken', price: 14.00, unit: 'pack', category: 'Spices/Herbs/Seasonings' },
  { name: 'Maggi Shrimp', price: 14.00, unit: 'pack', category: 'Spices/Herbs/Seasonings' },
  { name: 'Maggi Crayfish', price: 14.00, unit: 'pack', category: 'Spices/Herbs/Seasonings' },
  { name: 'Adam Salt / Kawu 210g', price: 5.00, category: 'Spices/Herbs/Seasonings' },
  { name: 'Knorr Chicken Seasoning Powder (Nigeria) 400g', price: 9.33, category: 'Spices/Herbs/Seasonings' },
  { name: 'Onga Powder - Classic', price: 2.75, category: 'Spices/Herbs/Seasonings' },
  { name: 'Irie All Purpose Seasoning 275g', price: 5.99, category: 'Spices/Herbs/Seasonings' },
  { name: 'Irie Oxtail Seasoning 400g', price: 5.99, category: 'Spices/Herbs/Seasonings' },
  { name: 'Irie Jerk BBQ 454ml', price: 5.29, category: 'Spices/Herbs/Seasonings' },
  { name: 'Seasoning Salt 454ml', price: 5.99, category: 'Spices/Herbs/Seasonings' },
  { name: 'Aurora Fine Sea Salt 1kg', price: 2.99, category: 'Spices/Herbs/Seasonings' },
  { name: 'Kalas Classic Iodized Sea Salt 750g', price: 2.99, category: 'Spices/Herbs/Seasonings' },

  // SAUCES
  { name: 'Irie Ultimate BBQ Sauce 16oz', price: 5.00, category: 'Sauces' },
  { name: 'Brown Betty pomeroon style cassareep (300ml)', price: 6.99, category: 'Sauces' },
  { name: 'Guyanese Pride Cassareep (300ml)', price: 6.99, category: 'Sauces' },

  // BAKED GOODS
  { name: 'Pine Tart', price: 8.00, category: 'Baked Goods' },
  { name: 'Salara', price: 8.00, category: 'Baked Goods' },
  { name: 'Pilourie', price: 8.00, category: 'Baked Goods' },
  { name: 'Bread', price: 9.99, category: 'Baked Goods' },
  { name: 'Chinchin', price: 7.00, unit: 'pack', category: 'Baked Goods' },
  { name: 'Meat Pie', price: 3.00, category: 'Baked Goods' },
  { name: 'Vege. Pie', price: 3.00, category: 'Baked Goods' },
  { name: 'Bofrot / Beignet / Pufpuf', price: 6.00, unit: 'pack', category: 'Baked Goods' },

  // DRINKS
  { name: 'Rayjuice Co. (Zobo / Sobolo)', price: 5.00, category: 'Drinks/Beverages' },
  { name: 'Hajia Fati (Burkina)', price: 5.00, category: 'Drinks/Beverages' },
  { name: 'Hajia Fati (Fura)', price: 5.00, category: 'Drinks/Beverages' },
  { name: 'Kirkland Signature Spring Water (500ml)', price: 1.00, category: 'Drinks/Beverages' },
  { name: 'Eska Natural Sprink Water (500ml)', price: 1.50, category: 'Drinks/Beverages' },
  { name: 'Coke 355ml', price: 2.50, category: 'Drinks/Beverages' },
  { name: 'Fanta 355ml', price: 2.50, category: 'Drinks/Beverages' },
  { name: 'Spirit 355ml', price: 2.50, category: 'Drinks/Beverages' },
  { name: 'Ginger Ale 355ml', price: 2.50, category: 'Drinks/Beverages' },
  { name: 'Aladun Zobo 500ml', price: 5.00, category: 'Drinks/Beverages' },

  // FRESH PRODUCE
  { name: 'Ginger Root', price: 6.59, unit: 'kg', category: 'Fresh Produce' },
  { name: 'Organic Ginger Root (160g)', price: 4.99, category: 'Fresh Produce' },
  { name: 'Tomatoes', price: 3.99, unit: 'lb', category: 'Fresh Produce' },
  { name: 'Yellow Onions', price: 3.49, unit: 'bag', category: 'Fresh Produce' },
  { name: 'Garlic', price: 2.49, unit: 'bag', category: 'Fresh Produce' },
  { name: 'Lemon', price: 0.99, category: 'Fresh Produce' },
  { name: 'Wirri Wirri Pepper 200g', price: 7.66, category: 'Fresh Produce' },
  { name: 'Ghana Yam', price: 3.15, unit: 'lb', category: 'Fresh Produce' },
  { name: 'Green Plantain', price: 1.25, unit: 'lb', category: 'Fresh Produce' },
  { name: 'Ripe Plantain', price: 1.20, unit: 'lb', category: 'Fresh Produce' }
]

async function checkFermaGroceryProducts() {
  console.log('🔍 Checking FERMA Grocery Products...\n')
  console.log(`📋 Total products to check: ${fermaGroceryProducts.length}\n`)

  // Fetch all products from database
  const { data: allProducts, error } = await supabase
    .from('products')
    .select('*')
    .order('name')

  if (error) {
    console.error('Error fetching products:', error)
    return
  }

  const foundWithMatch = []
  const foundDifferentPrice = []
  const missing = []

  // Check each product
  for (const product of fermaGroceryProducts) {
    // Clean product name for matching
    const cleanName = product.name.toLowerCase()
      .replace(/\s+/g, ' ')
      .replace(/[`']/g, '')
      .trim()

    // Try to find in database
    let found = allProducts.find(p => {
      const dbName = p.name.toLowerCase().replace(/\s+/g, ' ').trim()
      return dbName === cleanName ||
             dbName.includes(cleanName) ||
             cleanName.includes(dbName)
    })

    // More flexible matching
    if (!found) {
      const searchTerms = cleanName.split(/[\s-/()]+/).filter(term => term.length > 3)
      found = allProducts.find(p => {
        const productName = p.name.toLowerCase()
        const matchCount = searchTerms.filter(term => productName.includes(term)).length
        return matchCount >= Math.min(2, searchTerms.length)
      })
    }

    if (found) {
      const priceMatch = Math.abs(found.price - product.price) < 0.1
      if (priceMatch) {
        foundWithMatch.push({
          pdfName: product.name,
          dbName: found.name,
          price: product.price,
          category: product.category
        })
      } else {
        foundDifferentPrice.push({
          pdfName: product.name,
          dbName: found.name,
          pdfPrice: product.price,
          dbPrice: found.price,
          category: product.category
        })
      }
    } else {
      missing.push(product)
    }
  }

  // Display results
  console.log('=' .repeat(80))
  console.log('✅ FOUND IN DATABASE (Price Matches)')
  console.log('=' .repeat(80))
  foundWithMatch.forEach(p => {
    console.log(`✅ ${p.pdfName} - $${p.price}`)
  })

  console.log('\n' + '=' .repeat(80))
  console.log('⚠️  FOUND BUT PRICE DIFFERENT')
  console.log('=' .repeat(80))
  foundDifferentPrice.forEach(p => {
    console.log(`⚠️  ${p.pdfName}`)
    console.log(`   PDF: $${p.pdfPrice} | Database: $${p.dbPrice}`)
  })

  console.log('\n' + '=' .repeat(80))
  console.log('❌ MISSING FROM DATABASE (Need to Add)')
  console.log('=' .repeat(80))
  missing.forEach(p => {
    console.log(`❌ ${p.name} - $${p.price}${p.unit ? '/' + p.unit : ''} (${p.category})`)
  })

  console.log('\n' + '=' .repeat(80))
  console.log('📊 SUMMARY')
  console.log('=' .repeat(80))
  console.log(`Total FERMA Grocery products: ${fermaGroceryProducts.length}`)
  console.log(`✅ Found with matching price: ${foundWithMatch.length}`)
  console.log(`⚠️  Found but price different: ${foundDifferentPrice.length}`)
  console.log(`❌ Missing from database: ${missing.length}`)
  console.log(`\n📈 Coverage: ${Math.round(((foundWithMatch.length + foundDifferentPrice.length) / fermaGroceryProducts.length) * 100)}%`)

  // Category breakdown
  console.log('\n' + '=' .repeat(80))
  console.log('📂 MISSING BY CATEGORY')
  console.log('=' .repeat(80))
  const missingByCategory = {}
  missing.forEach(p => {
    if (!missingByCategory[p.category]) {
      missingByCategory[p.category] = []
    }
    missingByCategory[p.category].push(p.name)
  })

  Object.keys(missingByCategory).sort().forEach(category => {
    console.log(`\n${category} (${missingByCategory[category].length} missing):`)
    missingByCategory[category].forEach(name => console.log(`  - ${name}`))
  })

  // Save report
  const reportPath = `ferma-grocery-check-${new Date().toISOString().split('T')[0]}.txt`
  const fs = require('fs')
  const report = `FERMA Grocery Products Verification Report
Generated: ${new Date().toLocaleString()}

FOUND WITH MATCHING PRICE (${foundWithMatch.length}):
${foundWithMatch.map(p => `✅ ${p.pdfName} - $${p.price}`).join('\n')}

FOUND BUT PRICE DIFFERENT (${foundDifferentPrice.length}):
${foundDifferentPrice.map(p => `⚠️  ${p.pdfName}\n   PDF: $${p.pdfPrice} | Database: $${p.dbPrice}`).join('\n\n')}

MISSING FROM DATABASE (${missing.length}):
${missing.map(p => `❌ ${p.name} - $${p.price}${p.unit ? '/' + p.unit : ''} (${p.category})`).join('\n')}

MISSING BY CATEGORY:
${Object.keys(missingByCategory).sort().map(cat =>
  `\n${cat} (${missingByCategory[cat].length} missing):\n${missingByCategory[cat].map(n => `  - ${n}`).join('\n')}`
).join('\n')}

SUMMARY:
Total: ${fermaGroceryProducts.length}
Found with matching price: ${foundWithMatch.length}
Found but price different: ${foundDifferentPrice.length}
Missing: ${missing.length}
Coverage: ${Math.round(((foundWithMatch.length + foundDifferentPrice.length) / fermaGroceryProducts.length) * 100)}%
`
  fs.writeFileSync(reportPath, report)
  console.log(`\n📄 Report saved to: ${reportPath}`)
}

checkFermaGroceryProducts()
