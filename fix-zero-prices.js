const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://tmufbgaxhtqgkvcngyxg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtdWZiZ2F4aHRxZ2t2Y25neXhnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDU5ODc4NSwiZXhwIjoyMDcwMTc0Nzg1fQ.85Mj1j1tPayE8L-ChJ0qXBjI64e5UTsPSMB17AniNq4';
const supabase = createClient(supabaseUrl, supabaseKey);

// Price suggestions based on product type/name patterns
const pricePatterns = [
  // Fish products
  { pattern: /fish|mackerel|tilapia|whiting|crocker|sardine|tuna/i, price: 8.99 },
  { pattern: /chicken.*feet/i, price: 5.99 },
  { pattern: /turkey.*wing|turkey.*drumstick/i, price: 12.99 },
  { pattern: /smoked.*turkey/i, price: 9.99 },
  
  // Vegetables and produce
  { pattern: /tomatoes/i, price: 3.99 },
  { pattern: /onion/i, price: 3.49 },
  { pattern: /garlic/i, price: 2.49 },
  { pattern: /plantain/i, price: 1.25 },
  { pattern: /yam/i, price: 3.15 },
  
  // Packaged goods
  { pattern: /maggi.*pack/i, price: 14.99 },
  { pattern: /okro.*pack|okra.*pack/i, price: 6.75 },
  { pattern: /chinchin.*pack/i, price: 7.00 },
  { pattern: /bofrot.*pack|pufpuf.*pack/i, price: 6.00 },
  { pattern: /moi.*moi.*plate/i, price: 2.00 },
  
  // Default prices by category
  { pattern: /frozen/i, price: 7.99 },
  { pattern: /.*/, price: 4.99 } // Default fallback
];

function suggestPrice(productName) {
  for (const pattern of pricePatterns) {
    if (pattern.pattern.test(productName)) {
      return pattern.price;
    }
  }
  return 4.99; // Final fallback
}

async function findAndFixZeroPrices() {
  console.log('🔍 Finding products with zero prices...\n');
  
  try {
    // Find all products with price = 0
    const { data: zeroProducts, error: fetchError } = await supabase
      .from('products')
      .select('id, name, price, category_id')
      .eq('price', 0)
      .order('name');
    
    if (fetchError) {
      console.error('❌ Error fetching zero-price products:', fetchError.message);
      return;
    }
    
    if (!zeroProducts || zeroProducts.length === 0) {
      console.log('✅ No products with zero prices found!');
      return;
    }
    
    console.log(`📋 Found ${zeroProducts.length} products with zero prices:\n`);
    
    let updated = 0;
    let errors = [];
    
    for (const product of zeroProducts) {
      try {
        const suggestedPrice = suggestPrice(product.name);
        
        console.log(`💰 Updating: ${product.name} → $${suggestedPrice}`);
        
        const { data, error } = await supabase
          .from('products')
          .update({ price: suggestedPrice })
          .eq('id', product.id)
          .select('name, price');
        
        if (error) {
          console.error(`❌ Error updating ${product.name}:`, error.message);
          errors.push(`${product.name}: ${error.message}`);
        } else {
          console.log(`✅ Updated: ${product.name} → $${suggestedPrice}`);
          updated++;
        }
        
      } catch (error) {
        console.error(`💥 Exception updating ${product.name}:`, error);
        errors.push(`${product.name}: ${error.message}`);
      }
    }
    
    console.log(`\n📊 ZERO PRICE FIX SUMMARY`);
    console.log(`✅ Prices Updated: ${updated}`);
    console.log(`❌ Errors: ${errors.length}`);
    
    if (errors.length > 0) {
      console.log('\n⚠️  ERRORS:');
      errors.forEach(error => console.log(`  - ${error}`));
    }
    
  } catch (error) {
    console.error('💥 Fatal error:', error);
  }
}

if (require.main === module) {
  findAndFixZeroPrices()
    .then(() => {
      console.log('\n🎉 Zero price fix completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Script failed:', error);
      process.exit(1);
    });
}

module.exports = { findAndFixZeroPrices };