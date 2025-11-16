require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Products from FERMA PDF
const fermaProducts = [
  { name: 'Frozen Red Fish Whole', brand: 'FERMA', pack: '12/750g', item_number: '0526', category: 'Frozen Foods' },
  { name: 'Frz Med. Blue Jack Mackerel Carapau', brand: 'FERMA', pack: '12/750g', item_number: '0495', category: 'Frozen Foods' },
  { name: 'Frozen Sardines Nacional', brand: 'FERMA', pack: '12/750g', item_number: '0491', category: 'Frozen Foods' },
  { name: 'Frozen Large Mackerel', brand: 'FERMA', pack: '1/kg', item_number: '0506', category: 'Frozen Foods' },
  { name: 'Frozen Large Mackerel (Tote)', brand: 'FERMA', pack: 'TOTE', item_number: '0506A', category: 'Frozen Foods' },
  { name: 'Frozen Small Mackerel', brand: 'FERMA', pack: '12/750g', item_number: '0507', category: 'Frozen Foods' },
  { name: 'Frozen Red Fish (Slices)', brand: 'FERMA', pack: '12/750g', item_number: '0528', category: 'Frozen Foods' },
  { name: 'Frozen Nile Perch', brand: 'FERMA', pack: '1/Kg', item_number: '0552', category: 'Frozen Foods' },
  { name: 'Maggi Chicken Flavour Cubes (10g X 60)', brand: 'Maggi', pack: '10g x 60', category: 'Spices/Herbs/Seasonings' }
]

async function checkFermaProducts() {
  console.log('🔍 Checking FERMA Products...\n')
  console.log(`📋 Total products to check: ${fermaProducts.length}\n`)

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
  const missing = []

  // Check each FERMA product
  for (const product of fermaProducts) {
    // Try exact match first
    let found = allProducts.find(p =>
      p.name.toLowerCase().includes(product.name.toLowerCase().replace('frz', 'frozen').replace('med.', 'medium'))
    )

    // Try flexible matching
    if (!found) {
      const searchTerms = product.name.toLowerCase()
        .replace('frz', 'frozen')
        .replace('med.', 'medium')
        .split(/[\s-]+/)
        .filter(term => term.length > 3)

      found = allProducts.find(p => {
        const productName = p.name.toLowerCase()
        return searchTerms.some(term => productName.includes(term)) &&
               (product.brand ? productName.includes(product.brand.toLowerCase()) : true)
      })
    }

    if (found) {
      foundWithMatch.push({
        pdfName: product.name,
        dbName: found.name,
        brand: product.brand,
        pack: product.pack,
        item_number: product.item_number
      })
    } else {
      missing.push(product)
    }
  }

  // Display results
  console.log('=' .repeat(80))
  console.log('✅ FOUND IN DATABASE')
  console.log('=' .repeat(80))
  foundWithMatch.forEach(p => {
    console.log(`✅ ${p.pdfName}`)
    console.log(`   DB: ${p.dbName}`)
    console.log(`   Brand: ${p.brand} | Pack: ${p.pack} | Item #: ${p.item_number}`)
  })

  console.log('\n' + '=' .repeat(80))
  console.log('❌ MISSING FROM DATABASE (Need to Add)')
  console.log('=' .repeat(80))
  missing.forEach(p => {
    console.log(`❌ ${p.name}`)
    console.log(`   Brand: ${p.brand} | Pack: ${p.pack} | Item #: ${p.item_number} | Category: ${p.category}`)
  })

  console.log('\n' + '=' .repeat(80))
  console.log('📊 SUMMARY')
  console.log('=' .repeat(80))
  console.log(`Total FERMA products: ${fermaProducts.length}`)
  console.log(`✅ Found: ${foundWithMatch.length}`)
  console.log(`❌ Missing: ${missing.length}`)
  console.log(`\n📈 Coverage: ${Math.round((foundWithMatch.length / fermaProducts.length) * 100)}%`)

  // Save report
  const reportPath = `ferma-products-check-${new Date().toISOString().split('T')[0]}.txt`
  const fs = require('fs')
  const report = `FERMA Products Verification Report
Generated: ${new Date().toLocaleString()}

FOUND IN DATABASE (${foundWithMatch.length}):
${foundWithMatch.map(p => `✅ ${p.pdfName}\n   DB: ${p.dbName}\n   Brand: ${p.brand} | Pack: ${p.pack} | Item #: ${p.item_number}`).join('\n\n')}

MISSING FROM DATABASE (${missing.length}):
${missing.map(p => `❌ ${p.name}\n   Brand: ${p.brand} | Pack: ${p.pack} | Item #: ${p.item_number} | Category: ${p.category}`).join('\n\n')}

SUMMARY:
Total: ${fermaProducts.length}
Found: ${foundWithMatch.length}
Missing: ${missing.length}
Coverage: ${Math.round((foundWithMatch.length / fermaProducts.length) * 100)}%
`
  fs.writeFileSync(reportPath, report)
  console.log(`\n📄 Report saved to: ${reportPath}`)
}

checkFermaProducts()
