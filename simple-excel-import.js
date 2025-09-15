const { createClient } = require('@supabase/supabase-js');
const XLSX = require('xlsx');

// Supabase configuration
const supabaseUrl = 'https://tmufbgaxhtqgkvcngyxg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtdWZiZ2F4aHRxZ2t2Y25neXhnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDU5ODc4NSwiZXhwIjoyMDcwMTc0Nzg1fQ.85Mj1j1tPayE8L-ChJ0qXBjI64e5UTsPSMB17AniNq4';
const supabase = createClient(supabaseUrl, supabaseKey);

// Excel file path
const EXCEL_FILE_PATH = '/Users/jasskhinda/Downloads/final_product_data.xlsx';

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

async function readExcelFile() {
  console.log('📖 Reading Excel file...');
  
  try {
    const workbook = XLSX.readFile(EXCEL_FILE_PATH);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    console.log(`✅ Loaded ${data.length} rows from Excel`);
    return data;
  } catch (error) {
    console.error('❌ Error reading Excel file:', error.message);
    throw error;
  }
}

async function ensureCategory(categoryName) {
  if (!categoryName) return null;
  
  const slug = generateSlug(categoryName);
  
  // Check if category exists
  const { data: existing } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', slug)
    .single();
  
  if (existing) {
    return existing.id;
  }
  
  // Create new category
  const { data, error } = await supabase
    .from('categories')
    .insert([{
      name: categoryName,
      slug: slug,
      description: `${categoryName} products`,
      parent_category_id: null,
      level: 1,
      is_active: true,
      is_fresh_meals: false,
      display_order: 0
    }])
    .select()
    .single();
  
  if (error) {
    console.error(`❌ Error creating category ${categoryName}:`, error.message);
    return null;
  }
  
  console.log(`✅ Created category: ${categoryName}`);
  return data.id;
}

async function importProducts(data) {
  console.log('📦 Importing products from Excel...\n');
  
  let imported = 0;
  let errors = [];
  
  for (const row of data) {
    try {
      // Extract product name
      const productName = row['Product Name'] || row['Name'] || row['name'];
      
      if (!productName) {
        console.log('⚠️  Skipping row - no product name found');
        continue;
      }
      
      console.log(`📦 Processing: ${productName}`);
      
      // Get category if specified
      const categoryName = row['Category'] || row['category'];
      let categoryId = null;
      
      if (categoryName) {
        categoryId = await ensureCategory(categoryName);
      }
      
      // Prepare product record with ONLY basic database columns
      const productRecord = {
        name: productName,
        slug: generateSlug(productName),
        description: row['Product Description'] || null,
        price: parseFloat(row['Product Price']) || 0,
        category_id: categoryId,
        stock_quantity: parseInt(row['Stock Quantity']) || 100,
        is_available: true,
        is_featured: false
      };
      
      const { data, error } = await supabase
        .from('products')
        .insert([productRecord])
        .select()
        .single();
      
      if (error) {
        console.error(`❌ Error importing ${productName}:`, error.message);
        errors.push(`${productName}: ${error.message}`);
      } else {
        console.log(`✅ Imported: ${productName}`);
        imported++;
      }
      
    } catch (error) {
      console.error(`💥 Exception processing row:`, error);
      errors.push(`Row error: ${error.message}`);
    }
  }
  
  console.log(`\n📊 IMPORT SUMMARY`);
  console.log(`✅ Products Imported: ${imported}`);
  console.log(`❌ Errors: ${errors.length}`);
  
  if (errors.length > 0) {
    console.log('\n⚠️  ERRORS:');
    errors.forEach(error => console.log(`  - ${error}`));
  }
  
  return { imported, errors };
}

async function runSimpleExcelImport() {
  console.log('📊 Simple Excel Product Import');
  console.log('================================\n');
  console.log(`📄 Source: ${EXCEL_FILE_PATH}\n`);
  
  try {
    // Read Excel file
    const excelData = await readExcelFile();
    
    // Show sample of data structure
    if (excelData.length > 0) {
      console.log('\n📋 Excel columns found:');
      console.log(Object.keys(excelData[0]).join(', '));
      console.log('\n');
    }
    
    // Import products
    await importProducts(excelData);
    
    console.log('\n🎉 Excel import completed!');
    console.log('\n📝 Test URLs:');
    console.log('- Admin: https://kfresh-admin.vercel.app/products');
    console.log('- Store: https://kfresh-store.vercel.app/products');
    
  } catch (error) {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  runSimpleExcelImport()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('💥 Script failed:', error);
      process.exit(1);
    });
}

module.exports = { runSimpleExcelImport };