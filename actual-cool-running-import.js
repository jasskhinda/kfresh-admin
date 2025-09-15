const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Supabase configuration
const supabaseUrl = 'https://tmufbgaxhtqgkvcngyxg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtdWZiZ2F4aHRxZ2t2Y25neXhnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDU5ODc4NSwiZXhwIjoyMDcwMTc0Nzg1fQ.85Mj1j1tPayE8L-ChJ0qXBjI64e5UTsPSMB17AniNq4';
const supabase = createClient(supabaseUrl, supabaseKey);

// Read the actual JSON file
const COOL_RUNNING_JSON_PATH = '/Users/jasskhinda/Downloads/cool_running_products.json';

function generateSlug(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// Create categories based on the actual JSON structure
async function createCategoriesFromJSON(products) {
  console.log('🏗️  Creating categories from JSON structure...\n');
  
  // Extract unique categories and subcategories
  const categoryStructure = new Map();
  
  products.forEach(product => {
    const mainCategory = product.category;
    const subCategory = product.subCategory;
    
    if (!categoryStructure.has(mainCategory)) {
      categoryStructure.set(mainCategory, new Set());
    }
    
    if (subCategory) {
      categoryStructure.get(mainCategory).add(subCategory);
    }
  });
  
  const categoryMap = new Map();
  
  // Create main categories first
  for (const [mainCategoryName] of categoryStructure) {
    try {
      const slug = generateSlug(mainCategoryName);
      
      const categoryRecord = {
        name: mainCategoryName,
        slug: slug,
        description: `${mainCategoryName} products from Cool Running`,
        parent_category_id: null,
        level: 1,
        is_active: true,
        is_fresh_meals: false,
        display_order: 0
      };
      
      const { data, error } = await supabase
        .from('categories')
        .insert([categoryRecord])
        .select()
        .single();
        
      if (error) {
        console.error(`❌ Error creating category ${mainCategoryName}:`, error.message);
      } else {
        console.log(`✅ Created: ${mainCategoryName} (${slug})`);
        categoryMap.set(mainCategoryName, data);
      }
    } catch (error) {
      console.error(`💥 Exception creating ${mainCategoryName}:`, error);
    }
  }
  
  // Create subcategories
  for (const [mainCategoryName, subCategories] of categoryStructure) {
    const parentCategory = categoryMap.get(mainCategoryName);
    if (!parentCategory) continue;
    
    for (const subCategoryName of subCategories) {
      try {
        const slug = generateSlug(subCategoryName);
        
        const categoryRecord = {
          name: subCategoryName,
          slug: slug,
          description: `${subCategoryName} from ${mainCategoryName}`,
          parent_category_id: parentCategory.id,
          level: 2,
          is_active: true,
          is_fresh_meals: false,
          display_order: 0
        };
        
        const { data, error } = await supabase
          .from('categories')
          .insert([categoryRecord])
          .select()
          .single();
          
        if (error) {
          console.error(`❌ Error creating sub-category ${subCategoryName}:`, error.message);
        } else {
          console.log(`✅ Created: ${subCategoryName} (${slug}) → ${mainCategoryName}`);
          categoryMap.set(subCategoryName, data);
        }
      } catch (error) {
        console.error(`💥 Exception creating ${subCategoryName}:`, error);
      }
    }
  }
  
  console.log(`\n✅ Created ${categoryMap.size} categories total\n`);
  return categoryMap;
}

async function importActualProducts(categoryMap, products) {
  console.log('📦 Importing actual Cool Running products...\n');
  
  let imported = 0;
  let errors = [];
  
  for (const product of products) {
    try {
      console.log(`📦 Processing: ${product.productName}`);
      
      // Find category (prefer subcategory if available, otherwise main category)
      let category = categoryMap.get(product.subCategory);
      if (!category) {
        category = categoryMap.get(product.category);
      }
      
      if (!category) {
        errors.push(`No category found for ${product.productName}`);
        continue;
      }
      
      // Use existing slug or generate one
      const productSlug = product.urlSlug || generateSlug(product.productName);
      
      // Create weight string
      const weightString = product.weight ? `${product.weight}${product.unitType === 'gram' ? 'g' : product.unitType === 'milliliter' ? 'ml' : ''}` : null;
      
      // Create SEO-friendly title
      let seoTitle = product.productName;
      if (weightString && !seoTitle.includes(weightString)) {
        seoTitle += ` (${weightString})`;
      }
      
      const productRecord = {
        name: seoTitle,
        slug: productSlug,
        description: product.description,
        price: product.price,
        category_id: category.id,
        stock_quantity: 100,
        is_available: true,
        is_featured: false
      };
      
      const { data, error } = await supabase
        .from('products')
        .insert([productRecord])
        .select()
        .single();
        
      if (error) {
        console.error(`❌ Error importing ${product.productName}:`, error.message);
        errors.push(`${product.productName}: ${error.message}`);
      } else {
        console.log(`✅ Imported: ${seoTitle} → ${category.name}`);
        console.log(`   URL: /products/${category.slug}/${productSlug}`);
        imported++;
      }
      
    } catch (error) {
      console.error(`💥 Exception importing ${product.productName}:`, error);
      errors.push(`${product.productName}: ${error.message}`);
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

async function runActualImport() {
  console.log('🏃‍♂️ Cool Running Products - Actual JSON Import');
  console.log('=============================================\n');
  console.log('📄 Source: /Users/jasskhinda/Downloads/cool_running_products.json');
  console.log('🌐 Reference: www.coolrunningsfoods.ca\n');
  
  try {
    // Clean database first
    console.log('🧹 Cleaning database...');
    await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('categories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    console.log('✅ Database cleaned\n');
    
    // Read JSON file
    console.log('📖 Reading JSON file...');
    const jsonData = fs.readFileSync(COOL_RUNNING_JSON_PATH, 'utf8');
    const products = JSON.parse(jsonData);
    console.log(`✅ Loaded ${products.length} products from JSON\n`);
    
    // Create categories
    const categoryMap = await createCategoriesFromJSON(products);
    
    // Import products
    await importActualProducts(categoryMap, products);
    
    console.log('\n🎉 Actual Cool Running import completed!');
    console.log('\n📝 Test URLs:');
    console.log('- Homepage: https://kfresh-store.vercel.app/');
    console.log('- Beverages: https://kfresh-store.vercel.app/products/beverages');
    console.log('- Spices: https://kfresh-store.vercel.app/products/spices-seasonings');
    console.log('- Teas: https://kfresh-store.vercel.app/products/teas-wellness');
    
  } catch (error) {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  runActualImport()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('💥 Script failed:', error);
      process.exit(1);
    });
}

module.exports = { runActualImport };