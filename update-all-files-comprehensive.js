const { createClient } = require('@supabase/supabase-js');
const XLSX = require('xlsx');

// Supabase configuration
const supabaseUrl = 'https://tmufbgaxhtqgkvcngyxg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtdWZiZ2F4aHRxZ2t2Y25neXhnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDU5ODc4NSwiZXhwIjoyMDcwMTc0Nzg1fQ.85Mj1j1tPayE8L-ChJ0qXBjI64e5UTsPSMB17AniNq4';
const supabase = createClient(supabaseUrl, supabaseKey);

// All three comprehensive Excel files
const EXCEL_FILES = [
  {
    path: '/Volumes/C/Kfreshfiles/Final File - Kfresh Website/Final File - Kfresh Website/1final_product_data.xlsx',
    name: '1final_product_data.xlsx'
  },
  {
    path: '/Volumes/C/Kfreshfiles/Final File - Kfresh Website/Final File - Kfresh Website/2grace_products.xlsx',
    name: '2grace_products.xlsx'
  },
  {
    path: '/Volumes/C/Kfreshfiles/Final File - Kfresh Website/Final File - Kfresh Website/3ferma_grocery_products_cleaned.xlsx',
    name: '3ferma_grocery_products_cleaned.xlsx'
  }
];

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

function extractWeight(text) {
  if (!text) return null;
  
  // Extract weight patterns like "400g", "2lbs", "1.5kg", "500ml", etc.
  const weightMatch = text.match(/(\\d+(?:\\.\\d+)?)\\s*(g|kg|lb|lbs|oz|ml|l|litre|liter|pack|pcs|pieces)/i);
  if (weightMatch) {
    return parseFloat(weightMatch[1]);
  }
  return null;
}

function extractUnit(text) {
  if (!text) return null;
  
  // Extract unit from text
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

function extractBrand(productName) {
  // Common brand patterns
  const brands = [
    'Grace', 'Cool Runnings', 'Maggi', 'Indomie', 'Ovaltine', 'Irie', 'Cedar', 
    'Tropiway', 'Hereford', 'Unico', 'Primo', 'Gino', 'Derica', 'Carnation',
    'Honeywell', 'Gallo', 'Saporito', 'Knorr', 'Onga', 'Aurora', 'Kalas',
    'Brown Betty', 'Guyanese Pride', 'Kirkland', 'Eska', 'Titus', 'Mama\'s Choice',
    'Ola-Ola', 'Ayo-Ola', 'CASII', 'OCASII', 'Botan', 'Mekong', 'Rooster',
    'Star Kist', 'Nkulenu', 'Lafe', 'Mr. Johns', 'Aladun', 'Adam', '555'
  ];
  
  for (const brand of brands) {
    if (productName.toLowerCase().includes(brand.toLowerCase())) {
      return brand;
    }
  }
  return null;
}

function extractOrigin(productName, category, brand) {
  // Origin patterns
  if (productName.toLowerCase().includes('jamaica') || brand === 'Grace') {
    return 'Jamaica';
  }
  if (productName.toLowerCase().includes('ghana') || productName.toLowerCase().includes('guyanese')) {
    return 'Ghana';
  }
  if (productName.toLowerCase().includes('nigeria')) {
    return 'Nigeria';
  }
  if (productName.toLowerCase().includes('canada')) {
    return 'Canada';
  }
  if (productName.toLowerCase().includes('caribbean')) {
    return 'Caribbean';
  }
  
  // Default origins by category/brand
  if (category && category.toLowerCase().includes('frozen')) {
    return 'Canada';
  }
  
  // Fresh produce defaults
  if (productName.toLowerCase().includes('plantain') || 
      productName.toLowerCase().includes('yam') ||
      productName.toLowerCase().includes('cassava')) {
    return 'Caribbean';
  }
  
  return null;
}

async function readExcelFile(filePath, fileName) {
  console.log(`📖 Reading ${fileName}...`);
  
  try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    console.log(`✅ Loaded ${data.length} rows from ${fileName}`);
    
    // Show column structure
    if (data.length > 0) {
      console.log(`📋 Available columns: ${Object.keys(data[0]).join(', ')}\\n`);
    }
    
    return data;
  } catch (error) {
    console.error(`❌ Error reading ${fileName}:`, error.message);
    return [];
  }
}

async function processAllExcelFiles() {
  console.log('📖 Reading all comprehensive Excel files...\\n');
  
  const allProductData = new Map();
  
  for (const file of EXCEL_FILES) {
    const data = await readExcelFile(file.path, file.name);
    
    // Process each row and extract details
    data.forEach(row => {
      // Try multiple column name variations for product name
      const productName = row['Product Name'] || row['product name'] || row['Name'] || row['name'] || 
                         row['Product'] || row['Item'] || row['product_name'];
      
      if (!productName) return;
      
      const slug = generateSlug(productName);
      
      // Extract all available details
      const details = {
        name: productName,
        slug: slug,
        weight: extractWeight(productName) || parseFloat(row['Weight'] || row['weight'] || row['Size'] || row['size']) || null,
        unit: extractUnit(productName) || row['Unit'] || row['unit'] || null,
        brand: row['Brand'] || row['brand'] || extractBrand(productName) || null,
        origin: row['Origin'] || row['origin'] || extractOrigin(productName, row['Category'] || row['category'], row['Brand'] || row['brand']) || null,
        sku: row['SKU'] || row['sku'] || row['Product Code'] || row['Code'] || null,
        barcode: row['Barcode'] || row['barcode'] || row['UPC'] || row['EAN'] || null,
        ingredients: row['Ingredients'] || row['ingredients'] || row['🥬 ingredients'] || row['Ingredient List'] || null,
        nutrition_info: row['Nutrition'] || row['nutrition'] || row['nutritional_info'] || row['Nutrition Facts'] || row['Nutritional Information'] || null,
        description: row['Description'] || row['description'] || row['Product Description'] || null,
        short_description: row['Short Description'] || row['short_description'] || null
      };
      
      // Only overwrite if we have new data or existing entry doesn't have the field
      const existing = allProductData.get(slug);
      if (!existing) {
        allProductData.set(slug, details);
      } else {
        // Merge data, keeping existing values if new ones are null
        Object.keys(details).forEach(key => {
          if (details[key] && !existing[key]) {
            existing[key] = details[key];
          }
        });
      }
    });
  }
  
  console.log(`📊 Total unique product details collected: ${allProductData.size}\\n`);
  return allProductData;
}

async function updateAllProductDetails() {
  console.log('🔧 Starting comprehensive product details update...\\n');
  
  try {
    // Read all Excel data
    const productDetailsMap = await processAllExcelFiles();
    
    // Get all products from database
    const { data: dbProducts, error: fetchError } = await supabase
      .from('products')
      .select('id, name, slug, weight, unit, brand, origin, sku, barcode, ingredients, nutrition_info, description, short_description')
      .order('name');
    
    if (fetchError) {
      console.error('❌ Error fetching products:', fetchError.message);
      return;
    }
    
    console.log(`📦 Found ${dbProducts.length} products in database\\n`);
    
    let updated = 0;
    let notFound = 0;
    let errors = [];
    
    for (const product of dbProducts) {
      try {
        let details = productDetailsMap.get(product.slug);
        
        if (!details) {
          // Try alternative slug matching
          const altSlug = generateSlug(product.name);
          details = productDetailsMap.get(altSlug);
          
          if (!details) {
            console.log(`❓ No details found for: ${product.name}`);
            notFound++;
            continue;
          }
        }
        
        // Prepare update object with only fields that need updating
        const updateData = {};
        let needsUpdate = false;
        
        // Check each field and update if missing or different
        if (!product.weight && details.weight) {
          updateData.weight = details.weight;
          needsUpdate = true;
        }
        
        if (!product.unit && details.unit) {
          updateData.unit = details.unit;
          needsUpdate = true;
        }
        
        if (!product.brand && details.brand) {
          updateData.brand = details.brand;
          needsUpdate = true;
        }
        
        if (!product.origin && details.origin) {
          updateData.origin = details.origin;
          needsUpdate = true;
        }
        
        if (!product.ingredients && details.ingredients) {
          updateData.ingredients = details.ingredients;
          needsUpdate = true;
        }
        
        if (!product.nutrition_info && details.nutrition_info) {
          updateData.nutrition_info = details.nutrition_info;
          needsUpdate = true;
        }
        
        if (!product.barcode && details.barcode) {
          updateData.barcode = details.barcode;
          needsUpdate = true;
        }
        
        if (!product.description && details.description) {
          updateData.description = details.description;
          needsUpdate = true;
        }
        
        if (!product.short_description && details.short_description) {
          updateData.short_description = details.short_description;
          needsUpdate = true;
        }
        
        if (needsUpdate) {
          console.log(`🔧 Updating: ${product.name}`);
          console.log(`   Adding: ${Object.keys(updateData).join(', ')}`);
          
          const { error: updateError } = await supabase
            .from('products')
            .update(updateData)
            .eq('id', product.id);
          
          if (updateError) {
            console.error(`❌ Error updating ${product.name}:`, updateError.message);
            errors.push(`${product.name}: ${updateError.message}`);
          } else {
            console.log(`✅ Updated: ${product.name}`);
            updated++;
          }
        }
        
      } catch (error) {
        console.error(`💥 Exception updating ${product.name}:`, error);
        errors.push(`${product.name}: ${error.message}`);
      }
    }
    
    console.log(`\\n📊 COMPREHENSIVE UPDATE SUMMARY`);
    console.log(`===================================`);
    console.log(`✅ Products Updated: ${updated}`);
    console.log(`❓ Products Not Found in Excel: ${notFound}`);
    console.log(`❌ Errors: ${errors.length}`);
    
    if (errors.length > 0) {
      console.log('\\n⚠️  ERRORS:');
      errors.forEach(error => console.log(`  - ${error}`));
    }
    
    console.log('\\n🎯 FINAL RECOMMENDATIONS:');
    console.log('- Run audit script to see remaining gaps');
    console.log('- Consider manual entry for fresh produce items');
    console.log('- Extract weight/unit from product names for remaining items');
    
  } catch (error) {
    console.error('💥 Fatal error:', error);
  }
}

if (require.main === module) {
  updateAllProductDetails()
    .then(() => {
      console.log('\\n🎉 Comprehensive product details update completed!');
      console.log('\\n📝 Next steps:');
      console.log('1. Run: node audit-missing-details.js');
      console.log('2. Check admin panel: https://kfresh-admin.vercel.app/products');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Script failed:', error);
      process.exit(1);
    });
}

module.exports = { updateAllProductDetails };