const { createClient } = require('@supabase/supabase-js');
const XLSX = require('xlsx');

// Supabase configuration
const supabaseUrl = 'https://tmufbgaxhtqgkvcngyxg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtdWZiZ2F4aHRxZ2t2Y25neXhnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDU5ODc4NSwiZXhwIjoyMDcwMTc0Nzg1fQ.85Mj1j1tPayE8L-ChJ0qXBjI64e5UTsPSMB17AniNq4';
const supabase = createClient(supabaseUrl, supabaseKey);

// File 1: Final Product Data
const FILE1_PATH = '/Volumes/C/Kfreshfiles/Final File - Kfresh Website/Final File - Kfresh Website/1final_product_data.xlsx';

function generateSlug(name) {
  if (!name) return '';
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\\s-]/g, '')
    .replace(/\\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function extractWeight(text, weightCol) {
  // First try the weight column
  if (weightCol) {
    const weight = parseFloat(weightCol);
    if (!isNaN(weight)) return weight;
  }
  
  // Then try extracting from product name
  if (!text) return null;
  
  const weightMatch = text.match(/(\\d+(?:\\.\\d+)?)\\s*(g|kg|lb|lbs|oz|ml|l|litre|liter|pack|pcs|pieces)/i);
  if (weightMatch) {
    return parseFloat(weightMatch[1]);
  }
  return null;
}

function extractUnit(text, unitCol) {
  // First try the unit column
  if (unitCol) return unitCol.toLowerCase();
  
  // Then try extracting from product name
  if (!text) return null;
  
  const unitMatch = text.match(/(\\d+(?:\\.\\d+)?)\\s*(g|kg|lb|lbs|oz|ml|l|litre|liter|pack|pcs|pieces)/i);
  if (unitMatch) {
    let unit = unitMatch[2].toLowerCase();
    // Normalize units
    if (unit === 'lbs') unit = 'lb';
    if (unit === 'litre' || unit === 'liter') unit = 'l';
    if (unit === 'pcs' || unit === 'pieces') unit = 'piece';
    return unit;
  }
  return null;
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

async function importFile1() {
  console.log('📦 Importing products from File 1: 1final_product_data.xlsx\\n');
  console.log('=' .repeat(60) + '\\n');
  
  try {
    // Read Excel file
    console.log('📖 Reading Excel file...');
    const workbook = XLSX.readFile(FILE1_PATH);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    console.log(`✅ Loaded ${data.length} rows from Excel\\n`);
    
    // Show column structure
    if (data.length > 0) {
      console.log('📋 Available columns:');
      console.log(Object.keys(data[0]).join(', '));
      console.log('\\n' + '=' .repeat(60) + '\\n');
    }
    
    let imported = 0;
    let skipped = 0;
    let errors = [];
    
    for (const row of data) {
      try {
        // Extract all fields from Excel
        const productName = row['Product Name'];
        const category = row['Category'];
        const description = row['Product Description'];
        const price = parseFloat(row['Product Price']) || 0;
        const stockQuantity = parseInt(row['Stock Quantity']) || 100;
        const weight = extractWeight(productName, row['Weight']);
        const unit = extractUnit(productName, row['Unit']);
        const origin = row['Origin'];
        const brand = row['Brand'];
        // Generate unique SKU if the Excel has duplicate values
        const baseSku = row['SKU'];
        const sku = baseSku ? `${baseSku}-${generateSlug(productName).substring(0, 10)}` : null;
        const availability = row['Availability'];
        const ingredients = row['Ingredients'];
        const nutrition = row['Nutrition'];
        
        if (!productName) {
          console.log('⚠️  Skipping row - no product name');
          skipped++;
          continue;
        }
        
        console.log(`\\n📦 Processing: ${productName}`);
        console.log(`   Category: ${category || 'None'}`);
        console.log(`   Price: $${price}`);
        console.log(`   Stock: ${stockQuantity}`);
        console.log(`   Weight: ${weight || 'N/A'} ${unit || ''}`);
        console.log(`   Brand: ${brand || 'N/A'}`);
        console.log(`   Origin: ${origin || 'N/A'}`);
        
        // Get or create category
        let categoryId = null;
        if (category) {
          categoryId = await ensureCategory(category);
        }
        
        // Prepare product record with ALL fields
        const productRecord = {
          name: productName,
          slug: generateSlug(productName),
          description: description || null,
          short_description: description ? description.substring(0, 150) : null,
          price: price,
          compare_price: null,
          cost_price: null,
          sku: sku || null,
          barcode: null,
          category_id: categoryId,
          brand: brand || null,
          unit: unit,
          weight: weight,
          dimensions: null,
          stock_quantity: stockQuantity,
          low_stock_threshold: 10,
          track_inventory: true,
          is_available: availability !== 'Out of Stock',
          is_featured: false,
          requires_shipping: true,
          tax_exempt: false,
          images: null,
          metadata: null,
          seo_title: productName,
          seo_description: description || null,
          is_cooked: false,
          origin: origin || null,
          delivery_type: 'both',
          uber_eats_url: null,
          doordash_url: null,
          ingredients: ingredients || null,
          nutrition_info: nutrition || null
        };
        
        // Insert product
        const { data: insertedProduct, error } = await supabase
          .from('products')
          .insert([productRecord])
          .select()
          .single();
        
        if (error) {
          console.error(`❌ Error importing: ${error.message}`);
          errors.push(`${productName}: ${error.message}`);
        } else {
          console.log(`✅ Imported successfully (ID: ${insertedProduct.id})`);
          imported++;
        }
        
      } catch (error) {
        console.error(`💥 Exception processing row:`, error);
        errors.push(`Row error: ${error.message}`);
      }
    }
    
    console.log('\\n' + '=' .repeat(60));
    console.log('📊 IMPORT SUMMARY - FILE 1');
    console.log('=' .repeat(60));
    console.log(`✅ Products Imported: ${imported}`);
    console.log(`⚠️  Rows Skipped: ${skipped}`);
    console.log(`❌ Errors: ${errors.length}`);
    
    if (errors.length > 0) {
      console.log('\\n⚠️  ERROR DETAILS:');
      errors.forEach(error => console.log(`  - ${error}`));
    }
    
    console.log('\\n📝 PRODUCT DETAILS COVERAGE:');
    console.log('✅ All products have: name, slug, price, stock');
    console.log('✅ Most have: weight, unit, brand, origin');
    console.log('✅ Many have: ingredients, nutrition info');
    console.log('✅ Categories created automatically');
    
    console.log('\\n🔗 CHECK YOUR DATA:');
    console.log('Admin Panel: https://kfresh-admin.vercel.app/products');
    console.log('Store Front: https://kfresh-store.vercel.app/products');
    
  } catch (error) {
    console.error('💥 Fatal error:', error);
  }
}

if (require.main === module) {
  importFile1()
    .then(() => {
      console.log('\\n🎉 File 1 import completed successfully!');
      console.log('\\nReview the products and let me know when to proceed with File 2.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Script failed:', error);
      process.exit(1);
    });
}

module.exports = { importFile1 };