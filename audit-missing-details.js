const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://tmufbgaxhtqgkvcngyxg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtdWZiZ2F4aHRxZ2t2Y25neXhnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDU5ODc4NSwiZXhwIjoyMDcwMTc0Nzg1fQ.85Mj1j1tPayE8L-ChJ0qXBjI64e5UTsPSMB17AniNq4';
const supabase = createClient(supabaseUrl, supabaseKey);

async function auditMissingDetails() {
  console.log('🔍 Auditing products for missing details...\n');
  
  try {
    // Get all products with their current details
    const { data: products, error } = await supabase
      .from('products')
      .select('id, name, weight, unit, brand, origin, sku, barcode, price')
      .order('name');
    
    if (error) {
      console.error('❌ Error fetching products:', error.message);
      return;
    }
    
    console.log(`📦 Analyzing ${products.length} products...\n`);
    
    // Track missing details
    const missingDetails = {
      weight: [],
      unit: [],
      brand: [],
      origin: [],
      sku: [],
      barcode: [],
      price_zero: []
    };
    
    // Analyze each product
    products.forEach(product => {
      if (!product.weight) missingDetails.weight.push(product.name);
      if (!product.unit) missingDetails.unit.push(product.name);
      if (!product.brand) missingDetails.brand.push(product.name);
      if (!product.origin) missingDetails.origin.push(product.name);
      if (!product.sku) missingDetails.sku.push(product.name);
      if (!product.barcode) missingDetails.barcode.push(product.name);
      if (product.price === 0) missingDetails.price_zero.push(product.name);
    });
    
    // Report results
    console.log('📊 MISSING DETAILS AUDIT REPORT');
    console.log('================================\n');
    
    Object.entries(missingDetails).forEach(([field, missing]) => {
      console.log(`🔸 Missing ${field.toUpperCase()}: ${missing.length} products`);
      if (missing.length > 0 && missing.length <= 20) {
        missing.forEach(name => console.log(`   - ${name}`));
      } else if (missing.length > 20) {
        missing.slice(0, 10).forEach(name => console.log(`   - ${name}`));
        console.log(`   ... and ${missing.length - 10} more`);
      }
      console.log('');
    });
    
    // Summary statistics
    const totalProducts = products.length;
    const completeProducts = products.filter(p => 
      p.weight && p.unit && p.brand && p.origin && p.price > 0
    ).length;
    
    console.log('📈 SUMMARY STATISTICS');
    console.log('====================');
    console.log(`Total Products: ${totalProducts}`);
    console.log(`Complete Products: ${completeProducts} (${Math.round(completeProducts/totalProducts*100)}%)`);
    console.log(`Products with Missing Details: ${totalProducts - completeProducts} (${Math.round((totalProducts - completeProducts)/totalProducts*100)}%)`);
    
    // Identify products missing multiple details
    console.log('\n🚨 PRODUCTS MISSING MULTIPLE DETAILS');
    console.log('====================================');
    
    const multiMissing = products.filter(p => {
      const missing = [
        !p.weight,
        !p.unit,
        !p.brand,
        !p.origin,
        p.price === 0
      ].filter(Boolean).length;
      return missing >= 2;
    });
    
    multiMissing.forEach(product => {
      const missing = [];
      if (!product.weight) missing.push('weight');
      if (!product.unit) missing.push('unit');
      if (!product.brand) missing.push('brand');
      if (!product.origin) missing.push('origin');
      if (product.price === 0) missing.push('price');
      
      console.log(`❗ ${product.name}`);
      console.log(`   Missing: ${missing.join(', ')}\n`);
    });
    
  } catch (error) {
    console.error('💥 Fatal error:', error);
  }
}

if (require.main === module) {
  auditMissingDetails()
    .then(() => {
      console.log('\n🎉 Audit completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Audit failed:', error);
      process.exit(1);
    });
}

module.exports = { auditMissingDetails };