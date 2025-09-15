const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://tmufbgaxhtqgkvcngyxg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtdWZiZ2F4aHRxZ2t2Y25neXhnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDU5ODc4NSwiZXhwIjoyMDcwMTc0Nzg1fQ.85Mj1j1tPayE8L-ChJ0qXBjI64e5UTsPSMB17AniNq4';
const supabase = createClient(supabaseUrl, supabaseKey);

async function fixMaggiPrice() {
  console.log('🔧 Fixing Maggi Chicken Flavour Cubes price...\n');
  
  try {
    // Update the specific product with a reasonable price
    const { data, error } = await supabase
      .from('products')
      .update({ price: 14.99 })  // Set a reasonable price for a box of 60 cubes
      .eq('name', 'Maggi Chicken Flavour Cubes (10g X 60)')
      .select('id, name, price');
    
    if (error) {
      console.error('❌ Error updating Maggi price:', error.message);
      return;
    }
    
    if (data && data.length > 0) {
      console.log(`✅ Updated: ${data[0].name} → $${data[0].price}`);
      console.log('🎉 Maggi price fixed successfully!');
    } else {
      console.log('❓ Product not found. Let me search for similar products...');
      
      // Search for similar products
      const { data: searchResults } = await supabase
        .from('products')
        .select('id, name, price')
        .ilike('name', '%maggi%chicken%')
        .order('name');
      
      if (searchResults && searchResults.length > 0) {
        console.log('\n📋 Found similar Maggi products:');
        searchResults.forEach(product => {
          console.log(`  - ${product.name}: $${product.price}`);
        });
      }
    }
    
  } catch (error) {
    console.error('💥 Fatal error:', error);
  }
}

if (require.main === module) {
  fixMaggiPrice()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('💥 Script failed:', error);
      process.exit(1);
    });
}

module.exports = { fixMaggiPrice };