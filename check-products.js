const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://tmufbgaxhtqgkvcngyxg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtdWZiZ2F4aHRxZ2t2Y25neXhnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDU5ODc4NSwiZXhwIjoyMDcwMTc0Nzg1fQ.85Mj1j1tPayE8L-ChJ0qXBjI64e5UTsPSMB17AniNq4';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProducts() {
  console.log('📋 Checking all products in database...\n');
  
  try {
    const { data: products, error } = await supabase
      .from('products')
      .select('id, name, stock_quantity, is_available, price, category_id')
      .order('name');
    
    if (error) {
      console.error('❌ Error fetching products:', error.message);
      return;
    }
    
    console.log(`📦 Total products: ${products.length}\n`);
    
    products.forEach((product, index) => {
      const stockStatus = product.stock_quantity > 0 ? '✅' : '❌';
      const availStatus = product.is_available ? '✅' : '❌';
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   Stock: ${product.stock_quantity} ${stockStatus} | Available: ${product.is_available} ${availStatus} | Price: $${product.price}`);
    });
    
    const outOfStock = products.filter(p => p.stock_quantity <= 0);
    const unavailable = products.filter(p => !p.is_available);
    
    console.log(`\n📊 Summary:`);
    console.log(`   Out of stock: ${outOfStock.length}`);
    console.log(`   Unavailable: ${unavailable.length}`);
    
  } catch (error) {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  checkProducts()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('💥 Script failed:', error);
      process.exit(1);
    });
}

module.exports = { checkProducts };