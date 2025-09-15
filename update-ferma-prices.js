const { createClient } = require('@supabase/supabase-js');
const XLSX = require('xlsx');

// Supabase configuration
const supabaseUrl = 'https://tmufbgaxhtqgkvcngyxg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtdWZiZ2F4aHRxZ2t2Y25neXhnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDU5ODc4NSwiZXhwIjoyMDcwMTc0Nzg1fQ.85Mj1j1tPayE8L-ChJ0qXBjI64e5UTsPSMB17AniNq4';
const supabase = createClient(supabaseUrl, supabaseKey);

// Cleaned Ferma Excel file path
const CLEANED_FERMA_EXCEL_PATH = '/Users/jasskhinda/Downloads/3ferma_grocery_products_cleaned.xlsx';

function generateSlug(name) {
  if (!name) return '';
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

async function readCleanedExcelFile() {
  console.log('📖 Reading cleaned Ferma Excel file...');
  
  try {
    const workbook = XLSX.readFile(CLEANED_FERMA_EXCEL_PATH);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    console.log(`✅ Loaded ${data.length} rows from cleaned Ferma Excel`);
    return data;
  } catch (error) {
    console.error('❌ Error reading cleaned Ferma Excel file:', error.message);
    throw error;
  }
}

async function updateProductPrices(data) {
  console.log('💰 Updating Ferma product prices...\n');
  
  let updated = 0;
  let notFound = 0;
  let errors = [];
  
  for (const row of data) {
    try {
      // Extract product name - try multiple possible column names
      const productName = row['Product Name'] || row['product name'] || row['Name'] || row['name'] || row['product_name'] || row['Product'] || row['Item'];
      
      if (!productName) {
        console.log('⚠️  Skipping row - no product name found');
        continue;
      }
      
      // Extract price - try multiple possible column names
      const priceValue = row['Price'] || row['product price'] || row['Product Price'] || row['price'] || row['Cost'] || row['Unit Price'];
      const newPrice = parseFloat(priceValue);
      
      if (!newPrice || newPrice <= 0) {
        console.log(`⚠️  Skipping ${productName} - no valid price found (${priceValue})`);
        continue;
      }
      
      console.log(`💰 Updating: ${productName} → $${newPrice}`);
      
      // Generate slug to find the product
      const productSlug = generateSlug(productName);
      
      // Find and update the product by slug
      const { data: updateResult, error } = await supabase
        .from('products')
        .update({ price: newPrice })
        .eq('slug', productSlug)
        .select('id, name, price');
      
      if (error) {
        console.error(`❌ Error updating ${productName}:`, error.message);
        errors.push(`${productName}: ${error.message}`);
      } else if (updateResult && updateResult.length > 0) {
        console.log(`✅ Updated: ${updateResult[0].name} → $${updateResult[0].price}`);
        updated++;
      } else {
        console.log(`❓ Not found: ${productName} (slug: ${productSlug})`);
        notFound++;
      }
      
    } catch (error) {
      console.error(`💥 Exception processing row:`, error);
      errors.push(`Row error: ${error.message}`);
    }
  }
  
  console.log(`\n📊 FERMA PRICE UPDATE SUMMARY`);
  console.log(`✅ Prices Updated: ${updated}`);
  console.log(`❓ Products Not Found: ${notFound}`);
  console.log(`❌ Errors: ${errors.length}`);
  
  if (errors.length > 0) {
    console.log('\n⚠️  ERRORS:');
    errors.forEach(error => console.log(`  - ${error}`));
  }
  
  return { updated, notFound, errors };
}

async function runFermaPriceUpdate() {
  console.log('💰 Ferma Price Update');
  console.log('======================\n');
  console.log(`📄 Source: ${CLEANED_FERMA_EXCEL_PATH}\n`);
  
  try {
    // Read cleaned Excel file
    const excelData = await readCleanedExcelFile();
    
    // Show sample of data structure
    if (excelData.length > 0) {
      console.log('\n📋 Cleaned Excel columns found:');
      console.log(Object.keys(excelData[0]).join(', '));
      console.log('\n');
    }
    
    // Update product prices
    await updateProductPrices(excelData);
    
    console.log('\n🎉 Ferma price update completed!');
    console.log('\n📝 Test URLs:');
    console.log('- Admin: https://kfresh-admin.vercel.app/products');
    console.log('- Store: https://kfresh-store.vercel.app/products');
    
  } catch (error) {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  runFermaPriceUpdate()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('💥 Script failed:', error);
      process.exit(1);
    });
}

module.exports = { runFermaPriceUpdate };