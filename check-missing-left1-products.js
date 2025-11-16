require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// All products from left1 that should be in the database
const productsToCheck = [
  'Big Foot 25g Spicy',
  'Big Foot 25g Regular',
  'Tastees Jamaican Patties Regular Spicy Beef 1.2kg Box',
  'Tastees Jamaican Patties Extra Spicy Beef 1.2kg Box',
  'Tastees Jamaican Patties Vegetarian 1.2kg Box',
  'Nestle Nido Milk Powder 400g',
  'Nestle Nido Milk Powder 900g',
  'Nestle Nido Milk Powder 2500g',
  'Peak Milk Powder 2500g',
  'Peak Milk Powder 900g',
  'Peak Milk Powder 400g',
  'Bertie\'s Original Pepper Sauce 750ml',
  'Bertie\'s Original Pepper Sauce 500ml',
  'Bertie\'s Original Pepper Sauce 300ml',
  'Bertie\'s Original Pepper Sauce 150ml',
  'Bertie\'s Pimento Pepper Sauce 300ml',
  'Bertie\'s Scorpion Pepper Sauce 150ml',
  'Roasted Peanuts 510g',
  'Matouk\'s Tamarind Chutney 12oz',
  'Matouk\'s Trinidad Scorpion Pepper Sauce 10oz',
  'Matouk\'s Soca Hot Sauce 10oz',
  'De Rica Tomato Paste 400g',
  'De Rica Tomato Paste 210g',
  'Slap Ya Mama Original Blend Cajun Seasoning 227g',
  'Slap Ya Mama Hot Cajun Seasoning 227g',
  'Slap Ya Mama Low Sodium Cajun Seasoning 170g',
  'Suya Spice 125g',
  'KFresh Shito 250ml',
  'KFresh Shito 500ml',
  'KFresh Shito 5L',
  'Salted Pig Tail per lb',
  'Salted Pig Feet per lb',
  'Salted Mackerel',
  'Salted Tilapia Koobi',
  'Mauby Drink 500ml',
  'Matooki Green Plantain 1kg',
  'Roasted Peanuts',
  'Efom Wisa',
  'Hwentia',
  'Esoro Wisa',
  'Chilli Pepper Ground',
  'Egusi Ground',
  'Kenkey',
  'Momoni Frozen',
  'Maggi Crayfish Seasoning Cubes 6pcs',
  'Maggi Chicken Seasoning Cubes 6pcs',
  'Matouk\'s Hot Pepper Sauce 10oz',
  'Matouk\'s Calypso Hot Pepper Sauce 10oz',
  'Matouk\'s Chadon Beni Hot Sauce 5.3oz',
  'White Gari 3.5lbs',
  'White Gari 10lbs',
  'White Gari 16lbs',
  'Ijebu Gari 4lbs',
  'Ijebu Gari 10lbs',
  'Ijebu Gari 16lbs',
  'Yellow Gari 4lbs',
  'Yellow Gari 10lbs',
  'Yellow Gari 16lbs',
  'Vitamalt Classic 6pack',
  'Vitamalt Ginger 6pack',
  'Vitamalt Coconut & Hibiscus 6pack'
]

async function checkMissing() {
  console.log('🔍 Checking which products from left1 are missing...\n')

  const missing = []
  const found = []

  for (const productName of productsToCheck) {
    const { data } = await supabase
      .from('products')
      .select('id, name')
      .or(`name.ilike.%${productName}%,name.ilike.%${productName.replace(/['`]/g, '')}%`)
      .limit(1)

    if (!data || data.length === 0) {
      missing.push(productName)
      console.log(`❌ Missing: ${productName}`)
    } else {
      found.push(productName)
      console.log(`✅ Found: ${data[0].name}`)
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log(`✅ Found: ${found.length} products`)
  console.log(`❌ Missing: ${missing.length} products`)
  console.log('='.repeat(60))

  if (missing.length > 0) {
    console.log('\n📝 Missing products:')
    missing.forEach(p => console.log(`  - ${p}`))
  }
}

checkMissing()
