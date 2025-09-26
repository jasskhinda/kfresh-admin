const { createClient } = require('@supabase/supabase-js');
const XLSX = require('xlsx');
const path = require('path');

// Supabase configuration
const supabaseUrl = 'https://tmufbgaxhtqgkvcngyxg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtdWZiZ2F4aHRxZ2t2Y25neXhnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDU5ODc4NSwiZXhwIjoyMDcwMTc0Nzg1fQ.85Mj1j1tPayE8L-ChJ0qXBjI64e5UTsPSMB17AniNq4';
const supabase = createClient(supabaseUrl, supabaseKey);

// Excel file path
const EXCEL_FILE_PATH = '/Volumes/C/Kfreshfiles/Final File - Kfresh Website/Final File - Kfresh Website/2grace_products.xlsx';

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

function parsePrice(priceValue) {
  if (!priceValue) return 0;
  // Handle both string and number inputs
  const cleaned = typeof priceValue === 'string'
    ? priceValue.replace(/[^0-9.]/g, '')
    : priceValue.toString();
  return parseFloat(cleaned) || 0;
}

function parseStock(stockValue) {
  if (!stockValue) return 100; // Default stock
  return parseInt(stockValue) || 100;
}

function parseWeight(weightValue) {
  if (!weightValue) return null;
  return parseFloat(weightValue) || null;
}

// Category mapping for better organization
const categoryMapping = {
  'FROZEN FOODS': {
    name: 'Frozen Foods',
    slug: 'frozen-foods',
    description: 'Fresh frozen food items for convenience',
    icon: '🧊',
    color_class: 'bg-blue-100 text-blue-600'
  },
  'CANNED GOODS': {
    name: 'Canned Goods',
    slug: 'canned-goods',
    description: 'Preserved and canned food products',
    icon: '🥫',
    color_class: 'bg-orange-100 text-orange-600'
  },
  'FRESH PRODUCE': {
    name: 'Fresh Produce',
    slug: 'fresh-produce',
    description: 'Fresh fruits and vegetables',
    icon: '🥬',
    color_class: 'bg-green-100 text-green-600'
  },
  'DAIRY & EGGS': {
    name: 'Dairy & Eggs',
    slug: 'dairy-eggs',
    description: 'Fresh dairy products and eggs',
    icon: '🥛',
    color_class: 'bg-yellow-100 text-yellow-600'
  },
  'MEAT & POULTRY': {
    name: 'Meat & Poultry',
    slug: 'meat-poultry',
    description: 'Fresh and frozen meat products',
    icon: '🍖',
    color_class: 'bg-red-100 text-red-600'
  },
  'PANTRY ESSENTIALS': {
    name: 'Pantry Essentials',
    slug: 'pantry-essentials',
    description: 'Essential cooking ingredients and staples',
    icon: '🏪',
    color_class: 'bg-brown-100 text-brown-600'
  },
  'BEVERAGES': {
    name: 'Beverages',
    slug: 'beverages',
    description: 'Drinks and beverage products',
    icon: '🥤',
    color_class: 'bg-purple-100 text-purple-600'
  },
  'SNACKS': {
    name: 'Snacks',
    slug: 'snacks',
    description: 'Snack foods and treats',
    icon: '🍿',
    color_class: 'bg-pink-100 text-pink-600'
  }
};

async function readExcelFile() {
  console.log('📖 Reading 2Grace Excel file...');

  try {
    const workbook = XLSX.readFile(EXCEL_FILE_PATH);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    console.log(`✅ Loaded ${data.length} rows from 2Grace Excel`);
    return data;
  } catch (error) {
    console.error('❌ Error reading Excel file:', error.message);
    throw error;
  }
}

async function ensureCategory(categoryName) {
  if (!categoryName) return null;

  const categoryKey = categoryName.toUpperCase();
  const categoryInfo = categoryMapping[categoryKey] || {
    name: categoryName,
    slug: generateSlug(categoryName),
    description: `${categoryName} products`,
    icon: '🛒',
    color_class: 'bg-gray-100 text-gray-600'
  };

  // Check if category exists
  const { data: existing } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', categoryInfo.slug)
    .single();

  if (existing) {
    console.log(`✅ Found existing category: ${categoryInfo.name}`);
    return existing.id;
  }

  // Create new category
  const { data: categoryData, error } = await supabase
    .from('categories')
    .insert([{
      name: categoryInfo.name,
      slug: categoryInfo.slug,
      description: categoryInfo.description,
      parent_id: null,
      image_url: null,
      is_active: true,
      sort_order: 0,
      is_fresh_meals: false,
      show_in_homepage_hero: false,
      homepage_order: 999,
      icon: categoryInfo.icon,
      color_class: categoryInfo.color_class
    }])
    .select()
    .single();

  if (error) {
    console.error(`❌ Error creating category ${categoryInfo.name}:`, error.message);
    return null;
  }

  console.log(`✅ Created category: ${categoryInfo.name}`);
  return categoryData.id;
}

async function importProducts(data) {
  console.log('📦 Importing 2Grace products from Excel...\n');

  let imported = 0;
  let errors = [];
  let skipped = 0;

  for (let i = 0; i < data.length; i++) {
    const row = data[i];

    try {
      // Skip header row if it exists
      if (i === 0 && (row['product name'] === 'product name' || !row['product name'])) {
        console.log('⏭️  Skipping header row');
        skipped++;
        continue;
      }

      const productName = row['product name'];

      if (!productName || productName.trim() === '') {
        console.log(`⚠️  Skipping row ${i + 1} - no product name found`);
        skipped++;
        continue;
      }

      console.log(`📦 Processing (${i + 1}/${data.length}): ${productName}`);

      // Get category
      const categoryName = row['category'];
      let categoryId = null;

      if (categoryName) {
        categoryId = await ensureCategory(categoryName);
      }

      // Extract and clean data
      const description = row['product description'] || null;
      const price = parsePrice(row['product price']);
      const stockQuantity = parseStock(row['stock quantity']);
      const weight = parseWeight(row['weight']);
      const origin = row['origin'] || null;
      const brand = row['brand'] || 'KFresh';
      const sku = row['sku'] && row['sku'] !== 'N/A' ? row['sku'] : null;
      const unit = row['unit'] || 'piece';
      const availability = row['availability'] || 'In Stock';
      const ingredients = row['🥬 ingredients'] || null;
      const nutrition = row['📊 nutrition & other information'] || null;

      // Create metadata object
      const metadata = {
        origin: origin,
        ingredients: ingredients,
        nutrition: nutrition,
        imported_from: '2grace_products.xlsx',
        import_date: new Date().toISOString()
      };

      // Determine if product is available
      const isAvailable = availability && availability.toLowerCase().includes('stock');

      // Prepare product record for admin schema
      const productRecord = {
        name: productName.trim(),
        slug: generateSlug(productName),
        description: description,
        short_description: description ? description.substring(0, 150) + '...' : null,
        price: price,
        compare_price: null,
        cost_price: null,
        sku: sku,
        barcode: null,
        category_id: categoryId,
        brand: brand,
        unit: unit,
        weight: weight,
        dimensions: null,
        stock_quantity: stockQuantity,
        low_stock_threshold: 5,
        track_inventory: true,
        is_available: isAvailable,
        is_featured: false,
        requires_shipping: true,
        tax_exempt: false,
        images: [], // Empty array for now
        metadata: metadata,
        seo_title: productName,
        seo_description: description,
        is_cooked: false // Most products from this file appear to be packaged goods
      };

      // Check if product already exists (by name or SKU)
      const { data: existingProducts } = await supabase
        .from('products')
        .select('id, name')
        .or(`name.eq.${productName.trim()},sku.eq.${sku}`)
        .limit(1);

      if (existingProducts && existingProducts.length > 0) {
        console.log(`⚠️  Product already exists: ${productName} - skipping`);
        skipped++;
        continue;
      }

      const { data: insertedData, error } = await supabase
        .from('products')
        .insert([productRecord])
        .select()
        .single();

      if (error) {
        console.error(`❌ Error importing ${productName}:`, error.message);
        errors.push(`${productName}: ${error.message}`);
      } else {
        console.log(`✅ Imported: ${productName} - $${price} (${stockQuantity} in stock)`);
        imported++;
      }

    } catch (error) {
      console.error(`💥 Exception processing row ${i + 1}:`, error);
      errors.push(`Row ${i + 1}: ${error.message}`);
    }
  }

  console.log(`\n📊 2GRACE IMPORT SUMMARY`);
  console.log(`========================`);
  console.log(`✅ Products Imported: ${imported}`);
  console.log(`⏭️  Products Skipped: ${skipped}`);
  console.log(`❌ Errors: ${errors.length}`);

  if (errors.length > 0) {
    console.log('\n⚠️  ERRORS:');
    errors.forEach(error => console.log(`  - ${error}`));
  }

  return { imported, errors, skipped };
}

async function run2GraceImport() {
  console.log('🌟 2Grace Products Import');
  console.log('==========================\n');
  console.log(`📄 Source: ${EXCEL_FILE_PATH}\n`);

  try {
    // Check if file exists
    const fs = require('fs');
    if (!fs.existsSync(EXCEL_FILE_PATH)) {
      throw new Error(`Excel file not found at: ${EXCEL_FILE_PATH}`);
    }

    // Read Excel file
    const excelData = await readExcelFile();

    // Show sample of data structure
    if (excelData.length > 0) {
      console.log('\n📋 Excel columns found:');
      console.log(Object.keys(excelData[0]).join(', '));
      console.log('\n📊 Sample data:');
      console.log('Product:', excelData[0]['product name']);
      console.log('Category:', excelData[0]['category']);
      console.log('Price:', excelData[0]['product price']);
      console.log('Stock:', excelData[0]['stock quantity']);
      console.log('\n');
    }

    // Import products
    const result = await importProducts(excelData);

    console.log('\n🎉 2Grace import completed!');
    console.log('\n📝 Test URLs:');
    console.log('- Admin: http://localhost:3000/products (if running locally)');
    console.log('- Store: Check your store frontend');

    // Get final product count
    const { count } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    console.log(`\n📦 Total products in database: ${count}`);

  } catch (error) {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  run2GraceImport()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('💥 Script failed:', error);
      process.exit(1);
    });
}

module.exports = { run2GraceImport };