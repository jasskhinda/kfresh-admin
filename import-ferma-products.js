const { createClient } = require('@supabase/supabase-js');
const XLSX = require('xlsx');

// Supabase configuration
const supabaseUrl = 'https://tmufbgaxhtqgkvcngyxg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtdWZiZ2F4aHRxZ2t2Y25neXhnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDU5ODc4NSwiZXhwIjoyMDcwMTc0Nzg1fQ.85Mj1j1tPayE8L-ChJ0qXBjI64e5UTsPSMB17AniNq4';
const supabase = createClient(supabaseUrl, supabaseKey);

// Ferma Excel file path
const FERMA_EXCEL_FILE_PATH = '/Users/jasskhinda/Downloads/ferma_grocery_products.xlsx';

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
  console.log('📖 Reading Ferma Excel file...');
  
  try {
    const workbook = XLSX.readFile(FERMA_EXCEL_FILE_PATH);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    console.log(`✅ Loaded ${data.length} rows from Ferma Excel`);
    return data;
  } catch (error) {
    console.error('❌ Error reading Ferma Excel file:', error.message);
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

async function importFermaProducts(data) {
  console.log('📦 Importing Ferma products from Excel...\n');
  
  let imported = 0;
  let errors = [];
  
  for (const row of data) {
    try {
      // Extract product name - try multiple possible column names
      const productName = row['product name'] || row['Product Name'] || row['Name'] || row['name'] || row['product_name'] || row['Product'] || row['Item'];
      
      if (!productName) {
        console.log('⚠️  Skipping row - no product name found');
        continue;
      }
      
      console.log(`📦 Processing: ${productName}`);
      
      // Get category if specified - try multiple possible column names
      const categoryName = row['category'] || row['Category'] || row['Type'] || row['Product Type'];
      let categoryId = null;
      
      if (categoryName) {
        categoryId = await ensureCategory(categoryName);
      }
      
      // Extract description - try multiple possible column names
      const description = row['product description'] || row['Description'] || row['Product Description'] || row['description'] || row['Details'] || null;
      
      // Extract price - try multiple possible column names
      const priceValue = row['product price'] || row['Price'] || row['Product Price'] || row['price'] || row['Cost'] || row['Unit Price'] || 0;
      const price = parseFloat(priceValue) || 0;
      
      // Extract stock - try multiple possible column names
      const stockValue = row['stock quantity'] || row['Stock'] || row['Stock Quantity'] || row['stock_quantity'] || row['Quantity'] || row['Qty'] || 100;
      const stockQuantity = parseInt(stockValue) || 100;
      
      // Prepare product record with only basic database columns
      const productRecord = {
        name: productName,
        slug: generateSlug(productName),
        description: description,
        price: price,
        category_id: categoryId,
        stock_quantity: stockQuantity,
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
  
  console.log(`\n📊 FERMA IMPORT SUMMARY`);
  console.log(`✅ Products Imported: ${imported}`);
  console.log(`❌ Errors: ${errors.length}`);
  
  if (errors.length > 0) {
    console.log('\n⚠️  ERRORS:');
    errors.forEach(error => console.log(`  - ${error}`));
  }
  
  return { imported, errors };
}

async function runFermaImport() {
  console.log('🚜 Ferma Grocery Products Import');
  console.log('==================================\n');
  console.log(`📄 Source: ${FERMA_EXCEL_FILE_PATH}\n`);
  
  try {
    // Read Ferma Excel file
    const excelData = await readExcelFile();
    
    // Show sample of data structure
    if (excelData.length > 0) {
      console.log('\n📋 Ferma Excel columns found:');
      console.log(Object.keys(excelData[0]).join(', '));
      console.log('\n');
    }
    
    // Import Ferma products
    await importFermaProducts(excelData);
    
    console.log('\n🎉 Ferma import completed!');
    console.log('\n📝 Test URLs:');
    console.log('- Admin: https://kfresh-admin.vercel.app/products');
    console.log('- Store: https://kfresh-store.vercel.app/products');
    
  } catch (error) {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  runFermaImport()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('💥 Script failed:', error);
      process.exit(1);
    });
}

module.exports = { runFermaImport };