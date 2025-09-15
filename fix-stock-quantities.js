const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://tmufbgaxhtqgkvcngyxg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtdWZiZ2F4aHRxZ2t2Y25neXhnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDU5ODc4NSwiZXhwIjoyMDcwMTc0Nzg1fQ.85Mj1j1tPayE8L-ChJ0qXBjI64e5UTsPSMB17AniNq4';
const supabase = createClient(supabaseUrl, supabaseKey);

async function fixStockQuantities() {
  console.log('🔧 Fixing stock quantities for all products...\n');
  
  try {
    // Update all products to have stock and be available
    const { data, error } = await supabase
      .from('products')
      .update({
        stock_quantity: 100,  // Set reasonable stock quantity
        is_available: true,   // Make all products available
        is_featured: false    // Set featured status
      })
      .neq('id', '00000000-0000-0000-0000-000000000000') // Update all real products
      .select('id, name, stock_quantity, is_available');
    
    if (error) {
      console.error('❌ Error updating products:', error.message);
      return;
    }
    
    console.log(`✅ Updated ${data.length} products:`);
    data.forEach(product => {
      console.log(`  - ${product.name}: Stock ${product.stock_quantity}, Available: ${product.is_available}`);
    });
    
    console.log('\n🎉 All products are now in stock and available!');
    
  } catch (error) {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  fixStockQuantities()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('💥 Script failed:', error);
      process.exit(1);
    });
}

module.exports = { fixStockQuantities };