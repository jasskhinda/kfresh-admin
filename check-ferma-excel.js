require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')
const XLSX = require('xlsx')
const path = require('path')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkFermaExcelProducts() {
  console.log('📊 Reading FERMA Excel File...\n')

  // Read Excel file
  const excelPath = path.join(__dirname, '..', '3-4ferma_grocery_products_cleaned.xlsx')
  const workbook = XLSX.readFile(excelPath)
  const sheetName = workbook.SheetNames[0]
  const sheet = workbook.Sheets[sheetName]
  const data = XLSX.utils.sheet_to_json(sheet)

  console.log(`📋 Total products in Excel: ${data.length}\n`)

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

  // Check each product from Excel
  for (const row of data) {
    // Extract product info from Excel row
    const productName = row['Product Name'] || row['product_name'] || row['name'] || row['Name'] || ''
    const price = parseFloat(row['Price'] || row['price'] || 0)
    const category = row['Category'] || row['category'] || 'Uncategorized'

    if (!productName) continue

    // Clean product name for matching
    const cleanName = productName.toLowerCase()
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
      if (searchTerms.length > 0) {
        found = allProducts.find(p => {
          const productNameLower = p.name.toLowerCase()
          const matchCount = searchTerms.filter(term => productNameLower.includes(term)).length
          return matchCount >= Math.min(2, searchTerms.length)
        })
      }
    }

    if (found) {
      const priceMatch = Math.abs(found.price - price) < 0.1
      if (priceMatch) {
        foundWithMatch.push({
          excelName: productName,
          dbName: found.name,
          price: price,
          category: category
        })
      } else {
        foundDifferentPrice.push({
          excelName: productName,
          dbName: found.name,
          excelPrice: price,
          dbPrice: found.price,
          category: category
        })
      }
    } else {
      missing.push({
        name: productName,
        price: price,
        category: category,
        ...row // Include all Excel columns
      })
    }
  }

  // Display results
  console.log('=' .repeat(80))
  console.log('✅ FOUND IN DATABASE (Price Matches)')
  console.log('=' .repeat(80))
  foundWithMatch.forEach(p => {
    console.log(`✅ ${p.excelName} - $${p.price}`)
  })

  console.log('\n' + '=' .repeat(80))
  console.log('⚠️  FOUND BUT PRICE DIFFERENT')
  console.log('=' .repeat(80))
  foundDifferentPrice.forEach(p => {
    console.log(`⚠️  ${p.excelName}`)
    console.log(`   Excel: $${p.excelPrice} | Database: $${p.dbPrice}`)
  })

  console.log('\n' + '=' .repeat(80))
  console.log('❌ MISSING FROM DATABASE (Need to Add)')
  console.log('=' .repeat(80))
  missing.forEach(p => {
    console.log(`❌ ${p.name} - $${p.price} (${p.category})`)
  })

  console.log('\n' + '=' .repeat(80))
  console.log('📊 SUMMARY')
  console.log('=' .repeat(80))
  console.log(`Total products in Excel: ${data.length}`)
  console.log(`✅ Found with matching price: ${foundWithMatch.length}`)
  console.log(`⚠️  Found but price different: ${foundDifferentPrice.length}`)
  console.log(`❌ Missing from database: ${missing.length}`)
  console.log(`\n📈 Coverage: ${Math.round(((foundWithMatch.length + foundDifferentPrice.length) / data.length) * 100)}%`)

  // Category breakdown
  console.log('\n' + '=' .repeat(80))
  console.log('📂 MISSING BY CATEGORY')
  console.log('=' .repeat(80))
  const missingByCategory = {}
  missing.forEach(p => {
    if (!missingByCategory[p.category]) {
      missingByCategory[p.category] = []
    }
    missingByCategory[p.category].push({ name: p.name, price: p.price })
  })

  Object.keys(missingByCategory).sort().forEach(category => {
    console.log(`\n${category} (${missingByCategory[category].length} missing):`)
    missingByCategory[category].forEach(item => console.log(`  - ${item.name} - $${item.price}`))
  })

  // Save detailed report with all Excel data
  const reportPath = `ferma-excel-check-${new Date().toISOString().split('T')[0]}.json`
  const fs = require('fs')
  const report = {
    summary: {
      total: data.length,
      foundWithMatch: foundWithMatch.length,
      foundDifferentPrice: foundDifferentPrice.length,
      missing: missing.length,
      coverage: Math.round(((foundWithMatch.length + foundDifferentPrice.length) / data.length) * 100)
    },
    foundWithMatch,
    foundDifferentPrice,
    missing,
    missingByCategory
  }
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
  console.log(`\n📄 Detailed report saved to: ${reportPath}`)

  // Save text report
  const txtReportPath = `ferma-excel-check-${new Date().toISOString().split('T')[0]}.txt`
  const txtReport = `FERMA Excel Products Verification Report
Generated: ${new Date().toLocaleString()}

FOUND WITH MATCHING PRICE (${foundWithMatch.length}):
${foundWithMatch.map(p => `✅ ${p.excelName} - $${p.price}`).join('\n')}

FOUND BUT PRICE DIFFERENT (${foundDifferentPrice.length}):
${foundDifferentPrice.map(p => `⚠️  ${p.excelName}\n   Excel: $${p.excelPrice} | Database: $${p.dbPrice}`).join('\n\n')}

MISSING FROM DATABASE (${missing.length}):
${missing.map(p => `❌ ${p.name} - $${p.price} (${p.category})`).join('\n')}

MISSING BY CATEGORY:
${Object.keys(missingByCategory).sort().map(cat =>
  `\n${cat} (${missingByCategory[cat].length} missing):\n${missingByCategory[cat].map(n => `  - ${n.name} - $${n.price}`).join('\n')}`
).join('\n')}

SUMMARY:
Total: ${data.length}
Found with matching price: ${foundWithMatch.length}
Found but price different: ${foundDifferentPrice.length}
Missing: ${missing.length}
Coverage: ${Math.round(((foundWithMatch.length + foundDifferentPrice.length) / data.length) * 100)}%
`
  fs.writeFileSync(txtReportPath, txtReport)
  console.log(`📄 Text report saved to: ${txtReportPath}`)
}

checkFermaExcelProducts()
